import QRCode from 'qrcode'

export type QrCodeType = 'text' | 'url' | 'contact' | 'wifi' | 'sms' | 'email'
export type QrCodeErrorCorrection = 'L' | 'M' | 'Q' | 'H'
export type QrCodeOutputFormat = 'png' | 'svg'

export interface QrCodeOptions {
  type: QrCodeType
  size: number
  errorCorrection: QrCodeErrorCorrection
  format: QrCodeOutputFormat
  margin: number
  color: {
    dark: string
    light: string
  }
}

export interface QrCodeInput {
  text?: string
  url?: string
  contact?: {
    name: string
    phone?: string
    email?: string
    organization?: string
    title?: string
    address?: string
  }
  wifi?: {
    ssid: string
    password: string
    security: 'WPA' | 'WEP' | 'nopass'
    hidden?: boolean
  }
  sms?: {
    phone: string
    message: string
  }
  email?: {
    to: string
    subject?: string
    body?: string
  }
}

export interface QrCodeResult {
  dataUrl: string
  type: QrCodeType
  options: QrCodeOptions
  input: QrCodeInput
  size: number
  errorCorrection: QrCodeErrorCorrection
  format: QrCodeOutputFormat
}

export const DEFAULT_QR_OPTIONS: QrCodeOptions = {
  type: 'text',
  size: 256,
  errorCorrection: 'M',
  format: 'png',
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
}

/**
 * Generate QR code data URL from input
 */
