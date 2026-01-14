import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// Fallback copy function for HTTP/non-secure contexts
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Try modern API first (if available and secure context)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      console.warn("Clipboard API failed, trying fallback...", e)
    }
  }

  // Fallback using legacy execCommand
  try {
    const textArea = document.createElement("textarea")
    textArea.value = text

    // Ensure it's not visible but part of DOM
    textArea.style.position = "fixed"
    textArea.style.left = "-9999px"
    textArea.style.top = "0"
    textArea.setAttribute('readonly', '')

    document.body.appendChild(textArea)

    // Select text (critical for mobile)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, 99999) // For mobile devices

    const success = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (success) {
      return true
    } else {
      console.warn('execCommand returned false')
      return false
    }
  } catch (err) {
    console.error('Fallback copy failed', err)
    return false
  }
}

// Helper to get image URL (forces proxy for local uploads)
// This bypasses static file serving issues in Docker/Standalone
export function getImageUrl(src: string | undefined | null): string {
  if (!src) return "/placeholder.svg"

  // If it's a local upload, force it through our proxy API
  // The rewrite in next.config.mjs might fail in some docker setups
  // so we change the URL explicitly on the client.
  if (src.startsWith('/uploads/')) {
    return src.replace('/uploads/', '/api/image-proxy/')
  }

  return src
}
