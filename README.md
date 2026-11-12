# 什锦铺 · 产品落地页

什锦铺（fqapp）的静态产品官网：小说 / 听书 / 短剧 / 漫剧 / 漫画聚合应用，支持 Android 与 Windows。

页面用奶白纸面、细线格与衬线中文标题做骨架，应用截图统一取自**经典主题**的实机界面（经典主题：老版首页、封面书架、阅读统计）。无框架、无构建步骤，`index.html` 可直接部署。

## 本地预览

```bash
# 任意一种即可
npm run dev            # 零依赖 Node 静态服务器，默认 http://localhost:4173
python -m http.server 4173
```

`npm run dev` 使用 `scripts/serve.mjs`，没有第三方依赖，不需要 `npm install`。

## 目录

```
fq-landing/
├─ index.html                    单页结构（首屏 / 功能 / 外观 / 阅读 / 书架 / 下载 / FAQ / 参与）
├─ favicon.ico
├─ robots.txt
├─ .nojekyll                     GitHub Pages 用，跳过 Jekyll
├─ assets/
│  ├─ css/styles.css             设计令牌、布局、动效、深色模式、响应式
│  ├─ js/main.js                 主题切换、外观标签页、试读底色、FAQ、复制群号、滚动显现
│  ├─ img/                       应用界面、Logo、二维码、分享图 og.jpg
│  └─ fonts/                     子集化的 Noto Serif SC 与 Roboto Mono
├─ scripts/
│  ├─ serve.mjs                  零依赖本地服务器
│  └─ build_fonts.py             按页面实际用字重新子集化字体
├─ package.json
└─ README.md
```

## 内容与素材来源

| 内容 | 来源 |
| --- | --- |
| 文案、功能、安装要求、FAQ | `../fqapp/README.md`、应用内设置页 |
| 首页浅色 / 深色 / 墨水屏、书架、阅读页、主题页 | MuMu 模拟器实拍（经典主题，1080×2340，缩放至 600px 宽） |
| Logo、QQ 群与赞助二维码 | `../fqapp/assets/images/`、`../fqapp/.github/` |
| 品牌色 | `../fqapp/lib/services/app_theme.dart`、README 徽章（青 `#087E8B` / 琥珀 `#E89B35` / 纸面 `#F4F3EF`） |

截图对应经典主题的实机界面；应用更新后，重新截屏并替换 `assets/img/*.webp` 即可（保持 600×1300 左右的比例）。

## 修改

- **下载链接**：搜索 `github.com/ch6vip/novel-sound/releases`，安卓直链与 Releases 页分别在首屏、下载区各出现一次。
- **版本号**：搜索 `1.0.201`，出现在 `<title>` 附近的 JSON-LD、页头 `version-chip`、首屏 `hero-meta`、下载区小标题。
- **品牌色**：`assets/css/styles.css` 顶部的 `:root` / `:root[data-theme="dark"]` 令牌。
- **字体**：改动文案后运行 `npm run fonts`（需要 Python、fonttools、brotli），按新文案重新生成子集；否则新字会回退到系统宋体。
- **分享图**：`assets/img/og.jpg`（1200×630）。部署后把 `og:image` / `twitter:image` 改成完整 URL——多数社交平台不解析相对路径。

## 部署

纯静态，把整个目录上传即可：

- **GitHub Pages**：推到仓库后选择分支根目录；`.nojekyll` 已就位。
- **Vercel / Netlify / Cloudflare Pages**：构建命令留空，输出目录填 `.`。
- **自有服务器**：任意静态文件服务；`index.html` 引用的都是相对路径。

> 直接用 `file://` 双击打开时，Chrome 会因 CORS 拒绝加载自定义字体，页面会退回系统宋体；样式与脚本正常。正式预览请用上面的本地服务器。

## 可访问性与兼容

- 支持系统深浅色偏好，也提供手动切换并记住选择；`prefers-reduced-motion` 下关闭动效。
- 语义化结构、键盘可操作的外观标签页、`aria-live` 复制提示、跳过导航链接。
- 目标浏览器：Chrome / Edge / Safari / Firefox 最近两年版本；使用了 `color-mix()`，老浏览器降级为默认色。
- 页面无外部请求：字体、图片、脚本全部本地化。

## 说明

落地页只做产品介绍与下载引导。在线内容来自第三方，版权归各自权利人；项目与内容提供方无隶属关系，不托管作品，不绕过付费或访问权限。
