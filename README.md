# 图片压缩工具

一个简单易用的图片压缩网站，支持拖放上传、实时预览和一键下载功能。

## 功能特点

- 📁 支持拖放上传图片
- 🖼️ 实时预览压缩前后的图片
- 📊 显示压缩前后的文件大小和压缩率
- 💾 一键下载压缩后的图片
- 🎨 响应式设计，适配各种设备
- 🚀 快速压缩，无需等待

## 技术栈

- React 18
- Vite
- Compressor.js (图片压缩库)
- CSS3 (动画和响应式设计)

## 安装步骤

1. 克隆项目到本地
   ```bash
   git clone <项目地址>
   cd image-compressor
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

4. 构建生产版本
   ```bash
   npm run build
   ```

## 使用方法

1. 打开网站后，点击或拖放图片到上传区域
2. 上传完成后，点击「压缩图片」按钮
3. 等待压缩完成，查看压缩前后的对比
4. 点击「下载图片」按钮保存压缩后的图片

## 支持的图片格式

- JPG/JPEG
- PNG
- WebP
- GIF

## 压缩参数

- 质量: 0.6 (可在代码中调整)
- 最大宽度: 1920px (可在代码中调整)
- 最大高度: 1080px (可在代码中调整)

## 项目结构

```
image-compressor/
├── public/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── App.css          # 样式文件
│   ├── main.jsx         # 应用入口
│   └── index.css        # 全局样式
├── index.html           # HTML模板
├── package.json         # 项目配置
└── README.md            # 项目说明
```

## 浏览器兼容性

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

---

**注意**: 图片压缩是在客户端进行的，不会上传到服务器，保护您的隐私安全。