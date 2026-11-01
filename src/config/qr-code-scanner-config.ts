import { QrDecoderOptions } from '@/types/qr-decoder'

/**
 * QR Code Scanner Configuration
 * Camera-focused scanning tool configuration
 */

// Default scanner options
export const DEFAULT_QR_SCANNER_OPTIONS: QrDecoderOptions = {
  cameraEnabled: true,
  fileUploadEnabled: false,
  multipleDetection: false,
  formatDetection: true,
  showPosition: true,
}

// Scanning options for different scenarios
export const QR_SCANNER_SCANNING_OPTIONS = {
  desktop: {
    scanInterval: 100,
    qualityThreshold: 0.7,
    resolution: { width: 1280, height: 720 },
  },
  mobile: {
    scanInterval: 150,
    qualityThreshold: 0.5,
    resolution: { width: 640, height: 480 },
  },
  lowPower: {
    scanInterval: 500,
    qualityThreshold: 0.3,
    resolution: { width: 320, height: 240 },
  },
}

// Camera constraints for different devices
export const QR_SCANNER_CAMERA_CONSTRAINTS = {
  desktop: {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
    },
  },
  mobile: {
    video: {
      facingMode: 'environment',
      width: { ideal: 640, max: 1280 },
      height: { ideal: 480, max: 720 },
      frameRate: { ideal: 24, max: 30 },
    },
  },
}

// Scanner-specific examples
export const QR_SCANNER_EXAMPLES = {
  text: {
    title: 'Text QR Code',
    description: 'Simple text message',
    example: 'Hello, World!',
    useCase: 'Sharing messages, notes, or information',
  },
  url: {
    title: 'URL QR Code',
    description: 'Website link',
    example: 'https://example.com',
    useCase: 'Sharing websites, landing pages, or online content',
  },
  wifi: {
    title: 'WiFi QR Code',
    description: 'WiFi network credentials',
    example: 'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;',
    useCase: 'Sharing WiFi access with guests',
  },
  contact: {
    title: 'Contact QR Code',
    description: 'vCard contact information',
    example: 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEND:VCARD',
    useCase: 'Sharing contact details, business cards',
  },
  sms: {
    title: 'SMS QR Code',
    description: 'Text message with phone number',
    example: 'sms:+1234567890:Hello from QR code!',
    useCase: 'Quick messaging, customer service',
  },
  email: {
    title: 'Email QR Code',
    description: 'Email with subject and body',
    example: 'mailto:contact@example.com?subject=Hello&body=Message from QR code',
    useCase: 'Contact forms, feedback, inquiries',
  },
}

// Scanner help and instructions
export const QR_SCANNER_HELP = {
  features: [
    'Real-time QR code scanning with device camera',
    'Automatic focus and flash control',
    'Multiple camera support (front/back)',
    'Instant results with structured data parsing',
    'Export and share functionality',
    'Mobile-optimized interface',
  ],
  tips: [
    'Ensure good lighting for better scanning',
    'Hold device steady for clearer results',
    'Use flash in low-light conditions',
    'Try different angles if scanning fails',
    'Clean camera lens for better performance',
  ],
  troubleshooting: [
    'Camera not working: Check permissions and HTTPS',
    'Blurry results: Clean camera lens and improve lighting',
    'Slow scanning: Reduce quality settings',
    'No results: Ensure QR code is clear and well-lit',
    'Permission denied: Grant camera access in browser settings',
  ],
}

// Usage instructions
export const QR_SCANNER_USAGE_INSTRUCTIONS = {
  camera: [
    'Click "Initialize Camera" to start camera',
    'Grant camera permissions when prompted',
    'Click "Start Scanning" to begin detection',
    'Point camera at QR code for instant results',
    'Use camera controls for better scanning',
  ],
  mobile: [
    'Use back camera for better QR code scanning',
    'Enable flash in low-light conditions',
    'Hold device steady for clear results',
    'Try different angles if scanning fails',
  ],
  accessibility: [
    'Use keyboard shortcuts for camera controls',
    'Screen reader support for results',
    'High contrast mode available',
    'Voice announcements for scan results',
  ],
}

