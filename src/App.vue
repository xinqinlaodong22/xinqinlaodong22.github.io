<template>
  <div class="app">
    <div class="title">图片压缩</div>
    
    <!-- 上传区域 -->
    <div 
      class="drop-zone" 
      :class="{ dragging: isDragging }"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
    >
      <input 
        type="file" 
        ref="fileInput"
        @change="handleFileSelect"
        accept="image/*"
        multiple
        style="display: none"
      />
      <div class="drop-zone-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <p>点击或拖放图片到此处</p>
        <p class="hint">支持批量上传 JPG、PNG、WebP、GIF 等图片格式</p>
      </div>
    </div>

    <!-- 操作区域 -->
    <div v-if="images.length > 0" class="controls">
      <button 
        class="compress-btn"
        @click="compressImages"
        :disabled="isCompressing"
      >
        {{ isCompressing ? `压缩中... (${compressedCount}/${images.length})` : `压缩图片 (${images.length}张)` }}
      </button>
      <button 
        v-if="images.some(img => img.isCompressed)" 
        class="download-btn"
        @click="downloadAllImages"
        style="margin-left: 10px"
      >
        下载全部
      </button>
    </div>

    <!-- 预览区域 -->
    <div v-if="images.length > 0" class="preview-container">
      <div v-for="(image, index) in images" :key="image.id" class="preview-item">
        <h3>图片 {{ index + 1 }}</h3>
        
        <!-- 原始图片 -->
        <div class="image-wrapper">
          <img :src="image.originalUrl" :alt="`原始图片 ${index + 1}`" />
        </div>
        <p class="file-size">原始大小: {{ formatFileSize(image.originalSize) }}</p>
        
        <!-- 压缩后图片 -->
        <div v-if="image.isCompressed">
          <div class="image-wrapper">
            <img :src="image.compressedUrl" :alt="`压缩后图片 ${index + 1}`" />
          </div>
          <p class="file-size">压缩后大小: {{ formatFileSize(image.compressedSize) }}</p>
          <p class="compression-ratio">
            压缩率: {{ parseFloat(((1 - image.compressedSize / image.originalSize) * 100).toFixed(2)) }}%
          </p>
          <button 
            class="download-btn"
            @click="downloadImage(image)"
          >
            下载图片
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer>
      <p>图片压缩 &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script>
import JSZip from 'jszip'

