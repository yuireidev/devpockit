// QR Code Decoder Configuration
// Configuration options, examples, and help text for the QR decoder tool

import { QrDecoderOptions } from '@/types/qr-decoder'

export const DEFAULT_QR_DECODER_OPTIONS: QrDecoderOptions = {
  cameraEnabled: true,
  fileUploadEnabled: true,
  multipleDetection: true,
  formatDetection: true,
  showPosition: true,
}

export const QR_DECODER_SCANNING_OPTIONS = {
  desktop: {
    scanIntervalMs: 300,
    maxResults: 5,
    qualityThreshold: 0.5,
    enableMultipleDetection: true,
  },
  mobile: {
    scanIntervalMs: 400,
    maxResults: 3,
    qualityThreshold: 0.3,
    enableMultipleDetection: true,
  },
  lowPower: {
    scanIntervalMs: 800,
    maxResults: 1,
    qualityThreshold: 0.7,
    enableMultipleDetection: false,
  },
}

export const QR_DECODER_CAMERA_CONSTRAINTS = {
  desktop: {
    video: {
      facingMode: 'environment',
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
      frameRate: { ideal: 15, max: 30 },
    },
  },
}

export const QR_DECODER_EXAMPLES = {
  text: {
    content: 'Hello, World!',
    description: 'Simple text message',
    useCase: 'Notes, instructions, or any text content',
  },
  url: {
    content: 'https://example.com',
    description: 'Website URL',
    useCase: 'Quick access to websites, social media, or online resources',
  },
  contact: {
    content:
      'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nORG:Example Corp\nEND:VCARD',
    description: 'Contact information (vCard)',
    useCase: 'Business cards, contact sharing, networking',
  },
  wifi: {
    content: 'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;',
    description: 'WiFi network credentials',
    useCase: 'Guest WiFi access, network sharing, public WiFi',
  },
  sms: {
    content: 'sms:+1234567890:Hello from QR code!',
    description: 'SMS message',
    useCase: 'Quick messaging, contact sharing, promotional messages',
  },
  email: {
    content: 'mailto:example@email.com?subject=Hello&body=Message from QR code',
    description: 'Email message',
    useCase: 'Contact forms, feedback, promotional emails',
  },
  location: {
    content: 'geo:37.7749,-122.4194,100',
    description: 'GPS coordinates',
    useCase: 'Location sharing, navigation, event venues',
  },
  calendar: {
    content: 'BEGIN:VEVENT\nSUMMARY:Meeting\nDTSTART:20240101T100000Z\nDTEND:20240101T110000Z\nEND:VEVENT',
    description: 'Calendar event',
    useCase: 'Event invitations, meeting scheduling, appointments',
  },
}

export const QR_DECODER_FORMAT_DESCRIPTIONS = {
  text: {
    title: 'Text Content',
    icon: '📝',
    description: 'Plain text messages, notes, or any text-based information',
    examples: ['Hello World', 'Meeting notes', 'Instructions'],
  },
  url: {
    title: 'Website URL',
    icon: '🌐',
    description: 'Web addresses and links to online resources',
    examples: ['https://example.com', 'https://github.com/user/repo', 'https://youtube.com/watch?v=...'],
  },
  contact: {
    title: 'Contact Information',
    icon: '👤',
    description: 'Contact details in vCard format for easy contact sharing',
    examples: ['Business cards', 'Contact sharing', 'Networking'],
  },
  wifi: {
    title: 'WiFi Network',
    icon: '📶',
    description: 'WiFi network credentials for automatic connection',
    examples: ['Guest WiFi', 'Public networks', 'Home WiFi sharing'],
  },
  sms: {
    title: 'SMS Message',
    icon: '💬',
    description: 'Text messages with pre-filled content and recipient',
    examples: ['Quick messaging', 'Contact sharing', 'Promotional messages'],
  },
  email: {
    title: 'Email Message',
    icon: '📧',
    description: 'Email messages with pre-filled content and recipient',
    examples: ['Contact forms', 'Feedback', 'Promotional emails'],
  },
  unknown: {
    title: 'Unknown Format',
    icon: '❓',
    description: 'QR code content that could not be automatically categorized',
    examples: ['Custom formats', 'Encoded data', 'Specialized applications'],
  },
}

