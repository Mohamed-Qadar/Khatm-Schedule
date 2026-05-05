export function sanitizeFileName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0080-\uFFFF]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  link.click()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
