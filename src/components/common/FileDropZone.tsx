import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidGlassContainer } from '../glass/LiquidGlassContainer'
import { useLibraryStore } from '../../store/useLibraryStore'
import { UploadCloud, Sparkles } from 'lucide-react'

export const FileDropZone: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false)
  const importFiles = useLibraryStore((state) => state.importFiles)

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Check if leaving the document window
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const items = e.dataTransfer?.items
      const files: File[] = []

      if (items) {
        const queue: FileSystemEntry[] = []
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry?.()
          if (entry) queue.push(entry)
        }

        const readEntry = async (entry: FileSystemEntry): Promise<void> => {
          if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) => {
              ;(entry as FileSystemFileEntry).file(resolve, reject)
            })
            files.push(file)
          } else if (entry.isDirectory) {
            const dirReader = (entry as FileSystemDirectoryEntry).createReader()
            const entries = await new Promise<FileSystemEntry[]>((resolve) => {
              dirReader.readEntries(resolve)
            })
            for (const subEntry of entries) {
              await readEntry(subEntry)
            }
          }
        }

        for (const entry of queue) {
          await readEntry(entry)
        }
      } else if (e.dataTransfer?.files) {
        files.push(...Array.from(e.dataTransfer.files))
      }

      if (files.length > 0) {
        await importFiles(files)
      }
    },
    [importFiles]
  )

  useEffect(() => {
    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop])

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 p-8 flex items-center justify-center bg-black/60 backdrop-blur-2xl pointer-events-none"
        >
          <LiquidGlassContainer
            level={1}
            className="p-12 max-w-lg w-full flex flex-col items-center text-center space-y-4 border-2 border-dashed border-pink-400/50"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center animate-pulse">
              <UploadCloud className="w-10 h-10 text-pink-400" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              释放以导入音频与歌词
              <Sparkles className="w-5 h-5 text-pink-400" />
            </h3>

            <p className="text-sm text-white/60 max-w-sm">
              自动递归扫描文件夹，读取 FLAC / WAV / MP3 / M4A 元数据、内嵌高清封面及同名 .lrc 歌词
            </p>
          </LiquidGlassContainer>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
