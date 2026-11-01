// Global type definitions for DevPockit
// Camera and media access types for QR code decoder

declare global {
  interface Navigator {
    mediaDevices: MediaDevices
  }

  interface MediaDevices {
    getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>
    enumerateDevices(): Promise<MediaDeviceInfo[]>
  }

  interface MediaStreamConstraints {
    video?: boolean | MediaTrackConstraints
    audio?: boolean | MediaTrackConstraints
  }

  interface MediaTrackConstraints {
    width?: number | ConstrainULongRange
    height?: number | ConstrainULongRange
    facingMode?: string | ConstrainDOMString
    deviceId?: string | ConstrainDOMString
    torch?: boolean
    focusMode?: string | ConstrainDOMString
  }

  interface ConstrainULongRange {
    min?: number
    max?: number
    ideal?: number
  }

  interface ConstrainDoubleRange {
    min?: number
    max?: number
    ideal?: number
  }

  interface ConstrainDOMString {
    exact?: string
    ideal?: string
  }

  interface MediaDeviceInfo {
    deviceId: string
    kind: string
    label: string
    groupId: string
  }

  interface MediaTrackCapabilities {
    width?: ConstrainULongRange
    height?: ConstrainULongRange
    aspectRatio?: ConstrainDoubleRange
    frameRate?: ConstrainDoubleRange
    facingMode?: string[]
    deviceId?: string
    groupId?: string
    torch?: boolean
    focusMode?: string[]
  }

  interface MediaTrackSettings {
    width?: number
    height?: number
    aspectRatio?: number
    frameRate?: number
    facingMode?: string
    deviceId?: string
    groupId?: string
    torch?: boolean
    focusMode?: string
  }

  // QR Scanner types
  interface QrScanner {
    start(): Promise<void>
    stop(): void
    destroy(): void
    hasCamera(): Promise<boolean>
    getCapabilities(): MediaTrackCapabilities
  }

  // Camera permission states
  type CameraPermissionState = 'granted' | 'denied' | 'prompt'
}

export {}
