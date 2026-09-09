# 记一笔 · 极简记账

iPad / 手机通用的个人记账应用。浅色 ins 风、性冷淡（muji）极简设计。

## 一、文件说明

```
ledger-app/
├── index.html          入口页面（双击即可打开使用）
├── manifest.json       PWA 配置
├── service-worker.js   离线缓存
├── css/styles.css      设计系统与全部样式
├── js/
│   ├── data.js         数据层（本地存储 + 分类/预算/周期/统计）
│   ├── charts.js       图表（Chart.js）
│   ├── ai.js           AI 识图（调后端）
│   ├── sync.js         云同步（调后端）
│   └── app.js          界面与交互
├── icons/              应用图标
└── backend/
    ├── worker.js       后端（Cloudflare Worker）
    └── wrangler.toml   后端配置
```

## 二、基础使用（不需要后端也能用）

直接用浏览器打开 `index.html` 即可记账。记账、分类、统计、预算、周期、深浅色、本地图片拼贴（手动拍照/选图）都是纯本地功能，不依赖后端。

## 三、部署后端（解锁 AI 识图 + 云同步）

后端用 Cloudflare Worker，免费、无需买服务器。有两种方式，**推荐方式 A（网页操作，不用装任何东西）**。

### 方式 A：在 Cloudflare 网页上部署（推荐）

1. 打开 <https://dash.cloudflare.com> 注册并登录（可用邮箱注册，免费）。
2. 左侧菜单进入 **Workers 和 Pages** → 点 **创建** → **创建 Worker**。
3. 给 Worker 起个名字（如 `ledger-backend`），点 **部署**（先随便部署一个空的）。
4. 点 **编辑代码**，把本仓库 `backend/worker.js` 里的内容**全部粘贴**进去，替换原有内容，点右上角 **部署**。
5. 配置密钥（保存你的 DeepSeek key，这一步最安全，key 不会被任何人看到）：
   - 回到该 Worker 页面 → **设置** → **变量和机密** → 添加一个**机密**：
     - 名称填 `DEEPSEEK_API_KEY`
     - 值粘贴你的 DeepSeek key（`sk-6088...`）
   - 保存并部署。
6. 创建并绑定数据库（用于云同步）：
   - 左侧菜单进入 **存储和数据库** → **KV** → **创建命名空间**，名称填 `LEDGER_KV`。
   - 回到 Worker 页面 → **设置** → **绑定** → **添加绑定** → 选 **KV 命名空间**：
     - 变量名称填 `LEDGER_KV`
     - 选择刚创建的命名空间
   - 保存并部署。
7. 记下你的 Worker 地址（形如 `https://ledger-backend.你的账号.workers.dev`），这就是「后端地址」。

### 方式 B：用命令行部署（进阶）

需要先安装 Node.js（<https://nodejs.org>，装 LTS 版），然后在 `backend/` 目录下：

```bash
npm install -g wrangler      # 安装 wrangler 工具
wrangler login               # 登录 Cloudflare 账号
wrangler kv namespace create LEDGER_KV   # 创建 KV，记下返回的 id
```

把返回的 id 填进 `wrangler.toml` 里取消注释的那两行，然后：

```bash
wrangler secret put DEEPSEEK_API_KEY   # 粘贴你的 DeepSeek key
wrangler deploy                        # 部署，会打印出 workers.dev 地址
```

## 四、连接前端与后端

1. 打开应用，进入 **设置 → 云同步**。
2. 在「后端地址」里粘贴你的 Worker 地址，点 **保存地址**。
3. 「同步码」会自动生成，点 **复制**。
4. 在另一台设备（比如手机）打开同一个应用、填同样的后端地址，把同步码粘贴成**同一个**（在设置里把输入框内容改成一致的即可），两台设备数据就能互通。
5. 点 **立即同步** 手动同步。

> 说明：同步码相当于「账号密码」，请自己保存好。目前同步是手动触发 + 简化合并，后续可升级为自动同步。

## 五、AI 识图使用

记一笔时，点「拍照 / 选图」加上图片后，会出现「✦ AI 识物」按钮。点它：

- AI 会识别图片里的物品，**自动把物品名填进备注**；
- 对能定位的物品，**自动从图里裁剪出小图**加入拼贴；
- 识别不准的，你可以在拼贴里手动删除（点小图右上角 ×），或自己再拍/选图补充。

## 六、添加到 iPad 主屏幕（像 App 一样）

用 Safari 打开应用后：点右上角 **分享** → **添加到主屏幕** → 完成。之后从主屏幕图标进入，就是全屏无地址栏的体验。

## 七、常见问题

- **AI 识图提示「未配置后端地址」**：还没完成第三步，或地址没保存。
- **同步失败**：检查后端地址是否正确、KV 绑定名是否叫 `LEDGER_KV`、密钥名是否叫 `DEEPSEEK_API_KEY`。
- **图标是灰的/没图标**：SVG 图标在部分 iOS 版本需要 PNG，属已知小问题，不影响使用。
- **想彻底离线**：图表（Chart.js）从 CDN 加载，首次联网打开后会缓存，之后可离线。
