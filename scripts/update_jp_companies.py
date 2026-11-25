"""日本の注目企業：TDnet（東証の適時開示）の決算短信XBRLから最新の業績を取り出す。

使い方:  py -I scripts/update_jp_companies.py
- TDnet の公開一覧は直近約1か月分だけなので、見つからない会社は前回の数字を残す。
- 出力: jp_companies.json（ダウンロード用）と assets/jp_companies.js（ページ表示用）
- 数字は各社が公表した決算短信のサマリー（売上高・営業利益・前年同期比）をそのまま使う。
"""
import re, io, json, zipfile, datetime, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "jp_companies.json"
BASE = "https://www.release.tdnet.info/inbs/"
TODAY = datetime.date.today()

# (コード, 社名, 業界キー[複数可], 役割, 事業内容, IRページ)
COMPANIES = [
    ("8035", "東京エレクトロン", ["semi"], "製造装置", "半導体をつくる工場で使う製造装置（膜をつける・削る・塗るなど）をつくる。", "https://www.tel.co.jp/ir/"),
    ("6857", "アドバンテスト", ["semi"], "検査装置", "完成した半導体が正しく動くかを調べるテスト装置をつくる。AI向けの高性能半導体の検査で使われる。", "https://www.advantest.com/ja/investors/"),
    ("6146", "ディスコ", ["semi"], "加工装置", "半導体の材料（ウエハー）を切る・削る・磨く装置をつくる。", "https://www.disco.co.jp/jp/ir/"),
    ("6920", "レーザーテック", ["semi"], "検査装置", "半導体の回路の原版（フォトマスク）などに傷やごみがないかを調べる検査装置をつくる。", "https://www.lasertec.co.jp/ir/"),
    ("6525", "KOKUSAI ELECTRIC", ["semi"], "製造装置", "ウエハーに薄い膜をつける成膜装置などをつくる。", "https://www.kokusai-electric.com/ir/"),
    ("7735", "SCREENホールディングス", ["semi"], "製造装置", "半導体の製造途中でウエハーを洗う洗浄装置などをつくる。", "https://www.screen.co.jp/ir/"),
    ("6315", "TOWA", ["semi"], "製造装置", "できあがった半導体のチップを樹脂で包んで守る「封止（モールディング）」の装置をつくる。", "https://www.towajapan.co.jp/jp/ir/"),
    ("6871", "日本マイクロニクス", ["semi"], "検査部品", "半導体を電気で検査するときに使う「プローブカード」をつくる。", "https://www.mjc.co.jp/ir/"),
    ("4063", "信越化学工業", ["semi"], "材料", "半導体の材料になるシリコンウエハーや、塩化ビニル樹脂などをつくる化学メーカー。", "https://www.shinetsu.co.jp/jp/ir/"),
    ("6723", "ルネサスエレクトロニクス", ["semi"], "半導体メーカー", "自動車や家電を制御する半導体（マイコンなど）をつくる。", "https://www.renesas.com/ja/about/investor-relations"),
    ("285A", "キオクシアホールディングス", ["semi"], "半導体メーカー", "スマホやデータセンターでデータを記録するフラッシュメモリーをつくる。", "https://www.kioxia-holdings.com/ja-jp/ir.html"),
    ("6954", "ファナック", ["robot"], "ロボット", "工場で働く産業用ロボットや、工作機械を動かす制御装置（NC）をつくる。", "https://www.fanuc.co.jp/ja/ir/"),
    ("6506", "安川電機", ["robot"], "ロボット", "産業用ロボットや、機械を正確に動かすモーター（サーボモーター）をつくる。", "https://www.yaskawa.co.jp/ir"),
    ("6861", "キーエンス", ["robot"], "センサー・計測", "工場の自動化に使うセンサーや測定器、画像で検査する機器をつくる。", "https://www.keyence.co.jp/company/"),
    ("6268", "ナブテスコ", ["robot"], "部品", "ロボットの関節などに使われる精密減速機をつくる。鉄道や船舶向けの機器も手がける。", "https://www.nabtesco.com/ir/index.html"),
    ("6324", "ハーモニック・ドライブ・システムズ", ["robot"], "部品", "ロボットの関節などに使われる小型で精密な減速機をつくる。", "https://www.hds.co.jp/ir/"),
    ("7012", "川崎重工業", ["robot", "defense"], "ロボット・重工", "産業用ロボットのほか、航空機・防衛装備、船、二輪車などを幅広くつくる。", "https://www.khi.co.jp/ir/"),
    ("7011", "三菱重工業", ["space", "defense", "dc"], "重工", "H3ロケットの打ち上げ、防衛装備、発電用のガスタービンなどを手がける。", "https://www.mhi.com/jp/finance"),
    ("7013", "IHI", ["space", "defense"], "重工", "航空機エンジン、ロケット関連、防衛向けの機器などをつくる。", "https://www.ihi.co.jp/ir/"),
    ("6701", "NEC", ["space", "defense", "cyber"], "電機・IT", "人工衛星、防衛向けのレーダーや通信、サイバーセキュリティ、ITシステムを手がける。", "https://jpn.nec.com/ir/"),
    ("6503", "三菱電機", ["defense", "space"], "電機", "防衛向けのレーダーなど、人工衛星、工場の自動化機器、空調などを手がける。", "https://www.mitsubishielectric.co.jp/ir/"),
    ("290A", "Synspective", ["space"], "宇宙ベンチャー", "雲や夜でも地表を観測できる小型レーダー衛星（SAR衛星）を開発し、そのデータを提供する。", "https://synspective.com/jp/ir/"),
    ("5595", "QPS研究所", ["space"], "宇宙ベンチャー", "福岡を拠点に、小型レーダー衛星（SAR衛星）を開発・運用する。", "https://i-qps.net/ir/"),
    ("9348", "ispace", ["space"], "宇宙ベンチャー", "月に着陸する機体を開発し、月への荷物輸送サービスを目指す。", "https://ispace-inc.com/jpn/ir/"),
    ("186A", "アストロスケールホールディングス", ["space"], "宇宙ベンチャー", "宇宙ごみ（デブリ）の除去など、宇宙空間での新しいサービスを開発する。", "https://astroscale.com/ja/ir/"),
    ("5803", "フジクラ", ["dc"], "電線・光通信", "光ファイバーや光ケーブルなどをつくる。データセンターをつなぐ通信網で使われる。", "https://www.fujikura.co.jp/ir/"),
    ("5801", "古河電気工業", ["dc"], "電線・光通信", "光ファイバーや電線、自動車部品などをつくる。", "https://www.furukawa.co.jp/ir/"),
    ("5802", "住友電気工業", ["dc"], "電線・光通信", "電線や光ファイバー、自動車用の配線（ワイヤーハーネス）などをつくる。", "https://sumitomoelectric.com/jp/ir"),
    ("3778", "さくらインターネット", ["dc"], "データセンター", "国内でデータセンターとクラウドサービスを運営し、生成AI向けの計算サービスも提供する。", "https://www.sakura.ad.jp/corporate/ir/"),
    ("6501", "日立製作所", ["dc"], "電力網・IT", "電気を送る送配電の設備、鉄道、ITサービスなどを手がける。", "https://www.hitachi.co.jp/IR/"),
    ("6752", "パナソニック ホールディングス", ["battery"], "電池", "電気自動車向けなどのリチウムイオン電池や、家電、電子部品などを手がける。", "https://holdings.panasonic/jp/corporate/investors.html"),
    ("6674", "GSユアサ", ["battery"], "電池", "自動車用のバッテリーや、産業用・宇宙用のリチウムイオン電池などをつくる。", "https://www.gs-yuasa.com/jp/ir/"),
    ("6762", "TDK", ["battery"], "電池・電子部品", "スマホなどに使う小型のリチウムイオン電池や、電子部品をつくる。", "https://www.tdk.com/ja/ir/"),
    ("4704", "トレンドマイクロ", ["cyber"], "セキュリティ", "コンピューターウイルス対策など、サイバーセキュリティの製品・サービスを提供する。", "https://www.trendmicro.com/ja_jp/about/investor-relations.html"),
    ("3692", "FFRIセキュリティ", ["cyber"], "セキュリティ", "国産のサイバーセキュリティ製品や、官公庁・防衛向けのサービスを提供する。", "https://www.ffri.jp/ir/"),
    ("9432", "NTT", ["cyber", "dc"], "通信", "通信サービスのほか、国内外でデータセンターやセキュリティのサービスを手がける。", "https://group.ntt/jp/ir/"),
    ("6702", "富士通", ["cyber"], "IT", "企業や官公庁のITシステム、クラウド、セキュリティなどのサービスを提供する。", "https://global.fujitsu/ja-jp/ir"),
]
SALES = ["NetSales", "NetSalesIFRS", "SalesIFRS", "NetSalesUS", "OperatingRevenues", "OperatingRevenuesIFRS", "OperatingRevenuesUS", "RevenueIFRS", "RevenuesUS", "Revenue"]
OPINC = ["OperatingIncome", "OperatingIncomeIFRS", "OperatingIncomeUS", "OperatingProfitIFRS"]