// Error messages specific to scanner
export const QR_SCANNER_ERROR_MESSAGES = {
  cameraNotSupported: 'Camera is not supported on this device',
  cameraPermissionDenied: 'Camera permission denied. Please grant access.',
  cameraInUse: 'Camera is already in use by another application',
  cameraInitializationFailed: 'Failed to initialize camera. Please try again.',
  scanningFailed: 'Failed to start scanning. Check camera connection.',
  noResultsFound: 'No QR codes detected. Try adjusting camera angle.',
  lowQuality: 'QR code quality is too low. Improve lighting or distance.',
  networkError: 'Network error occurred during scanning',
  validationError: 'Invalid QR code data detected',
  memoryError: 'Insufficient memory for camera operation',
  processingError: 'Error processing camera stream',
}

// Success messages
export const QR_SCANNER_SUCCESS_MESSAGES = {
  cameraInitialized: 'Camera initialized successfully',
  scanningStarted: 'Scanning started. Point camera at QR code.',
  qrDetected: 'QR code detected successfully',
  resultAdded: 'Result added to list',
  cameraSwitched: 'Camera switched successfully',
  flashToggled: 'Flash toggled successfully',
  focusAdjusted: 'Camera focus adjusted',
}

// Loading messages
export const QR_SCANNER_LOADING_MESSAGES = {
  initializingCamera: 'Initializing camera...',
  startingScan: 'Starting scan...',
  processingResult: 'Processing result...',
  switchingCamera: 'Switching camera...',
  adjustingSettings: 'Adjusting settings...',
}

// State definitions
export const QR_SCANNER_STATE_DEFINITIONS = {
  idle: 'Ready to scan',
  cameraInitializing: 'Setting up camera',
  scanning: 'Actively scanning for QR codes',
  qrDetected: 'QR code found and processed',
  error: 'An error occurred',
  success: 'Operation completed successfully',
}

// User feedback messages
export const QR_SCANNER_USER_FEEDBACK = {
  hints: ['Point camera at QR code', 'Hold device steady', 'Ensure good lighting', 'Try different angles'],
  encouragements: ['Great! QR code detected', 'Perfect scan!', 'Excellent quality', 'Well done!'],
  warnings: [
    'Low light detected - try flash',
    'Camera shaking - hold steady',
    'Poor quality - move closer',
    'No QR code in view',
  ],
}

// Browser support information
export const QR_SCANNER_SUPPORTED_BROWSERS = {
  chrome: 'Full support with all features',
  safari: 'Full support on iOS/macOS',
  firefox: 'Full support with camera access',
  edge: 'Full support on Windows',
  mobile: 'Supported on modern mobile browsers',
}

// Best practices
export const QR_SCANNER_BEST_PRACTICES = {
  lighting: 'Use adequate lighting for better scanning',
  distance: 'Maintain 6-12 inches from QR code',
  angle: 'Hold device perpendicular to QR code',
  stability: 'Keep device steady during scanning',
  quality: 'Ensure QR code is clear and undamaged',
  environment: 'Avoid reflective surfaces and glare',
}

// Configuration object
export const QR_SCANNER_CONFIG = {
  DEFAULT_OPTIONS: DEFAULT_QR_SCANNER_OPTIONS,
  SCANNING_OPTIONS: QR_SCANNER_SCANNING_OPTIONS,
  CAMERA_CONSTRAINTS: QR_SCANNER_CAMERA_CONSTRAINTS,
  EXAMPLES: QR_SCANNER_EXAMPLES,
  HELP: QR_SCANNER_HELP,
  USAGE_INSTRUCTIONS: QR_SCANNER_USAGE_INSTRUCTIONS,
  ERROR_MESSAGES: QR_SCANNER_ERROR_MESSAGES,
  SUCCESS_MESSAGES: QR_SCANNER_SUCCESS_MESSAGES,
  LOADING_MESSAGES: QR_SCANNER_LOADING_MESSAGES,
  STATE_DEFINITIONS: QR_SCANNER_STATE_DEFINITIONS,
  USER_FEEDBACK: QR_SCANNER_USER_FEEDBACK,
  SUPPORTED_BROWSERS: QR_SCANNER_SUPPORTED_BROWSERS,
  BEST_PRACTICES: QR_SCANNER_BEST_PRACTICES,
}
