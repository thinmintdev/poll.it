'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreateImageOption } from '@/types/poll'

interface ImagePollCreatorProps {
  imageOptions: CreateImageOption[]
  onImageOptionsChange: (options: CreateImageOption[]) => void
}

export default function ImagePollCreator({ 
  imageOptions, 
  onImageOptionsChange 
}: ImagePollCreatorProps) {
  const [draggedOver, setDraggedOver] = useState<number | null>(null)
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({})

  const addImageOption = () => {
    if (imageOptions.length < 10) {
      onImageOptionsChange([...imageOptions, { imageUrl: '', caption: '' }])
    }
  }

  const removeImageOption = (index: number) => {
    if (imageOptions.length > 2) {
      onImageOptionsChange(imageOptions.filter((_, i) => i !== index))
    }
  }

  const updateImageOption = (index: number, updates: Partial<CreateImageOption>) => {
    const newOptions = [...imageOptions]
    newOptions[index] = { ...newOptions[index], ...updates }
    onImageOptionsChange(newOptions)
  }

  const handleImageLoad = (index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: false }))
  }

  const handleImageError = (index: number) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: false }))
  }

  const handleImageUrlChange = (index: number, url: string) => {
    if (url !== imageOptions[index].imageUrl) {
      setImageLoadingStates(prev => ({ ...prev, [index]: true }))
    }
    updateImageOption(index, { imageUrl: url })
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDraggedOver(index)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDraggedOver(null)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileUpload(imageFile, index)
    }
  }

  const handleFileUpload = (file: File, index: number) => {
    // For now, we'll use a placeholder URL
    // In production, you'd upload to a service like Cloudinary or AWS S3
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      updateImageOption(index, { imageUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, index)
    }
    // Reset the input so the same file can be selected again
    e.target.value = ''
  }

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url)
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-app-primary text-lg font-semibold">Image Options</h3>
          <p className="text-app-secondary text-sm">Add images by URL or drag &amp; drop</p>
        </div>
        {imageOptions.length < 10 && (
          <motion.button
            type="button"
            onClick={addImageOption}
            className="btn-gradient-border flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium text-cotton-purple leading-none"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Image</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {imageOptions.map((option, index) => (
          <motion.div
            key={index}
            className={`relative bg-app-surface rounded-xl border-2 transition-all duration-300 ${
              draggedOver === index 
                ? 'border-cotton-purple border-dashed bg-cotton-purple/5' 
                : 'border-app hover:border-cotton-purple/50'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {/* Remove button */}
            {imageOptions.length > 2 && (
              <motion.button
                type="button"
                onClick={() => removeImageOption(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-cotton-pink text-white rounded-full flex items-center justify-center text-xs hover:bg-cotton-pink/80 transition-colors z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Remove image option"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}

            <div className="p-4 space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <div className="aspect-video bg-app-tertiary rounded-lg border border-app overflow-hidden relative">
                  {option.imageUrl ? (
                    <>
                      {imageLoadingStates[index] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-app-tertiary">
                          <svg className="animate-spin w-6 h-6 text-cotton-purple" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      <img
                        src={option.imageUrl}
                        alt={option.caption || `Option ${index + 1}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          imageLoadingStates[index] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                        onLoadStart={() => setImageLoadingStates(prev => ({ ...prev, [index]: true }))}
                      />
                      {!isValidImageUrl(option.imageUrl) && !option.imageUrl.startsWith('data:') && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-red-300">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-xs">Invalid image URL</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full">
                      {/* Left Half - Upload Button */}
                      <label
                        htmlFor={`file-input-${index}`}
                        className="flex-1 flex items-center justify-center cursor-pointer hover:bg-app-surface/50 transition-colors border-r border-gray-600/50"
                      >
                        <svg className="w-8 h-8 text-cotton-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <input
                          id={`file-input-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileInputChange(e, index)}
                          className="hidden"
                        />
                      </label>

                      {/* Right Half - Drag & Drop Area */}
                      <div className="flex-1 flex items-center justify-center text-app-muted">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option Number Badge */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-cotton-purple to-cotton-pink rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {index + 1}
                </div>
              </div>


              {/* Image URL Input */}
              <div>
                <label className="block text-app-primary text-xs font-medium mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={option.imageUrl}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="input-field w-full text-sm"
                />
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-app-primary text-xs font-medium mb-2">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={option.caption || ''}
                  onChange={(e) => updateImageOption(index, { caption: e.target.value })}
                  placeholder="Describe this option..."
                  className="input-field w-full text-sm"
                  maxLength={100}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-xs text-app-muted bg-app-surface rounded-lg p-3 border border-app">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-cotton-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="mb-1"><strong>Supported formats:</strong> JPG, PNG, GIF, WebP, SVG</p>
            <p className="mb-1"><strong>Image URLs:</strong> Use direct links to images (ending in .jpg, .png, etc.)</p>
          </div>
        </div>
      </div>
    </div>
  )
}