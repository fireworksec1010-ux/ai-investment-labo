/* オリジナルのイラスト（すべてインラインSVG） */
(function(){
  var K = "#1b1f3b"; // 線の色
  var EN = document.documentElement.lang === "en", ZHL = /^zh/.test(document.documentElement.lang);
  function svg(vb, inner, cls){ return '<svg class="illu '+(cls||"")+'" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+inner+'</svg>'; }
  var S = 'stroke="'+K+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  function sparkle(x, y, s, c, d){
    return '<path class="twinkle" style="animation-delay:'+(d||0)+'s;transform-origin:'+x+'px '+y+'px" d="M'+x+' '+(y-s)+' Q'+x+' '+y+' '+(x+s)+' '+y+' Q'+x+' '+y+' '+x+' '+(y+s)+' Q'+x+' '+y+' '+(x-s)+' '+y+' Q'+x+' '+y+' '+x+' '+(y-s)+'Z" fill="'+(c||"#ffc53d")+'"/>';
  }
  function coin(x, y, w, label){ // 横から見たコイン1枚
    return '<rect x="'+(x-w/2)+'" y="'+y+'" width="'+w+'" height="11" rx="5.5" fill="#ffc53d" '+S+'/>'+
      '<line x1="'+(x-w/2+8)+'" y1="'+(y+5.5)+'" x2="'+(x+w/2-8)+'" y2="'+(y+5.5)+'" stroke="#e39b00" stroke-width="2"/>';
  }
  function stack(x, base, n, w){ var o = ""; for(var i=0;i<n;i++) o += coin(x, base-11*(i+1), w); return o; }
  function bigCoin(cx, cy, r, sym, fill, cls){
    return '<g class="'+(cls||"")+'"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+(fill||"#ffc53d")+'" '+S+'/>'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.74)+'" fill="none" stroke="rgba(27,31,59,.25)" stroke-width="2.5"/>'+
      '<text x="'+cx+'" y="'+(cy+r*0.36)+'" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="800" font-size="'+(r*1.05)+'" fill="'+K+'">'+sym+'</text></g>';
  }

  /* コイン先生（オリジナルキャラクター） */
  function mascot(mood){
    var mouth = mood==="wow" ? '<ellipse cx="60" cy="80" rx="7" ry="8" fill="'+K+'"/><ellipse cx="60" cy="83" rx="4" ry="3" fill="#ff6b57"/>'
      : '<path d="M49 76 Q60 88 71 76" fill="#ff6b57" '+S+'/>';
    return svg("0 0 120 124",
      '<ellipse cx="60" cy="118" rx="30" ry="5" fill="rgba(27,31,59,.12)"/>'+
      '<g class="bob">'+
      '<path d="M16 74 Q4 62 10 50" fill="none" '+S+' stroke-width="4"/><circle cx="10" cy="48" r="5" fill="#ffc53d" '+S+'/>'+
      '<circle cx="60" cy="66" r="44" fill="#ffc53d" '+S+' stroke-width="4"/>'+
      '<circle cx="60" cy="66" r="34" fill="none" stroke="#e39b00" stroke-width="3"/>'+
      '<path d="M96 70 Q110 74 108 88" fill="none" '+S+' stroke-width="4"/><circle cx="108" cy="90" r="5" fill="#ffc53d" '+S+'/>'+
      '<circle cx="45" cy="60" r="11" fill="#fff" '+S+'/><circle cx="75" cy="60" r="11" fill="#fff" '+S+'/>'+
      '<line x1="56" y1="60" x2="64" y2="60" '+S+'/>'+
      '<circle class="blink" cx="46" cy="61" r="4.5" fill="'+K+'"/><circle class="blink" cx="76" cy="61" r="4.5" fill="'+K+'"/>'+
      '<ellipse cx="34" cy="76" rx="6" ry="4" fill="#ff8f80" opacity=".7"/><ellipse cx="86" cy="76" rx="6" ry="4" fill="#ff8f80" opacity=".7"/>'+
      mouth+
      '<path d="M26 22 L60 8 L94 22 L60 36 Z" fill="'+K+'"/><rect x="44" y="24" width="32" height="10" rx="3" fill="'+K+'"/>'+
      '<path d="M90 22 L92 40" stroke="#ff6b57" stroke-width="3" stroke-linecap="round"/><circle cx="92" cy="42" r="3.5" fill="#ff6b57"/>'+
      '</g>', "mascot");
  }

  /* 投資の基礎：コインの山から芽が育つ */
  function basics(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="228" rx="140" ry="16" fill="rgba(18,184,134,.18)"/>'+
      stack(60, 224, 2, 46)+stack(118, 224, 4, 46)+stack(176, 224, 7, 46)+stack(236, 224, 10, 46)+
      '<g class="sway" style="transform-origin:236px 114px">'+
      '<path d="M236 114 C236 92 232 78 238 58" fill="none" stroke="#12b886" stroke-width="5" stroke-linecap="round"/>'+
      '<path d="M237 84 C214 84 204 66 206 54 C224 54 236 66 237 84Z" fill="#5ee0b0" '+S+'/>'+
      '<path d="M238 70 C258 70 270 54 268 40 C250 40 238 54 238 70Z" fill="#12b886" '+S+'/>'+
      '<path d="M238 58 C230 44 234 30 242 22 C250 32 248 46 238 58Z" fill="#5ee0b0" '+S+'/></g>'+
      '<path class="draw" d="M34 170 C90 168 120 140 160 120 S230 70 290 40" fill="none" stroke="#3b6cff" stroke-width="4" stroke-dasharray="8 8" stroke-linecap="round"/>'+
      '<path d="M278 34 L294 38 L286 52" fill="none" stroke="#3b6cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<g class="float"><rect x="22" y="40" width="96" height="40" rx="12" fill="#fff" '+S+'/><text x="70" y="67" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="800" font-size="20" fill="#12b886">'+(EN?"+5%/yr":"+5%/年")+'</text></g>'+
      sparkle(286, 92, 9, "#ffc53d", 0)+sparkle(150, 70, 7, "#12b886", .6)+sparkle(40, 120, 6, "#ffc53d", 1.2));
  }

  /* 世界経済：地球と通貨 */
  function world(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="238" rx="110" ry="12" fill="rgba(59,108,255,.15)"/>'+
      '<g class="spin-slow" style="transform-origin:160px 128px"><ellipse cx="160" cy="128" rx="140" ry="44" fill="none" stroke="rgba(59,108,255,.45)" stroke-width="3" stroke-dasharray="6 9"/></g>'+
      '<circle cx="160" cy="128" r="86" fill="#cfe0ff" '+S+' stroke-width="4"/>'+
      '<path d="M100 92 C112 76 140 70 152 84 C160 94 146 104 150 116 C154 128 136 136 124 128 C110 120 112 108 100 104Z" fill="#5ee0b0" '+S+'/>'+
      '<path d="M176 64 C196 60 220 72 228 90 C220 96 206 92 200 102 C192 112 176 104 172 92 C168 82 166 70 176 64Z" fill="#5ee0b0" '+S+'/>'+
      '<path d="M170 150 C186 140 208 146 212 162 C214 176 200 196 186 198 C176 188 178 176 168 168 C162 162 164 154 170 150Z" fill="#5ee0b0" '+S+'/>'+
      '<path d="M78 128 Q160 150 242 128" fill="none" stroke="rgba(27,31,59,.25)" stroke-width="2.5"/>'+
      '<path d="M160 42 Q130 128 160 214" fill="none" stroke="rgba(27,31,59,.25)" stroke-width="2.5"/>'+
      bigCoin(40, 92, 24, "$", "#5ee0b0", "float")+bigCoin(282, 82, 26, "¥", "#ffc53d", "float d1")+bigCoin(270, 190, 22, "€", "#b9c8ff", "float d2")+
      sparkle(66, 200, 8, "#3b6cff", .3)+sparkle(250, 30, 7, "#ffc53d", 1));
  }

  /* 企業分析：ビルの街と虫めがね */
  function companies(){
    function bld(x, w, h, c, win){
      var o = '<rect x="'+x+'" y="'+(220-h)+'" width="'+w+'" height="'+h+'" rx="6" fill="'+c+'" '+S+'/>';
      for(var yy=220-h+14; yy<210; yy+=22) for(var xx=x+10; xx<x+w-12; xx+=18) o += '<rect class="win" style="animation-delay:'+((xx*7+yy*3)%40/10)+'s" x="'+xx+'" y="'+yy+'" width="9" height="11" rx="2" fill="'+(win||"#fff")+'"/>';
      return o;
    }
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="226" rx="150" ry="14" fill="rgba(255,107,87,.15)"/>'+
      bld(20, 56, 90, "#ffd0c8")+bld(82, 64, 150, "#ff6b57")+bld(152, 54, 110, "#ffb199")+bld(212, 72, 180, "#ff8f80")+
      '<line x1="248" y1="40" x2="248" y2="18" '+S+'/><path d="M248 18 L270 24 L248 30Z" fill="#ffc53d" '+S+'/>'+
      '<line x1="10" y1="220" x2="310" y2="220" '+S+'/>'+
      '<g class="peek"><circle cx="122" cy="98" r="34" fill="rgba(255,255,255,.55)" '+S+' stroke-width="5"/><line x1="146" y1="122" x2="176" y2="152" '+K.replace(/.*/, 'stroke="'+K+'"')+' stroke-width="10" stroke-linecap="round"/></g>'+
      '<g class="float d1"><rect x="10" y="30" width="94" height="40" rx="12" fill="#fff" '+S+'/><text x="57" y="57" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="800" font-size="18" fill="#ff6b57">'+(EN?"Sales ↑":ZHL?"營收 ↑":"売上 ↑")+'</text></g>'+
      sparkle(300, 70, 8, "#ffc53d", .4)+sparkle(196, 60, 6, "#ff6b57", 1.1));
  }

  /* お金の教養：ブタの貯金箱 */
  function money(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="232" rx="120" ry="13" fill="rgba(245,165,36,.2)"/>'+
      '<g class="drop">'+bigCoin(170, 40, 20, "¥", "#ffc53d")+'</g>'+
      '<rect x="110" y="196" width="22" height="30" rx="8" fill="#ff9fb2" '+S+'/><rect x="196" y="196" width="22" height="30" rx="8" fill="#ff9fb2" '+S+'/>'+
      '<ellipse cx="166" cy="150" rx="96" ry="66" fill="#ffb8c6" '+S+' stroke-width="4"/>'+
      '<path d="M108 98 L118 66 L138 92Z" fill="#ff9fb2" '+S+'/>'+
      '<ellipse cx="256" cy="150" rx="18" ry="22" fill="#ff9fb2" '+S+'/><circle cx="251" cy="144" r="3.5" fill="'+K+'"/><circle cx="261" cy="156" r="3.5" fill="'+K+'"/>'+
      '<circle cx="216" cy="128" r="6" fill="'+K+'"/><ellipse cx="226" cy="150" rx="9" ry="6" fill="#ff8f80" opacity=".7"/>'+
      '<rect x="146" y="86" width="44" height="9" rx="4.5" fill="'+K+'"/>'+
      '<path d="M70 146 C52 140 50 160 62 160 C72 160 66 146 56 150" fill="none" '+S+'/>'+
      '<g class="float d2"><rect x="14" y="40" width="98" height="40" rx="12" fill="#fff" '+S+'/><text x="63" y="67" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="800" font-size="18" fill="#e08a00">'+(EN?"¥1M":ZHL?"100萬日圓":"100万円")+'</text></g>'+
      sparkle(286, 60, 9, "#ffc53d", .2)+sparkle(250, 214, 6, "#ff6b57", .9)+sparkle(60, 206, 7, "#ffc53d", 1.4));
  }

  /* 為替：円とドルの交換 */
  function fx(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="232" rx="120" ry="12" fill="rgba(59,108,255,.15)"/>'+
      bigCoin(92, 140, 58, "¥", "#ffc53d", "float")+bigCoin(228, 120, 58, "$", "#5ee0b0", "float d1")+
      '<g class="spin" style="transform-origin:160px 130px"><path d="M128 50 A90 90 0 0 1 222 46" fill="none" stroke="#3b6cff" stroke-width="5" stroke-linecap="round"/><path d="M212 36 L224 46 L210 54" fill="none" stroke="#3b6cff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<path d="M192 214 A90 90 0 0 1 98 218" fill="none" stroke="#ff6b57" stroke-width="5" stroke-linecap="round"/><path d="M108 228 L96 218 L110 210" fill="none" stroke="#ff6b57" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      sparkle(40, 60, 8, "#ffc53d", .3)+sparkle(290, 210, 7, "#3b6cff", 1));
  }

  /* 金利：％のバッジと銀行 */
  function rates(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="232" rx="130" ry="12" fill="rgba(59,108,255,.15)"/>'+
      '<path d="M40 110 L130 70 L220 110Z" fill="#cfe0ff" '+S+'/>'+
      [56,86,116,146,176].map(function(x){ return '<rect x="'+x+'" y="114" width="16" height="90" rx="3" fill="#fff" '+S+'/>'; }).join("")+
      '<rect x="36" y="204" width="188" height="20" rx="4" fill="#cfe0ff" '+S+'/>'+
      '<g class="float"><circle cx="248" cy="96" r="52" fill="#3b6cff" '+S+' stroke-width="4"/><text x="248" y="116" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="900" font-size="58" fill="#fff">%</text></g>'+
      '<g class="nudge-up"><path d="M282 176 L282 140 M270 152 L282 140 L294 152" fill="none" stroke="#12b886" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      '<g class="nudge-down"><path d="M246 178 L246 214 M234 202 L246 214 L258 202" fill="none" stroke="#ff6b57" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      sparkle(300, 30, 8, "#ffc53d", .5));
  }

  /* 株価指数：チャートのボード */
  function stocks(){
    var candles = [[60,150,120,170],[88,130,110,150],[116,140,118,160],[144,110,90,130],[172,96,80,118],[200,104,86,124],[228,76,58,98],[256,60,44,82]];
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="236" rx="130" ry="12" fill="rgba(18,184,134,.18)"/>'+
      '<rect x="30" y="30" width="260" height="180" rx="18" fill="#fff" '+S+' stroke-width="4"/>'+
      '<line x1="50" y1="186" x2="272" y2="186" stroke="rgba(27,31,59,.15)" stroke-width="2"/>'+
      candles.map(function(c,i){ var up = i!==2 && i!==5; return '<line x1="'+c[0]+'" y1="'+(c[2]-10)+'" x2="'+c[0]+'" y2="'+(c[3]+10)+'" stroke="'+K+'" stroke-width="2.5"/>'+
        '<rect x="'+(c[0]-8)+'" y="'+c[2]+'" width="16" height="'+(c[3]-c[2])+'" rx="3" fill="'+(up?"#12b886":"#ff6b57")+'" stroke="'+K+'" stroke-width="2.5"/>'; }).join("")+
      '<path class="draw" d="M52 176 L88 150 L116 158 L144 128 L172 112 L200 118 L228 90 L262 66" fill="none" stroke="#3b6cff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<g class="float d1"><rect x="200" y="14" width="96" height="36" rx="12" fill="#ffc53d" '+S+'/><text x="248" y="38" text-anchor="middle" font-family="Zen Old Mincho, serif" font-weight="800" font-size="17" fill="'+K+'">INDEX</text></g>'+
      sparkle(30, 230, 7, "#ffc53d", .8));
  }

  /* 出典・免責：書類と虫めがね */
  function about(){
    return svg("0 0 320 260",
      '<ellipse cx="160" cy="234" rx="110" ry="12" fill="rgba(139,92,246,.15)"/>'+
      '<rect x="84" y="26" width="150" height="196" rx="14" fill="#fff" '+S+' stroke-width="4"/>'+
      [62,84,106,128,150].map(function(y,i){ return '<rect x="106" y="'+y+'" width="'+(i%2?78:104)+'" height="9" rx="4.5" fill="#d9d3ff"/>'; }).join("")+
      '<g class="stamp"><circle cx="232" cy="178" r="34" fill="#12b886" '+S+' stroke-width="4"/><path d="M216 178 L228 190 L250 166" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>'+
      '<g class="peek"><circle cx="96" cy="160" r="30" fill="rgba(255,255,255,.6)" stroke="'+K+'" stroke-width="5"/><line x1="76" y1="182" x2="52" y2="206" stroke="'+K+'" stroke-width="10" stroke-linecap="round"/></g>'+
      sparkle(270, 50, 8, "#8b5cf6", .4));
  }

  /* トップページの大きなシーン */
  function hero(){
    return svg("0 0 560 420",
      '<ellipse cx="290" cy="392" rx="240" ry="20" fill="rgba(27,31,59,.10)"/>'+
      // 地球
      '<g transform="translate(250 10) scale(.82)">'+world().replace(/^<svg[^>]*>|<\/svg>$/g,"")+'</g>'+
      // チャートのカード
      '<g class="float d2"><rect x="18" y="150" width="210" height="150" rx="18" fill="#fff" '+S+' stroke-width="4"/>'+
      '<rect x="36" y="166" width="70" height="12" rx="6" fill="#d7e2ff"/>'+
      '<path class="draw" d="M38 272 L72 250 L98 258 L130 222 L160 230 L204 184" fill="none" stroke="#12b886" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="204" cy="184" r="7" fill="#12b886" '+S+'/></g>'+
      // コインの山
      stack(330, 388, 3, 50)+stack(390, 388, 6, 50)+stack(450, 388, 9, 50)+
      // コイン先生
      '<g transform="translate(150 250) scale(1.15)">'+mascot().replace(/^<svg[^>]*>|<\/svg>$/g,"")+'</g>'+
      '<g class="drop">'+bigCoin(450, 236, 18, "¥", "#ffc53d")+'</g>'+
      sparkle(520, 330, 10, "#ffc53d", .2)+sparkle(60, 120, 8, "#ff6b57", .9)+sparkle(240, 120, 7, "#3b6cff", 1.5), "hero-scene");
  }

  window.ILLUST = { mascot:mascot, basics:basics, world:world, companies:companies, money:money, fx:fx, rates:rates, stocks:stocks, about:about, hero:hero };
})();
