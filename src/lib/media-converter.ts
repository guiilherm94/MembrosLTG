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

    // Always provide both preview and download URLs for Drive files
    result.embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
    result.downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`

    // For now, treat all Drive files as videos for embedding
    // Images and other files will use downloadUrl
    result.type = 'drive-video'
  }

  return result
}

// Helper function to convert any Drive link to direct download URL
export function getDriveDirectDownload(url: string): string {
  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`
  }
  return url
}

// Helper function to convert any Drive link to preview/view URL
export function getDriveDirectView(url: string): string {
  const fileId = extractGoogleDriveFileId(url)
  if (fileId) {
    // Use thumbnail API with large size for better image display
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
  }
  return url
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
