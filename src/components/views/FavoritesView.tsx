import React from 'react'
import { SongsView } from './SongsView'
import type { Track } from '../../types'
import { Heart } from 'lucide-react'

interface FavoritesViewProps {
  tracks: Track[]
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ tracks }) => {
  const favoriteTracks = tracks.filter((t) => t.isFavorite)

  if (favoriteTracks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/50">
        <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <Heart className="w-10 h-10 text-rose-500/40" />
        </div>
        <h3 className="text-lg font-bold text-white/80">暂无收藏曲目</h3>
        <p className="text-xs text-white/40 mt-1 max-w-xs">
          在歌曲列表或播放控制舱点击爱心图标，即可将喜爱的高保真无损音轨加入本列表
        </p>
      </div>
    )
  }

  return <SongsView tracks={favoriteTracks} />
}
