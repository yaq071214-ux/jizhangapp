/**
 * 记一笔 · 后端（Cloudflare Worker）
 *
 * 功能：
 *  1. POST /api/recognize  —— 转发 DeepSeek V4 Flash Vision 识图，返回物品清单（含可选坐标）
 *  2. POST /api/sync       —— 账本数据云同步（存 Cloudflare KV）
 *  3. GET  /health         —— 健康检查
 *
 * 部署注意：
 *  - DeepSeek key 不要写进代码！用命令配置： wrangler secret put DEEPSEEK_API_KEY
 *  - 需要一个 KV 命名空间，绑定名 LEDGER_KV
 */

const RECOGNIZE_PROMPT =
  '你是记账助手。请识别这张图片中所有与消费/购物相关的物品（例如购物小票上的商品、购买的实物、收到的物品等），忽略背景、桌面、手等无关物体。' +
  '对每个物品输出：名称（简短中文）、以及它在图片中的位置（归一化坐标，范围 0~1，字段 x、y 为左上角，w、h 为宽高）。' +
  '如果无法确定某个物品的位置，把它的 x/y/w/h 都设为 null。' +
  '只返回 JSON，不要任何其他文字，格式严格为：{"items":[{"name":"物品名","x":0.1,"y":0.2,"w":0.3,"h":0.4}, ...]}';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() },
  });
}

/* ---------- 识图 ---------- */
async function recognize(env, imageDataUrl) {
  if (!env.DEEPSEEK_API_KEY) {
    return { error: '后端未配置 DEEPSEEK_API_KEY' };
  }

  const resp = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + env.DEEPSEEK_API_KEY,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash-vision-exp',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RECOGNIZE_PROMPT },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { error: 'DeepSeek 调用失败 ' + resp.status + ': ' + text.slice(0, 300) };
  }

  const data = await resp.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';

  try {
    const parsed = JSON.parse(content);
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch (e) {
    // 模型偶尔不按 JSON 返回，兜底返回原始文本
    return { items: [], raw: content };
  }
}

/* ---------- 云同步（KV） ---------- */
async function handleSync(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: '请求体不是合法 JSON' }, 400);
  }

  const { action, syncKey, data } = body || {};
  if (!syncKey || !/^[A-Za-z0-9._-]{4,64}$/.test(syncKey)) {
    return json({ error: '缺少或非法的 syncKey' }, 400);
  }
  const kvKey = 'ledger:' + syncKey;

  if (action === 'push') {
    const record = {
      data: data || {},
      updatedAt: Date.now(),
    };
    await env.LEDGER_KV.put(kvKey, JSON.stringify(record));
    return json({ ok: true, updatedAt: record.updatedAt });
  }

  if (action === 'pull') {
    const raw = await env.LEDGER_KV.get(kvKey);
    if (!raw) return json({ ok: true, data: null, updatedAt: null });
    const record = JSON.parse(raw);
    return json({ ok: true, data: record.data, updatedAt: record.updatedAt });
  }

  return json({ error: '未知 action' }, 400);
}

/* ---------- 入口 ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      if (url.pathname === '/health') {
        return json({ ok: true, hasKey: !!env.DEEPSEEK_API_KEY, hasKV: !!env.LEDGER_KV });
      }

      if (url.pathname === '/api/recognize' && request.method === 'POST') {
        const body = await request.json();
        const image = body && body.image;
        if (!image) return json({ error: '缺少 image 字段' }, 400);
        const result = await recognize(env, image);
        return json(result);
      }

      if (url.pathname === '/api/sync' && request.method === 'POST') {
        return handleSync(request, env);
      }

      return json({ error: 'Not found' }, 404);
    } catch (e) {
      return json({ error: String((e && e.message) || e) }, 500);
    }
  },
};
