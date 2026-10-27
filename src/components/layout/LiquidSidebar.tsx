import React from 'react'
import { motion } from 'framer-motion'
import { LiquidButton } from '../glass/LiquidButton'
import { useLibraryStore } from '../../store/useLibraryStore'
import type { ViewMode } from '../../types'
import {
  Music,
  Disc3,
  Users,
  Heart,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react'

export const LiquidSidebar: React.FC = () => {
  const currentView = useLibraryStore((state) => state.currentView)
  const setCurrentView = useLibraryStore((state) => state.setCurrentView)
  const mountDirectory = useLibraryStore((state) => state.mountDirectory)
  const preferences = useLibraryStore((state) => state.preferences)
  const updatePreferences = useLibraryStore((state) => state.updatePreferences)
  const tracks = useLibraryStore((state) => state.tracks)
  const favorites = useLibraryStore((state) => state.favorites)
  const isScanning = useLibraryStore((state) => state.isScanning)
  const scanProgress = useLibraryStore((state) => state.scanProgress)

  const isCollapsed = preferences.sidebarCollapsed

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'songs', label: '全部歌曲', icon: <Music className="w-5 h-5" />, badge: tracks.length },
    { id: 'albums', label: '专辑网格', icon: <Disc3 className="w-5 h-5" /> },
    { id: 'artists', label: '艺术家', icon: <Users className="w-5 h-5" /> },
    { id: 'favorites', label: '我的收藏', icon: <Heart className="w-5 h-5" />, badge: favorites.size },
  ]

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    updatePreferences({ glassOpacity: val })
  }

  return (
    <aside
      className={`
        relative h-full flex flex-col z-30 transition-all duration-300 ease-out select-none
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div
        className="solid-panel rounded-[24px] flex-1 flex flex-col justify-between overflow-hidden p-3 relative shadow-xl"
      >
        {/* Top Header / Branding */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-2 pt-2">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-indigo-500 flex items-center justify-center shadow-[0_2px_16px_rgba(244,63,94,0.45)]">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                    TAHOE HI-FI
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
                      iOS 27
                    </span>
                  </h1>
                  <p className="text-[10px] text-white/50 tracking-tight">Solid + Liquid Glass</p>
                </div>
              </motion.div>
            )}

            <LiquidButton
              variant="subtle"
              size="icon-sm"
              onClick={() => updatePreferences({ sidebarCollapsed: !isCollapsed })}
              title={isCollapsed ? '展开导航栏' : '折叠导航栏'}
              className="ml-auto"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </LiquidButton>
          </div>

          {/* Mount Directory Action */}
          <div className="px-1">
            <LiquidButton
              variant="accent"
              size="md"
              onClick={mountDirectory}
              disabled={isScanning}
              className={`w-full !rounded-2xl p-2.5 ${isCollapsed ? '!px-0 justify-center' : 'justify-start'}`}
            >
              <div className="p-1.5 rounded-xl bg-pink-500/25 text-pink-200 group-hover:scale-110 transition-transform">
                <FolderPlus className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="text-left ml-2">
                  <span className="text-xs font-semibold block leading-tight">
                    {isScanning ? '正在解析音频...' : '挂载本地曲库'}
                  </span>
                  <span className="text-[10px] text-white/60 block mt-0.5">
                    {isScanning && scanProgress.total > 0
                      ? `${scanProgress.current} / ${scanProgress.total}`
                      : 'File System Access'}
                  </span>
                </div>
              )}
            </LiquidButton>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2 px-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id
              return (
                <LiquidButton
                  key={item.id}
                  variant={isActive ? 'accent' : 'subtle'}
                  active={isActive}
                  size="md"
                  onClick={() => setCurrentView(item.id)}
                  className={`
                    w-full !rounded-2xl py-2.5 px-3 relative
                    ${isCollapsed ? '!px-0 justify-center' : 'justify-start'}
                  `}
                >
                  {/* Subtle active pill indicator on left edge */}
                  {isActive && !isCollapsed && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute left-0 w-1 h-5 rounded-r-full bg-pink-400"
                    />
                  )}

                  <div className={`transition-transform duration-200 ${isActive ? 'scale-105 text-white' : 'text-white/70'}`}>
                    {item.icon}
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between ml-3 text-left">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </LiquidButton>
              )
            })}
          </nav>
        </div>

        {/* Bottom Glass Appearance Slider */}
        <div className="pt-4 border-t border-white/10 px-1">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <Layers className="w-3.5 h-3.5 text-pink-400" />
                  液态玻璃光泽
                </span>
                <span className="font-mono text-[10px] text-white/50">
                  {Math.round(preferences.glassOpacity * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40">透澈</span>
                <input
                  type="range"
                  min="0.06"
                  max="0.55"
                  step="0.01"
                  value={preferences.glassOpacity}
                  onChange={handleOpacityChange}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-pink-400"
                />
                <span className="text-[10px] text-white/40">浓郁</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="液态玻璃光泽">
              <Layers className="w-5 h-5 text-white/40" />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
