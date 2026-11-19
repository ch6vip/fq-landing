# 什锦铺 · 产品落地页

什锦铺（fqapp）的静态单页官网：小说 / 听书 / 短剧 / 漫剧 / 漫画聚合应用，支持 Android 与 Windows。

页面采用现代产品展示风格：纯净留白、现代无衬线排版、场景化 Bento 功能网格、实时可互动阅读试读台与经典主题实机展示，并将完整安装包下载与 3 步安装指南整合在同一页中。无框架、无构建步骤，静态资源可直接部署。

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
├─ index.html                    完整单页官网（首屏 / 场景 Bento / 试读与外观 / 书架离线 / 下载与安装 / FAQ / 社区）
├─ favicon.ico
├─ robots.txt
├─ .nojekyll                     GitHub Pages 用，跳过 Jekyll
├─ .github/workflows/
│  └─ sync-release.yml           定时 / 手动自动同步主仓库最新 Release
├─ assets/
│  ├─ css/styles.css             设计令牌、Bento 布局、实机展示、深色模式、响应式
│  ├─ js/main.js                 主题切换、导航、实时试读台、外观切换、平台推荐、FAQ、复制群号
│  ├─ img/                       应用界面、Logo、二维码、分享图 og.jpg
│  └─ fonts/                     子集化的 Noto Serif SC（试读宋体）与 Roboto Mono
├─ scripts/
│  ├─ serve.mjs                  零依赖本地服务器
│  ├─ build_fonts.py             按试读样张重新子集化字体
│  ├─ sync_release.mjs           从 GitHub Release 同步版本、包大小与下载链接
│  └─ configure_site.mjs         配置正式站点 canonical 与分享图元信息
├─ package.json
└─ README.md
```

## 内容与素材来源

| 内容 | 来源 |
| --- | --- |
| 文案、功能、安装要求、FAQ | `../fqapp/README.md`、应用内设置页 |
| 首页浅色 / 深色 / 墨水屏、书架、阅读页、主题页 | MuMu 模拟器实拍（经典主题，1080×2340，缩放至 600px 宽） |
| Logo、QQ 群与赞助二维码 | `../fqapp/assets/images/`、`../fqapp/.github/` |
| 品牌色 | 应用经典主题珊瑚红 `#E84C35` 与 Logo 青 `#0A7E8C` / 琥珀 `#C97A16` |

三张首页截图各有 600×1300 与 300×650 两个版本，通过 `srcset` 按屏幕尺寸与像素密度选择；更新首页截图时同步导出对应的 `-300.webp`。非首屏图片懒加载，QQ 群与赞助二维码使用无损 WebP 并保持白底清晰可扫。

## 维护脚本

- **同步版本与安装包**：发布应用新版本后运行 `npm run release`。命令从 GitHub 最新正式 Release 校验两个 APK 和 Windows ZIP 的存在性、有效文件大小（十进制 MB）及北京时间发布日期，全部通过后再一次性更新 `index.html` 的版本号、下载直链、包大小、Windows 文件名、更新说明链接与 JSON-LD；支持读取环境变量 `GITHUB_TOKEN` 避免限流。页面访问不调用 GitHub API，禁用 JavaScript 仍可直接通过 GitHub 官方直链下载。
- **下载加速代理**：页面下载区内置「国内加速（`gh-proxy.com`）」与「GitHub 官方」一键切换（默认走国内加速并记住用户选择），HTML 底层链接仍保持 GitHub 官方地址以兼容自动同步与无 JS 降级；如需更换加速域名，修改 `assets/js/main.js` 顶部的 `PROXY_PREFIX` 即可。
- **自动同步（GitHub Actions）**：仓库内置 `.github/workflows/sync-release.yml`，每 6 小时自动检查主仓库最新正式版，也支持在 Actions 页手动点击运行（`workflow_dispatch`）或由主仓库通过 `repository_dispatch`（`app-release`）即时触发；有版本变化时自动提交并推送 `index.html`。
- **重生成字体子集**：修改试读样张（`.demo-text`）文案后运行 `npm run fonts`（需 Python、`fonttools`、`brotli`，且同级存在 `../fqapp/assets/fonts`）。主体文案使用现代系统无衬线字体，仅试读台的「宋体」模式与等宽编号加载轻量本地 `woff2`。
- **配置正式域名**：部署到正式 HTTPS 域名后运行 `npm run site -- https://your-domain.example/`，自动写入 `canonical`、`og:url`、`og:image` 与 `twitter:image`。

## 部署

纯静态站点，上传整个目录即可：

- **GitHub Pages**：推送到仓库并选择根目录；`.nojekyll` 已就位。
- **Vercel / Netlify / Cloudflare Pages**：构建命令留空，输出目录填 `.`。
- **自有服务器**：任意静态文件服务，所有本地资源均使用相对路径。

## 可访问性与兼容

- 支持系统深浅色偏好，提供手动切换并记住选择；`prefers-reduced-motion` 下关闭动画。
- 语义化结构、键盘可操作的外观分段标签、可交互试读台、`aria-live` 复制提示、跳过导航链接。
- 内容默认可见，仅对视口下方元素渐进启用滚入过渡；脚本禁用时所有介绍、下载与安装步骤均完整可用。

## 说明

落地页只做产品介绍与下载引导。在线内容来自第三方，版权归各自权利人；项目与内容提供方无隶属关系，不托管作品，不绕过付费或访问权限。
