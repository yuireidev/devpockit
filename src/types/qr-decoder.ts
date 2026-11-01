// TypeScript interfaces for QR Code Decoder
// Defines the data structures and types used throughout the decoder

export interface QrDecoderResult {
  id: string
  data: string
  format: QrCodeFormat
  position: QrCodePosition
  confidence: number
  timestamp: number
}

export interface QrCodePosition {
  x: number
  y: number
  width: number
  height: number
}

export type QrCodeFormat = 'text' | 'url' | 'contact' | 'wifi' | 'sms' | 'email' | 'unknown'

export interface QrDecoderOptions {
  cameraEnabled: boolean
  fileUploadEnabled: boolean
  multipleDetection: boolean
  formatDetection: boolean
  showPosition: boolean
}

export interface ParsedQrData {
  type: QrCodeFormat
  data: string
  description?: string
  structured?: {
    title?: string
    description?: string
    fields?: Record<string, string>
  }
}
