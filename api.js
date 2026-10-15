/* KBS Milling – เชื่อมต่อ Google Sheets (Apps Script Web app) */
(function () {
  var cfg = window.KBS_CONFIG || {};
  var url = (cfg.API_URL || '').trim();
  function call(promise) {
    return promise.then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
      return j;
    });
  }
  window.KBS_API = {
    configured: !!url,
    requirePin: false,
    list: function (limit) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets'));
      return call(fetch(url + '?action=list&limit=' + (limit || 30))).then(function (j) { return j.records; });
    },
    listTable: function (key) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets'));
      return call(fetch(url + '?action=' + key)).then(function (j) { return j.records; });
    },
    listNews: function (limit) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets'));
      return call(fetch(url + '?action=news&limit=' + (limit || 50))).then(function (j) { return j.records; });
    },
    listShares: function (limit) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets'));
      return call(fetch(url + '?action=shares&limit=' + (limit || 30))).then(function (j) { return j.records; });
    },
    save: function (action, record) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets — ตั้งค่า API_URL ในไฟล์ config.js'));
      var s = this.session(), self = this;
      var body = { action: action, record: record, token: s ? s.token : '' };
      if (action.indexOf('delete') === 0) body.id = record.id;
      // ส่งเป็น text/plain เพื่อหลีกเลี่ยง CORS preflight ของ Apps Script
      return fetch(url, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); }).then(function (j) {
        if (j.auth) self.clearSession();
        if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
        return j;
      });
    },
    session: function () {
      try { var s = JSON.parse(localStorage.getItem('kbsSession') || 'null'); if (s && s.exp > Date.now()) return s; } catch (e) {}
      return null;
    },
    clearSession: function () { try { localStorage.removeItem('kbsSession'); } catch (e) {} },
    login: function (username, password) {
      if (!url) return Promise.reject(new Error('ยังไม่ได้เชื่อม Google Sheets'));
      return call(fetch(url, { method: 'POST', body: JSON.stringify({ action: 'login', username: username, password: password }) })).then(function (j) {
        var s = { token: j.token, name: j.name, user: username, exp: Date.now() + (j.ttl || 21600) * 1000 };
        try { localStorage.setItem('kbsSession', JSON.stringify(s)); } catch (e) {}
        return s;
      });
    },
    logout: function () {
      var s = this.session(); this.clearSession();
      if (s && url) fetch(url, { method: 'POST', body: JSON.stringify({ action: 'logout', token: s.token }) }).catch(function () {});
    },
    thumb: function (p) { return p && p.id ? 'https://drive.google.com/thumbnail?id=' + p.id + '&sz=w400' : ''; },
    compress: function (file, maxSide) {
      maxSide = maxSide || 1280;
      return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onerror = function () { reject(new Error('อ่านไฟล์รูปไม่ได้')); };
        fr.onload = function () {
          var img = new Image();
          img.onerror = function () { reject(new Error('ไฟล์นี้ไม่ใช่รูปภาพ')); };
          img.onload = function () {
            var s = Math.min(1, maxSide / Math.max(img.width, img.height));
            var c = document.createElement('canvas');
            c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL('image/jpeg', 0.8));
          };
          img.src = fr.result;
        };
        fr.readAsDataURL(file);
      });
    },
    fmtDate: function (iso) {
      var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
      return m ? (m[3] + '/' + m[2] + '/' + (+m[1] + 543)) : String(iso || '');
    },
    getPin: function () { try { return localStorage.getItem('kbsPin') || ''; } catch (e) { return ''; } },
    setPin: function (p) { try { localStorage.setItem('kbsPin', p); } catch (e) {} }
  };
})();
