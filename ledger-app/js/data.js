/* ============================================
   记一笔 · 数据层
   本地存储（localStorage）作为过渡，后续接入云同步 API
   ============================================ */

(function (global) {
  'use strict';

  const STORE_KEY = 'ledger-app.v1';

  /* ---------- 预设分类 ---------- */
  const DEFAULT_CATEGORIES = {
    expense: [
      { id: 'e_food',    name: '餐饮', icon: '🍜' },
      { id: 'e_transit', name: '交通', icon: '🚕' },
      { id: 'e_shop',    name: '购物', icon: '🛍' },
      { id: 'e_home',    name: '居住', icon: '🏠' },
      { id: 'e_fun',     name: '娱乐', icon: '🎬' },
      { id: 'e_health',  name: '医疗', icon: '💊' },
      { id: 'e_gift',    name: '人情', icon: '🎁' },
      { id: 'e_daily',   name: '日用', icon: '🧴' },
      { id: 'e_edu',     name: '教育', icon: '📚' },
      { id: 'e_travel',  name: '旅行', icon: '✈️' },
      { id: 'e_other',   name: '其他', icon: '·' },
    ],
    income: [
      { id: 'i_salary',  name: '工资', icon: '💰' },
      { id: 'i_invest',  name: '理财', icon: '📈' },
      { id: 'i_hongbao', name: '红包', icon: '🧧' },
      { id: 'i_part',    name: '兼职', icon: '💼' },
      { id: 'i_other',   name: '其他', icon: '·' },
    ],
  };

  const CYCLE_LABELS = { daily: '每天', weekly: '每周', monthly: '每月', yearly: '每年' };

  /* ---------- 默认数据 ---------- */
  function defaultDB() {
    return {
      version: 1,
      updatedAt: 0,
      categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
      transactions: [],
      budgets: { total: null, byCategory: {} },
      recurrings: [],
      settings: { theme: 'light' },
    };
  }

  /* ---------- 存储 ---------- */
  function loadDB() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const db = JSON.parse(raw);
        // 合并默认值，避免新增字段缺失
        const base = defaultDB();
        db.categories = db.categories || base.categories;
        db.transactions = db.transactions || [];
        db.budgets = Object.assign(base.budgets, db.budgets || {});
        db.recurrings = db.recurrings || [];
        db.settings = Object.assign(base.settings, db.settings || {});
        return db;
      }
    } catch (e) {
      console.warn('读取本地数据失败', e);
    }
    return defaultDB();
  }

  let db = loadDB();

  function saveDB() {
    db.updatedAt = Date.now();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
    } catch (e) {
      console.warn('保存本地数据失败', e);
    }
  }

  function replaceDB(newDB) {
    db = Object.assign(defaultDB(), newDB || {});
    saveDB();
  }

  /* ---------- 工具 ---------- */
  function uid(prefix) {
    return (prefix || 'id') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function fmtDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function todayStr() { return fmtDate(new Date()); }

  function addDays(dateStr, n) {
    const d = parseDate(dateStr);
    d.setDate(d.getDate() + n);
    return fmtDate(d);
  }

  /* 金额：以"元"存储，格式化为两位小数 */
  function fmtMoney(n) {
    const v = Number(n) || 0;
    return v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ---------- 分类 ---------- */
  function getCategories(type) {
    return db.categories[type] || [];
  }

  function getCategory(type, id) {
    return getCategories(type).find((c) => c.id === id);
  }

  function addCategory(type, { name, icon }) {
    const cat = { id: uid('c'), name, icon: icon || '·' };
    db.categories[type].push(cat);
    saveDB();
    return cat;
  }

  function deleteCategory(type, id) {
    db.categories[type] = db.categories[type].filter((c) => c.id !== id);
    saveDB();
  }

  /* ---------- 交易 ---------- */
  function addTransaction(tx) {
    const record = {
      id: uid('t'),
      type: tx.type === 'income' ? 'income' : 'expense',
      amount: Math.round((Number(tx.amount) || 0) * 100) / 100,
      category: tx.category || '',
      date: tx.date || todayStr(),
      note: tx.note || '',
      images: Array.isArray(tx.images) ? tx.images : [],
      createdAt: Date.now(),
    };
    db.transactions.push(record);
    saveDB();
    return record;
  }

  function updateTransaction(id, patch) {
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) return null;
    if ('amount' in patch) patch.amount = Math.round((Number(patch.amount) || 0) * 100) / 100;
    Object.assign(tx, patch);
    saveDB();
    return tx;
  }

  function deleteTransaction(id) {
    db.transactions = db.transactions.filter((t) => t.id !== id);
    saveDB();
  }

  function getTransactions(opts) {
    opts = opts || {};
    let list = db.transactions.slice();
    if (opts.type) list = list.filter((t) => t.type === opts.type);
    if (opts.from) list = list.filter((t) => t.date >= opts.from);
    if (opts.to) list = list.filter((t) => t.date <= opts.to);
    if (opts.category) list = list.filter((t) => t.category === opts.category);
    if (opts.keyword) {
      const kw = String(opts.keyword).trim().toLowerCase();
      list = list.filter((t) => {
        const cat = getCategory(t.type, t.category);
        return (t.note || '').toLowerCase().includes(kw) ||
               (cat && cat.name.includes(kw));
      });
    }
    list.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : (a.date < b.date ? 1 : -1)));
    return list;
  }

  function getTransaction(id) {
    return db.transactions.find((t) => t.id === id);
  }

  /* ---------- 预算 ---------- */
  function getBudgets() { return db.budgets; }

  function setBudget(patch) {
    Object.assign(db.budgets, patch);
    saveDB();
  }

  /* ---------- 周期支出 ---------- */
  function getRecurrings() { return db.recurrings; }

  function addRecurring(r) {
    const rec = {
      id: uid('r'),
      name: r.name || '',
      amount: Math.round((Number(r.amount) || 0) * 100) / 100,
      type: r.type === 'income' ? 'income' : 'expense',
      category: r.category || '',
      cycle: r.cycle || 'monthly',
      nextDate: r.nextDate || todayStr(),
      enabled: true,
    };
    db.recurrings.push(rec);
    saveDB();
    return rec;
  }

  function updateRecurring(id, patch) {
    const rec = db.recurrings.find((r) => r.id === id);
    if (!rec) return null;
    if ('amount' in patch) patch.amount = Math.round((Number(patch.amount) || 0) * 100) / 100;
    Object.assign(rec, patch);
    saveDB();
    return rec;
  }

  function deleteRecurring(id) {
    db.recurrings = db.recurrings.filter((r) => r.id !== id);
    saveDB();
  }

  function nextCycleDate(dateStr, cycle) {
    const d = parseDate(dateStr);
    switch (cycle) {
      case 'daily': d.setDate(d.getDate() + 1); break;
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    }
    return fmtDate(d);
  }

  /* 处理到期的周期项：生成交易并推进 nextDate */
  function settleRecurrings(nowStr) {
    const today = nowStr || todayStr();
    let generated = 0;
    db.recurrings.forEach((r) => {
      if (!r.enabled) return;
      while (r.nextDate <= today) {
        addTransaction({
          type: r.type,
          amount: r.amount,
          category: r.category,
          date: r.nextDate,
          note: r.name,
        });
        r.nextDate = nextCycleDate(r.nextDate, r.cycle);
        generated++;
      }
    });
    if (generated) saveDB();
    return generated;
  }

  /* ---------- 统计 ---------- */
  function summarize(list) {
    const s = {
      expense: 0,
      income: 0,
      byCategory: {},   // { categoryId: { amount, count } }
      byDay: {},        // { 'YYYY-MM-DD': { expense, income } }
    };
    list.forEach((t) => {
      if (t.type === 'expense') s.expense += t.amount;
      else s.income += t.amount;

      const c = s.byCategory[t.category] || (s.byCategory[t.category] = { amount: 0, count: 0 });
      c.amount += t.amount;
      c.count += 1;

      const d = s.byDay[t.date] || (s.byDay[t.date] = { expense: 0, income: 0 });
      if (t.type === 'expense') d.expense += t.amount; else d.income += t.amount;
    });
    return s;
  }

  /* 日期范围工具 */
  function rangeOf(period, anchor) {
    // period: 'day' | 'week' | 'month'；anchor: 'YYYY-MM-DD'
    const a = anchor ? parseDate(anchor) : new Date();
    let from, to;
    if (period === 'day') {
      from = fmtDate(a);
      to = fmtDate(a);
    } else if (period === 'week') {
      // 周一起始
      const day = (a.getDay() + 6) % 7;
      const start = new Date(a); start.setDate(a.getDate() - day);
      const end = new Date(start); end.setDate(start.getDate() + 6);
      from = fmtDate(start);
      to = fmtDate(end);
    } else {
      const start = new Date(a.getFullYear(), a.getMonth(), 1);
      const end = new Date(a.getFullYear(), a.getMonth() + 1, 0);
      from = fmtDate(start);
      to = fmtDate(end);
    }
    return { from, to };
  }

  /* 月环比：本月 vs 上月 */
  function monthCompare(anchor) {
    const a = anchor ? parseDate(anchor) : new Date();
    const thisStart = new Date(a.getFullYear(), a.getMonth(), 1);
    const thisEnd = new Date(a.getFullYear(), a.getMonth() + 1, 0);
    const lastStart = new Date(a.getFullYear(), a.getMonth() - 1, 1);
    const lastEnd = new Date(a.getFullYear(), a.getMonth(), 0);

    const thisList = getTransactions({ from: fmtDate(thisStart), to: fmtDate(thisEnd) });
    const lastList = getTransactions({ from: fmtDate(lastStart), to: fmtDate(lastEnd) });
    const cur = summarize(thisList);
    const prev = summarize(lastList);
    return {
      curExpense: cur.expense,
      curIncome: cur.income,
      prevExpense: prev.expense,
      prevIncome: prev.income,
      expenseDelta: prev.expense ? (cur.expense - prev.expense) / prev.expense : null,
    };
  }

  /* ---------- 设置 ---------- */
  function getSettings() { return db.settings; }
  function setSettings(patch) {
    Object.assign(db.settings, patch);
    saveDB();
  }

  /* ---------- 导出 ---------- */
  global.Ledger = {
    DEFAULT_CATEGORIES,
    CYCLE_LABELS,
    // 存储
    loadDB, saveDB, getDB: () => db,
    // 工具
    uid, fmtDate, parseDate, todayStr, addDays, fmtMoney, rangeOf, monthCompare, summarize,
    // 分类
    getCategories, getCategory, addCategory, deleteCategory,
    // 交易
    addTransaction, updateTransaction, deleteTransaction, getTransactions, getTransaction,
    // 预算
    getBudgets, setBudget,
    // 周期
    getRecurrings, addRecurring, updateRecurring, deleteRecurring, settleRecurrings, nextCycleDate,
    // 设置
    getSettings, setSettings, replaceDB,
  };
})(window);
