import { useEffect } from 'react'
import { LiquidGlassSvgFilter } from './components/glass/LiquidGlassSvgFilter'
import { AdaptiveMeshBackdrop } from './components/layout/AdaptiveMeshBackdrop'
import { LiquidSidebar } from './components/layout/LiquidSidebar'
import { LiquidMediaPill } from './components/layout/LiquidMediaPill'
import { FullscreenPlayerView } from './components/views/FullscreenPlayerView'
import { EqualizerPanel } from './components/audio/EqualizerPanel'
import { FileDropZone } from './components/common/FileDropZone'
import { SongsView } from './components/views/SongsView'
import { AlbumsView } from './components/views/AlbumsView'
import { ArtistsView } from './components/views/ArtistsView'
import { FavoritesView } from './components/views/FavoritesView'
import { useLibraryStore } from './store/useLibraryStore'
import { usePlayerStore } from './store/usePlayerStore'
import { AnimatePresence } from 'framer-motion'

export function App() {
  const initLibrary = useLibraryStore((state) => state.initLibrary)
  const currentView = useLibraryStore((state) => state.currentView)
  const tracks = useLibraryStore((state) => state.tracks)
  const isEqualizerOpen = usePlayerStore((state) => state.isEqualizerOpen)
  const setEqualizerOpen = usePlayerStore((state) => state.setEqualizerOpen)

  useEffect(() => {
    initLibrary()
  }, [initLibrary])

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center p-2 sm:p-3 select-none">
      {/* 1. Global SVG Liquid Glass Filter */}
      <LiquidGlassSvgFilter />

      {/* 2. Dynamic Fluid Mesh Gradient Backdrop */}
      <AdaptiveMeshBackdrop />

      {/* 3. Drop Zone for drag-and-drop folders / audio files */}
      <FileDropZone />

      {/* 4. Level 1 Concentric Outer Main Window Frame (Solid Grounded Chassis with Specular Rim) */}
      <div className="solid-window rounded-[36px] w-full h-full flex overflow-hidden gap-3 p-3 relative z-10 shadow-[0_32px_100px_rgba(0,0,0,0.85)]">
        {/* Left: Solid Sidebar with Liquid Glass Buttons */}
        <LiquidSidebar />

        {/* Center: Main Viewport */}
        <main className="flex-1 h-full overflow-hidden flex flex-col relative">
          <div className="flex-1 h-full overflow-hidden pt-1 px-1">
            {currentView === 'songs' && <SongsView tracks={tracks} />}
            {currentView === 'albums' && <AlbumsView tracks={tracks} />}
            {currentView === 'artists' && <ArtistsView tracks={tracks} />}
            {currentView === 'favorites' && <FavoritesView tracks={tracks} />}
          </div>
        </main>
      </div>

      {/* 5. Floating Liquid Media Pill (Bottom) */}
      <LiquidMediaPill />

      {/* 6. Fullscreen Immersive Lyrics & Visualizer Modal */}
      <FullscreenPlayerView />

      {/* 7. 10-Band Hi-Fi Equalizer Modal */}
      <AnimatePresence>
        {isEqualizerOpen && (
          <EqualizerPanel onClose={() => setEqualizerOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
