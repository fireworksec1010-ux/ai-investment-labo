# 数字で学ぶ、経済と投資

為替・金利などの経済の数字を、公的機関のデータでまとめた学習サイト（静的HTML・GitHub Pages想定）。

## 月次更新
毎月はじめに、前月末の値を反映する。

```
py -I scripts/update_data.py
```

`data.json`（ダウンロード用）と `assets/data.js`（ページ表示用）が更新される。

## データと出典
| 指標 | 出典 |
|---|---|
| ドル円（17時時点・月末） | 日本銀行 時系列統計データ（FXERM06） |
| ユーロ円（月末） | 欧州中央銀行（ECB）ユーロ参照レート |
| 日本の政策金利（無担保コールO/N・月末） | 日本銀行（STRECLUCON） |
| アメリカの政策金利（FF実効金利・月末） | FRB H.15 |
| 日本10年国債（月末） | 財務省 国債金利情報 |
| アメリカ10年国債（月末） | 米国財務省 |

株価指数（オルカン／MSCI ACWI、S&P500、日経平均、TOPIX）は著作権があるため数値を載せず、説明と公式リンクのみ。

## ページ構成（投稿テーマと対応）
| テーマ | ページ |
|---|---|
| Investment Basics（投資の基礎） | basics.html（株式・PER/PBR・配当・複利計算）、stocks.html（株価指数） |
| Global Economy（世界経済） | world.html（GDP・インフレ・日米比較）、fx.html、rates.html |
| Company Analysis（企業分析） | companies.html（売上ランキング・Apple/Microsoft・日本企業） |
| Money Education（お金の教養） | money.html（貯金と投資・インフレ・将来価値計算・リスクとリターン） |

追加の出典：世界銀行 World Development Indicators（CC BY 4.0）、米国証券取引委員会 EDGAR（XBRL companyfacts）。

## 注目業界・注目企業（日本語のみ）
- industries.html（注目業界マップ：7業界）、jp_companies.html（注目企業：37社）
- 業績データ：`py -I scripts/update_jp_companies.py`（TDnetの決算短信XBRLから売上高・営業利益・前年同期比を取得。TDnetは直近約1か月分のため、見つからない会社は前回の値を残す）
- 毎月の更新では update_data.py と update_jp_companies.py の両方を実行する