export const QR_DECODER_HELP = {
  title: 'QR Code Decoder',
  description: 'Decode QR codes from images or camera with support for multiple formats',
  features: [
    'Upload images (PNG, JPG, WebP, GIF) to decode QR codes',
    'Real-time camera scanning with live preview',
    'Support for text, URL, contact, WiFi, SMS, and email QR codes',
    'Multiple QR code detection in single image',
    'Mobile-optimized interface with touch controls',
    'Copy decoded content to clipboard',
    'Format detection and structured data display',
    'Camera controls (switch, flash, focus)',
    'Orientation handling for mobile devices',
    'Performance optimization for different devices',
  ],
  tips: [
    'Ensure good lighting when using camera scanning',
    'Hold device steady for better QR code detection',
    'Supported image formats: PNG, JPG, WebP, GIF',
    'Camera permission is required for real-time scanning',
    'Multiple QR codes can be detected in a single image',
    'Decoded content can be copied to clipboard',
    'Use flash in low-light conditions for better scanning',
    'Switch between front and back cameras as needed',
    'Focus camera manually for better QR code detection',
    'Mobile devices are automatically optimized for performance',
  ],
  troubleshooting: [
    'Camera not working: Check browser permissions and try refreshing',
    'Poor scanning quality: Ensure good lighting and steady hands',
    'No QR code detected: Try different angles or lighting conditions',
    'Image upload fails: Check file format and size (max 10MB)',
    'Mobile issues: Ensure device supports camera access',
    'Performance issues: Close other camera-using applications',
  ],
}

export const QR_DECODER_ERROR_MESSAGES = {
  // Camera errors
  noCamera: 'Camera not available on this device',
  permissionDenied: 'Camera permission denied. Please allow camera access.',
  cameraInUse: 'Camera is already in use by another application',
  cameraNotSupported: 'Camera access is not supported on this device',
  cameraInitializationFailed: 'Failed to initialize camera. Please try again.',
  cameraStreamFailed: 'Camera stream failed to start. Please check your camera.',
  cameraPermissionBlocked: 'Camera permission is blocked. Please enable it in browser settings.',

  // File upload errors
  invalidImage: 'Invalid image format. Please use PNG, JPG, WebP, or GIF.',
  fileTooLarge: 'Image file is too large. Please use a smaller image (max 10MB).',
  fileTooSmall: 'Image file is too small. Please use a larger image.',
  fileCorrupted: 'Image file appears to be corrupted. Please try a different image.',
  fileReadError: 'Failed to read image file. Please try a different image.',
  unsupportedFormat: 'Unsupported image format. Please use PNG, JPG, WebP, or GIF.',
  fileNotFound: 'Image file not found. Please select a valid image.',

  // Scanning errors
  noQrCode: 'No QR code found in the image',
  scanError: 'Error scanning QR code. Please try again.',
  multipleScanError: 'Error scanning multiple QR codes. Please try again.',
  qrCodeDamaged: 'QR code appears to be damaged or unreadable.',
  qrCodeTooSmall: 'QR code is too small to detect. Please try a larger image.',
  qrCodeTooLarge: 'QR code is too large. Please try a smaller image or crop the area.',
  lowQualityImage: 'Image quality is too low for QR code detection.',

  // Network errors
  networkError: 'Network error occurred. Please check your connection.',
  timeoutError: 'Operation timed out. Please try again.',
  connectionLost: 'Connection lost. Please check your internet connection.',

  // Validation errors
  invalidQrData: 'Invalid QR code data detected.',
  qrDataTooLong: 'QR code data is too long to process.',
  qrDataEmpty: 'QR code contains no data.',

  // General errors
  unknownError: 'An unexpected error occurred. Please try again.',
  browserNotSupported: 'Your browser does not support this feature.',
  deviceNotSupported: 'Your device does not support this feature.',
  featureNotAvailable: 'This feature is not available on your device.',
  memoryError: 'Insufficient memory to process the image.',
  processingError: 'Error processing the request. Please try again.',
}

export const QR_DECODER_SUCCESS_MESSAGES = {
  // Detection success
  qrDetected: 'QR code detected successfully!',
  multipleQrDetected: 'Multiple QR codes detected!',
  qrCodeScanned: 'QR code scanned successfully!',
  contentDecoded: 'Content decoded successfully!',

  // Camera success
  cameraInitialized: 'Camera initialized successfully!',
  cameraStarted: 'Camera started successfully!',
  cameraSwitched: 'Camera switched successfully!',
  cameraFocused: 'Camera focused successfully!',
  flashToggled: 'Flash toggled successfully!',

  // File processing success
  imageProcessed: 'Image processed successfully!',
  imageUploaded: 'Image uploaded successfully!',
  fileValidated: 'File validated successfully!',

  // User actions success
  contentCopied: 'Content copied to clipboard!',
  contentDownloaded: 'Content downloaded successfully!',
  contentShared: 'Content shared successfully!',
  settingsSaved: 'Settings saved successfully!',

  // General success
  scanCompleted: 'Scan completed successfully!',
  operationCompleted: 'Operation completed successfully!',
  readyToScan: 'Ready to scan QR codes!',
  allSystemsReady: 'All systems ready!',
}

