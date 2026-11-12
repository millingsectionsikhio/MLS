/* KBS Milling – เมนู "รายการอื่น ๆ" (แทรกระหว่างอะไหล่สำรองกับแผนผังองค์กร) */
(function () {
  var ITEMS = [
    { title: 'การยืมอุปกรณ์', en: 'Equipment borrowing', desc: 'บันทึกการยืม-คืนอุปกรณ์ พร้อมรูปถ่าย', href: 'borrow.html', icon: 'M4 7h16v13H4zM9 7V4h6v3M4 12h16M10 12v2h4v-2' }
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var isHere = ITEMS.some(function (x) { return x.href === here; });
  var openState = false;
  var css = '#kbs-others{position:relative;display:flex;align-items:center;border-radius:10px}' +
    '#kbs-others.cur{background:#075A96}' +
    '#kbs-others > button{font:inherit;cursor:pointer;border:0;background:transparent;color:#FFFFFF;display:flex;align-items:center;gap:4px;padding:0 10px;min-height:48px;font-weight:500;border-radius:10px}' +
    '#kbs-others.cur > button{font-weight:600}' +
    '#kbs-others-panel{position:absolute;top:calc(100% + 6px);left:0;z-index:30;background:#FFFFFF;border:1px solid #D6E8F5;border-radius:16px;box-shadow:0 18px 32px rgba(11,46,79,.16);padding:10px;min-width:320px;display:none}' +
    '#kbs-others-panel.open{display:block}' +
    '#kbs-others-panel .hd{font-family:Prompt,sans-serif;font-weight:600;color:#0B2E4F;padding:6px 10px 8px;font-size:15px}' +
    '#kbs-others-panel a{display:flex;gap:12px;align-items:center;padding:10px;border-radius:12px;text-decoration:none;color:#1E3A56}' +
    '#kbs-others-panel a:hover,#kbs-others-panel a[aria-current="page"]{background:#E6F3FC}' +
    '#kbs-others-panel .ic{flex:none;width:40px;height:40px;border-radius:11px;background:#0A6FB8;color:#FFFFFF;display:flex;align-items:center;justify-content:center}' +
    '#kbs-others-panel b{display:block;color:#0B2E4F;font-size:16px}#kbs-others-panel small{display:block;color:#4A6580;font-size:13px}';
  function svg(d, s) { return '<svg width="' + (s || 20) + '" height="' + (s || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; }
  function paint() {
    var nav = document.querySelector('#app nav[aria-label="เมนูหลัก"]');
    if (nav && !document.getElementById('kbs-others')) {
      var spare = nav.querySelector('a[href="spare-parts.html"]');
      var after = spare ? (spare.parentNode === nav ? spare : spare.parentNode) : null;
      var w = document.createElement('div'); w.id = 'kbs-others'; if (isHere) w.className = 'cur';
      w.innerHTML = '<button type="button" aria-expanded="false" aria-controls="kbs-others-panel">รายการอื่น ๆ ' + svg(openState ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6', 16) + '</button>' +
        '<div id="kbs-others-panel" role="menu"><div class="hd">รายการอื่น ๆ</div>' + ITEMS.map(function (x) {
          return '<a role="menuitem" href="' + x.href + '"' + (x.href === here ? ' aria-current="page"' : '') + '><span class="ic">' + svg(x.icon) + '</span><span><b>' + x.title + '</b><small>' + x.en + ' · ' + x.desc + '</small></span></a>';
        }).join('') + '</div>';
      if (after && after.nextSibling) nav.insertBefore(w, after.nextSibling); else nav.appendChild(w);
      var btn = w.querySelector('button'), panel = w.querySelector('#kbs-others-panel');
      var set = function (v) { openState = v; panel.classList.toggle('open', v); btn.setAttribute('aria-expanded', String(v)); btn.querySelector('svg').outerHTML = svg(v ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6', 16); };
      btn.addEventListener('click', function (e) { e.stopPropagation(); set(!openState); });
      set(openState);
    }
    // footer menu link
    var fl = document.querySelector('#app footer a[href="spare-parts.html"]');
    if (fl && !document.getElementById('kbs-others-foot')) {
      var a = document.createElement('a'); a.id = 'kbs-others-foot'; a.href = 'borrow.html'; a.textContent = 'รายการอื่น ๆ · การยืมอุปกรณ์';
      a.setAttribute('style', fl.getAttribute('style') || ''); fl.parentNode.insertBefore(a, fl.nextSibling);
    }
  }
  document.addEventListener('click', function (e) { if (openState && !e.target.closest('#kbs-others')) { openState = false; var p = document.getElementById('kbs-others-panel'); if (p) p.classList.remove('open'); var b = document.querySelector('#kbs-others > button'); if (b) b.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openState) { openState = false; var p = document.getElementById('kbs-others-panel'); if (p) p.classList.remove('open'); } });
  (window.DC_AFTER = window.DC_AFTER || []).push(paint);
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
  if (document.readyState !== 'loading') paint(); else document.addEventListener('DOMContentLoaded', paint);
})();
