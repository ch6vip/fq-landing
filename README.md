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
├─ index.html                    单页结构（首屏 / 功能 / 下载 / 外观 / 阅读 / 书架 / FAQ / 参与）
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
│  ├─ build_fonts.py             按页面实际用字重新子集化字体
│  ├─ sync_release.mjs           从 GitHub Release 同步版本和下载链接
│  └─ configure_site.mjs         配置正式站点与分享元信息
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

截图对应经典主题的实机界面。三张首页截图各有 600×1300 与 300×650 两个版本，通过 `srcset` 按屏幕尺寸与像素密度选择；更新首页截图时同步导出对应的 `-300.webp`。外观区图片懒加载，仅预加载首屏标题所需的粗体字体。QQ 群与赞助二维码使用无损 WebP，保留原始尺寸与像素。

## 修改

- **版本与下载**：发布应用新版本后运行 `npm run release`。GitHub 最新正式 Release 是单一来源；命令确认两个 APK 和 Windows ZIP 均存在后，一次更新页面版本、固定版本下载链接、Windows 文件名、更新说明与 JSON-LD。网络或安装包检查失败时不写入页面。页面访问不调用 GitHub API，禁用 JavaScript 仍可下载。
- **品牌色**：`assets/css/styles.css` 顶部的 `:root` / `:root[data-theme="dark"]` 令牌。
- **字体**：改动文案后运行 `npm run fonts`（需要 Python、fonttools、brotli），按新文案重新生成子集；否则新字会回退到系统宋体。常规宋体仅用于试读样张，按样张文字单独生成；标题使用粗体子集。
- **分享与域名**：`assets/img/og.jpg`（1200×630）。尚未配置正式域名时，分享图使用仓库中已可访问的绝对地址。确定域名后运行 `npm run site -- https://your-domain.example/`（替换为实际地址，可含子目录），一次写入 `canonical`、`og:url`、`og:image` 和 `twitter:image`；不从访问者的主机名猜测正式域名。再次运行可更新域名。

## 部署

纯静态，把整个目录上传即可：

- **GitHub Pages**：推到仓库后选择分支根目录；`.nojekyll` 已就位。
- **Vercel / Netlify / Cloudflare Pages**：构建命令留空，输出目录填 `.`。
- **自有服务器**：任意静态文件服务；`index.html` 引用的都是相对路径。

发布前运行 `npm run release` 同步应用版本；首次部署到确定的域名时运行 `npm run site -- <正式 HTTPS 地址>`。这两个命令仅修改本地 HTML，不执行提交、推送或部署。网站运行和本地预览仍无构建依赖。

> 直接用 `file://` 双击打开时，Chrome 会因 CORS 拒绝加载自定义字体，页面会退回系统宋体；样式与脚本正常。正式预览请用上面的本地服务器。

## 可访问性与兼容

- 支持系统深浅色偏好，也提供手动切换并记住选择；`prefers-reduced-motion` 下关闭动效。
- 语义化结构、键盘可操作的外观标签页、`aria-live` 复制提示、跳过导航链接。
- 内容默认可见，进入视口时才执行一次显现动画；主脚本加载失败、无观察器或禁用 JavaScript 时，介绍和下载卡片仍完整显示。
- 下载详情位于功能介绍之后。手机端采用紧凑功能列表，减少重复截图；色板、主题、菜单和复制按钮的点击区域至少为 44×44px。
- 目标浏览器：Chrome / Edge / Safari / Firefox 最近两年版本；使用了 `color-mix()`，老浏览器降级为默认色。
- 页面渲染用到的字体、图片、脚本全部本地化；下载链接与分享图元信息指向 GitHub，访客无需请求外部脚本或版本接口。

## 说明

落地页只做产品介绍与下载引导。在线内容来自第三方，版权归各自权利人；项目与内容提供方无隶属关系，不托管作品，不绕过付费或访问权限。
