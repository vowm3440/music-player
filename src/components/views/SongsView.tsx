import React from 'react'
import { LiquidButton } from '../glass/LiquidButton'
import { LiquidBadge } from '../glass/LiquidBadge'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/usePlayerStore'
import { useLibraryStore } from '../../store/useLibraryStore'
import {
  Play,
  Pause,
  Heart,
  Clock,
  Music,
  FolderOpen,
  Search,
} from 'lucide-react'

interface SongsViewProps {
  tracks: Track[]
}

export const SongsView: React.FC<SongsViewProps> = ({ tracks }) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const playTrack = usePlayerStore((state) => state.playTrack)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const toggleFavorite = useLibraryStore((state) => state.toggleFavorite)
  const searchQuery = useLibraryStore((state) => state.searchQuery)
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery)
  const mountDirectory = useLibraryStore((state) => state.mountDirectory)

  const filteredTracks = tracks.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q)
    )
  })

  const formatDuration = (secs: number) => {
    if (!secs || secs <= 0) return '--:--'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleRowClick = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      playTrack(track, filteredTracks)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 pb-28">
      {/* Top Action & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="搜索歌曲、艺术家或专辑..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400/50 backdrop-blur-md transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50">
          <span>共 {filteredTracks.length} 首高保真曲目</span>
        </div>
      </div>

      {filteredTracks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <Music className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-lg font-semibold text-white/80">曲库为空或未找到匹配歌曲</h3>
          <p className="text-xs text-white/50 mt-1 max-w-sm mb-6">
            支持无损 FLAC、WAV、DSD、MP3、M4A 等格式，支持内嵌歌词与同名 .lrc 解析
          </p>
          <LiquidButton
            variant="accent"
            size="lg"
            onClick={mountDirectory}
            className="flex items-center gap-2 shadow-[0_4px_20px_rgba(244,63,94,0.4)]"
          >
            <FolderOpen className="w-4 h-4" />
            <span>挂载本地音乐文件夹</span>
          </LiquidButton>
        </div>
      ) : (
        /* Songs Table / List in Solid Card Container */
        <div className="solid-card rounded-[24px] flex-1 overflow-hidden p-2 flex flex-col border border-white/[0.07] shadow-xl">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-xs font-semibold text-white/50 border-b border-white/10 select-none">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">歌曲标题</div>
            <div className="col-span-3">专辑</div>
            <div className="col-span-2">音质规格</div>
            <div className="col-span-1 text-right flex justify-end items-center pr-2">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* List Rows */}
          <div className="flex-1 overflow-y-auto space-y-1 p-1">
            {filteredTracks.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id
              const isCurrentlyPlaying = isCurrent && isPlaying

              return (
                <div
                  key={track.id}
                  onDoubleClick={() => playTrack(track, filteredTracks)}
                  className={`
                    grid grid-cols-12 gap-3 items-center px-4 py-2.5 rounded-2xl
                    transition-all duration-200 cursor-pointer group select-none
                    ${
                      isCurrent
                        ? 'bg-white/[0.14] text-white shadow-sm border border-pink-400/30'
                        : 'hover:bg-white/[0.06] text-white/80 border border-transparent'
                    }
                  `}
                >
                  {/* Track Index or Liquid Glass Play Button */}
                  <div className="col-span-1 flex items-center justify-center">
                    {isCurrentlyPlaying ? (
                      <LiquidButton
                        variant="accent"
                        size="icon-sm"
                        onClick={() => handleRowClick(track)}
                        className="!w-7 !h-7"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      </LiquidButton>
                    ) : (
                      <>
                        <span className="group-hover:hidden font-mono text-xs text-white/50">
                          {index + 1}
                        </span>
                        <div className="hidden group-hover:flex">
                          <LiquidButton
                            variant="glass"
                            size="icon-sm"
                            onClick={() => handleRowClick(track)}
                            className="!w-7 !h-7"
                          >
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </LiquidButton>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Title + Cover + Artist */}
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/15">
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Music className="w-4 h-4 text-white/40" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-pink-300 font-bold' : 'text-white'}`}>
                        {track.title}
                      </span>
                      <span className="text-xs text-white/50 truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-3 truncate text-xs text-white/60">
                    {track.album}
                  </div>

                  {/* Audio Format Glass Badge */}
                  <div className="col-span-2 truncate">
                    <LiquidBadge
                      variant={track.format.lossless ? 'gold' : 'glass'}
                      className="text-[10px]"
                    >
                      {track.format.sampleRate && track.format.bitsPerSample
                        ? `${track.format.bitsPerSample}b / ${Math.round(track.format.sampleRate / 1000)}k`
                        : track.format.codec || 'Audio'}
                    </LiquidBadge>
                  </div>

                  {/* Duration + Favorite Liquid Button */}
                  <div className="col-span-1 flex items-center justify-end gap-2 pr-2">
                    <span className="font-mono text-xs text-white/50">
                      {formatDuration(track.duration)}
                    </span>
                    <LiquidButton
                      variant={track.isFavorite ? 'accent' : 'subtle'}
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(track.id)
                      }}
                      className="!w-7 !h-7 !p-0"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          track.isFavorite ? 'text-rose-400 fill-rose-400' : 'text-white/40 hover:text-rose-400'
                        }`}
                      />
                    </LiquidButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
