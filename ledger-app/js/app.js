/* ============================================
   记一笔 · 应用逻辑与视图
   ============================================ */

(function () {
  'use strict';

  const L = Ledger;

  /* ---------- 状态 ---------- */
  const state = {
    route: 'overview',
    listFilter: { type: 'all', month: '', keyword: '' },
    statsPeriod: 'month',
    statsAnchor: L.todayStr(),
  };

  /* ---------- 图标 ---------- */
  const ICONS = {
    overview: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    stats: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l3-4 3 3 4-6"/></svg>',
    budget: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    recurring: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v5h-5"/></svg>',
    settings: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h0a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    camera: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h2l1.5-2h6L15 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13.5" r="3.2"/></svg>',
    edit: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  };

  const NAV = [
    { key: 'overview', label: '概览', icon: ICONS.overview },
    { key: 'list', label: '流水', icon: ICONS.list },
    { key: 'stats', label: '统计', icon: ICONS.stats },
    { key: 'budget', label: '预算', icon: ICONS.budget },
    { key: 'recurring', label: '周期', icon: ICONS.recurring },
    { key: 'settings', label: '设置', icon: ICONS.settings },
  ];

  const TITLES = { overview: '概览', list: '流水', stats: '统计', budget: '预算', recurring: '周期支出', settings: '设置' };
  const TAB_KEYS = ['overview', 'list', 'stats', 'budget', 'settings'];

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const $ = (sel, root) => (root || document).querySelector(sel);

  function money(n) { return L.fmtMoney(n); }

  function catName(type, id) {
    const c = L.getCategory(type, id);
    return c ? c.name : '未分类';
  }
  function catIcon(type, id) {
    const c = L.getCategory(type, id);
    return c ? c.icon : '·';
  }

  /* ---------- 导航 ---------- */
  function renderNav() {
    const side = $('#sidebarNav');
    side.innerHTML = NAV.map((n) =>
      '<button class="nav-item' + (state.route === n.key ? ' active' : '') + '" data-route="' + n.key + '">' +
        n.icon + '<span>' + n.label + '</span></button>'
    ).join('');

    const tab = $('#tabbar');
    tab.innerHTML = TAB_KEYS.map((key) => {
      const n = NAV.find((x) => x.key === key);
      return '<button class="tab-item' + (state.route === key ? ' active' : '') + '" data-route="' + key + '">' +
        n.icon + '<span>' + n.label + '</span></button>';
    }).join('');
  }

  /* ---------- 路由 ---------- */
  function go(route) {
    state.route = route;
    renderNav();
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    $('#pageTitle').textContent = TITLES[state.route];
    const view = $('#view');
    const fn = { overview: renderOverview, list: renderList, stats: renderStats, budget: renderBudget, recurring: renderRecurring, settings: renderSettings }[state.route];
    view.innerHTML = fn();
    afterRender(state.route);
  }

  /* ---------- 概览 ---------- */
  function renderOverview() {
    const today = L.todayStr();
    const range = L.rangeOf('month', today);
    const txs = L.getTransactions({ from: range.from, to: range.to });
    const s = L.summarize(txs);
    const cmp = L.monthCompare(today);
    const recent = L.getTransactions().slice(0, 8);
    const totalBudget = L.getBudgets().total;

    const deltaHtml = cmp.expenseDelta == null ? '' :
      '<div class="row__sub">较上月 ' + (cmp.expenseDelta >= 0 ? '↑ ' : '↓ ') +
      Math.abs(cmp.expenseDelta * 100).toFixed(0) + '%</div>';

    let budgetLine = '';
    if (totalBudget) {
      const pct = totalBudget ? Math.min(100, Math.round(s.expense / totalBudget * 100)) : 0;
      budgetLine =
        '<div class="card">' +
          '<div class="card__head"><span class="card__title">本月预算</span>' +
          '<span class="card__more">' + money(s.expense) + ' / ' + money(totalBudget) + '</span></div>' +
          '<div class="progress"><div class="progress__bar' + (pct >= 90 ? ' warn' : '') + '" style="width:' + pct + '%"></div></div>' +
        '</div>';
    }

    const recentHtml = recent.length ? recent.map(rowHtml).join('') :
      '<div class="empty"><div class="empty__icon">🌸</div>还没有记录，点右下角记第一笔吧</div>';

    return (
      '<div class="card" style="text-align:center;padding:30px 22px;">' +
        '<div class="card__head" style="justify-content:center;margin-bottom:8px;"><span class="card__title">' + today + ' · 本月结余</span></div>' +
        '<div class="big-number" style="color:' + (s.income - s.expense >= 0 ? 'var(--income)' : 'var(--expense)') + '">' +
          money(s.income - s.expense) + '<span class="unit">元</span></div>' +
        '<div class="stat-row" style="margin-top:20px;">' +
          '<div class="stat-cell"><div class="stat-cell__label">支出</div><div class="stat-cell__value" style="color:var(--expense)">' + money(s.expense) + '</div>' + deltaHtml + '</div>' +
          '<div class="stat-cell"><div class="stat-cell__label">收入</div><div class="stat-cell__value" style="color:var(--income)">' + money(s.income) + '</div></div>' +
          '<div class="stat-cell"><div class="stat-cell__label">笔数</div><div class="stat-cell__value">' + txs.length + '</div></div>' +
        '</div>' +
      '</div>' +
      budgetLine +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">最近记录</span>' +
        '<button class="card__more btn--ghost btn" style="padding:4px 10px;font-size:13px" onclick="App.go(\'list\')">查看全部</button></div>' +
        recentHtml +
      '</div>'
    );
  }

  function rowHtml(t) {
    const isExpense = t.type === 'expense';
    return (
      '<div class="row" style="cursor:pointer" onclick="App.openEntry(\'' + t.id + '\')">' +
        '<div class="row__icon" style="background:' + (isExpense ? 'var(--expense-bg)' : 'var(--income-bg)') + '">' + esc(catIcon(t.type, t.category)) + '</div>' +
        '<div class="row__main">' +
          '<div class="row__title">' + esc(catName(t.type, t.category)) + (t.note ? '<span style="color:var(--text-3);font-size:13px"> · ' + esc(t.note) + '</span>' : '') + '</div>' +
          '<div class="row__sub">' + t.date + (t.images && t.images.length ? ' · 📷' + t.images.length : '') + '</div>' +
        '</div>' +
        '<div class="row__amount amount--' + (isExpense ? 'expense' : 'income') + '">' + (isExpense ? '-' : '+') + money(t.amount) + '</div>' +
      '</div>'
    );
  }

  /* ---------- 流水 ---------- */
  function renderList() {
    const f = state.listFilter;
    const txs = L.getTransactions({
      type: f.type === 'all' ? null : f.type,
      from: f.month ? f.month + '-01' : null,
      to: f.month ? f.month + '-31' : null,
      keyword: f.keyword,
    });
    const s = L.summarize(txs);

    const month = f.month || L.todayStr().slice(0, 7);
    const months = recentMonths();

    const typeSeg =
      '<div class="seg">' +
        ['all', 'expense', 'income'].map((t) => {
          const label = t === 'all' ? '全部' : (t === 'expense' ? '支出' : '收入');
          return '<button class="seg__item' + (f.type === t ? ' active' : '') + '" onclick="App.setListType(\'' + t + '\')">' + label + '</button>';
        }).join('') +
      '</div>';

    return (
      '<div style="margin-bottom:14px">' + typeSeg + '</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:14px;align-items:center">' +
        '<div style="position:relative;flex:1">' +
          '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-3)">' + ICONS.search + '</span>' +
          '<input class="field__input" style="padding-left:38px" placeholder="搜索备注或分类" value="' + esc(f.keyword) + '" oninput="App.setListKeyword(this.value)">' +
        '</div>' +
        '<select class="field__input" style="width:130px;padding:12px" onchange="App.setListMonth(this.value)">' +
          '<option value="">全部月份</option>' +
          months.map((m) => '<option value="' + m + '"' + (f.month === m ? ' selected' : '') + '>' + m + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card__head" style="margin-bottom:6px">' +
          '<span class="card__title">共 ' + txs.length + ' 笔</span>' +
          '<span style="font-size:13px;color:var(--text-3)">支出 ' + money(s.expense) + ' · 收入 ' + money(s.income) + '</span>' +
        '</div>' +
        (txs.length ? txs.map(rowHtml).join('') : '<div class="empty"><div class="empty__icon">🍃</div>没有符合条件的记录</div>') +
      '</div>'
    );
  }

  function recentMonths() {
    const set = new Set();
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      set.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
    }
    L.getTransactions().forEach((t) => set.add(t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }

  /* ---------- 统计 ---------- */
  function renderStats() {
    const p = state.statsPeriod;
    const anchor = state.statsAnchor;
    const range = L.rangeOf(p, anchor);
    const txs = L.getTransactions({ from: range.from, to: range.to });
    const s = L.summarize(txs);

    // 分类排行
    const catRows = Object.entries(s.byCategory)
      .map(([id, v]) => ({ id, ...v, name: catName('expense', id), icon: catIcon('expense', id) }))
      .filter((c) => !c.id.startsWith('i_')) // 只算支出分类（简化：按分类名匹配）
      .sort((a, b) => b.amount - a.amount);

    // 更稳的分类匹配：仅统计支出类型交易
    const expenseTxs = txs.filter((t) => t.type === 'expense');
    const expS = L.summarize(expenseTxs);
    const catRows2 = Object.entries(expS.byCategory)
      .map(([id, v]) => ({ id, amount: v.amount, count: v.count, name: catName('expense', id), icon: catIcon('expense', id) }))
      .sort((a, b) => b.amount - a.amount);

    // 趋势
    let labels = [], expData = [], incData = [];
    if (p === 'month') {
      const y = Number(anchor.slice(0, 4)), m = Number(anchor.slice(5, 7));
      const days = new Date(y, m, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const ds = anchor.slice(0, 8) + String(d).padStart(2, '0');
        const day = s.byDay[ds] || { expense: 0, income: 0 };
        labels.push(String(d));
        expData.push(day.expense);
        incData.push(day.income);
      }
    } else if (p === 'week') {
      const start = L.parseDate(range.from);
      for (let i = 0; i < 7; i++) {
        const ds = L.addDays(range.from, i);
        const day = s.byDay[ds] || { expense: 0, income: 0 };
        const wd = ['一', '二', '三', '四', '五', '六', '日'][(start.getDay() + 6 + i) % 7];
        labels.push('周' + wd);
        expData.push(day.expense);
        incData.push(day.income);
      }
    } else { // day
      const ds = anchor;
      const day = s.byDay[ds] || { expense: 0, income: 0 };
      labels = ['支出', '收入'];
      expData = [day.expense, 0];
      incData = [0, day.income];
    }

    const periodSeg =
      '<div class="seg">' +
        [['day', '日'], ['week', '周'], ['month', '月']].map(([k, label]) =>
          '<button class="seg__item' + (p === k ? ' active' : '') + '" onclick="App.setStatsPeriod(\'' + k + '\')">' + label + '</button>'
        ).join('') +
      '</div>';

    const nav =
      '<div style="display:flex;align-items:center;gap:6px">' +
        '<button class="icon-btn" onclick="App.shiftStats(-1)">' + ICONS.back + '</button>' +
        '<span style="font-size:14px;color:var(--text-2)">' + rangeLabel(p, anchor) + '</span>' +
        '<button class="icon-btn" onclick="App.shiftStats(1)" style="transform:rotate(180deg)">' + ICONS.back + '</button>' +
      '</div>';

    const donutHtml = catRows2.length ?
      '<div style="position:relative;height:210px"><canvas id="donutChart"></canvas></div>' +
      '<div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">' +
        catRows2.slice(0, 6).map((c, i) => {
          const pct = expS.expense ? Math.round(c.amount / expS.expense * 100) : 0;
          return '<div class="row" style="padding:8px 4px">' +
            '<div class="row__icon" style="width:32px;height:32px;font-size:15px">' + esc(c.icon) + '</div>' +
            '<div class="row__main"><div class="row__title">' + esc(c.name) + '</div>' +
            '<div class="row__sub">' + c.count + ' 笔</div></div>' +
            '<div style="text-align:right"><div class="row__amount amount--expense">' + money(c.amount) + '</div>' +
            '<div class="row__sub">' + pct + '%</div></div></div>';
        }).join('') +
      '</div>' :
      '<div class="empty"><div class="empty__icon">🌿</div>暂无支出数据</div>';

    return (
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px">' +
        periodSeg + nav +
      '</div>' +
      '<div class="card" style="margin-bottom:16px">' +
        '<div class="stat-row" style="margin-bottom:16px">' +
          '<div class="stat-cell"><div class="stat-cell__label">支出</div><div class="stat-cell__value" style="color:var(--expense)">' + money(s.expense) + '</div></div>' +
          '<div class="stat-cell"><div class="stat-cell__label">收入</div><div class="stat-cell__value" style="color:var(--income)">' + money(s.income) + '</div></div>' +
          '<div class="stat-cell"><div class="stat-cell__label">结余</div><div class="stat-cell__value">' + money(s.income - s.expense) + '</div></div>' +
        '</div>' +
        '<div style="position:relative;height:220px"><canvas id="trendChart"></canvas></div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">支出分类占比</span></div>' +
        donutHtml +
      '</div>'
    );
  }

  function rangeLabel(period, anchor) {
    if (period === 'month') return anchor.slice(0, 7);
    if (period === 'week') {
      const r = L.rangeOf('week', anchor);
      return r.from + ' ~ ' + r.to;
    }
    return anchor;
  }

  /* ---------- 预算 ---------- */
  function renderBudget() {
    const b = L.getBudgets();
    const range = L.rangeOf('month', L.todayStr());
    const txs = L.getTransactions({ from: range.from, to: range.to, type: 'expense' });
    const s = L.summarize(txs);

    const total = b.total;
    const totalPct = total ? Math.min(100, Math.round(s.expense / total * 100)) : 0;

    const totalBlock =
      '<div class="card" style="margin-bottom:16px">' +
        '<div class="card__head"><span class="card__title">总预算</span>' +
        (total ? '<button class="btn btn--ghost" style="font-size:13px;padding:4px 10px" onclick="App.openBudgetSheet()">编辑</button>' : '') +
        '</div>' +
        (total ?
          '<div class="big-number" style="font-size:32px">' + money(s.expense) + '<span class="unit"> / ' + money(total) + ' 元</span></div>' +
          '<div class="progress" style="margin-top:12px"><div class="progress__bar' + (totalPct >= 90 ? ' warn' : '') + '" style="width:' + totalPct + '%"></div></div>' +
          '<div class="row__sub" style="margin-top:8px;text-align:right">剩余 ' + money(Math.max(0, total - s.expense)) + ' · ' + totalPct + '%</div>'
        :
          '<div class="empty" style="padding:28px"><div class="empty__icon">🎯</div>还没有设置预算<br><br><button class="btn btn--primary" onclick="App.openBudgetSheet()">设置总预算</button></div>') +
      '</div>';

    // 分类预算
    const catBudgets = Object.entries(b.byCategory || {});
    const catHtml = catBudgets.length ? catBudgets.map(([cid, amt]) => {
      const spent = (s.byCategory[cid] || {}).amount || 0;
      const pct = amt ? Math.min(100, Math.round(spent / amt * 100)) : 0;
      return '<div class="card" style="margin-bottom:12px;padding:18px">' +
        '<div class="card__head" style="margin-bottom:10px"><span class="card__title">' + esc(catIcon('expense', cid)) + ' ' + esc(catName('expense', cid)) + '</span>' +
        '<span class="card__more">' + money(spent) + ' / ' + money(amt) + '</span></div>' +
        '<div class="progress"><div class="progress__bar' + (pct >= 90 ? ' warn' : '') + '" style="width:' + pct + '%"></div></div></div>';
    }).join('') : '';

    return (
      totalBlock +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">分类预算</span>' +
        '<button class="btn btn--ghost" style="font-size:13px;padding:4px 10px" onclick="App.openCatBudgetSheet()">添加</button></div>' +
        (catHtml || '<div class="empty" style="padding:24px">可为特定分类单独设置预算额度</div>') +
      '</div>'
    );
  }

  /* ---------- 周期 ---------- */
  function renderRecurring() {
    const list = L.getRecurrings();
    return (
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">周期记账</span>' +
        '<button class="btn btn--soft" style="font-size:13px;padding:7px 14px" onclick="App.openRecurringSheet()">＋ 新建</button></div>' +
        (list.length ? list.map((r) => {
          const c = L.getCategory(r.type, r.category);
          return '<div class="row">' +
            '<div class="row__icon">' + esc(c ? c.icon : '·') + '</div>' +
            '<div class="row__main"><div class="row__title">' + esc(r.name || (c ? c.name : '')) + '</div>' +
            '<div class="row__sub">' + L.CYCLE_LABELS[r.cycle] + ' · 下次 ' + r.nextDate + '</div></div>' +
            '<div class="row__amount amount--' + (r.type === 'expense' ? 'expense' : 'income') + '">' + money(r.amount) + '</div>' +
            '<button class="icon-btn" onclick="App.openRecurringSheet(\'' + r.id + '\')">' + ICONS.edit + '</button>' +
            '<button class="icon-btn" style="color:var(--expense)" onclick="App.deleteRecurring(\'' + r.id + '\')">' + ICONS.trash + '</button>' +
          '</div>';
        }).join('') : '<div class="empty"><div class="empty__icon">🔁</div>房租、会员费、订阅等固定支出<br>设置后到期自动记账</div>') +
      '</div>'
    );
  }

  /* ---------- 设置 ---------- */
  function renderSettings() {
    const settings = L.getSettings();
    return (
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">偏好</span></div>' +
        '<div class="row" style="cursor:pointer" onclick="App.toggleTheme()">' +
          '<div class="row__main"><div class="row__title">深色模式</div><div class="row__sub">' + (settings.theme === 'dark' ? '已开启' : '已关闭') + '</div></div>' +
          '<button class="btn btn--soft" style="padding:8px 14px;font-size:13px">' + (settings.theme === 'dark' ? '关闭' : '开启') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">数据</span></div>' +
        '<div class="row" style="cursor:pointer" onclick="App.exportCSV()">' +
          '<div class="row__main"><div class="row__title">导出 CSV</div><div class="row__sub">备份所有流水记录</div></div>' +
          '<span style="color:var(--text-3)">›</span>' +
        '</div>' +
        '<div class="row" style="cursor:pointer" onclick="App.clearAll()">' +
          '<div class="row__main"><div class="row__title" style="color:var(--expense)">清空所有数据</div><div class="row__sub">不可恢复，请先导出备份</div></div>' +
          '<span style="color:var(--text-3)">›</span>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">云同步</span></div>' +
        '<div class="field"><div class="field__label">后端地址（Worker 部署后得到）</div>' +
        '<input class="field__input" id="apiBaseInput" placeholder="https://你的worker.workers.dev" value="' + esc(settings.apiBase || '') + '">' +
        '<button class="btn btn--soft btn--block" style="margin-top:8px" onclick="App.saveApiBase()">保存地址</button></div>' +
        '<div class="field"><div class="field__label">同步码（多设备填同一个即可互通）</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<input class="field__input" id="syncKeyInput" readonly value="' + esc(Sync.syncKey()) + '">' +
          '<button class="btn btn--soft" onclick="App.copySyncKey()">复制</button>' +
        '</div></div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<button class="btn btn--primary" style="flex:1" onclick="App.syncNow()">立即同步</button>' +
          '<span id="syncMsg" style="font-size:13px;color:var(--text-3)"></span>' +
        '</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card__head"><span class="card__title">关于</span></div>' +
        '<div class="row__sub" style="padding:4px 0">记一笔 v0.1 · 极简记账<br>数据当前存于本地，云同步待接入</div>' +
      '</div>'
    );
  }

  /* ---------- 渲染后钩子 ---------- */
  function afterRender(route) {
    if (route === 'stats') {
      requestAnimationFrame(() => {
        const p = state.statsPeriod;
        const range = L.rangeOf(p, state.statsAnchor);
        const txs = L.getTransactions({ from: range.from, to: range.to });
        const s = L.summarize(txs);
        const expenseTxs = txs.filter((t) => t.type === 'expense');
        const expS = L.summarize(expenseTxs);
        const catRows = Object.entries(expS.byCategory)
          .map(([id, v]) => ({ id, amount: v.amount, count: v.count, name: catName('expense', id), icon: catIcon('expense', id) }))
          .sort((a, b) => b.amount - a.amount);

        let labels = [], expData = [], incData = [];
        if (p === 'month') {
          const y = Number(state.statsAnchor.slice(0, 4)), m = Number(state.statsAnchor.slice(5, 7));
          const days = new Date(y, m, 0).getDate();
          for (let d = 1; d <= days; d++) {
            const ds = state.statsAnchor.slice(0, 8) + String(d).padStart(2, '0');
            const day = s.byDay[ds] || { expense: 0, income: 0 };
            labels.push(String(d)); expData.push(day.expense); incData.push(day.income);
          }
        } else if (p === 'week') {
          const start = L.parseDate(range.from);
          for (let i = 0; i < 7; i++) {
            const ds = L.addDays(range.from, i);
            const day = s.byDay[ds] || { expense: 0, income: 0 };
            labels.push('周' + ['一', '二', '三', '四', '五', '六', '日'][(start.getDay() + 6 + i) % 7]);
            expData.push(day.expense); incData.push(day.income);
          }
        } else {
          const day = s.byDay[state.statsAnchor] || { expense: 0, income: 0 };
          labels = ['支出', '收入']; expData = [day.expense, 0]; incData = [0, day.income];
        }

        const donutCanvas = $('#donutChart');
        const trendCanvas = $('#trendChart');
        if (catRows.length && donutCanvas) LedgerCharts.renderDonut('donut', donutCanvas, catRows);
        if (trendCanvas) LedgerCharts.renderBars('trend', trendCanvas, labels, expData, incData);
      });
    }
  }

  /* ---------- 弹层 ---------- */
  function openSheet(html) {
    const root = $('#modalRoot');
    root.innerHTML = '<div class="sheet">' +
      '<div class="sheet__grip"></div>' + html + '</div>';
    root.hidden = false;
    const sheet = $('.sheet');
    sheet.addEventListener('click', (e) => { if (e.target === sheet) {} });
    return sheet;
  }

  function closeSheet() {
    const root = $('#modalRoot');
    root.hidden = true;
    root.innerHTML = '';
  }

  /* 记一笔 / 编辑 */
  let entryImages = [];
  let entryType = 'expense';

  function openEntry(txId) {
    const t = txId ? L.getTransaction(txId) : null;
    entryType = t ? t.type : 'expense';
    entryImages = t && t.images ? t.images.slice() : [];
    const isEdit = !!t;

    const cats = L.getCategories(entryType);
    const catHtml = cats.map((c) =>
      '<button class="cat' + ((t ? t.category : cats[0].id) === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' +
        '<span class="cat__dot" style="background:var(--bg-soft)">' + esc(c.icon) + '</span>' +
        '<span>' + esc(c.name) + '</span></button>'
    ).join('');

    const html =
      '<div class="sheet__title">' + (isEdit ? '编辑记录' : '记一笔') + '</div>' +
      '<div class="field"><div class="seg">' +
        '<button class="seg__item' + (entryType === 'expense' ? ' active' : '') + '" data-type="expense">支出</button>' +
        '<button class="seg__item' + (entryType === 'income' ? ' active' : '') + '" data-type="income">收入</button>' +
      '</div></div>' +
      '<div class="field">' +
        '<div class="field__label">金额</div>' +
        '<input class="field__input" id="entryAmount" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="' + (t ? t.amount : '') + '" style="font-size:28px;font-weight:500">' +
      '</div>' +
      '<div class="field">' +
        '<div class="field__label">分类</div>' +
        '<div class="cat-grid" id="entryCats">' + catHtml + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field__label">日期</div>' +
        '<input class="field__input" id="entryDate" type="date" value="' + (t ? t.date : L.todayStr()) + '">' +
      '</div>' +
      '<div class="field">' +
        '<div class="field__label">备注</div>' +
        '<input class="field__input" id="entryNote" placeholder="写点什么…" value="' + (t ? esc(t.note) : '') + '">' +
      '</div>' +
      '<div class="field">' +
        '<div class="field__label" id="entryImgLabel">图片（' + entryImages.length + '）</div>' +
        '<input id="entryImageInput" type="file" accept="image/*" capture="environment" multiple style="display:none">' +
        '<div style="display:flex;gap:8px">' +
          '<button class="btn btn--soft" style="flex:1" onclick="document.getElementById(\'entryImageInput\').click()">' + ICONS.camera + ' 拍照 / 选图</button>' +
          (entryImages.length ? '<button class="btn btn--soft" id="aiBtn" style="flex:1" onclick="App.recognizeImages()">✦ AI 识物</button>' : '') +
        '</div>' +
        (entryImages.length ? '<div class="collage" id="entryCollage">' + collageHtml() + '</div>' : '') +
        '<div id="aiResult" style="margin-top:8px;font-size:13px;color:var(--text-2)"></div>' +
      '</div>' +
      '<div class="sheet__actions">' +
        '<button class="btn btn--ghost" onclick="App.closeSheet()">取消</button>' +
        (isEdit ? '<button class="btn btn--ghost" style="color:var(--expense)" onclick="App.deleteEntry(\'' + t.id + '\')">删除</button>' : '') +
        '<button class="btn btn--primary" onclick="App.saveEntry(\'' + (t ? t.id : '') + '\')">保存</button>' +
      '</div>';

    const sheet = openSheet(html);

    let selectedCat = t ? t.category : cats[0].id;

    sheet.querySelectorAll('[data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        entryType = btn.getAttribute('data-type');
        sheet.querySelectorAll('[data-type]').forEach((b) => b.classList.toggle('active', b === btn));
        // 重渲染分类
        const grid = sheet.querySelector('#entryCats');
        const newCats = L.getCategories(entryType);
        grid.innerHTML = newCats.map((c) =>
          '<button class="cat" data-cat="' + c.id + '">' +
            '<span class="cat__dot" style="background:var(--bg-soft)">' + esc(c.icon) + '</span>' +
            '<span>' + esc(c.name) + '</span></button>'
        ).join('');
        grid.querySelectorAll('[data-cat]').forEach((el) => el.addEventListener('click', onCatClick));
        // 默认选第一个
        selectedCat = newCats[0].id;
        grid.querySelector('[data-cat="' + selectedCat + '"]').classList.add('active');
      });
    });

    function onCatClick(e) {
      sheet.querySelectorAll('#entryCats [data-cat]').forEach((el) => el.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedCat = e.currentTarget.getAttribute('data-cat');
    }
    sheet.querySelectorAll('#entryCats [data-cat]').forEach((el) => el.addEventListener('click', onCatClick));

    sheet.querySelector('#entryImageInput').addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      let done = 0;
      files.forEach((file) => {
        compressImage(file, (dataUrl) => {
          entryImages.push(dataUrl);
          done++;
          if (done === files.length) refreshEntryImagesUI(sheet);
        });
      });
    });
  }

  function collageHtml() {
    return entryImages.map((img, i) =>
      '<div class="collage__item"><img src="' + img + '" alt=""><button class="collage__del" data-img="' + i + '">×</button></div>'
    ).join('');
  }

  function bindCollageDelete(sheet) {
    sheet.querySelectorAll('.collage__del').forEach((btn) => {
      btn.addEventListener('click', () => {
        entryImages.splice(Number(btn.getAttribute('data-img')), 1);
        refreshEntryImagesUI(sheet);
      });
    });
  }

  function refreshEntryImagesUI(sheet) {
    const label = sheet.querySelector('#entryImgLabel');
    if (label) label.textContent = '图片（' + entryImages.length + '）';
    let c = sheet.querySelector('#entryCollage');
    if (entryImages.length && !c) {
      c = document.createElement('div');
      c.id = 'entryCollage';
      c.className = 'collage';
      sheet.querySelector('#entryImageInput').closest('.field').appendChild(c);
    }
    if (c) {
      if (entryImages.length) { c.innerHTML = collageHtml(); c.style.display = ''; bindCollageDelete(sheet); }
      else c.style.display = 'none';
    }
    let aiBtn = sheet.querySelector('#aiBtn');
    const row = sheet.querySelector('#entryImageInput').closest('.field').querySelector('div[style*="flex"]');
    if (entryImages.length && !aiBtn && row) {
      aiBtn = document.createElement('button');
      aiBtn.id = 'aiBtn';
      aiBtn.className = 'btn btn--soft';
      aiBtn.style.cssText = 'flex:1';
      aiBtn.onclick = () => App.recognizeImages();
      aiBtn.textContent = '✦ AI 识物';
      row.appendChild(aiBtn);
    }
    if (aiBtn) aiBtn.style.display = entryImages.length ? '' : 'none';
  }

  function clamp01(v) { return Math.max(0, Math.min(1, Number(v) || 0)); }

  function recognizeImages() {
    if (!AI.configured()) {
      alert('尚未配置后端地址，AI 识物暂不可用。\n请到「设置 → 云同步」填写后端地址后重试。');
      return;
    }
    if (!entryImages.length) return;
    const sheet = document.querySelector('.sheet');
    const aiBtn = sheet && sheet.querySelector('#aiBtn');
    const aiResult = sheet && sheet.querySelector('#aiResult');
    if (aiBtn) { aiBtn.disabled = true; aiBtn.textContent = '识别中…'; }

    const img = entryImages[entryImages.length - 1];
    AI.recognize(img).then(async (res) => {
      const items = (res && res.items) || [];
      const withBox = items.filter((it) => it && typeof it.x === 'number' && typeof it.w === 'number');
      const names = items.map((it) => it && it.name).filter(Boolean);
      for (const it of withBox) {
        try {
          const cropped = await AI.crop(img, clamp01(it.x), clamp01(it.y), clamp01(it.w), clamp01(it.h));
          entryImages.push(cropped);
        } catch (e) { /* 跳过裁剪失败的 */ }
      }
      if (names.length) {
        const noteInput = $('#entryNote');
        const existing = noteInput.value.trim();
        noteInput.value = existing ? existing + ' · ' + names.join('、') : names.join('、');
      }
      refreshEntryImagesUI(sheet);
      if (aiResult) {
        aiResult.textContent = items.length
          ? '识别到 ' + items.length + ' 件：' + names.join('、') + (withBox.length ? '，已自动裁剪 ' + withBox.length + ' 张' : '')
          : '未识别到物品';
      }
      if (aiBtn) { aiBtn.disabled = false; aiBtn.textContent = '✦ AI 识物'; }
    }).catch((err) => {
      if (aiResult) aiResult.textContent = '识别失败：' + err.message;
      if (aiBtn) { aiBtn.disabled = false; aiBtn.textContent = '✦ AI 识物'; }
    });
  }

  function saveEntry(txId) {
    const amount = Number($('#entryAmount').value);
    if (!amount || amount <= 0) { alert('请输入金额'); return; }
    const note = $('#entryNote').value.trim();
    const date = $('#entryDate').value || L.todayStr();
    const cats = L.getCategories(entryType);
    // 从当前激活分类取
    const active = $('#entryCats .cat.active');
    const category = active ? active.getAttribute('data-cat') : (cats[0] ? cats[0].id : '');

    const patch = { type: entryType, amount, category, date, note, images: entryImages };
    if (txId) L.updateTransaction(txId, patch);
    else L.addTransaction(patch);
    closeSheet();
    render();
  }

  function deleteEntry(txId) {
    if (!confirm('删除这笔记录？')) return;
    L.deleteTransaction(txId);
    closeSheet();
    render();
  }

  /* 预算弹层 */
  function openBudgetSheet() {
    const b = L.getBudgets();
    const html =
      '<div class="sheet__title">设置总预算</div>' +
      '<div class="field"><div class="field__label">每月总预算（元）</div>' +
      '<input class="field__input" id="budgetTotal" type="number" inputmode="decimal" min="0" step="100" placeholder="如 5000" value="' + (b.total || '') + '"></div>' +
      '<div class="sheet__actions">' +
        '<button class="btn btn--ghost" onclick="App.closeSheet()">取消</button>' +
        '<button class="btn btn--primary" onclick="App.saveBudget()">保存</button></div>';
    openSheet(html);
  }

  function saveBudget() {
    const v = Number($('#budgetTotal').value);
    L.setBudget({ total: v > 0 ? v : null });
    closeSheet();
    render();
  }

  function openCatBudgetSheet() {
    const b = L.getBudgets();
    const cats = L.getCategories('expense');
    const html =
      '<div class="sheet__title">添加分类预算</div>' +
      '<div class="field"><div class="field__label">分类</div>' +
      '<select class="field__input" id="catBudgetId">' +
        cats.map((c) => '<option value="' + c.id + '">' + esc(c.icon) + ' ' + esc(c.name) + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><div class="field__label">每月额度（元）</div>' +
      '<input class="field__input" id="catBudgetAmt" type="number" inputmode="decimal" min="0" placeholder="如 800"></div>' +
      '<div class="sheet__actions">' +
        '<button class="btn btn--ghost" onclick="App.closeSheet()">取消</button>' +
        '<button class="btn btn--primary" onclick="App.saveCatBudget()">保存</button></div>';
    openSheet(html);
  }

  function saveCatBudget() {
    const id = $('#catBudgetId').value;
    const amt = Number($('#catBudgetAmt').value);
    if (!amt || amt <= 0) { alert('请输入额度'); return; }
    const b = L.getBudgets();
    b.byCategory[id] = amt;
    L.setBudget({ byCategory: b.byCategory });
    closeSheet();
    render();
  }

  /* 周期弹层 */
  function openRecurringSheet(id) {
    const r = id ? L.getRecurrings().find((x) => x.id === id) : null;
    const cats = L.getCategories(r ? r.type : 'expense');
    const html =
      '<div class="sheet__title">' + (r ? '编辑周期记账' : '新建周期记账') + '</div>' +
      '<div class="field"><div class="field__label">名称</div>' +
      '<input class="field__input" id="recName" placeholder="如 房租、视频会员" value="' + (r ? esc(r.name) : '') + '"></div>' +
      '<div class="field"><div class="field__label">金额</div>' +
      '<input class="field__input" id="recAmount" type="number" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="' + (r ? r.amount : '') + '"></div>' +
      '<div class="field"><div class="seg" id="recTypeSeg">' +
        '<button class="seg__item' + (!r || r.type === 'expense' ? ' active' : '') + '" data-type="expense">支出</button>' +
        '<button class="seg__item' + (r && r.type === 'income' ? ' active' : '') + '" data-type="income">收入</button>' +
      '</div></div>' +
      '<div class="field"><div class="field__label">分类</div>' +
      '<select class="field__input" id="recCat">' +
        cats.map((c) => '<option value="' + c.id + '"' + (r && r.category === c.id ? ' selected' : '') + '>' + esc(c.icon) + ' ' + esc(c.name) + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><div class="field__label">周期</div>' +
      '<select class="field__input" id="recCycle">' +
        Object.entries(L.CYCLE_LABELS).map(([k, v]) => '<option value="' + k + '"' + (r && r.cycle === k ? ' selected' : '') + '>' + v + '</option>').join('') +
      '</select></div>' +
      '<div class="field"><div class="field__label">下次执行日期</div>' +
      '<input class="field__input" id="recDate" type="date" value="' + (r ? r.nextDate : L.todayStr()) + '"></div>' +
      '<div class="sheet__actions">' +
        '<button class="btn btn--ghost" onclick="App.closeSheet()">取消</button>' +
        (r ? '<button class="btn btn--ghost" style="color:var(--expense)" onclick="App.deleteRecurring(\'' + r.id + '\')">删除</button>' : '') +
        '<button class="btn btn--primary" onclick="App.saveRecurring(\'' + (r ? r.id : '') + '\')">保存</button></div>';
    const sheet = openSheet(html);

    let recType = r ? r.type : 'expense';
    sheet.querySelectorAll('#recTypeSeg [data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        recType = btn.getAttribute('data-type');
        sheet.querySelectorAll('#recTypeSeg [data-type]').forEach((b) => b.classList.toggle('active', b === btn));
        const sel = sheet.querySelector('#recCat');
        sel.innerHTML = L.getCategories(recType).map((c) => '<option value="' + c.id + '">' + esc(c.icon) + ' ' + esc(c.name) + '</option>').join('');
      });
    });
    sheet.__recType = () => recType;
  }

  function saveRecurring(id) {
    const name = $('#recName').value.trim();
    const amount = Number($('#recAmount').value);
    if (!name || !amount || amount <= 0) { alert('请填写名称和金额'); return; }
    const type = $('#recTypeSeg .seg__item.active').getAttribute('data-type');
    const data = {
      name, amount, type,
      category: $('#recCat').value,
      cycle: $('#recCycle').value,
      nextDate: $('#recDate').value || L.todayStr(),
    };
    if (id) L.updateRecurring(id, data);
    else L.addRecurring(data);
    closeSheet();
    render();
  }

  function deleteRecurring(id) {
    if (!confirm('删除这条周期记账？')) return;
    L.deleteRecurring(id);
    closeSheet();
    render();
  }

  /* ---------- 图片压缩 ---------- */
  function compressImage(file, cb) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const max = 360;
        let w = img.width, h = img.height;
        if (w > max || h > max) {
          const r = Math.min(max / w, max / h);
          w = Math.round(w * r); h = Math.round(h * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ---------- 主题 ---------- */
  function applyTheme() {
    const theme = L.getSettings().theme;
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#1D1D1B' : '#F6F5F1');
  }

  function toggleTheme() {
    const cur = L.getSettings().theme;
    L.setSettings({ theme: cur === 'dark' ? 'light' : 'dark' });
    applyTheme();
    render();
  }

  /* ---------- 导出 ---------- */
  function exportCSV() {
    const txs = L.getTransactions();
    const header = '日期,类型,分类,金额,备注';
    const rows = txs.map((t) =>
      [t.date, t.type === 'expense' ? '支出' : '收入', catName(t.type, t.category), t.amount, (t.note || '').replace(/,/g, '，')].join(',')
    );
    const csv = '﻿' + header + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '记账导出_' + L.todayStr() + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearAll() {
    if (!confirm('确定清空所有数据？此操作不可恢复。')) return;
    localStorage.removeItem('ledger-app.v1');
    location.reload();
  }

  /* ---------- 云同步设置 ---------- */
  function saveApiBase() {
    const v = $('#apiBaseInput').value.trim();
    L.setSettings({ apiBase: v });
    render();
    alert(v ? '后端地址已保存' : '已清空后端地址');
  }

  function copySyncKey() {
    const inp = $('#syncKeyInput');
    inp.select();
    try { document.execCommand('copy'); } catch (e) {}
    if (navigator.clipboard) navigator.clipboard.writeText(inp.value).catch(() => {});
    alert('已复制同步码');
  }

  async function syncNow() {
    if (!Sync.configured()) { alert('请先填写后端地址'); return; }
    const msg = $('#syncMsg');
    if (msg) msg.textContent = '同步中…';
    try {
      await Sync.syncNow();
      if (msg) msg.textContent = '同步成功 ' + new Date().toLocaleTimeString();
      render();
    } catch (e) {
      if (msg) msg.textContent = '同步失败：' + e.message;
    }
  }

  /* ---------- 列表筛选 ---------- */
  function setListType(t) { state.listFilter.type = t; renderListOnly(); }
  function setListMonth(m) { state.listFilter.month = m; renderListOnly(); }
  function setListKeyword(k) { state.listFilter.keyword = k; renderListOnly(); }
  function renderListOnly() { $('#view').innerHTML = renderList(); }

  function setStatsPeriod(p) { state.statsPeriod = p; renderStatsOnly(); }
  function renderStatsOnly() { $('#view').innerHTML = renderStats(); afterRender('stats'); }

  function shiftStats(dir) {
    const anchor = L.parseDate(state.statsAnchor);
    if (state.statsPeriod === 'month') anchor.setMonth(anchor.getMonth() + dir);
    else if (state.statsPeriod === 'week') anchor.setDate(anchor.getDate() + dir * 7);
    else anchor.setDate(anchor.getDate() + dir);
    state.statsAnchor = L.fmtDate(anchor);
    renderStatsOnly();
  }

  /* ---------- 事件绑定 ---------- */
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-route]');
      if (navBtn) { go(navBtn.getAttribute('data-route')); return; }

      if (e.target.closest('#fab')) { openEntry(); return; }
      if (e.target.closest('#themeToggle')) { toggleTheme(); return; }

      if (e.target === $('#modalRoot')) { closeSheet(); }
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    window.addEventListener('error', (e) => {
      let box = document.getElementById('errBanner');
      if (!box) {
        box = document.createElement('div');
        box.id = 'errBanner';
        box.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;background:#C98E7E;color:#fff;padding:10px 14px;border-radius:12px;font-size:12px;line-height:1.5;z-index:99999;';
        document.body.appendChild(box);
      }
      box.textContent = '加载出错：' + (e.message || '未知错误');
    });
    L.settleRecurrings(L.todayStr());
    applyTheme();
    bindGlobal();
    renderNav();
    render();
  }

  /* 暴露给内联 onclick */
  global.App = {
    go, render, openEntry, closeSheet, saveEntry, deleteEntry,
    openBudgetSheet, saveBudget, openCatBudgetSheet, saveCatBudget,
    openRecurringSheet, saveRecurring, deleteRecurring,
    toggleTheme, exportCSV, clearAll,
    setListType, setListMonth, setListKeyword,
    setStatsPeriod, shiftStats,
    recognizeImages, saveApiBase, copySyncKey, syncNow,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