export default {
  name: 'App',
  data() {
    return {
      images: [],
      isDragging: false,
      isCompressing: false,
      compressedCount: 0
    }
  },
  methods: {
    /**
     * 触发文件选择器
     */
    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    /**
     * 处理文件选择
     * @param {Event} e - 事件对象
     */
    handleFileSelect(e) {
      const files = e.target.files
      if (files.length > 0) {
        this.handleFileUpload(files)
      }
    },

    /**
     * 处理拖放事件
     * @param {Event} e - 事件对象
     */
    handleDragOver(e) {
      this.isDragging = true
    },

    /**
     * 处理拖放离开事件
     */
    handleDragLeave() {
      this.isDragging = false
    },

    /**
     * 处理拖放完成事件
     * @param {Event} e - 事件对象
     */
    handleDrop(e) {
      this.isDragging = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.handleFileUpload(files)
      }
    },

    /**
     * 处理文件上传
     * @param {File[]} files - 上传的图片文件数组
     */
    handleFileUpload(files) {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
      
      if (imageFiles.length === 0) {
        alert('请上传图片文件！')
        return
      }

      // 清空之前的图片
      this.images = []
      
      // 添加新图片
      const newImages = imageFiles.map(file => ({
        id: Date.now() + Math.random(),
        file: file,
        originalUrl: URL.createObjectURL(file),
        originalSize: file.size,
        compressedUrl: null,
        compressedSize: 0,
        isCompressed: false
      }))
      
      this.images = newImages
    },

    /**
     * 压缩单个图片
     * @param {object} image - 图片对象
     * @param {number} index - 图片索引
     * @returns {Promise} 压缩完成的Promise
     */
    compressSingleImage(image, index) {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          // 设置压缩后的尺寸
          const maxWidth = 1920
          const maxHeight = 1080
          let width = img.width
          let height = img.height

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }

          // 设置canvas尺寸
          canvas.width = width
          canvas.height = height

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // 更新图片状态
                this.images[index] = {
                  ...this.images[index],
                  compressedUrl: URL.createObjectURL(blob),
                  compressedSize: blob.size,
                  isCompressed: true
                }
                resolve()
              } else {
                reject(new Error('压缩失败'))
              }
            },
            'image/jpeg', // 转换为JPG格式以获得更好的压缩效果
            0.6 // 压缩质量
          )
        }

        img.onerror = () => {
          reject(new Error('图片加载失败'))
        }

        img.src = image.originalUrl
      })
    },

    /**
     * 压缩所有图片
     */
    async compressImages() {
      if (this.images.length === 0) {
        alert('请先上传图片！')
        return
      }

      this.isCompressing = true
      this.compressedCount = 0

      try {
        // 逐个压缩图片
        for (let i = 0; i < this.images.length; i++) {
          await this.compressSingleImage(this.images[i], i)
          this.compressedCount++
        }
      } catch (error) {
        console.error('压缩过程中出错：', error)
        alert('部分图片压缩失败，请重试！')
      } finally {
        this.isCompressing = false
      }
    },

    /**
     * 下载单个压缩后的图片
     * @param {object} image - 图片对象
     */
    downloadImage(image) {
      if (!image.compressedUrl) {
        alert('请先压缩图片！')
        return
      }

      // 创建下载链接
      const link = document.createElement('a')
      link.href = image.compressedUrl
      link.download = image.file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    /**
     * 格式化日期时间
     * @returns {string} 格式化后的日期时间字符串
     */
    formatDateTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      return `${year}年${month}月${day}日${hours}时${minutes}分${seconds}秒`
    },

    /**
     * 下载所有压缩后的图片到一个ZIP文件夹
     */
    async downloadAllImages() {
      const compressedImages = this.images.filter(img => img.isCompressed)
      
      if (compressedImages.length === 0) {
        alert('请先压缩图片！')
        return
      }

      try {
        // 导入JSZip
        const { default: JSZip } = await import('jszip')
        // 创建JSZip实例
        const zip = new JSZip()
        
        // 添加压缩后的图片到ZIP文件
        for (let i = 0; i < compressedImages.length; i++) {
          const image = compressedImages[i]
          const response = await fetch(image.compressedUrl)
          const blob = await response.blob()
          // 使用原始文件名
          zip.file(image.file.name, blob)
        }

        // 生成ZIP文件并下载
        zip.generateAsync({ type: 'blob' }).then((content) => {
          const link = document.createElement('a')
          link.href = URL.createObjectURL(content)
          link.download = `press_image${this.formatDateTime()}.zip`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        })
      } catch (error) {
        console.error('下载失败：', error)
        alert('下载失败，请重试！')
      }
    },

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
/* 样式内容保持不变 */
.app {
  max-width: 1900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.title {
  color: #000;
  font-size: 20px;
  padding: 10px;
  text-align: center;
  margin-bottom: 30px;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #4CAF50;
  background-color: #f5f5f5;
}

.drop-zone.dragging {
  border-color: #4CAF50;
  background-color: #e8f5e8;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drop-zone-content svg {
  color: #4CAF50;
  margin-bottom: 20px;
}

.drop-zone-content p {
  margin: 10px 0;
  font-size: 18px;
}

.hint {
  font-size: 14px;
  color: #666;
}

.controls {
  margin: 30px 0;
  text-align: center;
}

.compress-btn, .download-btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.compress-btn {
  background-color: #4CAF50;
  color: white;
}

.compress-btn:hover {
  background-color: #45a049;
}

.compress-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.download-btn {
  background-color: #2196F3;
  color: white;
}

.download-btn:hover {
  background-color: #0b7dda;
}

.preview-container {
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.preview-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.preview-item > *:not(.download-btn) {
  flex: 1;
}

.preview-item .download-btn {
  margin-top: 20px;
  align-self: center;
}

.image-wrapper {
  margin: 15px 0;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 4px;
}

.file-size {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.compression-ratio {
  font-size: 14px;
  color: #4CAF50;
  font-weight: bold;
  margin: 5px 0;
}

footer {
  margin-top: 50px;
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style>