# Personal Photography Archive

一个极简的个人摄影档案馆，部署在 GitHub Pages 上，支持绑定自定义 CN 域名。

**你只需要做一件事：把照片原图丢进 `photos/` 文件夹。**  
其余全部自动完成 —— 读取 EXIF 拍摄时间、生成索引、自动压缩图片、部署上线。

---

## 功能特性

- **极简画廊**：首页网格排列缩略图，安静克制，不强调标题和分类。
- **自动读取 EXIF**：拍摄时间、相机型号（如 `2026.09.17 HUAWEI MATE 60 PRO+`），全部自动抓取。
- **时间倒序排列**：永远把最新的照片放在最前面。
- **自动压缩**：GitHub Actions 会在部署时自动将图片压缩至长边 2560px、质量 82，**你在网页上加载飞快**。
- **原图保留 EXIF**：即使压缩了网页上的图， Actions 构建时读取的是原图 EXIF，因此相机信息绝不会丢失。
- **随机微浮动**：桌面端图片有微弱的左右浮动动画，鼠标悬停立即停止，营造静谧的画廊感。
- **全屏灯箱**：点击缩略图，放大至 96% 屏幕大小展示。
- **键盘与触屏支持**：键盘 `←` / `→` 切换，手机支持左右滑动切换，自动预加载相邻图片。
- **手机端适配**：手机端自动变为两列缩略图，并关闭浮动动画以节省性能。

---

## 目录结构

```text
你的仓库根目录/
│
├── .github/
│   └── workflows/
│       └── deploy.yaml         # 自动构建 + 部署 + 压缩图片
│
├── scripts/
│   └── build-manifest.js       # 扫描照片、读 EXIF、生成 photos.json
│
├── photos/                     # ← 你唯一需要动的文件夹
│   └── 2026/
│       └── 2026-09/
│           └── IMG_0001.jpg
│
├── index.html                  # 页面结构
├── style.css                   # 页面样式（两列网格 + 浮动动画 + 灯箱）
├── app.js                      # 前端逻辑（读取 JSON + 随机浮动参数）
├── CNAME                       # 自定义域名（无扩展名）
├── .nojekyll                   # 空文件，禁用 Jekyll
└── README.md


GitHub 必要设置（首次部署）
请按顺序完成以下设置：

开启 GitHub Pages

Settings → Pages → Build and deployment → Source

选择 GitHub Actions（⚠️ 千万不要选 "Deploy from a branch"）。

确认 Actions 权限

Settings → Actions → General → Workflow permissions

选择 Read and write permissions（保险起见）。

确认默认分支

仓库默认分支建议为 main。

如果默认分支是 master，请把 .github/workflows/deploy.yaml 中的 branches: [main] 改为 branches: [master]。

URL 大小写问题

如果你的仓库名包含大写字母（如 Photo），访问地址也要注意大小写：

正确：https://raui812.github.io/Photo/

错误：https://raui812.github.io/photo/

日常更新流程
打开 GitHub 仓库，进入 photos/ 文件夹（支持拖拽整个文件夹上传）。

点击 Add file → Upload files，把照片拖进去。

点击 Commit changes。

等待 1 分钟左右，Actions 自动完成构建和部署。

全程不需要 git 命令，也不需要本地安装任何东西。

绑定自定义 CN 域名
确认默认地址 https://raui812.github.io/Photo/ 能正常访问。

在仓库 Settings → Pages → Custom domain 填入你的域名，例如 photos.example.cn。

去域名服务商处添加 DNS 记录：

子域名：添加 CNAME 记录，指向 你的用户名.github.io

根域名：按 GitHub 官方文档添加 A 记录

回到 Pages 设置，勾选 Enforce HTTPS，等待证书签发。

仓库根目录的 CNAME 文件应包含一行你的域名，例如：

text
photos.example.cn
常见问题（FAQ）
Q：首页图片加载后很暗、没显示？
已修复。style.css 已去掉透明度淡入动画，图片加载完成后会立刻显示。

Q：我压缩了图片，结果相机信息（EXIF）全没了怎么办？
不用管。我们的构建流程是在 GitHub Actions 里先读取原图的 EXIF 并写入 photos.json，然后再压缩部署到网页上。所以你可以放心上传原图，相机信息不会丢。

Q：为什么首页照片那么大，点击进去反而变小了？
已修复。现在首页是密集的缩略图网格（电脑端约 4~5 列，手机端 2 列），点击后灯箱展示 96% 屏幕大小的大图，真正实现“小图变大图”。

Q：Action 报错 Get Pages site failed 怎么办？
说明 GitHub Pages 没有开启。去 Settings → Pages 将 Source 改为 GitHub Actions，然后重新运行失败的 Action。

Q：需要本地安装 git 吗？
不需要。日常更新全部在 GitHub 网页完成，网页上的“Commit changes”就是提交。

Q：支持哪些图片格式？
.jpg .jpeg .png .webp .gif .avif .heic .heif .tif .tiff。
建议使用 JPEG，因为它在网页端显示最稳定、体积最小。

Q：能放视频吗？
当前版本仅支持图片。

Q：仓库能放私密照片吗？
不能。 GitHub Pages 是完全公开的，任何人访问域名都能看到。

技术说明
构建：GitHub Actions + Node.js（内置模块，无额外依赖）

依赖工具：exiftool（读取 EXIF）、ImageMagick（自动压缩图片）

部署：GitHub Pages，通过 artifact 直接部署，不产生 bot commit

前端：原生 HTML / CSS / JS，无框架、无构建步骤

图片压缩参数：长边 2560px，质量 82，保留 EXIF

License
个人项目，随意使用。
