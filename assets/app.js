/* 共通：ヘッダー・フッター・データ・グラフ */
(function(){
  var NAV = [
    ["index.html","トップ"],["basics.html","投資の基礎"],["world.html","世界経済"],["companies.html","企業分析"],
    ["money.html","お金の教養"],["about.html","出典・免責"]
  ];
  var PARENT = { "stocks.html":"basics.html", "fx.html":"world.html", "rates.html":"world.html" };
  var here = location.pathname.split("/").pop() || "index.html";
  var active = PARENT[here] || here;

  function head(){
    var h = document.createElement("header"); h.className = "site-head";
    h.innerHTML = '<div class="wrap"><a class="logo" href="index.html">数字で学ぶ<span>、</span>経済と投資</a><nav class="nav">'+
      NAV.map(function(n){ return '<a href="'+n[0]+'"'+(n[0]===active?' class="active"':'')+'>'+n[1]+'</a>'; }).join("")+'</nav></div>';
    document.body.insertBefore(h, document.body.firstChild);
    var f = document.createElement("footer");
    f.innerHTML = '<div class="wrap"><div class="links">'+NAV.map(function(n){ return '<a href="'+n[0]+'">'+n[1]+'</a>'; }).join("")+
      '<a href="stocks.html">株価指数</a><a href="fx.html">為替</a><a href="rates.html">金利</a></div>'+
      '<div>このサイトは経済と投資について学ぶための情報提供を目的としており、特定の銘柄や金融商品の売買をすすめるものではありません。投資の判断はご自身の責任で行ってください。</div>'+
      '<div style="margin-top:6px;">データ更新：'+(window.DATA ? fmtDate(DATA.meta.generated_at) : "")+'（毎月はじめに更新）</div></div>';
    document.body.appendChild(f);
  }

  function fmtDate(s){ var a = s.split("-"); return a[0]+"年"+(+a[1])+"月"+(+a[2])+"日"; }
  function ymLabel(ym){ var a = ym.split("-"); return a[0]+"年"+(+a[1])+"月"; }
  function S(key){ return DATA.series[key]; }
  function last(key, back){ var p = S(key).points; return p[p.length-1-(back||0)]; }
  function num(v, unit){ return unit==="%" ? v.toFixed(2) : v.toFixed(2); }
  function src(id){ return DATA.meta.sources.filter(function(s){ return s.id===id; })[0]; }
  function comma(v, d){ return v.toLocaleString("ja-JP", {minimumFractionDigits:d||0, maximumFractionDigits:d||0}); }
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
    var txt = s.unit==="%" ? sign+Math.abs(d).toFixed(2)+"ポイント" : sign+Math.abs(d).toFixed(2)+"円";
    return '<span class="'+cls+'">'+txt+'</span>';
  }

  function tile(key, o){
    var s = S(key), p = last(key);
    return '<a class="card tile" href="'+o.href+'"><div class="cat">'+o.cat+'</div><div class="nm">'+(o.name||s.name)+'</div>'+
      '<div class="val">'+num(p.value, s.unit)+'<small>'+s.unit+'</small></div>'+
      '<div class="chg">前の月から '+change(key,1)+'　1年前から '+change(key,12)+'</div>'+
      '<div class="when">'+ymLabel(p.ym)+'末時点・出典：'+src(s.source).org+'</div>'+
      (o.more ? '<div class="more">'+o.more+' →</div>' : '')+'</a>';
  }

  /* ---------- 汎用の折れ線グラフ ----------
     cfg = { title, labels:[x軸の文字], tipLabels:[ツールチップ見出し], series:[{name, short, values:[]}],
             fmt:function(v), axisFmt:function(v), tickEvery:function(i,label)->文字|null, foot, ranges:[[n,"1年"],...], zero:bool } */
  var COLORS = ["var(--s1)","var(--s2)"];
  function plot(box, cfg){
    var NS = "http://www.w3.org/2000/svg", W = 720, H = 300, m = {t:16, r:96, b:30, l:52};
    var ranges = cfg.ranges, rn = ranges ? ranges[ranges.length-1][0] : null, multi = cfg.series.length>1;
    box.innerHTML = '<div class="chart-top"><div class="ttl">'+cfg.title+'</div>'+(ranges ? '<div class="seg">'+
      ranges.map(function(r){ return '<button data-r="'+r[0]+'"'+(r[0]===rn?' class="on"':'')+'>'+r[1]+'</button>'; }).join("")+'</div>' : '')+'</div>'+
      (multi ? '<div class="legend">'+cfg.series.map(function(s,i){ return '<span><i style="background:'+COLORS[i]+'"></i>'+s.name+'</span>'; }).join("")+'</div>' : '')+
      '<div class="chart-wrap"><svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+cfg.title+'"></svg><div class="tip"></div></div>'+
      '<div class="chart-foot">'+(cfg.foot||"")+'</div>'+
      '<details class="table-view"><summary>数値を表で見る</summary><div class="tbl-wrap"></div></details>';
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
      labels.forEach(function(l,i){
        var t = cfg.tickEvery ? cfg.tickEvery(i, l, len) : l;
        if(t) el("text",{class:"ax", x:sx(i), y:H-8, "text-anchor":"middle"}).textContent = t;
      });
      var ends = [];
      sets.forEach(function(s,si){
        var d = "", pen = false;
        s.forEach(function(v,i){ if(v==null){ pen = false; return; } d += (pen?"L":"M")+sx(i).toFixed(1)+","+sy(v).toFixed(1); pen = true; });
        el("path",{class:"ln", stroke:COLORS[si], d:d});
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
    }
    draw();
  }

  /* 月末データ（DATA.series）の折れ線 */
  function lineChart(box, keys, o){
    o = o || {};
    var base = S(keys[0]).points, unit = S(keys[0]).unit;
    plot(box, {
      title:o.title, foot:o.foot, ranges:[[13,"1年"],[61,"5年"],[121,"10年"]],
      labels:base.map(function(p){ return p.ym; }), tipLabels:base.map(function(p){ return ymLabel(p.ym)+"末"; }),
      series:keys.map(function(k,i){ var mp = {}; S(k).points.forEach(function(p){ mp[p.ym] = p.value; });
        return {name:o.names?o.names[i]:S(k).name, short:o.short?o.short[i]:"", values:base.map(function(p){ return mp[p.ym]==null?null:mp[p.ym]; })}; }),
      fmt:function(v){ return num(v,unit)+(unit==="%"?"%":"円"); },
      axisFmt:function(v,st){ return (st<1 ? v.toFixed(st<0.1?2:1) : v)+(unit==="%"?"%":""); },
      tickEvery:function(i, ym, len){ var mo = +ym.slice(5), yr = ym.slice(0,4);
        if(len<=13) return i%2===0 ? (mo===1||i===0 ? yr.slice(2)+"年"+mo+"月" : mo+"月") : null;
        if(mo!==1) return null; return (len<=61 || +yr%2===0) ? yr+"年" : null; }
    });
  }

  /* 横棒グラフ（ランキング）：rows=[{label, value, text, hl, sub}] */
  function bars(box, cfg){
    var max = Math.max.apply(null, cfg.rows.map(function(r){ return Math.abs(r.value); }));
    var hasNeg = cfg.rows.some(function(r){ return r.value<0; });
    box.innerHTML = '<div class="chart-top"><div class="ttl">'+cfg.title+'</div></div>'+
      '<div class="bars">'+cfg.rows.map(function(r,i){
        var w = Math.abs(r.value)/max*78;
        return '<div class="bar-row'+(r.hl?' hl':'')+'"><div class="bl">'+(cfg.rank?'<span class="rk">'+(i+1)+'</span>':'')+r.label+(r.sub?'<small>'+r.sub+'</small>':'')+'</div>'+
          '<div class="bt"><div class="bf'+(r.value<0?' neg':'')+'" style="width:'+Math.max(w,0.6)+'%"></div><span class="bv">'+r.text+'</span></div></div>';
      }).join("")+'</div><div class="chart-foot">'+(cfg.foot||"")+'</div>';
  }

  /* 出典の一覧（月末データ） */
  function sourceList(box, keys){
    box.innerHTML = keys.map(function(k){
      var s = S(k), o = src(s.source);
      return '<div><b>'+s.name+'</b>：'+o.org+'「'+o.name+'」　<a href="'+o.url+'" target="_blank" rel="noopener">出典を見る</a><br>'+
        '<span style="color:var(--muted)">内容：'+s.note+'／期間：'+ymLabel(s.points[0].ym)+'〜'+ymLabel(s.points[s.points.length-1].ym)+'（月末値・月1回更新）／取得日：'+fmtDate(s.retrieved)+'</span></div>';
    }).join("");
  }
  function sourceLine(id, extra){
    var o = src(id);
    return '<div><b>'+o.org+'</b>「'+o.name+'」　<a href="'+o.url+'" target="_blank" rel="noopener">出典を見る</a>'+(extra?'<br><span style="color:var(--muted)">'+extra+'</span>':'')+'</div>';
  }

  window.SITE = { tile:tile, plot:plot, lineChart:lineChart, bars:bars, sourceList:sourceList, sourceLine:sourceLine,
    last:last, ymLabel:ymLabel, fmtDate:fmtDate, num:num, S:S, comma:comma, yen:yen, oku:oku };
  document.addEventListener("DOMContentLoaded", head);
})();
