import * as mm from 'music-metadata-browser'
import type { Track, TrackFormat } from '../../types'
import { parseLrc } from './lrcParser'

const SUPPORTED_AUDIO_EXTENSIONS = ['.flac', '.wav', '.mp3', '.m4a', '.ogg', '.aac', '.alac', '.aiff']

export function isAudioFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return SUPPORTED_AUDIO_EXTENSIONS.some(ext => name.endsWith(ext)) || file.type.startsWith('audio/')
}

export function isLrcFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.lrc')
}

export function getBaseFileName(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.substring(0, lastDot) : fileName
}

/**
 * Parses an audio File into a Hi-Fi Track model with embedded cover, format metadata, and lyrics.
 */
export async function parseAudioFile(
  file: File,
  companionLrcText?: string
): Promise<Track> {
  const url = URL.createObjectURL(file)
  const baseName = getBaseFileName(file.name)
  const extension = file.name.slice(file.name.lastIndexOf('.') + 1).toUpperCase()

  let title = baseName
  let artist = '未知艺术家'
  let album = '未知专辑'
  let year: number | undefined
  let genre: string | undefined
  let duration = 0
  let coverUrl: string | undefined
  let embeddedLyrics: string | undefined

  const format: TrackFormat = {
    codec: extension,
    lossless: ['FLAC', 'WAV', 'ALAC', 'AIFF'].includes(extension),
  }

  try {
    const metadata = await mm.parseBlob(file)
    const { common, format: fmt } = metadata

    if (common.title) title = common.title
    if (common.artist) artist = common.artist
    if (common.album) album = common.album
    if (common.year) year = common.year
    if (common.genre && common.genre.length > 0) genre = common.genre[0]

    // Check embedded lyrics
    if (common.lyrics && common.lyrics.length > 0) {
      embeddedLyrics = typeof common.lyrics[0] === 'string' ? common.lyrics[0] : (common.lyrics[0] as unknown as { text?: string }).text
    }

    // Cover Art
    if (common.picture && common.picture.length > 0) {
      const pic = common.picture[0]
      const blob = new Blob([pic.data as unknown as BlobPart], { type: pic.format })
      coverUrl = URL.createObjectURL(blob)
    }

    // Audio format details for Hi-Res Glass Badges
    if (fmt.duration) duration = fmt.duration
    if (fmt.sampleRate) format.sampleRate = fmt.sampleRate
    if (fmt.bitsPerSample) format.bitsPerSample = fmt.bitsPerSample
    if (fmt.bitrate) format.bitrate = Math.round(fmt.bitrate)
    if (fmt.codec) format.codec = fmt.codec
    if (fmt.lossless !== undefined) format.lossless = fmt.lossless
    if (fmt.numberOfChannels) format.channels = fmt.numberOfChannels
  } catch (err) {
    console.warn(`Could not parse full metadata for ${file.name}, using fallback:`, err)
  }

  // Fallback duration using Audio element if metadata had 0
  if (!duration || duration <= 0) {
    try {
      duration = await getAudioDuration(url)
    } catch {
      duration = 0
    }
  }

  const rawLyrics = companionLrcText || embeddedLyrics || ''
  const parsedLyrics = rawLyrics ? parseLrc(rawLyrics) : undefined

  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    title,
    artist,
    album,
    year,
    genre,
    duration,
    url,
    file,
    coverUrl,
    lyrics: rawLyrics,
    parsedLyrics,
    format,
    dateAdded: Date.now(),
    isFavorite: false,
    size: file.size,
    fileName: file.name,
  }
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.src = url
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration || 0)
    })
    audio.addEventListener('error', () => {
      resolve(0)
    })
  })
}
