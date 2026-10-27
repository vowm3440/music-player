# Tahoe Hi-Fi • iOS 27 Liquid Glass Music Player

一款基于 **实体背景与液态玻璃按钮设计 (Solid Backgrounds + Liquid Glass Buttons)** 与 **原生 Web Audio API** 构建的本地高保真音乐播放器。

---

## ✨ 核心特性

### 1. 实体背景与液态玻璃按钮架构 (Solid Grounding + Liquid Glass Buttons)
- **实体物理背景体系 (Solid Physical Surfaces)**：
  - 主视窗（`solid-window`）：沉稳深曜石黑材质（`#0b0c13`），配备精细 1px 微反光边缘与物理环境深阴影。彻底告别全透明造成的视觉疲劳与眩光，提供极致高对比度与信息可读性。
  - 侧边栏与主视口（`solid-panel` / `solid-card`）：独立实体物理面板（`#11121b`、`#161723`），层次分明、井然有序。
  - 底部控制舱（`solid-dock`）：雕刻感石墨质感底座（`#12131e`）。
  - 周围环境微光（Adaptive Ambient Mesh）：动态流体网格退至外围作为环境氛围背光，既保证美观又绝不干扰内容阅读。
- **液态玻璃交互按钮体系 (`LiquidButton`)**：
  - 将液态玻璃的光学奇观聚焦在所有交互触点上：主播放/暂停微凸透镜胶囊、切歌圆钮、侧边栏导航条目、曲库挂载胶囊、搜索框、音效预设按钮、全屏歌词控制等。
  - 具备真实的 **1px 晶体光泽边缘 (`specular-border`)**、**鼠标实时光斑追踪 (`--btn-mouse-x`, `--btn-mouse-y`)**、**表面张力微凹凸感 (`surface-tension`)** 以及 **微回弹触觉下压动效**。
  - 支持 `glass`（透澈水晶）、`accent`（流光粉红凝胶）、`gold`（Hi-Fi 金质透镜）、`primary`（高亮白玉微透胶囊）、`subtle`（深邃烟熏玻璃）等多种风格。
- **严格同心圆角公式**：遵循连续曲率 Squircle 几何规范 $R_{outer} = R_{inner} + Padding$
  - 一级应用主窗：`border-radius: 36px`，`padding: 12px`
  - 二级功能卡片 / 侧栏 / 浮动控制舱：`border-radius: 24px`，`padding: 8px`
  - 三级内嵌元素（专辑封面 / 列表高光）：`border-radius: 16px`
  - 四级胶囊按钮 / 规格徽章：`border-radius: 9999px`
- **SVG 光学折射管线 (`#ios27-liquid-glass`)**：
  - 隐藏 SVG 滤镜矩阵，组合 `feTurbulence`、`feDisplacementMap`、`feGaussianBlur` 与 `feSpecularLighting`，还原真实玻璃边缘纳米级折射与高光。
- **多层表面张力光泽与掠射角渐变边框**：
  - `mask-composite: exclude` / `-webkit-mask-composite: xor` 绘制 1px 晶体光泽倒角边框。
  - 多层内腔阴影营造表面张力厚度感。
  - 动态跟踪光标位置更新 `--mouse-x` 与 `--mouse-y`，呈现柔和移动高光。
- **液态玻璃浓度无级调节**：
  - 侧边栏支持自由拖动“液态玻璃浓度（Clear ➔ Tinted）”滑块，动态调整 `--glass-surface-opacity`（0.06 ~ 0.55）。
- **动态流光背景引擎 (Adaptive Album Mesh Backdrop)**：
  - 实时从专辑封面提取 4 种主导色彩，通过 HTML5 Canvas 流体渐变在底层缓慢律动流动，提供真实透色感。

### 2. 原生 Web Audio API 专业音频管线
- **完整音频链路**：
  `HTMLAudioElement / MediaSource` ➔ `10-Band BiquadFilterNode (31Hz ~ 16kHz)` ➔ `GainNode (平滑淡入淡出)` ➔ `AnalyserNode (FFT 2048)` ➔ `AudioContext.destination`
- **10-Band 硬件级图形均衡器**：
  - 频段覆盖 31Hz、62Hz、125Hz、250Hz、500Hz、1kHz、2kHz、4kHz、8kHz、16kHz（-12dB ~ +12dB）。
  - 内置 8 种大师级预设：平直 (Flat)、重低音 (Bass Boost)、人声优化 (Vocal Presence)、电子乐 (Electronic)、摇滚 (Rock)、爵士 (Jazz Club)、原声民谣 (Acoustic)、高音增强 (Treble Air)。
  - 一键硬件旁通 (Bypass) 与快速重置。
- **实时音频可视化**：
  - 3 种律动模式可选：流体波纹 (Fluid Ribbon)、光泽频谱柱 (Crystal Bars)、示波器声波 (Oscilloscope Wave)。

### 3. 本地曲库与元数据解析
- **File System Access API**：一键挂载本地音乐文件夹，支持递归扫描子目录。
- **全屏拖拽导入**：支持将音频文件或整文件夹直接拖入窗口。
- **音频格式支持**：FLAC、WAV、MP3、M4A、OGG、AAC、ALAC、AIFF。
- **全量 ID3 / FLAC 元数据提取**：
  - 使用 `music-metadata-browser` 提取歌名、艺术家、专辑、年份、流派。
  - 采样率与位深解析：自适应显示 `24-bit / 96kHz Lossless`、`32-bit / 192kHz Master`、`Hi-Res Lossless` 等液态金质徽章。
  - 内嵌封面提取与 Blob URL 生命周期管理。
  - 同步识别同名 companion `.lrc` 歌词文件或音频文件内嵌 USLT / SYLT 歌词。

