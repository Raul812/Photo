# Personal Photography Archive

一个极简的个人摄影档案馆，部署在 GitHub Pages 上，绑定自定义 CN 域名。

**你只需要做一件事：把照片丢进 `photos/` 文件夹。**  
其余全部自动完成 —— 读取 EXIF 拍摄时间、按时间倒序排列、生成索引、部署上线。

---

## 特性

- 单列大图铺满，安静、极简，不强调标题和分类
- 自动读取 EXIF 拍摄时间（含相机型号），照片按时间倒序排列
- 无布局偏移：读取图片宽高比，加载前即占位
- 自动处理手机竖拍方向（EXIF Orientation）
- 点击放大：支持键盘方向键、移动端左右滑动、相邻图预加载
- 顶栏滚动自动隐藏，不抢戏
- 零 bot commit，git 历史干净
- 无需本地安装任何工具，全程在 GitHub 网页操作

---

## 目录结构

```text
你的仓库根目录/
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # 自动构建 + 部署
│
├── scripts/
│   └── build-manifest.js       # 扫描照片、读 EXIF、生成 photos.json
│
├── photos/                     # ← 你唯一需要动的文件夹
│   ├── 2024/
│   │   ├── 2024-05/
│   │   │   └── IMG_0001.jpg
│   │   └── 2024-06/
│   │       └── DSC_0001.jpg
│   └── 2025/
│       └── 2025-01/
│           └── IMG_0003.jpg
│
├── index.html                  # 页面结构
├── style.css                   # 页面样式
├── app.js                      # 前端逻辑
├── CNAME                       # 自定义域名（无扩展名）
├── .nojekyll                   # 空文件，禁用 Jekyll
└── README.md
```

> `photos.json` **不需要手动创建**，由 GitHub Actions 每次运行时自动生成。

---

## 快速开始

### 1. 创建仓库

在 GitHub 网页上新建一个仓库，例如 `my-photos`。

### 2. 创建文件夹和文件

GitHub 无法直接建空文件夹，用「新建文件时在文件名里带路径」即可自动创建：

| 在文件名输入框里输入 | 粘贴内容 |
|---|---|
| `.github/workflows/deploy.yml` | workflow 配置 |
| `scripts/build-manifest.js` | 构建脚本 |
| `index.html` | 页面结构 |
| `style.css` | 页面样式 |
| `app.js` | 前端逻辑 |
| `CNAME` | 你的域名，一行，例如 `photos.example.cn` |
| `.nojekyll` | 留空即可 |
| `photos/.gitkeep` | 留空，占位用，之后可删 |

### 3. 上传第一张照片

进入 `photos/` → **Add file → Upload files** → 拖入照片 → **Commit changes**。

### 4. 开启 GitHub Pages

**Settings → Pages → Source** 选择 **GitHub Actions**。

> 注意：不是 "Deploy from a branch"。

### 5. 等待部署

进入 **Actions** 标签页，等 `Build & Deploy` 跑完（约 1 分钟）。

先访问默认地址确认可用：

```text
https://你的用户名.github.io/仓库名/
```

---

## 绑定自定义 CN 域名

1. 确认默认地址已能正常访问。
2. 在仓库 **Settings → Pages → Custom domain** 填入你的域名，例如 `photos.example.cn`。
3. 到域名服务商处添加 DNS 记录：
   - **子域名**（`photos.example.cn`）：添加 `CNAME` 记录，指向 `你的用户名.github.io`
   - **根域名**（`example.cn`）：按 GitHub 官方文档添加 `A` 记录
4. 回到 Pages 设置，勾选 **Enforce HTTPS**，等待证书签发（可能需几分钟到几小时）。

`CNAME` 文件的作用：换机器、重建仓库或重新部署时，域名配置不会丢失。

---

## 日常更新

以后你唯一要做的事：

