"""公的機関のデータから月末値を取得して data.json を作る。

使い方:  py -I scripts/update_data.py
出典:
  日本銀行 時系列統計データ（API）   ドル円 17時/月末, 無担保コールO/N 月末
  欧州中央銀行（ECB Data Portal）    ユーロ円 参照レート 月末
  財務省 国債金利情報                日本10年国債 月末
  米国財務省 Daily Treasury Par Yield 米国10年国債 月末
  米連邦準備制度理事会 H.15          FF実効金利 月末
完了した月だけを使う（今月の途中の値は入れない）。
"""
import csv, io, json, datetime, urllib.request, pathlib

START = "2016-01"
TODAY = datetime.date.today()
LAST_DONE = (TODAY.replace(day=1) - datetime.timedelta(days=1)).strftime("%Y-%m")
OUT = pathlib.Path(__file__).resolve().parent.parent / "data.json"


def get(url, enc="utf-8"):
    req = urllib.request.Request(url, headers={"User-Agent": "investment-indicators-updater/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read().decode(enc, errors="replace")


def keep(series):
    """{ym: value} -> 期間内の [{ym, value}] に整える"""
    return [{"ym": k, "value": round(v, 3)} for k, v in sorted(series.items()) if START <= k <= LAST_DONE]


def month_end(rows):
    """[(date, value)] の各月最後の値"""
    d = {}
    for dt, v in sorted(rows):
        d[dt.strftime("%Y-%m")] = v
    return d


def boj(db, code):
    txt = get(f"https://www.stat-search.boj.or.jp/api/v1/getDataCode?format=csv&lang=en&db={db}&code={code}&startDate={START.replace('-', '')}", "shift_jis")
    out = {}
    for row in csv.reader(io.StringIO(txt)):
        if len(row) >= 8 and row[0] == code and row[6].isdigit() and row[7] not in ("", "ND"):
            out[f"{row[6][:4]}-{row[6][4:6]}"] = float(row[7])
    return out


def ecb_eurjpy():
    txt = get("https://data-api.ecb.europa.eu/service/data/EXR/M.JPY.EUR.SP00.E?format=csvdata&startPeriod=" + START)
    return {r["TIME_PERIOD"]: float(r["OBS_VALUE"]) for r in csv.DictReader(io.StringIO(txt)) if r.get("OBS_VALUE")}


ERA = {"H": 1988, "R": 2018, "S": 1925}


def jgb10():
    rows = []
    for url in ("https://www.mof.go.jp/jgbs/reference/interest_rate/data/jgbcm_all.csv",
                "https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcm.csv"):
        lines = get(url, "shift_jis").splitlines()
        hdr = next(i for i, l in enumerate(lines) if l.startswith("基準日"))
        for r in csv.DictReader(lines[hdr:]):
            d, v = r["基準日"].strip(), (r.get("10年") or "").strip()
            if not d or d[0] not in ERA or v in ("", "-"):
                continue
            y, m, dd = d[1:].split(".")
            y = 1 if y == "元" else int(y)
            rows.append((datetime.date(ERA[d[0]] + y, int(m), int(dd)), float(v)))
    return month_end(rows)


def ust10():
    rows = []
    for y in range(int(START[:4]), TODAY.year + 1):
        txt = get(f"https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/{y}/all?type=daily_treasury_yield_curve&field_tdr_date_value={y}&page&_format=csv")
        for r in csv.DictReader(io.StringIO(txt)):
            if r.get("10 Yr"):
                rows.append((datetime.datetime.strptime(r["Date"], "%m/%d/%Y").date(), float(r["10 Yr"])))
    return month_end(rows)


def fedfunds():
    txt = get("https://www.federalreserve.gov/datadownload/Output.aspx?rel=H15&series=c5025f4bbbed155a6f17c587772ed69e&lastobs=&from=&to=&filetype=csv&label=include&layout=seriescolumn")
    rows = []
    for r in csv.reader(io.StringIO(txt)):
        if len(r) == 2 and r[0][:2] in ("19", "20") and r[1] not in ("", "ND"):
            rows.append((datetime.date.fromisoformat(r[0]), float(r[1])))
    return month_end(rows)


SOURCES = [
    {"id": "boj", "org": "日本銀行", "name": "時系列統計データ検索サイト（外国為替市況・コールレート）",
     "url": "https://www.stat-search.boj.or.jp/", "terms": "https://www.boj.or.jp/about/copyright.htm"},
    {"id": "ecb", "org": "欧州中央銀行（ECB）", "name": "ユーロ参照レート（円）",
     "url": "https://data.ecb.europa.eu/data/datasets/EXR/EXR.M.JPY.EUR.SP00.E"},
    {"id": "mof", "org": "財務省", "name": "国債金利情報",
     "url": "https://www.mof.go.jp/jgbs/reference/interest_rate/index.htm"},
    {"id": "ust", "org": "米国財務省", "name": "Daily Treasury Par Yield Curve Rates",
     "url": "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve"},
    {"id": "frb", "org": "米連邦準備制度理事会（FRB）", "name": "H.15 Selected Interest Rates（FF実効金利）",
     "url": "https://www.federalreserve.gov/releases/h15/"},
]

SERIES = [
    ("usdjpy", "ドル円", "円", "boj", "東京市場 ドル・円 スポット 17時時点／月末（系列コード FXERM06）", lambda: boj("FM08", "FXERM06")),
    ("eurjpy", "ユーロ円", "円", "ecb", "ECBのユーロ参照レート（円）／月末", ecb_eurjpy),
    ("jp_policy", "日本の政策金利（無担保コール翌日物）", "%", "boj", "無担保コールレート・オーバーナイト物／月末（系列コード STRECLUCON）。日銀が誘導目標にしている金利", lambda: boj("FM02", "STRECLUCON")),
    ("us_policy", "アメリカの政策金利（FF実効金利）", "%", "frb", "フェデラル・ファンド実効金利（日次）の各月最終営業日の値", fedfunds),
    ("jp10y", "日本の10年国債利回り", "%", "mof", "新発10年国債の利回り（日次）の各月最終営業日の値", jgb10),
    ("us10y", "アメリカの10年国債利回り", "%", "ust", "10年物国債利回り（日次）の各月最終営業日の値", ust10),
]


# ---------------- 世界経済（世界銀行 World Development Indicators） ----------------
SOURCES += [
    {"id": "wb", "org": "世界銀行（World Bank）", "name": "World Development Indicators（CC BY 4.0）",
     "url": "https://databank.worldbank.org/source/world-development-indicators"},
    {"id": "sec", "org": "米国証券取引委員会（SEC）", "name": "EDGAR 各社の年次報告書（10-K／20-F）のXBRLデータ",
     "url": "https://www.sec.gov/search-filings"},
]
WB_COUNTRIES = ["JPN", "USA", "CHN", "DEU", "IND", "GBR", "FRA", "ITA", "CAN", "BRA", "KOR", "AUS", "IDN", "MEX"]
JA = {"JPN": "日本", "USA": "アメリカ", "CHN": "中国", "DEU": "ドイツ", "IND": "インド", "GBR": "イギリス", "FRA": "フランス",
      "ITA": "イタリア", "CAN": "カナダ", "BRA": "ブラジル", "KOR": "韓国", "AUS": "オーストラリア", "TUR": "トルコ", "ARG": "アルゼンチン",
      "RUS": "ロシア", "ESP": "スペイン", "MEX": "メキシコ", "IDN": "インドネシア", "NLD": "オランダ", "SAU": "サウジアラビア", "CHE": "スイス",
      "POL": "ポーランド", "TWN": "台湾", "BEL": "ベルギー", "SWE": "スウェーデン", "IRL": "アイルランド", "ARE": "アラブ首長国連邦",
      "SGP": "シンガポール", "THA": "タイ", "ISR": "イスラエル", "NOR": "ノルウェー", "AUT": "オーストリア", "NGA": "ナイジェリア",
      "PHL": "フィリピン", "VNM": "ベトナム", "IRN": "イラン", "EGY": "エジプト", "MYS": "マレーシア", "DNK": "デンマーク", "BGD": "バングラデシュ"}


def wb(ind, countries="all", date=None, mrv=None):
    q = f"https://api.worldbank.org/v2/country/{countries}/indicator/{ind}?format=json&per_page=20000"
    q += f"&date={date}" if date else ""
    q += f"&mrv={mrv}" if mrv else ""
    res = json.loads(get(q))
    return [r for r in (res[1] if len(res) > 1 and res[1] else []) if r["value"] is not None]


def world():
    meta = json.loads(get("https://api.worldbank.org/v2/country?format=json&per_page=400"))[1]
    real = {c["id"] for c in meta if c["region"]["value"] != "Aggregates"}
    # GDP ランキング：日米がそろう最新の年
    years = [int(r["date"]) for r in wb("NY.GDP.MKTP.CD", "JPN;USA", mrv=3)]
    yr = max(y for y in set(years) if years.count(y) == 2)
    gdp = sorted([r for r in wb("NY.GDP.MKTP.CD", date=yr) if r["countryiso3code"] in real], key=lambda r: -r["value"])
    rank = [{"code": r["countryiso3code"], "name": JA.get(r["countryiso3code"], r["country"]["value"]), "value": round(r["value"] / 1e12, 3)} for r in gdp[:15]]
    # インフレ率（主要国の最新年・日米の推移）
    inf = wb("FP.CPI.TOTL.ZG", ";".join(WB_COUNTRIES), date=f"2000:{TODAY.year}")
    latest = {}
    for r in inf:
        c = r["countryiso3code"]
        if c not in latest or int(r["date"]) > int(latest[c]["date"]):
            latest[c] = r
    inf_latest = sorted([{"code": c, "name": JA[c], "year": int(r["date"]), "value": round(r["value"], 2)} for c, r in latest.items()], key=lambda x: -x["value"])
    inf_hist = {c: sorted([{"year": int(r["date"]), "value": round(r["value"], 2)} for r in inf if r["countryiso3code"] == c], key=lambda x: x["year"]) for c in ("JPN", "USA")}
    # 日米比較
    compare = []
    for ind, label, unit, scale in [("NY.GDP.MKTP.CD", "GDP（国内総生産）", "兆ドル", 1e12), ("NY.GDP.PCAP.CD", "1人あたりGDP", "ドル", 1),
                                    ("NY.GDP.MKTP.KD.ZG", "経済成長率（実質）", "%", 1), ("FP.CPI.TOTL.ZG", "インフレ率（消費者物価）", "%", 1),
                                    ("SL.UEM.TOTL.ZS", "失業率（ILO推計）", "%", 1), ("SP.POP.TOTL", "人口", "億人", 1e8)]:
        row = {"label": label, "unit": unit, "ind": ind}
        for c in ("JPN", "USA"):
            r = max(wb(ind, c, mrv=5), key=lambda r: int(r["date"]))
            row[c] = {"year": int(r["date"]), "value": round(r["value"] / scale, 3)}
        compare.append(row)
    # 日本の消費者物価指数（2010年＝100）：お金の価値
    cpi = sorted([{"year": int(r["date"]), "value": round(r["value"], 2)} for r in wb("FP.CPI.TOTL", "JPN", date=f"1980:{TODAY.year}")], key=lambda x: x["year"])
    print(f"world      GDP {yr}年 1位 {rank[0]['name']} / インフレ {len(inf_latest)}か国 / CPI {cpi[0]['year']}〜{cpi[-1]['year']}")
    return {"retrieved": TODAY.isoformat(), "gdp_year": yr, "gdp_rank": rank, "inflation_latest": inf_latest,
            "inflation_hist": inf_hist, "compare": compare, "jp_cpi": cpi}


# ---------------- 企業（SEC EDGAR XBRL） ----------------
COMPANIES = [  # (CIK, 表示名, 国, 決算月の説明)
    (104169, "ウォルマート", "US", "1月"), (1018724, "アマゾン", "US", "12月"), (731766, "ユナイテッドヘルス", "US", "12月"),
    (320193, "アップル", "US", "9月"), (64803, "CVSヘルス", "US", "12月"), (1067983, "バークシャー・ハサウェイ", "US", "12月"),
    (1652044, "アルファベット（Google）", "US", "12月"), (34088, "エクソンモービル", "US", "12月"), (789019, "マイクロソフト", "US", "6月"),
    (1045810, "エヌビディア", "US", "1月"), (1094517, "トヨタ自動車", "JP", "3月"), (715153, "本田技研工業（ホンダ）", "JP", "3月"),
    (313838, "ソニーグループ", "JP", "3月"),
]
TAGS = {
    "revenue": ["Revenues", "RevenueFromContractWithCustomerExcludingAssessedTax", "Revenue", "RevenuesNetOfInterestExpense", "SalesRevenueNet"],
    "op_income": ["OperatingIncomeLoss", "ProfitLossFromOperatingActivities"],
    "net_income": ["NetIncomeLoss", "ProfitLossAttributableToOwnersOfParent", "NetIncomeLossAvailableToCommonStockholdersBasic"],
}


def sec_facts(cik):
    req = urllib.request.Request(f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik:010d}.json",
                                 headers={"User-Agent": "investment-indicators-research/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.load(r)


def annual(facts, tags):
    """年次報告書の1年分の値を {決算期末: (値, 通貨)} で返す（タグは優先順）。"""
    out = {}
    for tag in tags:
        for tax in ("us-gaap", "ifrs-full"):
            f = facts["facts"].get(tax, {}).get(tag)
            if not f:
                continue
            for unit, vals in f["units"].items():
                for v in sorted(vals, key=lambda v: v.get("filed", "")):
                    if v.get("form") not in ("10-K", "20-F") or "start" not in v:
                        continue
                    days = (datetime.date.fromisoformat(v["end"]) - datetime.date.fromisoformat(v["start"])).days
                    if 350 <= days <= 380 and v["end"] not in out:
                        out[v["end"]] = (v["val"], unit)
    return out


def fy_avg_usdjpy(end):
    """決算期の12か月の月中平均（日本銀行 FXERM07）の平均"""
    e = datetime.date.fromisoformat(end)
    months = [((e.year * 12 + e.month - 1 - i) // 12, (e.year * 12 + e.month - 1 - i) % 12 + 1) for i in range(12)]
    vals = [AVG_USDJPY.get(f"{y}-{m:02d}") for y, m in months]
    return round(sum(vals) / 12, 2) if all(vals) else None


AVG_USDJPY = {}


def companies():
    AVG_USDJPY.update(boj("FM08", "FXERM07"))
    res = []
    for cik, name, country, fyend in COMPANIES:
        f = sec_facts(cik)
        cols = {k: annual(f, t) for k, t in TAGS.items()}
        ends = sorted(cols["revenue"])[-6:]
        years = []
        for e in ends:
            rev, cur = cols["revenue"][e]
            row = {"end": e, "currency": cur, "revenue": rev,
                   "op_income": cols["op_income"].get(e, (None,))[0], "net_income": cols["net_income"].get(e, (None,))[0]}
            if cur == "JPY":
                row["usdjpy_avg"] = fy_avg_usdjpy(e)
            years.append(row)
        res.append({"cik": cik, "name": name, "entity": f["entityName"], "country": country, "fy_end_month": fyend, "years": years})
        last = years[-1]
        print(f"  {name:12s} 期末{last['end']} 売上 {last['revenue']/1e9:,.1f}B {last['currency']}  純利益 {(last['net_income'] or 0)/1e9:,.1f}B")
    return {"retrieved": TODAY.isoformat(), "list": res}


def main():
    data = {"meta": {"generated_at": TODAY.isoformat(), "start": START, "last_month": LAST_DONE, "sources": SOURCES}, "series": {}}
    data["world"] = world()
    data["companies"] = companies()
    for key, name, unit, src, note, fn in SERIES:
        pts = keep(fn())
        if not pts:
            raise SystemExit(f"{key}: データが取れませんでした")
        data["series"][key] = {"name": name, "unit": unit, "source": src, "note": note, "retrieved": TODAY.isoformat(), "points": pts}
        print(f"{key:10s} {pts[0]['ym']}〜{pts[-1]['ym']}  最新 {pts[-1]['value']}{unit}  ({len(pts)}件)")
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    # ページ用（ファイルを直接開いても表示できるように JS としても書き出す）
    (OUT.parent / "assets" / "data.js").write_text("window.DATA = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("書き出し:", OUT)


if __name__ == "__main__":
    main()