export const QR_DECODER_LOADING_MESSAGES = {
  // Camera loading states
  initializingCamera: 'Initializing camera...',
  requestingPermission: 'Requesting camera permission...',
  startingCamera: 'Starting camera...',
  switchingCamera: 'Switching camera...',
  focusingCamera: 'Focusing camera...',
  togglingFlash: 'Toggling flash...',

  // File processing loading states
  processingImage: 'Processing image...',
  uploadingFile: 'Uploading file...',
  validatingFile: 'Validating file...',
  readingImage: 'Reading image...',
  analyzingImage: 'Analyzing image...',

  // Scanning loading states
  scanningQrCode: 'Scanning for QR codes...',
  detectingFormats: 'Detecting QR code formats...',
  parsingContent: 'Parsing content...',
  validatingData: 'Validating data...',

  // User action loading states
  copyingContent: 'Copying content to clipboard...',
  downloadingContent: 'Downloading content...',
  sharingContent: 'Sharing content...',
  savingSettings: 'Saving settings...',

  // General loading states
  loading: 'Loading...',
  processing: 'Processing...',
  working: 'Working...',
  pleaseWait: 'Please wait...',
}

export const QR_DECODER_STATE_DEFINITIONS = {
  idle: {
    title: 'Ready to Scan',
    description: 'QR decoder is ready. Choose camera scanning or file upload.',
    icon: '🎯',
    color: 'blue',
  },
  cameraInitializing: {
    title: 'Initializing Camera',
    description: 'Setting up camera for QR code scanning...',
    icon: '📷',
    color: 'yellow',
  },
  cameraScanning: {
    title: 'Scanning',
    description: 'Point your camera at a QR code to scan...',
    icon: '🔍',
    color: 'green',
  },
  fileProcessing: {
    title: 'Processing Image',
    description: 'Analyzing uploaded image for QR codes...',
    icon: '🖼️',
    color: 'yellow',
  },
  qrDetected: {
    title: 'QR Code Detected',
    description: 'QR code found! Decoding content...',
    icon: '✅',
    color: 'green',
  },
  error: {
    title: 'Error',
    description: 'An error occurred. Please try again.',
    icon: '❌',
    color: 'red',
  },
  success: {
    title: 'Success',
    description: 'QR code decoded successfully!',
    icon: '🎉',
    color: 'green',
  },
}

export const QR_DECODER_USER_FEEDBACK = {
  hints: [
    'Hold your device steady for better scanning',
    'Ensure good lighting for optimal detection',
    "Try different angles if QR code isn't detected",
    'Use flash in low-light conditions',
    'Clean your camera lens for better quality',
  ],
  encouragements: [
    'Great! Keep the QR code in view',
    'Almost there! Hold steady...',
    'Perfect! QR code detected',
    'Excellent scanning!',
    'Well done! Content decoded successfully',
  ],
  warnings: [
    'QR code is too far away - move closer',
    'QR code is too close - move back',
    'Lighting is too dim - try using flash',
    'QR code is blurry - hold device steady',
    'Multiple QR codes detected - focus on one',
  ],
}

export const QR_DECODER_USAGE_INSTRUCTIONS = {
  camera: {
    title: 'Using Camera Scanning',
    steps: [
      'Click the "Camera Scan" button to start camera scanning',
      'Allow camera permission when prompted by your browser',
      'Point your camera at a QR code',
      'Hold steady until the QR code is detected',
      'The decoded content will appear automatically',
      'Use camera controls to switch cameras, toggle flash, or focus',
    ],
    tips: [
      'Ensure good lighting for better detection',
      'Hold the device steady while scanning',
      "Try different angles if the QR code isn't detected",
      'Use flash in low-light conditions',
      'Switch between front and back cameras as needed',
    ],
  },
  fileUpload: {
    title: 'Using File Upload',
    steps: [
      'Click the "Upload Image" button or drag and drop an image',
      'Select an image file (PNG, JPG, WebP, or GIF)',
      'Wait for the image to be processed',
      'View the decoded QR code content',
      'Copy or download the results as needed',
    ],
    tips: [
      'Supported formats: PNG, JPG, WebP, GIF',
      'Maximum file size: 10MB',
      'Higher resolution images work better',
      'Ensure the QR code is clearly visible in the image',
      'Try cropping the image to focus on the QR code',
    ],
  },
  mobile: {
    title: 'Mobile Device Usage',
    steps: [
      'Open the QR decoder in your mobile browser',
      'Tap the camera button to start scanning',
      'Allow camera permission when prompted',
      'Point your camera at the QR code',
      'The app will automatically detect and decode the QR code',
      'Tap on results to copy or share content',
    ],
    tips: [
      'Use landscape mode for better scanning',
      'Enable auto-rotate for optimal viewing',
      'Close other camera apps for better performance',
      'Use the flash in dark environments',
      'Hold the device steady for better detection',
    ],
  },
  accessibility: {
    title: 'Accessibility Features',
    features: [
      'Keyboard navigation support',
      'Screen reader compatibility',
      'High contrast mode support',
      'Large touch targets for mobile',
      'Voice announcements for results',
      'Alternative text for all images',
    ],
    keyboardShortcuts: [
      'Tab: Navigate between controls',
      'Enter/Space: Activate buttons',
      'Escape: Close dialogs or stop scanning',
      'Ctrl+C: Copy decoded content',
      'Ctrl+V: Paste image from clipboard',
    ],
  },
}