export async function generateQrCode(input: QrCodeInput, options: QrCodeOptions): Promise<QrCodeResult> {
  const { type, size, errorCorrection, format, margin, color } = options

  // Validate input based on type
  validateQrCodeInput(input, type)

  // Generate QR code content based on type
  const content = generateQrCodeContent(input, type)

  // Generate QR code options
  const qrOptions = {
    errorCorrectionLevel: errorCorrection,
    margin: margin,
    color: {
      dark: color.dark,
      light: color.light,
    },
    width: size,
  }

  try {
    const dataUrl = await QRCode.toDataURL(content, qrOptions)

    return {
      dataUrl,
      type,
      options,
      input,
      size,
      errorCorrection,
      format,
    }
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate QR code content based on type and input
 */
export function generateQrCodeContent(input: QrCodeInput, type: QrCodeType): string {
  switch (type) {
    case 'text':
      if (!input.text) {
        throw new Error('Text is required for text QR codes')
      }
      return input.text

    case 'url':
      if (!input.url) {
        throw new Error('URL is required for URL QR codes')
      }
      // Ensure URL has protocol
      return input.url.startsWith('http') ? input.url : `https://${input.url}`

    case 'contact':
      if (!input.contact) {
        throw new Error('Contact information is required for contact QR codes')
      }
      return generateVCardContent(input.contact)

    case 'wifi':
      if (!input.wifi) {
        throw new Error('WiFi information is required for WiFi QR codes')
      }
      return generateWifiContent(input.wifi)

    case 'sms':
      if (!input.sms) {
        throw new Error('SMS information is required for SMS QR codes')
      }
      return generateSmsContent(input.sms)

    case 'email':
      if (!input.email) {
        throw new Error('Email information is required for email QR codes')
      }
      return generateEmailContent(input.email)

    default:
      throw new Error(`Unsupported QR code type: ${type}`)
  }
}

/**
 * Generate vCard content for contact QR codes
 */
function generateVCardContent(contact: QrCodeInput['contact']): string {
  if (!contact) throw new Error('Contact information is required')

  const vcard = ['BEGIN:VCARD', 'VERSION:3.0']

  if (contact.name) vcard.push(`FN:${contact.name}`)
  if (contact.phone) vcard.push(`TEL:${contact.phone}`)
  if (contact.email) vcard.push(`EMAIL:${contact.email}`)
  if (contact.organization) vcard.push(`ORG:${contact.organization}`)
  if (contact.title) vcard.push(`TITLE:${contact.title}`)
  if (contact.address) vcard.push(`ADR:${contact.address}`)

  vcard.push('END:VCARD')

  return vcard.join('\n')
}

/**
 * Generate WiFi content for WiFi QR codes
 */
function generateWifiContent(wifi: QrCodeInput['wifi']): string {
  if (!wifi) throw new Error('WiFi information is required')

  const { ssid, password, security, hidden } = wifi

  return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`
}

/**
 * Generate SMS content for SMS QR codes
 */
function generateSmsContent(sms: QrCodeInput['sms']): string {
  if (!sms) throw new Error('SMS information is required')

  const { phone, message } = sms
  return `sms:${phone}:${message}`
}

/**
 * Generate email content for email QR codes
 */
function generateEmailContent(email: QrCodeInput['email']): string {
  if (!email) throw new Error('Email information is required')

  const { to, subject, body } = email
  let emailContent = `mailto:${to}`

  const params: string[] = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)

  if (params.length > 0) {
    emailContent += `?${params.join('&')}`
  }

  return emailContent
}

/**
 * Validate QR code input based on type
 */
export function validateQrCodeInput(input: QrCodeInput, type: QrCodeType): void {
  switch (type) {
    case 'text':
      if (!input.text || input.text.trim().length === 0) {
        throw new Error('Text is required and cannot be empty')
      }
      if (input.text.length > 2953) {
        throw new Error('Text is too long (maximum 2953 characters)')
      }
      break

    case 'url':
      if (!input.url || input.url.trim().length === 0) {
        throw new Error('URL is required and cannot be empty')
      }
      if (input.url.length > 2048) {
        throw new Error('URL is too long (maximum 2048 characters)')
      }
      break

    case 'contact':
      if (!input.contact || !input.contact.name || input.contact.name.trim().length === 0) {
        throw new Error('Contact name is required')
      }
      break

    case 'wifi':
      if (!input.wifi || !input.wifi.ssid || input.wifi.ssid.trim().length === 0) {
        throw new Error('WiFi SSID is required')
      }
      break

    case 'sms':
      if (!input.sms || !input.sms.phone || input.sms.phone.trim().length === 0) {
        throw new Error('Phone number is required for SMS QR codes')
      }
      if (!input.sms.message) {
        throw new Error('Message is required for SMS QR codes')
      }
      break

    case 'email':
      if (!input.email || !input.email.to || input.email.to.trim().length === 0) {
        throw new Error('Email address is required for email QR codes')
      }
      break

    default:
      throw new Error(`Unsupported QR code type: ${type}`)
  }
}

/**
 * Validate QR code options
 */
export function validateQrCodeOptions(options: QrCodeOptions): void {
  if (options.size < 100 || options.size > 1000) {
    throw new Error('Size must be between 100 and 1000 pixels')
  }

  if (!['L', 'M', 'Q', 'H'].includes(options.errorCorrection)) {
    throw new Error('Error correction must be L, M, Q, or H')
  }

  if (!['png', 'svg'].includes(options.format)) {
    throw new Error('Format must be png or svg')
  }

  if (options.margin < 0 || options.margin > 10) {
    throw new Error('Margin must be between 0 and 10')
  }

  if (!options.color.dark || !options.color.light) {
    throw new Error('Both dark and light colors are required')
  }
}

/**
 * Get QR code statistics
 */
export function getQrCodeStats(result: QrCodeResult): {
  type: QrCodeType
  size: number
  errorCorrection: QrCodeErrorCorrection
  format: QrCodeOutputFormat
  dataUrlLength: number
  estimatedCapacity: number
} {
  const estimatedCapacity = getEstimatedCapacity(result.type, result.errorCorrection)

  return {
    type: result.type,
    size: result.size,
    errorCorrection: result.errorCorrection,
    format: result.format,
    dataUrlLength: result.dataUrl.length,
    estimatedCapacity,
  }
}

/**
 * Get estimated capacity for QR code type and error correction
 */
export function getEstimatedCapacity(type: QrCodeType, errorCorrection: QrCodeErrorCorrection): number {
  const baseCapacity = {
    L: 2953,
    M: 2331,
    Q: 1663,
    H: 1273,
  }

  const typeMultiplier = {
    text: 1,
    url: 0.8,
    contact: 0.6,
    wifi: 0.4,
    sms: 0.5,
    email: 0.7,
  }

  return Math.floor(baseCapacity[errorCorrection] * typeMultiplier[type])
}

/**
 * Download QR code as file
 */
export function downloadQrCode(result: QrCodeResult, filename?: string): void {
  const defaultFilename = `qr-code-${result.type}-${Date.now()}`
  const finalFilename = filename || defaultFilename
  const extension = result.format === 'svg' ? 'svg' : 'png'
  const fullFilename = `${finalFilename}.${extension}`

  const link = document.createElement('a')
  link.href = result.dataUrl
  link.download = fullFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Copy QR code data URL to clipboard
 */
export async function copyQrCodeToClipboard(result: QrCodeResult): Promise<void> {
  try {
    if (result.format === 'svg') {
      // For SVG, we need to extract the SVG content from the data URL
      const svgContent = result.dataUrl.split(',')[1]
      const decodedSvg = atob(svgContent)
      await navigator.clipboard.writeText(decodedSvg)
    } else {
      // For PNG, copy the data URL
      await navigator.clipboard.writeText(result.dataUrl)
    }
  } catch (error) {
    throw new Error(`Failed to copy QR code to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get QR code type from content (basic detection)
 */
export function detectQrCodeType(content: string): QrCodeType {
  if (content.startsWith('http://') || content.startsWith('https://')) {
    return 'url'
  }
  if (content.startsWith('mailto:')) {
    return 'email'
  }
  if (content.startsWith('sms:')) {
    return 'sms'
  }
  if (content.startsWith('WIFI:')) {
    return 'wifi'
  }
  if (content.startsWith('BEGIN:VCARD')) {
    return 'contact'
  }
  return 'text'
}
