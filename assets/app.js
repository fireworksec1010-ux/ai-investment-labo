/* 共通：ヘッダー・フッター・データ・グラフ */
(function(){
  var LANG = document.documentElement.lang === "en" ? "en" : (/^zh/.test(document.documentElement.lang) ? "zh" : "ja");
  var EN = LANG === "en", ZH = LANG === "zh";
  function T(ja, en, zh){ return ZH ? (zh != null ? zh : en) : (EN ? en : ja); }
  var NAV = ZH ? [
    ["index.html","首頁"],["basics.html","投資基礎"],["world.html","全球經濟"],["companies.html","企業分析"],
    ["money.html","理財素養"],["about.html","資料來源"]
  ] : EN ? [
    ["index.html","Home"],["basics.html","Basics"],["world.html","Economy"],["companies.html","Companies"],
    ["money.html","Money"],["about.html","Sources"]
  ] : [
    ["index.html","トップ"],["basics.html","投資の基礎"],["world.html","世界経済"],["companies.html","企業分析"],
    ["money.html","お金の教養"],["about.html","出典・免責"]
  ];
  var SUBNAV = ZH ? [["stocks.html","股價指數"],["fx.html","匯率"],["rates.html","利率"]] : EN ? [["stocks.html","Stock indexes"],["fx.html","Exchange rates"],["rates.html","Interest rates"]] : [["stocks.html","株価指数"],["fx.html","為替"],["rates.html","金利"]];
  var CTRY_EN = { KOR:"South Korea", RUS:"Russia", TUR:"Turkey", IRN:"Iran", EGY:"Egypt", VNM:"Vietnam" };
  var PARENT = { "stocks.html":"basics.html", "fx.html":"world.html", "rates.html":"world.html" };
  var here = location.pathname.split("/").pop() || "index.html";
  var active = PARENT[here] || here;

  var THEME = { "index.html":"home", "basics.html":"basics", "stocks.html":"basics", "world.html":"world", "fx.html":"world", "rates.html":"world",
    "companies.html":"companies", "money.html":"money", "about.html":"about" };
  var ART = { "basics.html":"basics", "stocks.html":"stocks", "world.html":"world", "fx.html":"fx", "rates.html":"rates",
    "companies.html":"companies", "money.html":"money", "about.html":"about", "index.html":"hero" };
  var LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="21" r="16" fill="#ffc53d" stroke="#1b1f3b" stroke-width="2.5"/><circle cx="20" cy="21" r="11" fill="none" stroke="#e39b00" stroke-width="2"/>'+
    '<path d="M13 26 L18 20 L22 23 L28 15" fill="none" stroke="#1b1f3b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 14.5 L28.5 14.5 L28.5 19" fill="none" stroke="#1b1f3b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var page = here==="index.html" ? "" : here;
  function langHref(l){ return (LANG==="ja" ? "" : "../")+(l==="ja" ? "" : l+"/")+page; }
  var LANGS = [["ja","日本語"],["en","EN"],["zh","中文"]].filter(function(x){ return x[0]!==LANG; });
  var other = langHref(LANGS[0][0]);
  function head(){
    document.body.dataset.theme = THEME[here] || "home";
    var h = document.createElement("header"); h.className = "site-head";
    h.innerHTML = '<div class="wrap"><a class="logo" href="index.html">'+LOGO+'<span class="lt">'+T('数字で学ぶ<i>、</i>経済と投資','Learn <i>Economy</i> with Numbers','用數字學<i>經濟</i>與投資')+'</span></a><nav class="nav">'+
      NAV.map(function(n){ return '<a href="'+n[0]+'"'+(n[0]===active?' class="active"':'')+'>'+n[1]+'</a>'; }).join("")+
      LANGS.map(function(x,i){ return '<a class="lang'+(i?' lang2':'')+'" href="'+langHref(x[0])+'" hreflang="'+(x[0]==="zh"?"zh-Hant":x[0])+'" lang="'+(x[0]==="zh"?"zh-Hant":x[0])+'">'+x[1]+'</a>'; }).join("")+'</nav></div>';
    document.body.insertBefore(h, document.body.firstChild);
    if(window.DATA) h.insertAdjacentElement("afterend", ticker());
    var M = window.ILLUST ? ILLUST.mascot() : "";
    var f = document.createElement("footer");
    f.innerHTML = '<div class="wrap">'+M+'<div><div class="fname">'+T("数字で学ぶ、経済と投資","Learn Economy with Numbers","用數字學經濟與投資")+'</div><div class="links">'+NAV.concat(SUBNAV).map(function(n){ return '<a href="'+n[0]+'">'+n[1]+'</a>'; }).join("")+
      LANGS.map(function(x){ return '<a href="'+langHref(x[0])+'">'+({ja:"日本語",en:"English",zh:"中文（繁體）"})[x[0]]+'</a>'; }).join("")+'</div>'+
      '<div>'+T('このサイトは経済と投資について学ぶための情報提供を目的としており、特定の銘柄や金融商品の売買をすすめるものではありません。投資の判断はご自身の責任で行ってください。',
        'This site is for learning about the economy and investing. It does not recommend buying or selling any specific stock or financial product. Please make your own investment decisions.',
        '本網站以學習經濟與投資為目的提供資訊，並不推薦買賣任何特定股票或金融商品。投資判斷請自行負責。')+'</div>'+
      '<div style="margin-top:6px;">'+T('データ更新：','Data updated: ','資料更新：')+(window.DATA ? fmtDate(DATA.meta.generated_at) : "")+T('（毎月はじめに更新）・キャラクター「コイン先生」はこのサイトのオリジナルです',' (updated at the start of each month) · "Coin Sensei" is an original character of this site','（每月月初更新）・角色「硬幣老師」為本網站原創')+'</div></div></div>';
    document.body.appendChild(f);
    decorate();
  }

  /* ニュースのような数字のテロップ */
  function ticker(){
    var items = ZH ? [["usdjpy","美元兌日圓"],["eurjpy","歐元兌日圓"],["jp_policy","日本政策利率"],["us_policy","美國政策利率"],["jp10y","日本10年期國債"],["us10y","美國10年期公債"]]
      : EN ? [["usdjpy","USD/JPY"],["eurjpy","EUR/JPY"],["jp_policy","Japan policy rate"],["us_policy","U.S. policy rate"],["jp10y","Japan 10Y bond"],["us10y","U.S. 10Y Treasury"]]
      : [["usdjpy","ドル円"],["eurjpy","ユーロ円"],["jp_policy","日本の政策金利"],["us_policy","アメリカの政策金利"],["jp10y","日本10年国債"],["us10y","アメリカ10年国債"]];
    var one = '<span class="it"><span class="lbl">'+endOf(last("usdjpy").ym)+'</span></span>'+items.map(function(k){
      var s = S(k[0]), a = last(k[0]), b = last(k[0],1), d = a.value-b.value;
      var cls = d>0.0005 ? "u" : (d<-0.0005 ? "d" : "f"), mark = d>0.0005 ? "▲" : (d<-0.0005 ? "▼" : "−");
      return '<span class="it">'+k[1]+' <b>'+num(a.value, s.unit)+unitTxt(s.unit)+'</b><span class="'+cls+'">'+mark+Math.abs(d).toFixed(2)+'</span></span>';
    }).join("");
    var t = document.createElement("div"); t.className = "ticker"; t.setAttribute("aria-label",T("最新の為替と金利","Latest exchange and interest rates","最新匯率與利率"));
    t.innerHTML = '<div class="track">'+one+one+one+one+'</div>';
    return t;
  }

  /* イラスト・キャラクター・動きの演出 */
  function decorate(){
    var hero = document.querySelector(".hero");
    if(hero && window.ILLUST && ART[here] && !hero.querySelector(".hero-art")){
      var txt = document.createElement("div"); txt.className = "hero-text";
      while(hero.firstChild) txt.appendChild(hero.firstChild);
      hero.appendChild(txt);
      var art = document.createElement("div"); art.className = "hero-art"; art.innerHTML = ILLUST[ART[here]]();
      hero.appendChild(art);
      if(here==="index.html" && window.DATA){ // 食品サイトのような「浮かぶ値札」
        var W = DATA.world, rk = W.gdp_rank.map(function(r){ return r.code; }).indexOf("JPN")+1;
        art.insertAdjacentHTML("beforeend",
          '<div class="scene-tag t1" style="--tc:#2a78d6">'+T("ドル円","USD/JPY","美元兌日圓")+'<span class="v">'+last("usdjpy").value.toFixed(2)+'<small>'+T("円","yen","日圓")+'</small></span></div>'+
          '<div class="scene-tag t2" style="--tc:#1baf7a">'+T("日本の10年国債","Japan 10Y bond","日本10年期國債")+'<span class="v">'+last("jp10y").value.toFixed(2)+'<small>%</small></span></div>'+
          '<div class="scene-tag t3" style="--tc:#eb6834">'+T("日本のGDP（"+W.gdp_year+"年）","Japan GDP ("+W.gdp_year+")","日本GDP（"+W.gdp_year+"年）")+'<span class="v">'+T(rk+"<small>位</small>", "No."+rk, "第"+rk+"<small>名</small>")+'</span></div>');
      }
    }
    if(!document.querySelector(".bg-deco")){
      var bg = document.createElement("div"); bg.className = "bg-deco"; bg.setAttribute("aria-hidden","true");
      bg.innerHTML = '<div class="wave"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>';
      document.body.insertBefore(bg, document.body.firstChild);
    }
    if(window.ILLUST) document.querySelectorAll(".quick").forEach(function(q){
      if(q.classList.contains("has-mascot")) return;
      var tag = q.querySelector(".tag"), wow = tag && /注意|注目|Watch|Note|Look|留意|重點/.test(tag.textContent);
      var b = document.createElement("div"); b.className = "bubble";
      while(q.firstChild) b.appendChild(q.firstChild);
      q.innerHTML = ILLUST.mascot(wow ? "wow" : ""); q.appendChild(b); q.classList.add("has-mascot");
    });
    document.querySelectorAll("[data-illust]").forEach(function(el){ if(window.ILLUST) el.innerHTML = ILLUST[el.dataset.illust](); });
    /* スクロールで表示 */
    var targets = document.querySelectorAll("main > section");
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); countUp(e.target); io.unobserve(e.target); } }); }, {rootMargin:"0px 0px -8% 0px"});
      targets.forEach(function(s){ var r = s.getBoundingClientRect(); if(r.top < innerHeight){ countUp(s); return; } s.classList.add("reveal"); io.observe(s); });
    }
  }
  function countUp(root){
    root.querySelectorAll("[data-count]").forEach(function(el){
      if(el.dataset.done) return; el.dataset.done = 1;
      var to = +el.dataset.count, dec = +el.dataset.dec || 0, t0 = null, dur = 900;
      if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      function f(t){ if(!t0) t0 = t; var p = Math.min(1, (t-t0)/dur), e = 1-Math.pow(1-p,3);
        el.textContent = (to*e).toFixed(dec); if(p<1) requestAnimationFrame(f); else el.textContent = to.toFixed(dec); }
      requestAnimationFrame(f);
    });
  }

  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function fmtDate(s){ var a = s.split("-"); return EN ? MON[+a[1]-1]+" "+(+a[2])+", "+a[0] : a[0]+"年"+(+a[1])+"月"+(+a[2])+"日"; }
  function ymLabel(ym){ var a = ym.split("-"); return EN ? MON[+a[1]-1]+" "+a[0] : a[0]+"年"+(+a[1])+"月"; }
  function endOf(ym){ return EN ? "End of "+ymLabel(ym) : ymLabel(ym)+T("末","","底"); }
  function unitTxt(u){ return u==="%" ? "%" : T("円"," yen"," 日圓"); }
  function nm(o){ return o ? (ZH ? (o.name_zh||o.name_en||o.name) : EN ? (o.name_en||o.name) : o.name) : ""; }
  function cname(r){ return ZH ? (r.name_zh || r.name) : EN ? (CTRY_EN[r.code] || r.name_en || r.name) : r.name; }
  function S(key){ return DATA.series[key]; }
  function last(key, back){ var p = S(key).points; return p[p.length-1-(back||0)]; }
  function num(v, unit){ return unit==="%" ? v.toFixed(2) : v.toFixed(2); }
  function src(id){ return DATA.meta.sources.filter(function(s){ return s.id===id; })[0]; }
  function comma(v, d){ return v.toLocaleString(EN ? "en-US" : ZH ? "zh-TW" : "ja-JP", {minimumFractionDigits:d||0, maximumFractionDigits:d||0}); }
  /* 大きな金額を「兆・億」で */
  function yen(v){ // v: 円
    var a = Math.abs(v);
    if(a>=1e12) return comma(v/1e12, 1)+"兆円";
    if(a>=1e8) return comma(v/1e8, 0)+"億円";
    if(a>=1e4) return comma(v/1e4, 0)+"万円";
    return comma(v, 0)+"円";
  }
  function oku(v){ return comma(v/1e8, 0)+"億ドル"; }  // v: ドル

  /* 前月・1年前との違い */
  function change(key, back){
    var a = last(key), b = last(key, back), s = S(key), d = a.value - b.value;
    var cls = d>0.0005 ? "up" : (d<-0.0005 ? "down" : "");
    var sign = d>0 ? "+" : (d<0 ? "−" : "±");
    var txt = s.unit==="%" ? sign+Math.abs(d).toFixed(2)+T("ポイント"," pt"," 個百分點") : sign+Math.abs(d).toFixed(2)+T("円"," yen"," 日圓");
    return '<span class="'+cls+'">'+txt+'</span>';
  }

  /* カードの右上に小さな1年分の線 */
  function spark(key){
    var p = S(key).points.slice(-13).map(function(x){ return x.value; }), lo = Math.min.apply(null,p), hi = Math.max.apply(null,p), r = (hi-lo)||1;
    var d = p.map(function(v,i){ return (i?"L":"M")+(2+i*(86/12)).toFixed(1)+","+(32-(v-lo)/r*28).toFixed(1); }).join(" ");
    var lp = d.split(" ").pop().slice(1).split(",");
    return '<svg class="spark" viewBox="0 0 90 36" aria-hidden="true"><path d="'+d+'" fill="none" stroke="var(--t)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+lp[0]+'" cy="'+lp[1]+'" r="3.5" fill="var(--t)" stroke="#1b1f3b" stroke-width="1.5"/></svg>';
  }

  function tile(key, o){
    var s = S(key), p = last(key);
    return '<a class="card tile" href="'+o.href+'"><div class="cat">'+o.cat+'</div><div class="nm">'+(o.name||nm(s))+'</div>'+
      spark(key)+
      '<div class="val"><span data-count="'+p.value+'" data-dec="2">'+num(p.value, s.unit)+'</span><small>'+(s.unit==="%"?"%":T("円","yen","日圓"))+'</small></div>'+
      '<div class="chg">'+T('前の月から ','vs last month ','較上月 ')+change(key,1)+T('　1年前から ','　vs 1 year ago ','　較1年前 ')+change(key,12)+'</div>'+
      '<div class="when">'+T(ymLabel(p.ym)+'末時点・出典：'+src(s.source).org, endOf(p.ym)+' · Source: '+src(s.source).org_en, endOf(p.ym)+'・來源：'+src(s.source).org_zh)+'</div>'+
      (o.more ? '<div class="more">'+o.more+' →</div>' : '')+'</a>';
  }

  /* ---------- 汎用の折れ線グラフ ----------
     cfg = { title, labels:[x軸の文字], tipLabels:[ツールチップ見出し], series:[{name, short, values:[]}],
             fmt:function(v), axisFmt:function(v), tickEvery:function(i,label)->文字|null, foot, ranges:[[n,"1年"],...], zero:bool } */
  var COLORS = ["var(--s1)","var(--s2)"];
  function plot(box, cfg){
    var narrow = box.clientWidth && box.clientWidth < 560;
    var NS = "http://www.w3.org/2000/svg", W = 720, H = 300, m = {t:16, r:narrow?150:96, b:30, l:narrow?70:52};
    var ranges = cfg.ranges, rn = ranges ? ranges[ranges.length-1][0] : null, multi = cfg.series.length>1;
    box.innerHTML = '<div class="chart-top"><div class="ttl">'+cfg.title+'</div>'+(ranges ? '<div class="seg">'+
      ranges.map(function(r){ return '<button data-r="'+r[0]+'"'+(r[0]===rn?' class="on"':'')+'>'+r[1]+'</button>'; }).join("")+'</div>' : '')+'</div>'+
      (multi ? '<div class="legend">'+cfg.series.map(function(s,i){ return '<span><i style="background:'+COLORS[i]+'"></i>'+s.name+'</span>'; }).join("")+'</div>' : '')+
      '<div class="chart-wrap"><svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+cfg.title+'"></svg><div class="tip"></div></div>'+
      '<div class="chart-foot">'+(cfg.foot||"")+'</div>'+
      '<details class="table-view"><summary>'+T("数値を表で見る","Show as a table","以表格檢視數值")+'</summary><div class="tbl-wrap"></div></details>';
    var svg = box.querySelector("svg"), tip = box.querySelector(".tip");
    box.querySelectorAll(".seg button").forEach(function(b){
      b.addEventListener("click", function(){
        box.querySelectorAll(".seg button").forEach(function(x){ x.classList.remove("on"); });
        b.classList.add("on"); rn = +b.dataset.r; draw();
      });
    });
    function draw(){
      while(svg.firstChild) svg.removeChild(svg.firstChild);
      function el(t,a){ var e = document.createElementNS(NS,t); for(var k in a) e.setAttribute(k,a[k]); svg.appendChild(e); return e; }
      var N = cfg.labels.length, from = rn ? Math.max(0, N-rn) : 0;
      var labels = cfg.labels.slice(from), tl = (cfg.tipLabels||cfg.labels).slice(from);
      var sets = cfg.series.map(function(s){ return s.values.slice(from); });
      var all = []; sets.forEach(function(s){ s.forEach(function(v){ if(v!=null) all.push(v); }); });
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      if(cfg.zero) lo = Math.min(0, lo);
      var span = (hi-lo) || 1, raw = span/5, mag = Math.pow(10, Math.floor(Math.log10(raw)));
      var step = [1,2,2.5,5,10].map(function(x){ return x*mag; }).filter(function(x){ return x>=raw; })[0];
      var y0 = Math.floor(lo/step)*step, y1 = Math.ceil(hi/step)*step;
      if(lo>=0 && y0<0) y0 = 0;
      var len = labels.length, iw = W-m.l-m.r, ih = H-m.t-m.b;
      function sx(i){ return m.l + (len>1 ? i/(len-1)*iw : iw/2); }
      function sy(v){ return m.t + ih - (v-y0)/(y1-y0)*ih; }
      var af = cfg.axisFmt || function(v){ return v; };
      for(var v=y0; v<=y1+step/2; v+=step){
        var vv = Math.round(v*1e6)/1e6;
        el("line",{class:"grid", x1:m.l, x2:W-m.r, y1:sy(vv), y2:sy(vv)});
        el("text",{class:"ax", x:m.l-8, y:sy(vv)+4, "text-anchor":"end"}).textContent = af(vv, step);
      }
      if(y0<0) el("line",{x1:m.l, x2:W-m.r, y1:sy(0), y2:sy(0), stroke:"var(--muted)", "stroke-width":1});
      var gap = box.clientWidth && box.clientWidth < 560 ? 120 : 60, lastX = -1e9;  // 文字が重ならない間隔
      labels.forEach(function(l,i){
        var t = cfg.tickEvery ? cfg.tickEvery(i, l, len) : l;
        if(t && sx(i)-lastX >= gap){ el("text",{class:"ax", x:sx(i), y:H-8, "text-anchor":"middle"}).textContent = t; lastX = sx(i); }
      });
      var ends = [];
      sets.forEach(function(s,si){
        var d = "", pen = false;
        s.forEach(function(v,i){ if(v==null){ pen = false; return; } d += (pen?"L":"M")+sx(i).toFixed(1)+","+sy(v).toFixed(1); pen = true; });
        if(!multi && d){ // 1本のときは下を薄く塗る
          var gid = "g"+Math.random().toString(36).slice(2,8), df = el("defs",{});
          df.innerHTML = '<linearGradient id="'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+COLORS[0].replace(/var\((.*)\)/, function(_,v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); })+'" stop-opacity=".22"/><stop offset="1" stop-color="#3b6cff" stop-opacity="0"/></linearGradient>';
          var xs = s.map(function(v,i){ return v==null?null:i; }).filter(function(i){ return i!=null; });
          el("path",{d:d+" L"+sx(xs[xs.length-1]).toFixed(1)+","+sy(y0)+" L"+sx(xs[0]).toFixed(1)+","+sy(y0)+" Z", fill:"url(#"+gid+")"});
        }
        el("path",{class:"ln"+(drawn?"":" anim"), stroke:COLORS[si], d:d, pathLength:1});
        for(var k=s.length-1;k>=0;k--) if(s[k]!=null){ ends.push({y:sy(s[k]), v:s[k], si:si}); el("circle",{cx:sx(k), cy:sy(s[k]), r:4, fill:COLORS[si], stroke:"#fff", "stroke-width":2}); break; }
      });
      ends.sort(function(a,b){ return a.y-b.y; });
      for(var j=1;j<ends.length;j++) if(ends[j].y-ends[j-1].y<30) ends[j].y = ends[j-1].y+30;
      ends.forEach(function(e){
        el("text",{class:"lbl", x:W-m.r+10, y:e.y+4}).textContent = cfg.fmt(e.v);
        if(multi) el("text",{class:"ax", x:W-m.r+10, y:e.y+18}).textContent = cfg.series[e.si].short || "";
      });
      var hl = el("line",{class:"hv", y1:m.t, y2:m.t+ih});
      var dots = sets.map(function(s,si){ return el("circle",{r:5, fill:COLORS[si], stroke:"#fff", "stroke-width":2, style:"display:none"}); });
      var hit = el("rect",{class:"hit", x:m.l, y:m.t, width:iw, height:ih});
      function at(e){
        var r = svg.getBoundingClientRect(), ux = (e.clientX-r.left)/r.width*W;
        var i = Math.max(0, Math.min(len-1, Math.round((ux-m.l)/iw*(len-1))));
        hl.setAttribute("x1",sx(i)); hl.setAttribute("x2",sx(i)); hl.style.display = "block";
        var html = tl[i], top = H;
        sets.forEach(function(s,si){
          if(s[i]==null){ dots[si].style.display = "none"; return; }
          dots[si].setAttribute("cx",sx(i)); dots[si].setAttribute("cy",sy(s[i])); dots[si].style.display = "block";
          top = Math.min(top, sy(s[i]));
          html += "<br>"+(multi ? (cfg.series[si].short||cfg.series[si].name)+"　" : "")+"<b>"+cfg.fmt(s[i])+"</b>";
        });
        tip.innerHTML = html; tip.style.left = (sx(i)/W*r.width)+"px"; tip.style.top = (top/H*r.height)+"px"; tip.style.opacity = 1;
      }
      function off(){ hl.style.display = "none"; dots.forEach(function(d){ d.style.display = "none"; }); tip.style.opacity = 0; }
      hit.addEventListener("mousemove", at); hit.addEventListener("mouseleave", off);
      hit.addEventListener("touchstart", function(e){ if(e.touches[0]) at(e.touches[0]); }, {passive:true});
      hit.addEventListener("touchmove", function(e){ if(e.touches[0]) at(e.touches[0]); }, {passive:true});
      hit.addEventListener("touchend", off);
      box.querySelector(".tbl-wrap").innerHTML = '<table><tr><th></th>'+cfg.series.map(function(s){ return '<th>'+(s.short||s.name)+'</th>'; }).join("")+'</tr>'+
        tl.map(function(l,i){ return '<tr><td>'+l+'</td>'+sets.map(function(s){ return '<td>'+(s[i]==null?"—":cfg.fmt(s[i]))+'</td>'; }).join("")+'</tr>'; }).reverse().join("")+'</table>';
      drawn = true;
    }
    var drawn = !!cfg.noAnim || !!box.dataset.plotted; box.dataset.plotted = 1;
    draw();
  }

  /* 月末データ（DATA.series）の折れ線 */
  function lineChart(box, keys, o){
    o = o || {};
    var base = S(keys[0]).points, unit = S(keys[0]).unit;
    plot(box, {
      title:o.title, foot:o.foot, ranges:EN ? [[13,"1Y"],[61,"5Y"],[121,"10Y"]] : [[13,"1年"],[61,"5年"],[121,"10年"]],
      labels:base.map(function(p){ return p.ym; }), tipLabels:base.map(function(p){ return endOf(p.ym); }),
      series:keys.map(function(k,i){ var mp = {}; S(k).points.forEach(function(p){ mp[p.ym] = p.value; });
        return {name:o.names?o.names[i]:nm(S(k)), short:o.short?o.short[i]:"", values:base.map(function(p){ return mp[p.ym]==null?null:mp[p.ym]; })}; }),
      fmt:function(v){ return num(v,unit)+unitTxt(unit); },
      axisFmt:function(v,st){ return (st<1 ? v.toFixed(st<0.1?2:1) : v)+(unit==="%"?"%":""); },
      tickEvery:function(i, ym, len){ var mo = +ym.slice(5), yr = ym.slice(0,4);
        if(len<=13) return i%2===0 ? (EN ? (mo===1||i===0 ? MON[mo-1]+" '"+yr.slice(2) : MON[mo-1]) : (mo===1||i===0 ? yr.slice(2)+"年"+mo+"月" : mo+"月")) : null;
        if(mo!==1) return null; return (len<=61 || +yr%2===0) ? yr+T("年","","年") : null; }
    });
  }

  /* 横棒グラフ（ランキング）：rows=[{label, value, text, hl, sub}] */
  function bars(box, cfg){
    var max = Math.max.apply(null, cfg.rows.map(function(r){ return Math.abs(r.value); }));
    var hasNeg = cfg.rows.some(function(r){ return r.value<0; });
    box.innerHTML = '<div class="chart-top"><div class="ttl">'+cfg.title+'</div></div>'+
      '<div class="bars">'+cfg.rows.map(function(r,i){
        var w = Math.abs(r.value)/max*78;
        return '<div class="bar-row'+(r.hl?' hl':'')+'" style="--i:'+i+'"><div class="bl">'+(cfg.rank?'<span class="rk">'+(i+1)+'</span>':'')+r.label+(r.sub?'<small>'+r.sub+'</small>':'')+'</div>'+
          '<div class="bt"><div class="bf'+(r.value<0?' neg':'')+'" style="width:'+Math.max(w,0.6)+'%"></div><span class="bv">'+r.text+(r.after?'<small>'+r.after+'</small>':'')+'</span></div></div>';
      }).join("")+'</div><div class="chart-foot">'+(cfg.foot||"")+'</div>';
  }

  /* 出典の一覧（月末データ） */
  function sourceList(box, keys){
    box.innerHTML = keys.map(function(k){
      var s = S(k), o = src(s.source);
      if(ZH) return '<div><b>'+s.name_zh+'</b>：'+o.org_zh+'「'+o.name_zh+'」　<a href="'+o.url+'" target="_blank" rel="noopener">查看來源</a><br>'+
        '<span style="color:var(--muted)">內容：'+s.note_zh+'／期間：'+ymLabel(s.points[0].ym)+'～'+ymLabel(s.points[s.points.length-1].ym)+'（月底數值・每月更新）／取得日：'+fmtDate(s.retrieved)+'</span></div>';
      if(EN) return '<div><b>'+s.name_en+'</b>: '+o.org_en+', "'+o.name_en+'"　<a href="'+o.url+'" target="_blank" rel="noopener">View source</a><br>'+
        '<span style="color:var(--muted)">What: '+s.note_en+' / Period: '+ymLabel(s.points[0].ym)+' – '+ymLabel(s.points[s.points.length-1].ym)+' (month-end values, updated monthly) / Retrieved: '+fmtDate(s.retrieved)+'</span></div>';
      return '<div><b>'+s.name+'</b>：'+o.org+'「'+o.name+'」　<a href="'+o.url+'" target="_blank" rel="noopener">出典を見る</a><br>'+
        '<span style="color:var(--muted)">内容：'+s.note+'／期間：'+ymLabel(s.points[0].ym)+'〜'+ymLabel(s.points[s.points.length-1].ym)+'（月末値・月1回更新）／取得日：'+fmtDate(s.retrieved)+'</span></div>';
    }).join("");
  }
  function sourceLine(id, extra){
    var o = src(id);
    if(ZH) return '<div><b>'+o.org_zh+'</b>「'+o.name_zh+'」　<a href="'+o.url+'" target="_blank" rel="noopener">查看來源</a>'+(extra?'<br><span style="color:var(--muted)">'+extra+'</span>':'')+'</div>';
    if(EN) return '<div><b>'+o.org_en+'</b>, "'+o.name_en+'"　<a href="'+o.url+'" target="_blank" rel="noopener">View source</a>'+(extra?'<br><span style="color:var(--muted)">'+extra+'</span>':'')+'</div>';
    return '<div><b>'+o.org+'</b>「'+o.name+'」　<a href="'+o.url+'" target="_blank" rel="noopener">出典を見る</a>'+(extra?'<br><span style="color:var(--muted)">'+extra+'</span>':'')+'</div>';
  }

  window.SITE = { tile:tile, plot:plot, lineChart:lineChart, bars:bars, sourceList:sourceList, sourceLine:sourceLine,
    last:last, ymLabel:ymLabel, endOf:endOf, fmtDate:fmtDate, num:num, S:S, comma:comma, yen:yen, oku:oku, nm:nm, cname:cname, EN:EN, ZH:ZH, T:T };
  document.addEventListener("DOMContentLoaded", head);
})();