1. 打开 GitHub 仓库。
2. 进入 `photos/`（可以进任意子文件夹）。
3. 点 **Add file → Upload files**。
4. 拖入新照片。
5. 点 **Commit changes**。

等 1 分钟左右，Actions 自动重新生成索引并部署。刷新网页即可看到新照片。

**全程不需要 git 命令，也不需要本地安装任何东西。**

---

## 照片如何排序？

排序完全由照片的**拍摄时间**决定，与文件名、文件夹名无关。

脚本按以下优先级读取时间：

1. EXIF `DateTimeOriginal`（拍摄时间）
2. EXIF `CreateDate`（数字化时间）
3. EXIF `ModifyDate`（修改时间）
4. 文件名中的日期，如 `IMG_20240503_184203.jpg`、`2024-05-03.jpg`
5. 文件修改时间（最后兜底）

最终按时间**从新到旧**排列。

相机型号同样从 EXIF 的 `Make` + `Model` 读取，在灯箱里以小字显示。没有 EXIF 的照片不会显示相机信息。

---

## 子文件夹怎么用？

`photos/` 支持任意层级的子文件夹，脚本会递归扫描。推荐按年 / 月组织：

```text
photos/
├── 2024/
│   ├── 2024-05/
│   └── 2024-06/
└── 2025/
    └── 2025-01/
```

**子文件夹只方便你自己管理，不影响页面排序。**  
页面永远按拍摄时间倒序，不看文件夹名。

---

## 上传前建议压缩

GitHub 网页上传有两个限制：

- 单个文件 ≤ **25MB**
- 一次最多 **100 个文件**

所以建议上传前压缩，长边 2560px、质量 80 左右就足够清晰。

用 ImageMagick 批量压缩：

```bash
magick mogrify -resize 2560x2560\> -quality 82 photos/**/*.jpg
```

或用在线工具：[Squoosh](https://squoosh.app)

---

## 支持的图片格式

`.jpg` `.jpeg` `.png` `.webp` `.gif` `.avif` `.heic` `.heif` `.tif` `.tiff`

⚠️ **强烈建议统一使用 JPEG。**  
虽然脚本能读取 HEIC 的 EXIF，但 Chrome / Firefox 无法显示 HEIC 图片，只有 Safari 能看。iPhone 原图建议先转成 JPEG 再上传。

---

## 常见问题

**Q：需要本地装 git 吗？**  
不需要。日常更新全部在 GitHub 网页完成，网页上的「Commit changes」就是提交。

**Q：`photos.json` 在哪里？**  
它是 Actions 运行时自动生成的，不在仓库里。部署时会被打进站点。

**Q：Action 跑失败了怎么办？**  
进 **Actions** 标签页，点开失败的那次运行，查看日志。常见原因：
- `photos/` 文件夹不存在
- `deploy.yml` 不在 `.github/workflows/` 下
- 默认分支不是 `main`

**Q：照片没按预期时间排序？**  
大多是 EXIF 时间被微信、QQ、修图软件、导出工具清掉了。可以：
- 用支持保留 EXIF 的方式导出
- 或者把文件名改成 `IMG_20240503_184203.jpg` 这类带日期的格式

**Q：换了同名照片但网页没变？**  
浏览器可能缓存了旧图。强刷（`Ctrl/Cmd + Shift + R`）一次即可。`photos.json` 已加时间戳，不会缓存。

**Q：能不能放视频？**  
当前版本只处理图片。视频需要另行处理。

**Q：仓库能放私密照片吗？**  
**不能。** GitHub Pages 是完全公开的，任何人访问域名都能看到。私密照片请不要放进这个仓库。

---

## 技术说明

- 构建：GitHub Actions + Node.js（内置模块，无额外依赖）
- EXIF：`exiftool`（系统包 `libimage-exiftool-perl`）
- 部署：GitHub Pages，通过 artifact 直接部署，不产生 bot commit
- 前端：原生 HTML / CSS / JS，无框架、无构建步骤

---

## License

个人项目，随意使用。