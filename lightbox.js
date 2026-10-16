/* KBS Milling – ดูรูปขนาดเต็ม (คลิกรูป / ปัดซ้ายขวาบนมือถือ) */
(function () {
  var box, imgs = [], idx = 0, lastFocus = null, sx = null;
  var css = '#kbs-lb{position:fixed;inset:0;z-index:90;background:rgba(5,20,36,.92);display:none;flex-direction:column;align-items:center;justify-content:center;padding:56px 12px 64px;font-family:"IBM Plex Sans Thai","Noto Sans Thai",sans-serif}' +
    '#kbs-lb.open{display:flex}#kbs-lb img{max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;background:#FFF}' +
    '#kbs-lb button{font:inherit;cursor:pointer;border:0;background:rgba(255,255,255,.14);color:#FFF;border-radius:999px;width:48px;height:48px;font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center}' +
    '#kbs-lb button:hover{background:rgba(255,255,255,.28)}#kbs-lb .x{position:absolute;top:10px;right:12px}' +
    '#kbs-lb .pv{position:absolute;left:10px;top:50%;transform:translateY(-50%)}#kbs-lb .nx{position:absolute;right:10px;top:50%;transform:translateY(-50%)}' +
    '#kbs-lb .bar{position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:16px;color:#FFF;font-size:14px}' +
    '#kbs-lb .bar a{color:#BFE3FA}';
  function build() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    box = document.createElement('div'); box.id = 'kbs-lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'ดูรูปขนาดเต็ม');
    box.innerHTML = '<img alt=""><button type="button" class="x" aria-label="ปิด">×</button><button type="button" class="pv" aria-label="รูปก่อนหน้า">‹</button><button type="button" class="nx" aria-label="รูปถัดไป">›</button><div class="bar"><span class="n"></span><a target="_blank" rel="noopener">เปิดรูปต้นฉบับ</a></div>';
    document.body.appendChild(box);
    box.querySelector('.x').onclick = close; box.querySelector('.pv').onclick = function () { go(-1); }; box.querySelector('.nx').onclick = function () { go(1); };
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) { if (!box.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); });
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) { if (sx == null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); sx = null; });
  }
  function show() {
    var it = imgs[idx]; var im = box.querySelector('img'); im.src = it.src; im.alt = 'รูปที่ ' + (idx + 1);
    box.querySelector('.n').textContent = imgs.length > 1 ? (idx + 1) + ' / ' + imgs.length : '';
    var a = box.querySelector('.bar a'); a.style.display = it.href ? '' : 'none'; if (it.href) a.href = it.href;
    box.querySelector('.pv').style.display = box.querySelector('.nx').style.display = imgs.length > 1 ? '' : 'none';
  }
  function go(d) { if (imgs.length < 2) return; idx = (idx + d + imgs.length) % imgs.length; show(); }
  function open(list, i) {
    if (!box) build();
    imgs = (list || []).filter(function (x) { return x && x.src; }); if (!imgs.length) return;
    idx = Math.max(0, Math.min(i || 0, imgs.length - 1)); lastFocus = document.activeElement;
    show(); box.classList.add('open'); document.body.style.overflow = 'hidden'; box.querySelector('.x').focus();
  }
  function close() { box.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  window.KBS_LIGHTBOX = { open: open, close: close };
})();