### 4. Apple Music 级沉浸式流体歌词
- 支持标准及毫秒级精度时间戳歌词。
- **物理弹簧平滑滚动**：随播放进度自适应滚动至视口中央。
- **阶梯式高斯模糊衰减**：
  - 当前行：纯白高亮、1.05 倍微放大、发光阴影。
  - 邻近行：阶梯式模糊 (`1.2px` ~ `4px`) 与不透明度衰减。
  - 点击任意歌词触发**液态波纹 (Liquid Ripple)** 反馈并高精跳转。

---

## 🛠️ 项目目录结构

```
musicbofangqi/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── audio/
│   │   │   ├── EqualizerPanel.tsx         # 10-Band 硬件级均衡器控制面板
│   │   │   ├── FluidLyricsView.tsx        # Apple Music 风格流体歌词视图
│   │   │   └── LiquidVisualizer.tsx       # 实时高帧率液态音频可视化频谱
│   │   ├── common/
│   │   │   └── FileDropZone.tsx           # 全局拖拽文件夹/文件解析投递区
│   │   ├── glass/
│   │   │   ├── LiquidBadge.tsx            # Hi-Res / 无损音质液态玻璃徽章
│   │   │   ├── LiquidButton.tsx           # 核心液态玻璃交互控件按钮
│   │   │   ├── liquidButtonStyles.ts      # 液态按钮样式与变体映射
│   │   │   ├── liquidButtonStyles.test.ts # 液态按钮变体测试
│   │   │   ├── LiquidGlassContainer.tsx   # 同心圆角玻璃容器
│   │   │   └── LiquidGlassSvgFilter.tsx   # 全局 SVG #ios27-liquid-glass 滤镜
│   │   ├── layout/
│   │   │   ├── AdaptiveMeshBackdrop.tsx   # 封面色彩自适应流光背景引擎
│   │   │   ├── LiquidMediaPill.tsx        # 底部浮动液态玻璃播放控制舱
│   │   │   └── LiquidSidebar.tsx          # 悬浮液态玻璃侧边导航栏与浓度调节
│   │   └── views/
│   │       ├── AlbumsView.tsx             # 专辑画廊网格视图
│   │       ├── ArtistsView.tsx            # 艺术家名录视图
│   │       ├── FavoritesView.tsx          # 收藏曲目视图
│   │       ├── FullscreenPlayerView.tsx   # 沉浸式双栏全屏播放器视图
│   │       └── SongsView.tsx              # 全部歌曲列表与实时搜索视图
│   ├── core/
│   │   ├── audio/
│   │   │   ├── AudioEngine.ts             # Web Audio API 单例类与链路控制
│   │   │   └── AudioEngine.test.ts        # 音频引擎配置单元测试
│   │   ├── metadata/
│   │   │   ├── colorExtractor.ts          # 封面主导色彩提取与色彩量化
│   │   │   ├── lrcParser.ts               # LRC 歌词解析与二分查找跳转
│   │   │   ├── lrcParser.test.ts          # LRC 歌词单元测试 (覆盖边缘/多时间戳)
│   │   │   └── metadataParser.ts          # 本地音频元数据与格式解析
│   │   └── storage/
│   │       └── idbStorage.ts              # IndexedDB / idb-keyval 持久化存储
│   ├── store/
│   │   ├── useLibraryStore.ts             # 本地曲库状态、扫描与用户设置 Store
│   │   └── usePlayerStore.ts              # 播放状态、播放队列与歌词同步 Store
│   ├── types/
│   │   └── index.ts                       # 全局 TypeScript 接口与类型定义
│   ├── App.tsx                            # 主界面组织与同心圆角一级视窗
│   ├── index.css                          # 液态玻璃设计 Token 与全局样式
│   └── main.tsx                           # React 19 应用入口
├── index.html
├── package.json
├── tailwind.config.js / @tailwindcss/vite
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 启动与使用指南

### 环境要求
- Node.js >= 18.0.0
- 支持现代现代浏览器（Chrome / Edge / Safari / Arc）

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
打开浏览器访问控制台提示的 URL（通常为 `http://localhost:5173`）。

### 运行单元测试
```bash
npm test
```

### 构建生产环境产物
```bash
npm run build
```
生产构建产物将输出至 `dist/` 目录。

---

### 打包本地独立 `.exe` 软件 (打开即用)
```bash
npm run build:exe
```
执行后将在 `release/` 目录生成单文件绿色便携版：
- **便携版 EXE**：`release/Tahoe-HiFi-Portable.exe`（直接双击即可启动运行，无需安装）
- **免安装绿色目录**：`release/win-unpacked/Tahoe-HiFi.exe`

---

## 💡 使用演示
1. **开箱即用**：初次加载时内置高保真合成立体声测试曲目（带有 24-bit / 96kHz Lossless 规格与同步歌词），点击播放即可立即测试音频引擎、均衡器与流体视觉。
2. **挂载曲库**：点击左侧导航栏的“挂载本地曲库”按钮或直接将整目录拖入网页，自动读取并分类全部无损音乐。
3. **调校音质**：在底部播放舱点击滑块图标，开启 10 频段 EQ，自由选择“重低音”、“摇滚”或自定义调校。
4. **全屏沉浸**：点击专辑封面或右侧全屏图标，展开 Apple Music 风格歌词与唱片律动大屏。
