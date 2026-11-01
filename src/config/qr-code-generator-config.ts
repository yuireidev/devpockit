import { QrCodeErrorCorrection, QrCodeOutputFormat, QrCodeType } from '@/libs/qr-code-generator'

export const QR_CODE_TYPES: { value: QrCodeType; label: string; symbol: string; description: string }[] = [
  {
    value: 'text',
    label: 'Text',
    symbol: '📝',
    description: 'Plain text content',
  },
  {
    value: 'url',
    label: 'URL',
    symbol: '🌐',
    description: 'Web addresses and links',
  },
  {
    value: 'contact',
    label: 'Contact',
    symbol: '👤',
    description: 'Contact information (vCard format)',
  },
  {
    value: 'wifi',
    label: 'WiFi',
    symbol: '📶',
    description: 'WiFi network credentials',
  },
  {
    value: 'sms',
    label: 'SMS',
    symbol: '💬',
    description: 'Text message with phone number',
  },
  {
    value: 'email',
    label: 'Email',
    symbol: '📧',
    description: 'Email with subject and body',
  },
]

export const QR_CODE_ERROR_CORRECTIONS: {
  value: QrCodeErrorCorrection
  label: string
  symbol: string
  description: string
  capacity: number
}[] = [
  {
    value: 'L',
    label: 'Low (7%)',
    symbol: '🟢',
    description: 'Low error correction, maximum capacity',
    capacity: 2953,
  },
  {
    value: 'M',
    label: 'Medium (15%)',
    symbol: '🟡',
    description: 'Medium error correction, good balance',
    capacity: 2331,
  },
  {
    value: 'Q',
    label: 'Quartile (25%)',
    symbol: '🟠',
    description: 'High error correction, good for damaged codes',
    capacity: 1663,
  },
  {
    value: 'H',
    label: 'High (30%)',
    symbol: '🔴',
    description: 'Highest error correction, maximum reliability',
    capacity: 1273,
  },
]

export const QR_CODE_FORMATS: { value: QrCodeOutputFormat; label: string; symbol: string; description: string }[] = [
  {
    value: 'png',
    label: 'PNG',
    symbol: '🖼️',
    description: 'Raster image format, good for photos',
  },
  {
    value: 'svg',
    label: 'SVG',
    symbol: '📐',
    description: 'Vector format, scalable and editable',
  },
]

export const QR_CODE_SIZES = [
  { value: 128, label: '128px', description: 'Small, good for mobile' },
  { value: 256, label: '256px', description: 'Medium, standard size' },
  { value: 512, label: '512px', description: 'Large, high quality' },
  { value: 1024, label: '1024px', description: 'Extra large, print quality' },
]

export const DEFAULT_QR_OPTIONS = {
  type: 'text' as QrCodeType,
  size: 256,
  errorCorrection: 'M' as QrCodeErrorCorrection,
  format: 'png' as QrCodeOutputFormat,
  margin: 4,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
}

export const QR_CODE_EXAMPLES = {
  text: {
    name: 'Simple Text',
    description: 'Generate QR code for plain text',
    input: {
      text: 'Hello, World! This is a QR code for text content.',
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'text' as const },
  },
  url: {
    name: 'Website URL',
    description: 'Generate QR code for a website',
    input: {
      url: 'https://devpockit.com',
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'url' as const },
  },
  contact: {
    name: 'Contact Card',
    description: 'Generate QR code for contact information',
    input: {
      contact: {
        name: 'John Doe',
        phone: '+1-555-123-4567',
        email: 'john.doe@example.com',
        organization: 'DevPockit',
        title: 'Software Developer',
        address: '123 Main St, City, State 12345',
      },
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'contact' as const },
  },
  wifi: {
    name: 'WiFi Network',
    description: 'Generate QR code for WiFi credentials',
    input: {
      wifi: {
        ssid: 'MyWiFiNetwork',
        password: 'securepassword123',
        security: 'WPA' as const,
        hidden: false,
      },
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'wifi' as const },
  },
  sms: {
    name: 'SMS Message',
    description: 'Generate QR code for SMS',
    input: {
      sms: {
        phone: '+1-555-123-4567',
        message: 'Hello! This is a test message.',
      },
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'sms' as const },
  },
  email: {
    name: 'Email Message',
    description: 'Generate QR code for email',
    input: {
      email: {
        to: 'contact@example.com',
        subject: 'Hello from QR Code',
        body: 'This is a test email generated from a QR code.',
      },
    },
    options: { ...DEFAULT_QR_OPTIONS, type: 'email' as const },
  },
}

