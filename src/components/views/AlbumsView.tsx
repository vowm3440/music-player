import React from 'react'
import { LiquidButton } from '../glass/LiquidButton'
import type { Track } from '../../types'
import { usePlayerStore } from '../../store/usePlayerStore'
import { Play, Music2 } from 'lucide-react'

interface AlbumsViewProps {
  tracks: Track[]
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({ tracks }) => {
  const playTrack = usePlayerStore((state) => state.playTrack)

  // Group by album name
  const albumMap = new Map<string, Track[]>()
  tracks.forEach((t) => {
    const key = t.album || '未知专辑'
    const list = albumMap.get(key) || []
    list.push(t)
    albumMap.set(key, list)
  })

  const albums = Array.from(albumMap.entries()).map(([albumName, albumTracks]) => {
    const firstWithCover = albumTracks.find((t) => t.coverUrl)
    return {
      name: albumName,
      artist: albumTracks[0].artist,
      coverUrl: firstWithCover?.coverUrl,
      year: albumTracks[0].year,
      tracks: albumTracks,
    }
  })

  return (
    <div className="h-full overflow-y-auto pb-32">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">专辑画廊</h2>
        <p className="text-xs text-white/50">共 {albums.length} 张专辑</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albums.map((album) => (
          <div
            key={album.name}
            className="solid-card rounded-[22px] group cursor-pointer p-3.5 flex flex-col gap-3 transition-all duration-200 hover:border-pink-500/30 hover:-translate-y-1 shadow-lg border border-white/[0.07] relative"
            onClick={() => playTrack(album.tracks[0], album.tracks)}
          >
            {/* Album Artwork Squircle */}
            <div className="relative aspect-square w-full rounded-[16px] overflow-hidden bg-black/40 border border-white/10 shadow-md">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-500/10 to-indigo-500/10">
                  <Music2 className="w-12 h-12 text-white/30" />
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
                    playTrack(album.tracks[0], album.tracks)
                  }}
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </LiquidButton>
              </div>
            </div>

            {/* Album Metadata */}
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
                {album.name}
              </h4>
              <p className="text-xs text-white/50 truncate">{album.artist}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-white/40 pt-1">
                <span>{album.tracks.length} 首歌曲</span>
                {album.year && <span>• {album.year}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