def get(u, binary=False):
    req = urllib.request.Request(u, headers={"User-Agent": "investment-indicators-research/1.0"})
    with urllib.request.urlopen(req, timeout=90) as r:
        b = r.read()
    return b if binary else b.decode("utf-8", "replace")


ROW = re.compile(r'kjTime" noWrap>([^<]*)</td>\s*<td[^>]*kjCode" noWrap>([^<]*)</td>\s*<td[^>]*kjName" noWrap>([^<]*)</td>\s*'
                 r'<td[^>]*kjTitle"[^>]*><a href="([^"]+)"[^>]*>([^<]*)</a></td>\s*<td[^>]*kjXbrl"[^>]*>(.*?)</td>', re.S)


def scan(codes):
    """直近31日のTDnet一覧から、各社の最新の決算短信（訂正を除く）を探す"""
    found = {}
    for k in range(0, 32):
        d = TODAY - datetime.timedelta(days=k)
        for pg in range(1, 60):
            try:
                h = get(f"{BASE}I_list_{pg:03d}_{d:%Y%m%d}.html")
            except Exception:
                break
            rows = ROW.findall(h)
            if not rows:
                break
            for t, code, name, pdf, title, x in rows:
                c = code.strip()[:4]
                z = re.search(r'href="([^"]+\.zip)"', x)
                if c in codes and c not in found and "決算短信" in title and "訂正" not in title and z:
                    found[c] = {"date": d.isoformat(), "time": t.strip(), "title": title.strip(), "pdf": BASE + pdf, "zip": BASE + z.group(1)}
            if f"I_list_{pg + 1:03d}_{d:%Y%m%d}.html" not in h:
                break
    return found


