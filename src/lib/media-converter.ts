export type MediaType = 'youtube' | 'drive-video' | 'drive-image' | 'drive-file'

export interface ConvertedMedia {
  type: MediaType
  embedUrl?: string
  downloadUrl?: string
  thumbnailUrl?: string
  originalUrl: string
}

export function convertMediaUrl(url: string): ConvertedMedia {
  const result: ConvertedMedia = {
    type: 'drive-file',
    originalUrl: url,
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    result.type = 'youtube'
    const videoId = extractYouTubeId(url)
    if (videoId) {
      result.embedUrl = `https://www.youtube.com/embed/${videoId}`
      result.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return result
  }

  if (url.includes('drive.google.com')) {
    const fileId = extractGoogleDriveFileId(url)
    if (!fileId) return result

    if (url.includes('/file/d/') || url.includes('view')) {
      const mimeType = detectDriveMimeType(url)

      if (mimeType === 'video') {
        result.type = 'drive-video'
        result.embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
      } else if (mimeType === 'image') {
        result.type = 'drive-image'
        result.embedUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
        result.thumbnailUrl = result.embedUrl
      } else {
        result.type = 'drive-file'
        result.downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
      }
    }
  }

  return result
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

function extractGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([^\/\?]+)/,
    /id=([^&\n?#]+)/,
    /\/d\/([^\/\?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

function detectDriveMimeType(url: string): 'video' | 'image' | 'file' {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes('video') || lowerUrl.includes('.mp4') || lowerUrl.includes('.mov')) {
    return 'video'
  }

  if (lowerUrl.includes('image') || lowerUrl.includes('.jpg') || lowerUrl.includes('.png') || lowerUrl.includes('.jpeg')) {
    return 'image'
  }

  return 'file'
}

export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/')
    return segments[segments.length - 1] || 'arquivo'
  } catch {
    return 'arquivo'
  }
}
