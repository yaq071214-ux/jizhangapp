/* ============================================
   记一笔 · AI 识图（DeepSeek V4 Flash Vision）
   通过后端 Worker 转发，key 保存在后端，前端不持有
   ============================================ */

(function (global) {
  'use strict';

  const L = Ledger;

  function apiBase() {
    return (L.getSettings().apiBase || '').trim().replace(/\/+$/, '');
  }

  function configured() { return !!apiBase(); }

  /* 识别一张图，返回 { items: [{name, x, y, w, h}] } */
  async function recognize(imageDataUrl) {
    const base = apiBase();
    if (!base) throw new Error('未配置后端地址，请到「设置 → 云同步」填写');
    const res = await fetch(base + '/api/recognize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl }),
    });
    const r = await res.json();
    if (r && r.error) throw new Error(r.error);
    return r || { items: [] };
  }

  /* 按归一化坐标从图片裁剪出一张小图，返回 dataURL */
  function crop(dataUrl, x, y, w, h) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const cw = Math.max(1, Math.round(img.width * w));
          const ch = Math.max(1, Math.round(img.height * h));
          const canvas = document.createElement('canvas');
          canvas.width = cw;
          canvas.height = ch;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, img.width * x, img.height * y, img.width * w, img.height * h, 0, 0, cw, ch);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = dataUrl;
    });
  }

  global.AI = { apiBase, configured, recognize, crop };
})(window);
