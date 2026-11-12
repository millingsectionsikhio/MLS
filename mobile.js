/* KBS Milling – ฟังก์ชันสำหรับมือถือ: แถบเมนูล่าง + เมนูเต็มจอ + ติดตั้งเป็นแอป */
(function () {
  var MENU = [
    ['หน้าหลัก', 'index.html'],
    ['ประชาสัมพันธ์', null, [['ข่าวและประกาศ', 'news.html'], ['พื้นที่รับผิดชอบ (Gray zone)', 'grayzone.html']]],
    ['งานซ่อมบำรุงเครื่องจักร (PM)', 'pm.html'],
    ['งานความปลอดภัย (HSE)', null, [['Safety sharing', 'safety-sharing.html'], ['งานตรวจสอบอุปกรณ์', 'hse.html'], ['บันทึกการตรวจสอบ', 'inspection.html']]],
    ['คู่มือและขั้นตอนการทำงาน', null, [['หัวข้อคู่มือ', 'manual.html'], ['Flow process การผลิตน้ำตาล', 'flow-process.html']]],
    ['อะไหล่สำรอง', 'spare-parts.html'],
    ['รายการอื่น ๆ', null, [['การยืมอุปกรณ์', 'borrow.html']]],
    ['แผนผังองค์กร', 'organization.html'],
    ['ติดต่อแผนก', 'contact.html']
  ];
  var TABS = [
    ['หน้าหลัก', 'index.html', 'M3 11 12 4l9 7M5 10v10h14V10'],
    ['ตรวจสอบ', 'inspection.html', 'M9 4h6v3H9zM7 5H5v16h14V5h-2M9 13l2 2 4-4'],
    ['แชร์', 'safety-sharing.html', 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z'],
    ['ประกาศ', 'news.html', 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a3 3 0 0 1 0 6'],
    ['เมนู', '#menu', 'M4 7h16M4 12h16M4 17h16']
  ];
  var here = (location.pathname.split('/').pop() || 'index.html');
  var css = '' +
    '#kbs-tabbar,#kbs-drawer{display:none;font-family:"IBM Plex Sans Thai","Noto Sans Thai",sans-serif}' +
    '@media (max-width: 760px){' +
    ' header > div:has(> nav[aria-label="เมนูหลัก"]), #hse-menu, #spare-menu, #news-menu, #learn-menu{display:none !important}' +
    ' body{padding-bottom:calc(72px + env(safe-area-inset-bottom, 0px))}' +
    ' #kbs-tabbar{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));position:fixed;left:0;right:0;bottom:0;z-index:40;background:#FFFFFF;border-top:1px solid #D6E8F5;padding:6px 4px calc(6px + env(safe-area-inset-bottom, 0px));box-shadow:0 -6px 20px rgba(11,46,79,.08)}' +
    ' #kbs-tabbar a{display:flex;flex-direction:column;align-items:center;gap:2px;min-height:48px;justify-content:center;text-decoration:none;color:#4A6580;font-size:12px;border-radius:10px}' +
    ' #kbs-tabbar a[aria-current="page"]{color:#0A6FB8;font-weight:700;background:#E6F3FC}' +
    ' #kbs-drawer.open{display:block}' +
    '}' +
    '#kbs-drawer{position:fixed;inset:0;z-index:60;background:rgba(11,46,79,.55)}' +
    '#kbs-drawer .panel{position:absolute;right:0;top:0;bottom:0;width:min(88vw,360px);background:#FFFFFF;overflow:auto;padding:16px 14px calc(24px + env(safe-area-inset-bottom, 0px));box-shadow:-12px 0 32px rgba(11,46,79,.2)}' +
    '#kbs-drawer .top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
    '#kbs-drawer .x{width:44px;height:44px;border:1px solid #D6E8F5;border-radius:12px;background:#FFF;font-size:22px;cursor:pointer;color:#0B2E4F}' +
    '#kbs-drawer a.l{display:block;padding:12px;border-radius:12px;text-decoration:none;color:#0B2E4F;font-weight:600}' +
    '#kbs-drawer a.s{display:block;padding:10px 12px 10px 28px;border-radius:10px;text-decoration:none;color:#1E3A56;font-size:15px}' +
    '#kbs-drawer .g{padding:12px 12px 4px;color:#0A5C99;font-weight:700;font-size:14px}' +
    '#kbs-drawer a[aria-current="page"]{background:#E6F3FC;color:#0A5C99}' +
    '#kbs-drawer .cta{display:block;margin-top:14px;text-align:center;background:#0A6FB8;color:#FFF;border-radius:14px;padding:14px;text-decoration:none;font-weight:700}' +
    '#kbs-drawer .inst{margin-top:12px;width:100%;min-height:48px;border:2px solid #0A6FB8;background:#FFF;color:#0A6FB8;border-radius:14px;font:inherit;font-weight:700;cursor:pointer}' +
    '#kbs-drawer .tip{margin-top:12px;font-size:13px;color:#4A6580;background:#F5FAFE;border-radius:12px;padding:10px 12px}';
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function svg(d) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"></path></svg>'; }
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; var b = document.querySelector('#kbs-drawer .inst'); if (b) b.style.display = 'block'; });
  function init() {
    document.head.appendChild(el('style', {}, css));
    // tab bar
    var bar = el('nav', { id: 'kbs-tabbar', 'aria-label': 'เมนูลัดบนมือถือ' });
    TABS.forEach(function (t) {
      var a = el('a', { href: t[1] }, svg(t[2]) + '<span>' + t[0] + '</span>');
      if (t[1] === here) a.setAttribute('aria-current', 'page');
      if (t[1] === '#menu') a.addEventListener('click', function (e) { e.preventDefault(); open(); });
      bar.appendChild(a);
    });
    document.body.appendChild(bar);
    // drawer
    var d = el('div', { id: 'kbs-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'เมนูหลัก' });
    var p = el('div', { 'class': 'panel' });
    p.appendChild(el('div', { 'class': 'top' }, '<b style="font-family:Prompt,sans-serif;font-size:18px;color:#0B2E4F">แผนกลูกหีบ · สีคิ้ว</b><button type="button" class="x" aria-label="ปิดเมนู">×</button>'));
    MENU.forEach(function (m) {
      if (m[1]) { var a = el('a', { 'class': 'l', href: m[1] }, m[0]); if (m[1] === here) a.setAttribute('aria-current', 'page'); p.appendChild(a); }
      else {
        p.appendChild(el('div', { 'class': 'g' }, m[0]));
        m[2].forEach(function (s) { var a = el('a', { 'class': 's', href: s[1] }, s[0]); if (s[1] === here) a.setAttribute('aria-current', 'page'); p.appendChild(a); });
      }
    });
    p.appendChild(el('a', { 'class': 'cta', href: 'inspection.html' }, 'บันทึกการตรวจสอบ'));
    var lg = el('button', { type: 'button', 'class': 'inst', id: 'kbs-drawer-auth', style: 'display:block' }, '');
    function lgPaint() { var s = window.KBS_API && KBS_API.session(); lg.textContent = s ? 'ออกจากระบบ (' + s.name + ')' : 'เข้าสู่ระบบผู้แก้ไข'; }
    lg.addEventListener('click', function () { close(); var s = window.KBS_API && KBS_API.session(); if (s) { if (window.KBS_AUTH) KBS_AUTH.logout(); } else if (window.KBS_AUTH) KBS_AUTH.open(); });
    (window.DC_AFTER = window.DC_AFTER || []).push(lgPaint); lgPaint();
    p.appendChild(lg);
    var inst = el('button', { type: 'button', 'class': 'inst', style: 'display:' + (deferred ? 'block' : 'none') }, 'ติดตั้งเป็นแอปบนมือถือ');
    inst.addEventListener('click', function () { if (deferred) { deferred.prompt(); deferred = null; inst.style.display = 'none'; } });
    p.appendChild(inst);
    var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) p.appendChild(el('div', { 'class': 'tip' }, 'ติดตั้งเป็นแอปบน iPhone: เปิดใน Safari › กดปุ่มแชร์ › “เพิ่มไปยังหน้าจอโฮม”'));
    d.appendChild(p);
    d.addEventListener('click', function (e) { if (e.target === d || (e.target.classList && e.target.classList.contains('x'))) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.body.appendChild(d);
  }
  function open() { var d = document.getElementById('kbs-drawer'); d.classList.add('open'); var x = d.querySelector('.x'); if (x) x.focus(); }
  function close() { var d = document.getElementById('kbs-drawer'); if (d) d.classList.remove('open'); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ===== เลือกวิธีแนบรูปบนมือถือ: ถ่ายรูปทันที หรือ เลือกจากอัลบั้ม (Android / iOS) ===== */
(function () {
  var touch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window);
  if (!touch) return;
  var css = '#kbs-pick{position:fixed;inset:0;z-index:95;background:rgba(11,46,79,.5);display:none;align-items:flex-end;justify-content:center;font-family:"IBM Plex Sans Thai","Noto Sans Thai",sans-serif}' +
    '#kbs-pick.open{display:flex}' +
    '#kbs-pick .sheet{background:#FFFFFF;width:100%;max-width:480px;border-radius:20px 20px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom, 0px));box-shadow:0 -12px 32px rgba(11,46,79,.2)}' +
    '#kbs-pick .t{text-align:center;color:#4A6580;font-size:14px;padding:4px 0 10px}' +
    '#kbs-pick button{font:inherit;width:100%;display:flex;align-items:center;gap:12px;min-height:56px;padding:0 16px;border:0;border-radius:14px;background:#F5FAFE;color:#0B2E4F;font-weight:600;font-size:17px;margin-bottom:8px;cursor:pointer}' +
    '#kbs-pick button .i{width:40px;height:40px;border-radius:12px;background:#0A6FB8;color:#FFFFFF;display:flex;align-items:center;justify-content:center;flex:none}' +
    '#kbs-pick button.c{justify-content:center;background:transparent;color:#0A6FB8;margin:4px 0 0}';
  var CAM = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4zM12 11a3 3 0 1 0 0 6 3 3 0 0 0 0-6"></path></svg>';
  var ALB = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01"></path></svg>';
  var sheet, target = null, armed = null;
  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    sheet = document.createElement('div'); sheet.id = 'kbs-pick'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'เลือกวิธีแนบรูป');
    sheet.innerHTML = '<div class="sheet"><div class="t">แนบรูปภาพ</div>' +
      '<button type="button" data-m="cam"><span class="i">' + CAM + '</span>ถ่ายรูปทันที</button>' +
      '<button type="button" data-m="alb"><span class="i">' + ALB + '</span>เลือกจากอัลบั้ม / คลังภาพ</button>' +
      '<button type="button" class="c" data-m="x">ยกเลิก</button></div>';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (e.target === sheet || (b && b.getAttribute('data-m') === 'x')) { close(); return; }
      if (!b || !target) return;
      var inp = target; close();
      var orig = inp.getAttribute('data-capture') || inp.getAttribute('capture') || 'environment';
      inp.setAttribute('data-capture', orig);
      if (b.getAttribute('data-m') === 'cam') inp.setAttribute('capture', orig); else inp.removeAttribute('capture');
      armed = inp; inp.click();   // ยังอยู่ในการแตะของผู้ใช้ จึงเปิดกล้อง/อัลบั้มได้
      setTimeout(function () { if (armed === inp) armed = null; }, 1000);
    });
  }
  function close() { sheet.classList.remove('open'); target = null; }
  document.addEventListener('click', function (e) {
    var inp = e.target;
    if (!inp || inp.tagName !== 'INPUT' || inp.type !== 'file' || !/image/.test(inp.getAttribute('accept') || '')) return;
    if (armed === inp) { armed = null; return; }       // คลิกที่เราสั่งเอง ปล่อยผ่าน
    if ((inp.getAttribute('data-capture') || inp.getAttribute('capture')) === 'user') {   // รูปใบหน้า: บังคับกล้องหน้าอย่างเดียว
      inp.setAttribute('capture', 'user'); return;
    }
    e.preventDefault();
    if (!sheet) build();
    target = inp; sheet.classList.add('open');
    var f = sheet.querySelector('button'); if (f) f.focus();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheet && sheet.classList.contains('open')) close(); });
})();