export const QR_DECODER_TROUBLESHOOTING = {
  camera: {
    title: 'Camera Issues',
    problems: [
      {
        issue: 'Camera not working',
        solutions: [
          'Check browser permissions in settings',
          'Refresh the page and try again',
          'Close other applications using the camera',
          'Try a different browser',
          'Restart your device',
        ],
      },
      {
        issue: 'Poor scanning quality',
        solutions: [
          'Ensure good lighting conditions',
          'Hold the device steady',
          'Clean the camera lens',
          'Try different angles',
          'Use flash in low-light conditions',
        ],
      },
      {
        issue: 'Permission denied',
        solutions: [
          'Click the camera icon in the address bar',
          'Allow camera access in browser settings',
          'Check system privacy settings',
          'Try refreshing the page',
          'Use a different browser if needed',
        ],
      },
    ],
  },
  fileUpload: {
    title: 'File Upload Issues',
    problems: [
      {
        issue: 'File upload fails',
        solutions: [
          'Check file format (PNG, JPG, WebP, GIF only)',
          'Ensure file size is under 10MB',
          'Try a different image file',
          'Check internet connection',
          'Refresh the page and try again',
        ],
      },
      {
        issue: 'No QR code detected',
        solutions: [
          'Ensure the QR code is clearly visible',
          'Try a higher resolution image',
          'Check if the QR code is damaged',
          'Try cropping the image to focus on the QR code',
          'Ensure good contrast between QR code and background',
        ],
      },
    ],
  },
  performance: {
    title: 'Performance Issues',
    problems: [
      {
        issue: 'Slow scanning',
        solutions: [
          'Close other camera applications',
          'Reduce browser tab count',
          'Restart your device',
          'Try a different browser',
          'Check available memory and CPU usage',
        ],
      },
      {
        issue: 'Battery drain',
        solutions: [
          'Use low-power mode for scanning',
          'Close other applications',
          'Reduce screen brightness',
          'Use file upload instead of camera when possible',
          'Take breaks between scanning sessions',
        ],
      },
    ],
  },
}

export const QR_DECODER_BEST_PRACTICES = {
  scanning: [
    'Hold the device steady while scanning',
    'Ensure good lighting conditions',
    'Keep the QR code within the scanning area',
    'Try different angles if detection fails',
    'Use flash in low-light environments',
  ],
  fileUpload: [
    'Use high-resolution images for better detection',
    'Ensure QR code is clearly visible and not damaged',
    'Crop images to focus on the QR code area',
    'Use supported file formats (PNG, JPG, WebP, GIF)',
    'Keep file sizes reasonable (under 10MB)',
  ],
  mobile: [
    'Use landscape mode for better scanning experience',
    'Enable auto-rotate for optimal viewing',
    'Close other camera applications before scanning',
    'Use the back camera for better quality',
    'Hold the device with both hands for stability',
  ],
  security: [
    'Only scan QR codes from trusted sources',
    'Be cautious with QR codes in public places',
    'Check the decoded content before taking action',
    "Don't scan QR codes that look suspicious",
    'Use official apps when possible for sensitive operations',
  ],
}

export const QR_DECODER_SUPPORTED_BROWSERS = {
  desktop: ['Chrome 60+', 'Firefox 55+', 'Safari 11+', 'Edge 79+', 'Opera 47+'],
  mobile: ['Chrome Mobile 60+', 'Safari iOS 11+', 'Firefox Mobile 55+', 'Samsung Internet 8+', 'Edge Mobile 79+'],
  requirements: [
    'Camera access support',
    'getUserMedia API support',
    'Canvas API support',
    'Modern JavaScript features',
    'HTTPS connection (required for camera access)',
  ],
}
