import React, { useState, useRef } from 'react'
import Compressor from 'compressorjs'
import JSZip from 'jszip'
import './App.css'

/**
 * 图片压缩工具应用
 * 功能：上传图片、压缩图片、预览和下载压缩后的图片
 */
function App() {
  // 状态管理
  const [images, setImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedCount, setCompressedCount] = useState(0)
  
  // 引用
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  /**
   * 处理文件上传
   * @param {File[]} files - 上传的图片文件数组
   */
  const handleFileUpload = (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('请上传图片文件！')
      return
    }

    // 清空之前的图片
    setImages([])
    
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
    
    setImages(newImages)
  }

  /**
   * 处理文件选择
   * @param {Event} e - 事件对象
   */
  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  /**
   * 处理拖放事件
   * @param {Event} e - 事件对象
   */
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * 处理拖放离开事件
   */
  const handleDragLeave = () => {
    setIsDragging(false)
  }

  /**
   * 处理拖放完成事件
   * @param {Event} e - 事件对象
   */
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  /**
   * 压缩单个图片
   * @param {object} image - 图片对象
   * @param {number} index - 图片索引
   */
  const compressSingleImage = (image, index) => {
    return new Promise((resolve, reject) => {
      new Compressor(image.file, {
        quality: 0.6, // 压缩质量
        maxWidth: 1920, // 最大宽度
        maxHeight: 1080, // 最大高度
        success: (result) => {
          // 计算压缩后的文件大小
          const compressedBlob = result
          const compressedSizeInBytes = compressedBlob.size
          
          // 更新图片状态
          setImages(prevImages => {
            const newImages = [...prevImages]
            newImages[index] = {
              ...newImages[index],
              compressedUrl: URL.createObjectURL(compressedBlob),
              compressedSize: compressedSizeInBytes,
              isCompressed: true
            }
            return newImages
          })
          
          resolve()
        },
        error: (err) => {
          console.error('压缩失败：', err)
          reject(err)
        }
      })
    })
  }

  /**
   * 压缩所有图片
   */
  const compressImages = async () => {
    if (images.length === 0) {
      alert('请先上传图片！')
      return
    }

    setIsCompressing(true)
    setCompressedCount(0)

    try {
      // 逐个压缩图片
      for (let i = 0; i < images.length; i++) {
        await compressSingleImage(images[i], i)
        setCompressedCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('压缩过程中出错：', error)
      alert('部分图片压缩失败，请重试！')
    } finally {
      setIsCompressing(false)
    }
  }

  /**
   * 下载单个压缩后的图片
   * @param {object} image - 图片对象
   */
  const downloadImage = (image) => {
    if (!image.compressedUrl) {
      alert('请先压缩图片！')
      return
    }

    // 创建下载链接
    const link = document.createElement('a')
    link.href = image.compressedUrl
    link.download = `compressed_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * 下载所有压缩后的图片到一个ZIP文件夹
   */
  const downloadAllImages = async () => {
    const compressedImages = images.filter(img => img.isCompressed)
    
    if (compressedImages.length === 0) {
      alert('请先压缩图片！')
      return
    }

    try {
      // 创建JSZip实例
      const zip = new JSZip()
      
      // 添加压缩后的图片到ZIP文件
      for (let i = 0; i < compressedImages.length; i++) {
        const image = compressedImages[i]
        const response = await fetch(image.compressedUrl)
        const blob = await response.blob()
        zip.file(`compressed_image_${i + 1}.jpg`, blob)
      }

      // 生成ZIP文件并下载
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = `compressed_images_${Date.now()}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
    } catch (error) {
      console.error('下载失败：', error)
      alert('下载失败，请重试！')
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="app">
      <div className="title">图片压缩工具</div>
      
      {/* 上传区域 */}
      <div 
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        <div className="drop-zone-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <p>点击或拖放图片到此处</p>
          <p className="hint">支持批量上传 JPG、PNG、WebP 等图片格式</p>
        </div>
      </div>

      {/* 操作区域 */}
      {images.length > 0 && (
        <div className="controls">
          <button 
            className="compress-btn"
            onClick={compressImages}
            disabled={isCompressing}
          >
            {isCompressing 
              ? `压缩中... (${compressedCount}/${images.length})` 
              : `压缩图片 (${images.length}张)`}
          </button>
          {images.some(img => img.isCompressed) && (
            <button 
              className="download-btn"
              onClick={downloadAllImages}
              style={{ marginLeft: '10px' }}
            >
              下载全部
            </button>
          )}
        </div>
      )}

      {/* 预览区域 */}
      {images.length > 0 && (
        <div className="preview-container">
          {images.map((image, index) => (
            <div key={image.id} className="preview-item">
              <h3>图片 {index + 1}</h3>
              
              {/* 原始图片 */}
              <div className="image-wrapper">
                <img src={image.originalUrl} alt={`原始图片 ${index + 1}`} />
              </div>
              <p className="file-size">原始大小: {formatFileSize(image.originalSize)}</p>
              
              {/* 压缩后图片 */}
              {image.isCompressed && (
                <>
                  <div className="image-wrapper">
                    <img src={image.compressedUrl} alt={`压缩后图片 ${index + 1}`} />
                  </div>
                  <p className="file-size">压缩后大小: {formatFileSize(image.compressedSize)}</p>
                  <p className="compression-ratio">
                    压缩率: {parseFloat(((1 - image.compressedSize / image.originalSize) * 100).toFixed(2))}%
                  </p>
                  <button 
                    className="download-btn"
                    onClick={() => downloadImage(image)}
                  >
                    下载图片
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 页脚 */}
      <footer>
        <p>图片压缩工具 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

export default App