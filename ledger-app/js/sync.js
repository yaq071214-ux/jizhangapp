/* ============================================
   记一笔 · 云同步（Cloudflare Worker + KV）
   用「同步码」标识同一份账本，多设备输入相同同步码即可互通
   ============================================ */

(function (global) {
  'use strict';

  const L = Ledger;

  function apiBase() {
    return (L.getSettings().apiBase || '').trim().replace(/\/+$/, '');
  }

  function configured() { return !!apiBase(); }

  /* 同步码：首次自动生成，用户可在多设备间复制粘贴 */
  function syncKey() {
    let k = L.getSettings().syncKey;
    if (!k) {
      k = 'sk_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
      L.setSettings({ syncKey: k });
    }
    return k;
  }

  async function post(action, payload) {
    const base = apiBase();
    if (!base) throw new Error('未配置后端地址');
    const res = await fetch(base + '/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action, syncKey: syncKey() }, payload || {})),
    });
    const r = await res.json();
    if (r && r.error) throw new Error(r.error);
    return r;
  }

  async function push() {
    return post('push', { data: L.getDB() });
  }

  async function pull() {
    return post('pull');
  }

  /* 合并本地与远程账本（按交易 id 并集，冲突取较新的） */
  function merge(local, remote) {
    if (!remote) return local;
    const txMap = {};
    (local.transactions || []).forEach((t) => { txMap[t.id] = t; });
    (remote.transactions || []).forEach((t) => {
      const a = txMap[t.id];
      if (!a || (t.updatedAt || t.createdAt || 0) > (a.updatedAt || a.createdAt || 0)) {
        txMap[t.id] = t;
      }
    });
    const merged = Object.assign({}, local, {
      transactions: Object.values(txMap),
    });
    // 分类/预算/周期等非流水数据：整份取较新的
    if ((remote.updatedAt || 0) > (local.updatedAt || 0)) {
      merged.categories = remote.categories;
      merged.budgets = remote.budgets;
      merged.recurrings = remote.recurrings;
    }
    return merged;
  }

  /* 一键同步：先拉取合并，再推回 */
  async function syncNow() {
    const r = await pull();
    if (r.data) {
      L.replaceDB(merge(L.getDB(), r.data));
    }
    const p = await push();
    return { pulled: !!r.data, pushedAt: p.updatedAt };
  }

  global.Sync = { apiBase, configured, syncKey, push, pull, merge, syncNow };
})(window);
