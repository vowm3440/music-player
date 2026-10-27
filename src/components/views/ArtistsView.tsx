import React from 'react'
import { LiquidButton } from '../glass/LiquidButton'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/usePlayerStore'
import { Users, Play } from 'lucide-react'

interface ArtistsViewProps {
  tracks: Track[]
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ tracks }) => {
  const playTrack = usePlayerStore((state) => state.playTrack)

  const artistMap = new Map<string, Track[]>()
  tracks.forEach((t) => {
    const key = t.artist || '未知艺术家'
    const list = artistMap.get(key) || []
    list.push(t)
    artistMap.set(key, list)
  })

  const artists = Array.from(artistMap.entries()).map(([artistName, artistTracks]) => {
    const firstWithCover = artistTracks.find((t) => t.coverUrl)
    const albums = new Set(artistTracks.map((t) => t.album)).size
    return {
      name: artistName,
      coverUrl: firstWithCover?.coverUrl,
      tracks: artistTracks,
      albumCount: albums,
    }
  })

  return (
    <div className="h-full overflow-y-auto pb-32">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">艺术家名录</h2>
        <p className="text-xs text-white/50">共 {artists.length} 位艺术家</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {artists.map((artist) => (
          <div
            key={artist.name}
            className="solid-card rounded-[22px] group cursor-pointer p-4 flex flex-col items-center text-center gap-3 transition-all duration-200 hover:border-pink-500/30 hover:-translate-y-1 shadow-lg border border-white/[0.07] relative"
            onClick={() => playTrack(artist.tracks[0], artist.tracks)}
          >
            {/* Round Squircle Artist Avatar */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden bg-black/40 border-2 border-white/20 shadow-md">
              {artist.coverUrl ? (
                <img
                  src={artist.coverUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-500/20 to-indigo-500/20">
                  <Users className="w-10 h-10 text-white/40" />
                </div>
              )}

              {/* Liquid Glass Play Hover Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <LiquidButton
                  variant="primary"
                  size="icon-md"
                  className="shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    playTrack(artist.tracks[0], artist.tracks)
                  }}
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </LiquidButton>
              </div>
            </div>

            <div className="space-y-0.5 max-w-full">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
                {artist.name}
              </h4>
              <p className="text-[11px] text-white/50">
                {artist.tracks.length} 首歌曲 • {artist.albumCount} 张专辑
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
