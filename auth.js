/* KBS Milling – ปุ่มเข้าสู่ระบบผู้แก้ไข (ที่เดียว ใช้ได้ทุกหน้า) */
(function () {
  var LOCK = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5z"></path></svg>';
  var USER = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"></path></svg>';
  var OUT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"></path></svg>';
  var css = '' +
    '#kbs-auth{display:flex;align-items:center;gap:8px;margin-left:auto;font-family:"IBM Plex Sans Thai","Noto Sans Thai",sans-serif}' +
    '#kbs-auth button{font:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:8px;min-height:44px;border-radius:10px;font-weight:600;padding:0 16px}' +
    '#kbs-auth .in{border:2px solid #0A6FB8;background:#FFFFFF;color:#0A6FB8}' +
    '#kbs-auth .in:hover{background:#E6F3FC}' +
    '#kbs-auth .who{display:inline-flex;align-items:center;gap:6px;color:#0B2E4F;background:#E6F3FC;border-radius:999px;padding:8px 14px;font-size:14px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#kbs-auth .out{border:2px solid #B8D4EA;background:#FFFFFF;color:#0A5C99;padding:0 12px}' +
    '@media (max-width:760px){#kbs-auth .lbl,#kbs-auth .who span{display:none}#kbs-auth button{padding:0 12px}#kbs-auth .who{padding:8px 10px}}' +
    '#kbs-login{position:fixed;inset:0;z-index:80;background:rgba(11,46,79,.55);display:none;align-items:center;justify-content:center;padding:20px;font-family:"IBM Plex Sans Thai","Noto Sans Thai",sans-serif}' +
    '#kbs-login.open{display:flex}' +
    '#kbs-login .box{background:#FFFFFF;border-radius:20px;padding:28px;width:100%;max-width:400px;box-shadow:0 24px 48px rgba(11,46,79,.25)}' +
    '#kbs-login h2{font-family:Prompt,sans-serif;font-weight:600;font-size:22px;margin:0;color:#0B2E4F;display:flex;align-items:center;gap:8px}' +
    '#kbs-login p.sub{margin:4px 0 18px;color:#4A6580;font-size:15px}' +
    '#kbs-login label{display:block;font-weight:600;color:#0B2E4F;margin:12px 0 6px}' +
    '#kbs-login input{box-sizing:border-box;width:100%;font:inherit;padding:12px 14px;border:1.5px solid #B8D4EA;border-radius:12px;color:#0B2E4F}' +
    '#kbs-login .err{min-height:20px;margin:10px 0 0;color:#8A4B00;font-size:14px}' +
    '#kbs-login .row{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}' +
    '#kbs-login .cancel{font:inherit;cursor:pointer;border:0;background:transparent;color:#0A6FB8;font-weight:600;padding:0 16px;min-height:48px}' +
    '#kbs-login .go{font:inherit;cursor:pointer;border:0;background:#0A6FB8;color:#FFFFFF;border-radius:12px;font-weight:600;padding:0 24px;min-height:48px}';
  var modal, busy = false, lastFocus = null;
  function api() { return window.KBS_API; }
  function rerender() { if (window.DCRerender) window.DCRerender(); }
  function buildModal() {
    modal = document.createElement('div');
    modal.id = 'kbs-login'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'kbs-lg-title');
    modal.innerHTML = '<div class="box"><h2 id="kbs-lg-title">' + LOCK + 'เข้าสู่ระบบผู้แก้ไข</h2>' +
      '<p class="sub">เข้าสู่ระบบครั้งเดียว เพิ่มและแก้ไขข้อมูลได้ทุกหน้า</p>' +
      '<label for="kbs-lg-user">ชื่อผู้ใช้ (User)</label><input id="kbs-lg-user" type="text" autocomplete="username" autocapitalize="none" spellcheck="false">' +
      '<label for="kbs-lg-pass">รหัสผ่าน (Password)</label><input id="kbs-lg-pass" type="password" autocomplete="current-password">' +
      '<p class="err" role="alert"></p><div class="row"><button type="button" class="cancel">ยกเลิก</button><button type="button" class="go">เข้าสู่ระบบ</button></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('.cancel').addEventListener('click', close);
    modal.querySelector('.go').addEventListener('click', submit);
    modal.querySelector('#kbs-lg-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    modal.querySelector('#kbs-lg-user').addEventListener('keydown', function (e) { if (e.key === 'Enter') modal.querySelector('#kbs-lg-pass').focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
  }
  function err(t) { modal.querySelector('.err').textContent = t || ''; }
  function open() {
    if (!api() || !api().configured) { alert('ยังไม่ได้เชื่อม Google Sheets — ผู้ดูแลเว็บตั้งค่า API_URL ในไฟล์ config.js'); return; }
    lastFocus = document.activeElement; err(''); modal.classList.add('open');
    setTimeout(function () { modal.querySelector('#kbs-lg-user').focus(); }, 0);
  }
  function close() { modal.classList.remove('open'); modal.querySelector('#kbs-lg-pass').value = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function submit() {
    if (busy) return;
    var u = modal.querySelector('#kbs-lg-user').value.trim(), p = modal.querySelector('#kbs-lg-pass').value;
    if (!u || !p) { err('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'); return; }
    busy = true; err(''); var go = modal.querySelector('.go'); go.textContent = 'กำลังตรวจสอบ...';
    api().login(u, p).then(function () { busy = false; go.textContent = 'เข้าสู่ระบบ'; close(); rerender(); paint(); })
      .catch(function (e) { busy = false; go.textContent = 'เข้าสู่ระบบ'; err(e.message); });
  }
  function logout() { if (!confirm('ออกจากระบบผู้แก้ไข?')) return; api().logout(); rerender(); paint(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function paint() {
    var row = document.querySelector('#app header > div');
    if (!row) return;
    var box = document.getElementById('kbs-auth');
    if (!box || box.parentNode !== row) {
      box = document.createElement('div'); box.id = 'kbs-auth';
      var cta = row.querySelector('a[href="inspection.html"]');
      row.insertBefore(box, cta || null);
    }
    var s = api() ? api().session() : null;
    box.innerHTML = s
      ? '<span class="who" title="ผู้แก้ไข: ' + esc(s.name) + '">' + USER + '<span>' + esc(s.name) + '</span></span><button type="button" class="out" aria-label="ออกจากระบบ">' + OUT + '<span class="lbl">ออกจากระบบ</span></button>'
      : '<button type="button" class="in" aria-label="เข้าสู่ระบบผู้แก้ไข">' + LOCK + '<span class="lbl">เข้าสู่ระบบ</span></button>';
    var b = box.querySelector('button'); b.addEventListener('click', s ? logout : open);
  }
  window.KBS_AUTH = { open: open, logout: logout, refresh: function () { rerender(); paint(); } };
  (window.DC_AFTER = window.DC_AFTER || []).push(paint);
  window.addEventListener('storage', function (e) { if (e.key === 'kbsSession') { rerender(); paint(); } });
  function init() { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); buildModal(); paint(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
