/* ============================================
   记一笔 · 图表（Chart.js）
   懒加载 + 多源回退：不阻塞页面，打开速度不受影响
   ============================================ */

(function (global) {
  'use strict';

  /* 低饱和 ins 色板 */
  const PALETTE = [
    '#C98E7E', '#A9B8C6', '#8FA98C', '#C9B8A6', '#B8A6C9',
    '#A6C9B8', '#C9A6A6', '#9CA6B8', '#C4C9A6', '#B89CA6',
  ];

  /* Chart.js 加载源（国内用 bootcdn 更快，依次回退） */
  const CDN_SOURCES = [
    'https://cdn.bootcdn.net/ajax/libs/Chart.js/4.5.0/chart.umd.min.js',
    'https://unpkg.com/chart.js@4.5.0/dist/chart.umd.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.5.0/chart.umd.min.js',
  ];

  let loadPromise = null;

  function loadChartJS() {
    if (typeof global.Chart !== 'undefined') return Promise.resolve(global.Chart);
    if (loadPromise) return loadPromise;
    loadPromise = new Promise((resolve, reject) => {
      let idx = 0;
      const next = () => {
        if (idx >= CDN_SOURCES.length) {
          reject(new Error('图表库加载失败，请检查网络后重试'));
          return;
        }
        const s = document.createElement('script');
        s.src = CDN_SOURCES[idx++];
        s.onload = () => resolve(global.Chart);
        s.onerror = () => next();
        document.head.appendChild(s);
      };
      next();
    });
    return loadPromise;
  }

  const registry = new Map();

  function destroy(key) {
    if (registry.has(key)) {
      try { registry.get(key).destroy(); } catch (e) {}
      registry.delete(key);
    }
  }

  function getCSS(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function baseOpts() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2A2A27',
          padding: 10,
          cornerRadius: 10,
          titleFont: { family: getCSS('--font'), size: 12 },
          bodyFont: { family: getCSS('--font'), size: 13 },
        },
      },
    };
  }

  function showLoadError(canvas, msg) {
    const card = canvas && canvas.closest ? canvas.closest('.card') : null;
    if (card) {
      const note = document.createElement('div');
      note.className = 'empty';
      note.style.padding = '20px 0';
      note.textContent = msg;
      card.appendChild(note);
    }
  }

  /* 环形图：分类占比 */
  async function renderDonut(key, canvas, items) {
    try { await loadChartJS(); }
    catch (e) { showLoadError(canvas, e.message); return; }
    destroy(key);
    const labels = items.map((i) => i.name);
    const data = items.map((i) => i.amount);
    const colors = items.map((_, idx) => PALETTE[idx % PALETTE.length]);

    registry.set(key, new global.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: getCSS('--bg-card'),
          hoverOffset: 4,
        }],
      },
      options: Object.assign(baseOpts(), {
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0) || 1;
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ' ' + ctx.label + '  ' + global.Ledger.fmtMoney(ctx.parsed) + '（' + pct + '%）';
              },
            },
          },
        },
      }),
    }));
  }

  /* 柱状图：日/周/月趋势 */
  async function renderBars(key, canvas, labels, expenseData, incomeData) {
    try { await loadChartJS(); }
    catch (e) { showLoadError(canvas, e.message); return; }
    destroy(key);
    registry.set(key, new global.Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '支出',
            data: expenseData,
            backgroundColor: getCSS('--expense'),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 26,
          },
          {
            label: '收入',
            data: incomeData,
            backgroundColor: getCSS('--income'),
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 26,
          },
        ],
      },
      options: Object.assign(baseOpts(), {
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: getCSS('--text-3'), font: { size: 11 } },
            border: { display: false },
          },
          y: {
            grid: { color: getCSS('--line') },
            ticks: { color: getCSS('--text-3'), font: { size: 11 } },
            border: { display: false },
            beginAtZero: true,
          },
        },
      }),
    }));
  }

  global.LedgerCharts = { renderDonut, renderBars, destroy };
})(window);