export const QR_CODE_COLOR_PRESETS = [
  {
    name: 'Classic',
    dark: '#000000',
    light: '#FFFFFF',
    description: 'Black and white, maximum contrast',
  },
  {
    name: 'Blue',
    dark: '#1E40AF',
    light: '#F8FAFC',
    description: 'Professional blue theme',
  },
  {
    name: 'Green',
    dark: '#059669',
    light: '#F0FDF4',
    description: 'Nature-inspired green',
  },
  {
    name: 'Purple',
    dark: '#7C3AED',
    light: '#FAF5FF',
    description: 'Creative purple theme',
  },
  {
    name: 'Red',
    dark: '#DC2626',
    light: '#FEF2F2',
    description: 'Bold red theme',
  },
  {
    name: 'Orange',
    dark: '#EA580C',
    light: '#FFF7ED',
    description: 'Energetic orange theme',
  },
]

export const QR_CODE_SIZE_LIMITS = {
  min: 100,
  max: 1000,
  default: 256,
  step: 32,
}

export const QR_CODE_MARGIN_OPTIONS = [
  { value: 0, label: 'None', description: 'No margin' },
  { value: 1, label: 'Minimal', description: '1 module margin' },
  { value: 2, label: 'Small', description: '2 module margin' },
  { value: 4, label: 'Standard', description: '4 module margin (recommended)' },
  { value: 6, label: 'Large', description: '6 module margin' },
  { value: 8, label: 'Extra Large', description: '8 module margin' },
]

export const QR_CODE_VALIDATION_RULES = {
  text: {
    maxLength: 2953,
    minLength: 1,
    description: 'Plain text content',
  },
  url: {
    maxLength: 2048,
    minLength: 1,
    description: 'Web addresses and links',
  },
  contact: {
    required: ['name'],
    optional: ['phone', 'email', 'organization', 'title', 'address'],
    description: 'Contact information in vCard format',
  },
  wifi: {
    required: ['ssid'],
    optional: ['password', 'security', 'hidden'],
    description: 'WiFi network credentials',
  },
  sms: {
    required: ['phone', 'message'],
    optional: [],
    description: 'SMS message with phone number',
  },
  email: {
    required: ['to'],
    optional: ['subject', 'body'],
    description: 'Email message',
  },
}

export const QR_CODE_TOOL_DESCRIPTIONS = {
  text: 'Generate QR codes for plain text content. Perfect for simple messages, notes, or any text-based information.',
  url: 'Create QR codes for web addresses and links. Users can scan to quickly visit websites, social media profiles, or online resources.',
  contact:
    'Generate QR codes for contact information using vCard format. Perfect for business cards, networking, and contact sharing.',
  wifi: 'Create QR codes for WiFi network credentials. Users can scan to automatically connect to WiFi networks without typing passwords.',
  sms: 'Generate QR codes for SMS messages. Users can scan to quickly send text messages with pre-filled content.',
  email:
    'Create QR codes for email messages. Users can scan to quickly compose emails with pre-filled recipients, subjects, and content.',
}

export const QR_CODE_USE_CASES = {
  text: ['Event information', 'Instructions', 'Notes', 'Simple messages'],
  url: ['Website links', 'Social media profiles', 'Online resources', 'Documentation'],
  contact: ['Business cards', 'Networking', 'Contact sharing', 'Event attendees'],
  wifi: ['Guest networks', 'Public WiFi', 'Event WiFi', 'Home networks'],
  sms: ['Quick messages', 'Support requests', 'Feedback', 'Emergency contacts'],
  email: ['Contact forms', 'Support requests', 'Newsletter signup', 'Feedback'],
}

export const QR_CODE_TIPS = [
  'Higher error correction levels make QR codes more reliable but reduce capacity',
  'Larger QR codes are easier to scan but take up more space',
  'Use high contrast colors (dark on light) for better scanning',
  'Test your QR codes with different devices and lighting conditions',
  'Consider the scanning distance when choosing QR code size',
  'PNG format is better for photos, SVG is better for scalable graphics',
  'WiFi QR codes work best with WPA/WPA2 security',
  'Contact QR codes use vCard format for maximum compatibility',
]

export const QR_CODE_HELP = {
  title: 'QR Code Generator',
  description: 'Generate QR codes for text, URLs, contacts, WiFi, SMS, and email with customizable options',
  features: [
    'Support for 6 different QR code types (text, URL, contact, WiFi, SMS, email)',
    'Customizable size (100px to 1000px) and error correction levels',
    'Multiple output formats (PNG and SVG)',
    'Color customization with preset themes',
    'Live preview with real-time generation',
    'Download functionality for both PNG and SVG formats',
    'Input validation and error handling',
    'Professional tool interface with examples',
  ],
  tips: [
    'Choose the right error correction level for your use case',
    'Larger QR codes are easier to scan from a distance',
    'Use high contrast colors for better scanning reliability',
    'Test your QR codes with different devices before sharing',
    'Consider the scanning environment when choosing size',
    'WiFi QR codes work with most modern smartphones',
    'Contact QR codes use standard vCard format',
    'URL QR codes should include the full protocol (https://)',
  ],
}