NF = re.compile(r"<ix:nonFraction([^>]*)>(.*?)</ix:nonFraction>", re.S)
ATTR = re.compile(r'(\w+(?::\w+)?)="([^"]*)"')


def summary(zbytes):
    """決算短信サマリーのiXBRLから {(項目, context): 値} を作る"""
    z = zipfile.ZipFile(io.BytesIO(zbytes))
    names = [n for n in z.namelist() if "/Summary/" in n and n.endswith("ixbrl.htm")]
    if not names:
        return {}
    html = z.read(names[0]).decode("utf-8", "replace")
    vals = {}
    for attrs, text in NF.findall(html):
        a = dict(ATTR.findall(attrs))
        nm = a.get("name", "").split(":")[-1]
        txt = re.sub(r"<[^>]+>", "", text).replace(",", "").strip()
        if not txt or a.get("xsi:nil") == "true":
            continue
        try:
            v = float(txt) * (10 ** int(a.get("scale", "0")))
        except ValueError:
            continue
        if a.get("sign") == "-":
            v = -v
        vals[(nm, a.get("contextRef", ""))] = v
    return vals


CUR = re.compile(r"^Current(AccumulatedQ\d|Year)Duration_(Consolidated|NonConsolidated)Member_ResultMember$")


def pick(vals, names):
    ctxs = sorted({c for (_, c) in vals if CUR.match(c)}, key=lambda c: ("NonConsolidated" in c))
    for ctx in ctxs:
        for n in names:
            if (n, ctx) in vals:
                ch = vals.get(("ChangeIn" + n, ctx))
                return {"value": vals[(n, ctx)], "change": None if ch is None else round(ch * 100, 1), "tag": n}
    return None


def period_label(title):
    t = re.split(r"決算短信", title)[0]
    return re.sub(r"\s+", " ", t).strip(" 　")


def main():
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    old = {}
    if OUT.exists():
        old = {c["code"]: c.get("results") for c in json.loads(OUT.read_text(encoding="utf-8"))["companies"]}
    found = scan({c[0] for c in COMPANIES})
    out = []
    for code, name, inds, role, desc, ir in COMPANIES:
        res = old.get(code)
        f = found.get(code)
        if f:
            try:
                vals = summary(get(f["zip"], binary=True))
                s, o = pick(vals, SALES), pick(vals, OPINC)
                if s:
                    res = {"period": period_label(f["title"]), "date": f["date"], "pdf": f["pdf"], "title": f["title"], "sales": s, "op": o}
            except Exception as e:
                print("  ! 取得失敗", code, name, e)
        out.append({"code": code, "name": name, "industries": inds, "role": role, "desc": desc, "ir": ir, "results": res})
        r = res
        print(f"{code} {name:16s} " + (f"{r['period']} 売上 {r['sales']['value']/1e8:,.0f}億円 ({r['sales']['change']}%)  営業利益 " +
              (f"{r['op']['value']/1e8:,.0f}億円 ({r['op']['change']}%)" if r.get('op') else "—") if r else "データなし（各社IRで確認）"))
    data = {"generated_at": TODAY.isoformat(), "source": {"org": "日本取引所グループ TDnet（適時開示情報閲覧サービス）", "url": "https://www.release.tdnet.info/inbs/I_main_00.html"},
            "companies": out}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    (ROOT / "assets" / "jp_companies.js").write_text("window.JPCO = " + json.dumps(data, ensure_ascii=False) + ";\n", encoding="utf-8")
    print("書き出し:", OUT)


if __name__ == "__main__":
    main()
