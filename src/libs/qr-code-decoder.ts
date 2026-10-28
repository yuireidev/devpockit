// QR Code Decoder Utility Functions
// Core logic for decoding QR codes from images and camera streams

import { ParsedQrData, QrCodeFormat, QrDecoderResult } from '@/types/qr-decoder';
import jsQR from 'jsqr';

/**
 * Decode QR codes from an uploaded image file
 */
export const decodeQrFromImage = async (imageFile: File): Promise<QrDecoderResult[]> => {
  try {
    // Validate file input
    const validation = validateImageFile(imageFile);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Create image element and load file
    const image = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    return new Promise((resolve, reject) => {
      image.onload = () => {
        try {
          // Create canvas to extract image data
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Failed to create canvas context');
          }

          // Set canvas dimensions to image dimensions
          canvas.width = image.width;
          canvas.height = image.height;

          // Draw image to canvas
          ctx.drawImage(image, 0, 0);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Decode QR codes using jsQR
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

          if (qrCode) {
            // Validate QR code data
            const dataValidation = validateQrData(qrCode.data);
            if (!dataValidation.isValid) {
              throw new Error(dataValidation.error);
            }

            const result: QrDecoderResult = {
              id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              data: qrCode.data,
              format: detectQrFormat(qrCode.data),
              position: {
                x: qrCode.location.topLeftCorner.x,
                y: qrCode.location.topLeftCorner.y,
                width: qrCode.location.bottomRightCorner.x - qrCode.location.topLeftCorner.x,
                height: qrCode.location.bottomRightCorner.y - qrCode.location.topLeftCorner.y
              },
              confidence: 1.0, // jsQR doesn't provide confidence score
              timestamp: Date.now()
            };

            resolve([result]);
          } else {
            resolve([]);
          }
        } catch {
          reject(new Error('Failed to decode QR code from image'));
        } finally {
          // Clean up
          URL.revokeObjectURL(imageUrl);
        }
      };

      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        reject(new Error('Failed to load image'));
      };

      image.src = imageUrl;
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Decode QR codes from camera video element
 */
export const decodeQrFromCamera = async (videoElement: HTMLVideoElement): Promise<QrDecoderResult[]> => {
  try {
    // Create canvas to capture video frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Set canvas dimensions to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Decode QR codes using jsQR
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
      // Validate QR code data
      const dataValidation = validateQrData(qrCode.data);
      if (!dataValidation.isValid) {
        throw new Error(dataValidation.error);
      }

      const result: QrDecoderResult = {
        id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data: qrCode.data,
        format: detectQrFormat(qrCode.data),
        position: {
          x: qrCode.location.topLeftCorner.x,
          y: qrCode.location.topLeftCorner.y,
          width: qrCode.location.bottomRightCorner.x - qrCode.location.topLeftCorner.x,
          height: qrCode.location.bottomRightCorner.y - qrCode.location.topLeftCorner.y
        },
        confidence: 1.0,
        timestamp: Date.now()
      };

      return [result];
    }

    return [];
  } catch {
    throw new Error('Failed to decode QR code from camera');
  }
};

/**
 * Parse QR code content and detect format
 */
export const parseQrContent = (data: string): ParsedQrData => {
  const format = detectQrFormat(data);

  switch (format) {
    case 'url':
      return parseUrlContent(data);

    case 'text':
      return parseTextContent(data);

    case 'wifi':
      return parseWifiContent(data);

    case 'contact':
      return parseContactContent(data);

    case 'sms':
      return parseSmsContent(data);

    case 'email':
      return parseEmailContent(data);

    default:
      return {
        type: 'unknown',
        data,
        structured: {
          title: 'Unknown QR Code',
          description: 'Unable to parse QR code content'
        }
      };
  }
};

/**
 * Parse URL content with enhanced analysis
 */
const parseUrlContent = (data: string): ParsedQrData => {
  try {
    const url = new URL(data);
    const domain = url.hostname;
    const protocol = url.protocol.replace(':', '');
    const path = url.pathname;
    const searchParams = url.searchParams;

    // Extract common URL parameters
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Determine URL type and description
    let title = 'Website URL';
    let description = 'Click to visit the website';

    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      title = 'YouTube Video';
      description = 'Click to watch the video';
    } else if (domain.includes('github.com')) {
      title = 'GitHub Repository';
      description = 'Click to view the repository';
    } else if (domain.includes('twitter.com') || domain.includes('x.com')) {
      title = 'Twitter/X Post';
      description = 'Click to view the post';
    } else if (domain.includes('instagram.com')) {
      title = 'Instagram Post';
      description = 'Click to view the post';
    } else if (domain.includes('linkedin.com')) {
      title = 'LinkedIn Profile';
      description = 'Click to view the profile';
    } else if (domain.includes('facebook.com')) {
      title = 'Facebook Page';
      description = 'Click to view the page';
    }

    return {
      type: 'url',
      data,
      structured: {
        title,
        description,
        fields: {
          url: data,
          domain,
          protocol,
          path: path || '/',
          ...(Object.keys(params).length > 0 && {
            parameters: JSON.stringify(params)
          })
        }
      }
    };
  } catch {
    // If URL parsing fails, treat as text
    return parseTextContent(data);
  }
};

/**
 * Parse text content with enhanced analysis
 */
const parseTextContent = (data: string): ParsedQrData => {
  const trimmedData = data.trim();

  // Check for common text patterns
  if (trimmedData.length === 0) {
    return {
      type: 'text',
      data,
      structured: {
        title: 'Empty Text',
        description: 'No text content found'
      }
    };
  }

  // Check for JSON-like content
  if (isJsonLike(trimmedData)) {
    try {
      const parsed = JSON.parse(trimmedData);
      return {
        type: 'text',
        data,
        structured: {
          title: 'JSON Data',
          description: 'Structured JSON content',
          fields: { json: JSON.stringify(parsed, null, 2) }
        }
      };
    } catch {
      // Not valid JSON, continue with text analysis
    }
  }

  // Check for email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = trimmedData.match(emailRegex);

  if (emailMatch) {
    return {
      type: 'text',
      data,
      structured: {
        title: 'Text with Email',
        description: 'Contains email address',
        fields: {
          text: trimmedData,
          email: emailMatch[0]
        }
      }
    };
  }

  // Check for phone numbers
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = trimmedData.match(phoneRegex);

  if (phoneMatch) {
    return {
      type: 'text',
      data,
      structured: {
        title: 'Text with Phone Number',
        description: 'Contains phone number',
        fields: {
          text: trimmedData,
          phone: phoneMatch[0]
        }
      }
    };
  }

  // Check for coordinates (latitude, longitude)
  const coordRegex = /(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/;
  const coordMatch = trimmedData.match(coordRegex);

  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);

    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        type: 'text',
        data,
        structured: {
          title: 'Location Coordinates',
          description: 'GPS coordinates',
          fields: {
            text: trimmedData,
            latitude: lat.toString(),
            longitude: lng.toString(),
            mapsUrl: `https://maps.google.com/?q=${lat},${lng}`
          }
        }
      };
    }
  }

  // Default text analysis
  const wordCount = trimmedData.split(/\s+/).length;
  const charCount = trimmedData.length;

  return {
    type: 'text',
    data,
    structured: {
      title: 'Text Content',
      description: `${wordCount} words, ${charCount} characters`,
      fields: {
        text: trimmedData,
        wordCount: wordCount.toString(),
        characterCount: charCount.toString()
      }
    }
  };
};

/**
 * Parse WiFi QR code content
 * Format: WIFI:T:WPA;S:NetworkName;P:password;H:false;;
 */
const parseWifiContent = (data: string): ParsedQrData => {
  try {
    // Remove WIFI: prefix and split by semicolon
    const wifiData = data.replace('WIFI:', '');
    const parts = wifiData.split(';');

    const wifiInfo: Record<string, string> = {};

    // Parse each part
    parts.forEach(part => {
      if (part.includes(':')) {
        const [key, value] = part.split(':', 2);
        wifiInfo[key] = value;
      }
    });

    const networkName = wifiInfo.S || 'Unknown Network';
    const security = wifiInfo.T || 'Unknown';
    const password = wifiInfo.P || '';
    const hidden = wifiInfo.H === 'true';

    return {
      type: 'wifi',
      data,
      structured: {
        title: 'WiFi Network',
        description: `Connect to ${networkName}`,
        fields: {
          networkName,
          security,
          password: password ? '••••••••' : 'No password',
          hidden: hidden.toString(),
          ssid: networkName,
          encryption: security
        }
      }
    };
  } catch {
    return {
      type: 'wifi',
      data,
      structured: {
        title: 'WiFi Network',
        description: 'WiFi configuration (unable to parse details)',
        fields: { raw: data }
      }
    };
  }
};

/**
 * Parse vCard contact content
 * Format: BEGIN:VCARD...END:VCARD
 */
const parseContactContent = (data: string): ParsedQrData => {
  try {
    const lines = data.split('\n');
    const contactInfo: Record<string, string> = {};

    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2);
        const cleanKey = key.replace(/;.*$/, ''); // Remove parameters
        contactInfo[cleanKey] = value;
      }
    });

    const name = contactInfo.FN || contactInfo.N || 'Unknown Contact';
    const phone = contactInfo.TEL || '';
    const email = contactInfo.EMAIL || '';
    const organization = contactInfo.ORG || '';

    return {
      type: 'contact',
      data,
      structured: {
        title: 'Contact Information',
        description: `Add ${name} to contacts`,
        fields: {
          name,
          phone: phone || 'No phone',
          email: email || 'No email',
          organization: organization || 'No organization',
          fullName: name,
          telephone: phone,
          emailAddress: email,
          company: organization
        }
      }
    };
  } catch {
    return {
      type: 'contact',
      data,
      structured: {
        title: 'Contact Information',
        description: 'Contact details (unable to parse)',
        fields: { raw: data }
      }
    };
  }
};

/**
 * Parse SMS content
 * Format: sms:+1234567890:message
 */
const parseSmsContent = (data: string): ParsedQrData => {
  try {
    const smsData = data.replace('sms:', '');
    const [phoneNumber, message] = smsData.split(':', 2);

    return {
      type: 'sms',
      data,
      structured: {
        title: 'SMS Message',
        description: `Send message to ${phoneNumber}`,
        fields: {
          phoneNumber: phoneNumber || 'No number',
          message: message || 'No message',
          recipient: phoneNumber,
          text: message
        }
      }
    };
  } catch {
    return {
      type: 'sms',
      data,
      structured: {
        title: 'SMS Message',
        description: 'SMS configuration (unable to parse)',
        fields: { raw: data }
      }
    };
  }
};

/**
 * Parse email content
 * Format: mailto:email@domain.com?subject=...&body=...
 */
const parseEmailContent = (data: string): ParsedQrData => {
  try {
    const emailData = data.replace('mailto:', '');
    const [email, queryString] = emailData.split('?', 2);

    const params: Record<string, string> = {};
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=', 2);
        params[decodeURIComponent(key)] = decodeURIComponent(value || '');
      });
    }

    const subject = params.subject || '';
    const body = params.body || '';

    return {
      type: 'email',
      data,
      structured: {
        title: 'Email Message',
        description: `Send email to ${email}`,
        fields: {
          email: email || 'No email',
          subject: subject || 'No subject',
          body: body || 'No message',
          recipient: email,
          subjectLine: subject,
          messageBody: body
        }
      }
    };
  } catch {
    return {
      type: 'email',
      data,
      structured: {
        title: 'Email Message',
        description: 'Email configuration (unable to parse)',
        fields: { raw: data }
      }
    };
  }
};

/**
 * Check if text looks like JSON
 */
const isJsonLike = (text: string): boolean => {
  const trimmed = text.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
};

/**
 * Validate file input for QR code decoding
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid image format. Please use PNG, JPG, WebP, or GIF.'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image file is too large. Please use a smaller image (max 10MB).'
    };
  }

  // Check minimum file size (1KB)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    return {
      isValid: false,
      error: 'Image file is too small. Please use a larger image.'
    };
  }

  return { isValid: true };
};

/**
 * Validate camera permissions and availability
 */
export const validateCameraAccess = async (): Promise<{ hasCamera: boolean; error?: string }> => {
  try {
    // Check for basic WebRTC support
    if (!navigator.mediaDevices) {
      return {
        hasCamera: false,
        error: 'WebRTC is not supported on this device. Please use a modern browser.'
      };
    }

    // Check if getUserMedia is available
    if (!navigator.mediaDevices.getUserMedia) {
      return {
        hasCamera: false,
        error: 'Camera access is not supported on this device.'
      };
    }

    // For mobile devices, try multiple approaches
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);

    if (isMobile) {
      // Try different constraint combinations for mobile
      const constraintAttempts = [
        { video: { facingMode: 'environment' } },
        { video: { facingMode: 'user' } },
        { video: true },
        { video: { width: 640, height: 480 } }
      ];

      for (const constraints of constraintAttempts) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          stream.getTracks().forEach(track => track.stop());
          return { hasCamera: true };
        } catch {
          // Continue to next attempt
          continue;
        }
      }

      // If all attempts fail, try device enumeration as last resort
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        if (videoDevices.length > 0) {
          return { hasCamera: true };
        }
      } catch {
        // Ignore enumeration errors
      }

      return {
        hasCamera: false,
        error: 'Camera access failed on mobile device. Please ensure you\'re using HTTPS and grant camera permissions.'
      };
    } else {
      // Desktop: try standard approach
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        stream.getTracks().forEach(track => track.stop());
        return { hasCamera: true };
      } catch {
        // Fallback to device enumeration
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');

          if (videoDevices.length === 0) {
            return {
              hasCamera: false,
              error: 'No camera found on this device.'
            };
          }

          return { hasCamera: true };
        } catch {
          return {
            hasCamera: false,
            error: 'Unable to detect camera on this device.'
          };
        }
      }
    }
  } catch (error) {
    return {
      hasCamera: false,
      error: getErrorMessage(error as Error)
    };
  }
};

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<{ granted: boolean; error?: string }> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    // Stop the stream immediately as we just needed to check permissions
    stream.getTracks().forEach(track => track.stop());

    return { granted: true };
  } catch (error: unknown) {
    let errorMessage = 'Camera permission denied.';
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    if (errorName === 'NotAllowedError') {
      errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
    } else if (errorName === 'NotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (errorName === 'NotSupportedError') {
      errorMessage = 'Camera access is not supported on this device.';
    } else if (errorName === 'NotReadableError') {
      errorMessage = 'Camera is already in use by another application.';
    }

    return { granted: false, error: errorMessage };
  }
};

/**
 * Validate QR code data integrity
 */
export const validateQrData = (data: string): { isValid: boolean; error?: string } => {
  if (!data || data.trim().length === 0) {
    return {
      isValid: false,
      error: 'No QR code data found.'
    };
  }

  // Check for minimum length
  if (data.length < 1) {
    return {
      isValid: false,
      error: 'QR code data is too short.'
    };
  }

  // Check for maximum length (QR codes can store up to 2953 characters)
  if (data.length > 2953) {
    return {
      isValid: false,
      error: 'QR code data is too long.'
    };
  }

  // Check for invalid characters (basic validation)
  const invalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (invalidChars.test(data)) {
    return {
      isValid: false,
      error: 'QR code contains invalid characters.'
    };
  }

  return { isValid: true };
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();

  if (message.includes('permission denied')) {
    return 'Camera permission denied. Please allow camera access and try again.';
  }

  if (message.includes('no camera')) {
    return 'No camera found on this device. Please use image upload instead.';
  }

  if (message.includes('invalid image')) {
    return 'Invalid image format. Please use PNG, JPG, WebP, or GIF.';
  }

  if (message.includes('file too large')) {
    return 'Image file is too large. Please use a smaller image.';
  }

  if (message.includes('no qr code')) {
    return 'No QR code found in the image. Please try a different image.';
  }

  if (message.includes('failed to load')) {
    return 'Failed to load image. Please check the file and try again.';
  }

  if (message.includes('canvas context')) {
    return 'Browser compatibility issue. Please try a different browser.';
  }

  // Default error message
  return 'An error occurred while processing the QR code. Please try again.';
};

/**
 * Camera manager class for handling camera operations
 */
export class CameraManager {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private orientationHandler: (() => void) | null = null;
  private currentOrientation: string = 'unknown';
  private isMobile = false;
  private isProcessing = false;

  /**
   * Initialize camera with permission handling and mobile optimization
   */
  async initializeCamera(
    videoElement: HTMLVideoElement,
    constraints: MediaStreamConstraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Detect mobile device
      this.isMobile = this.detectMobileDevice();

      // Get optimized constraints for mobile
      const optimizedConstraints = this.getOptimizedConstraints(constraints);

      // Check camera availability first
      const cameraCheck = await validateCameraAccess();
      if (!cameraCheck.hasCamera) {
        let errorMessage = cameraCheck.error;

        if (this.isMobile) {
          errorMessage = `Mobile camera access failed: ${cameraCheck.error}\n\nTroubleshooting steps:\n• Ensure you're using HTTPS (required for camera access)\n• Grant camera permissions when prompted\n• Try refreshing the page\n• Use a modern browser (Chrome, Safari, Firefox)\n• Check if camera is being used by another app`;
        }

        return { success: false, error: errorMessage };
      }

      // Request camera permission
      const permissionCheck = await requestCameraPermission();
      if (!permissionCheck.granted) {
        return { success: false, error: permissionCheck.error };
      }

      // Get camera stream with comprehensive fallback for mobile devices
      let streamObtained = false;

      if (this.isMobile) {
        // Mobile: try multiple constraint combinations
        const mobileConstraints = [
          optimizedConstraints,
          { video: { facingMode: 'environment' } },
          { video: { facingMode: 'user' } },
          { video: { width: 640, height: 480 } },
          { video: true }
        ];

        for (const constraints of mobileConstraints) {
          try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamObtained = true;
            break;
          } catch {
            // Continue to next attempt
            continue;
          }
        }
      } else {
        // Desktop: try standard approach
        try {
          this.stream = await navigator.mediaDevices.getUserMedia(optimizedConstraints);
          streamObtained = true;
        } catch (error) {
          // Fallback for desktop
          try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamObtained = true;
          } catch {
            throw error;
          }
        }
      }

      if (!streamObtained) {
        throw new Error('Unable to access camera with any available constraints');
      }

      this.videoElement = videoElement;

      // Set up video element with mobile optimizations
      this.setupVideoElement(videoElement);

      // Set up orientation handling for mobile
      this.setupOrientationHandling();

      // Set up video element
      videoElement.srcObject = this.stream;
      videoElement.play();

      return { success: true };
  } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  /**
   * Detect if device is mobile
   */
  private detectMobileDevice(): boolean {
    // Check user agent for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const isMobileUA = mobileRegex.test(navigator.userAgent);

    // Check for touch capability
    const hasTouch = navigator.maxTouchPoints ? navigator.maxTouchPoints > 0 : false;

    // Check screen size (mobile devices typically have smaller screens)
    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

    // Check for mobile-specific features
    const hasMobileFeatures = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return isMobileUA || (hasTouch && isSmallScreen) || hasMobileFeatures;
  }

  /**
   * Get optimized constraints for mobile devices
   */
  private getOptimizedConstraints(constraints: MediaStreamConstraints): MediaStreamConstraints {
    if (!this.isMobile) {
      return constraints;
    }

    // Mobile-optimized constraints
    const mobileConstraints: MediaStreamConstraints = {
      video: {
        facingMode: constraints.video === true ? 'environment' :
                   typeof constraints.video === 'object' ? constraints.video.facingMode || 'environment' : 'environment',
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 15, max: 30 }
      }
    };

    return mobileConstraints;
  }

  /**
   * Set up video element with mobile optimizations
   */
  private setupVideoElement(videoElement: HTMLVideoElement): void {
    if (!this.isMobile) return;

    // Mobile-specific video element setup
    videoElement.setAttribute('playsinline', 'true');
    videoElement.setAttribute('webkit-playsinline', 'true');
    videoElement.setAttribute('muted', 'true');
    videoElement.setAttribute('autoplay', 'true');

    // Add mobile-specific CSS classes
    videoElement.style.objectFit = 'cover';
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
  }

  /**
   * Set up orientation change handling
   */
  private setupOrientationHandling(): void {
    if (!this.isMobile || this.orientationHandler) return;

    this.orientationHandler = () => {
      this.handleOrientationChange();
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', this.orientationHandler);
    window.addEventListener('resize', this.orientationHandler);

    // Initial orientation detection
    this.detectCurrentOrientation();
  }

  /**
   * Handle orientation change
   */
  private handleOrientationChange(): void {
    if (!this.isMobile || !this.videoElement) return;

    // Debounce orientation changes
    setTimeout(() => {
      this.detectCurrentOrientation();
      this.adjustVideoForOrientation();
    }, 100);
  }

  /**
   * Detect current device orientation
   */
  private detectCurrentOrientation(): void {
    if (!this.isMobile) return;

    const orientation = screen.orientation?.type ||
                       (window.orientation !== undefined ?
                         (window.orientation === 0 ? 'portrait-primary' : 'landscape-primary') :
                         'unknown');

    this.currentOrientation = orientation;
  }

  /**
   * Adjust video element for orientation
   */
  private adjustVideoForOrientation(): void {
    if (!this.isMobile || !this.videoElement) return;

    const isPortrait = this.currentOrientation.includes('portrait');

    // Adjust video element styles based on orientation
    if (isPortrait) {
      this.videoElement.style.transform = 'none';
    } else {
      // Landscape mode - ensure video fills the container
      this.videoElement.style.transform = 'scale(1.1)';
    }
  }

  /**
   * Get mobile-optimized scanning options
   */
  getMobileScanningOptions(): {
    scanIntervalMs: number;
    maxResults: number;
    qualityThreshold: number;
  } {
    if (!this.isMobile) {
      return {
        scanIntervalMs: 100,
        maxResults: 5,
        qualityThreshold: 0.5
      };
    }

    // Mobile-optimized settings
    return {
      scanIntervalMs: 200, // Slower scanning to save battery
      maxResults: 3, // Fewer results for better performance
      qualityThreshold: 0.3 // Lower threshold for mobile cameras
    };
  }

  /**
   * Start real-time QR code scanning with enhanced performance
   */
  startScanning(
    onQrDetected: (result: QrDecoderResult) => void,
    onError: (error: string) => void,
    options: {
      scanIntervalMs?: number;
      maxResults?: number;
      qualityThreshold?: number;
      enableMultipleDetection?: boolean;
    } = {}
  ): void {
    if (!this.videoElement || this.isScanning) {
      return;
    }

    const {
      scanIntervalMs = 100,
      maxResults = 5,
      qualityThreshold = 0.5,
      enableMultipleDetection = true
    } = options;

    this.isScanning = true;
    let lastScanTime = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 10;

    this.scanInterval = setInterval(async () => {
      try {
        if (!this.videoElement || this.videoElement.readyState !== 4) {
          return;
        }

        // Throttle scanning to prevent excessive CPU usage
        const now = Date.now();
        if (now - lastScanTime < scanIntervalMs) {
          return;
        }
        lastScanTime = now;

        // Skip scanning if we're in the middle of processing
        if (this.isProcessing) {
          return;
        }
        this.isProcessing = true;

        // Perform QR code detection
        const results = await this.performQrDetection(
          this.videoElement,
          maxResults,
          qualityThreshold,
          enableMultipleDetection
        );

        if (results.length > 0) {
          consecutiveFailures = 0;
          results.forEach(result => onQrDetected(result));
        } else {
          consecutiveFailures++;

          // If too many consecutive failures, slow down scanning
          if (consecutiveFailures > maxConsecutiveFailures) {
            // Reduce scanning frequency temporarily
            if (scanIntervalMs < 500) {
              this.stopScanning();
              setTimeout(() => {
                this.startScanning(onQrDetected, onError, {
                  ...options,
                  scanIntervalMs: scanIntervalMs * 2
                });
              }, 1000);
            }
          }
        }
      } catch (error: unknown) {
        consecutiveFailures++;
        onError(getErrorMessage(error));

        // If too many errors, stop scanning
        if (consecutiveFailures > maxConsecutiveFailures) {
          this.stopScanning();
          onError('Scanning stopped due to repeated errors. Please try again.');
        }
      } finally {
        this.isProcessing = false;
      }
    }, scanIntervalMs);
  }

  /**
   * Perform QR code detection with enhanced processing
   */
  private async performQrDetection(
    videoElement: HTMLVideoElement,
    maxResults: number,
    qualityThreshold: number,
    enableMultipleDetection: boolean
  ): Promise<QrDecoderResult[]> {
    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create canvas context');
    }

    // Set canvas dimensions to video dimensions
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Decode QR codes using jsQR
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (!qrCode) {
      return [];
    }

    // Validate QR code data
    const dataValidation = validateQrData(qrCode.data);
    if (!dataValidation.isValid) {
      throw new Error(dataValidation.error);
    }

    // Create result
    const result: QrDecoderResult = {
      id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data: qrCode.data,
      format: detectQrFormat(qrCode.data),
      position: {
        x: qrCode.location.topLeftCorner.x,
        y: qrCode.location.topLeftCorner.y,
        width: qrCode.location.bottomRightCorner.x - qrCode.location.topLeftCorner.x,
        height: qrCode.location.bottomRightCorner.y - qrCode.location.topLeftCorner.y
      },
      confidence: 1.0, // jsQR doesn't provide confidence score
      timestamp: Date.now()
    };

    // For now, jsQR only detects one QR code at a time
    // In the future, we could implement multiple detection by:
    // 1. Cropping the image into regions
    // 2. Running jsQR on each region
    // 3. Combining results

    const resultLimit = Math.max(0, Math.floor(maxResults));
    const detections = [result].filter(detection => detection.confidence >= qualityThreshold);

    // jsQR currently yields one result per frame; keep the option meaningful
    // when multi-result detection is added while enforcing the selected limit.
    return detections.slice(0, enableMultipleDetection ? resultLimit : Math.min(1, resultLimit));
  }

  /**
   * Stop QR code scanning
   */
  stopScanning(): void {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Pause scanning temporarily
   */
  pauseScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  /**
   * Resume scanning after pause
   */
  resumeScanning(
    onQrDetected: (result: QrDecoderResult) => void,
    onError: (error: string) => void,
    options: {
      scanIntervalMs?: number;
      maxResults?: number;
      qualityThreshold?: number;
      enableMultipleDetection?: boolean;
    } = {}
  ): void {
    if (this.isScanning && !this.scanInterval) {
      this.startScanning(onQrDetected, onError, options);
    }
  }

  /**
   * Get scanning status
   */
  getScanningStatus(): {
    isScanning: boolean;
    hasVideo: boolean;
    videoReady: boolean;
  } {
    return {
      isScanning: this.isScanning,
      hasVideo: this.videoElement !== null,
      videoReady: this.videoElement?.readyState === 4
    };
  }

  /**
   * Adjust scanning quality based on performance
   */
  adjustScanningQuality(): {
    recommendedInterval: number;
    recommendedMaxResults: number;
  } {
    const capabilities = this.getCameraCapabilities();
    const status = this.getScanningStatus();

    let recommendedInterval = 100;
    let recommendedMaxResults = 5;

    // Adjust based on camera capabilities
    if (capabilities) {
      if (capabilities.width?.max && capabilities.width.max > 1920) {
        // High resolution camera - slow down scanning
        recommendedInterval = 200;
        recommendedMaxResults = 3;
      } else if (capabilities.width?.max && capabilities.width.max < 640) {
        // Low resolution camera - can scan faster
        recommendedInterval = 50;
        recommendedMaxResults = 8;
      }
    }

    // Adjust based on current performance
    if (!status.videoReady) {
      recommendedInterval = 500;
      recommendedMaxResults = 1;
    }

    return {
      recommendedInterval,
      recommendedMaxResults
    };
  }

  /**
   * Switch camera (front/back) with enhanced error handling
   */
  async switchCamera(): Promise<{
    success: boolean;
    error?: string;
    newFacingMode?: string;
    availableCameras?: number;
  }> {
    if (!this.videoElement) {
      return { success: false, error: 'Camera not initialized' };
    }

    try {
      // Check available cameras first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length < 2) {
        return {
          success: false,
          error: 'Only one camera available. Cannot switch cameras.',
          availableCameras: videoDevices.length
        };
      }

      // Stop current stream
      this.stopScanning();
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
      }

      // Get current facing mode
      const currentTrack = this.stream?.getVideoTracks()[0];
      const currentFacingMode = currentTrack?.getSettings().facingMode;

      // Switch to opposite camera
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      // Initialize with new camera
      const result = await this.initializeCamera(this.videoElement, constraints);

      if (result.success) {
        return {
          success: true,
          newFacingMode,
          availableCameras: videoDevices.length
        };
      }

      return result;
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  /**
   * Get available cameras information
   */
  async getAvailableCameras(): Promise<{
    cameras: MediaDeviceInfo[];
    currentCamera?: string;
    canSwitch: boolean;
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      const currentTrack = this.stream?.getVideoTracks()[0];
      const currentSettings = currentTrack?.getSettings();

      return {
        cameras: videoDevices,
        currentCamera: currentSettings?.deviceId,
        canSwitch: videoDevices.length > 1
      };
    } catch {
      return {
        cameras: [],
        canSwitch: false
      };
    }
  }

  /**
   * Toggle camera flash/torch (if supported) with enhanced feedback
   */
  async toggleFlash(): Promise<{
    success: boolean;
    error?: string;
    isFlashOn?: boolean;
    isSupported?: boolean;
  }> {
    if (!this.stream) {
      return { success: false, error: 'Camera not initialized' };
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) {
        return { success: false, error: 'No video track found' };
      }

      // Check if torch is supported
      const capabilities = videoTrack.getCapabilities();
      if (!capabilities.torch) {
        return {
          success: false,
          error: 'Flash not supported on this device',
          isSupported: false
        };
      }

      // Get current torch state
      const settings = videoTrack.getSettings();
      const currentTorch = settings.torch || false;

      // Apply new torch setting
      await videoTrack.applyConstraints({
        torch: !currentTorch
      });

      return {
        success: true,
        isFlashOn: !currentTorch,
        isSupported: true
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error),
        isSupported: false
      };
    }
  }

  /**
   * Get flash/torch status
   */
  getFlashStatus(): {
    isSupported: boolean;
    isOn: boolean;
    canToggle: boolean;
  } {
    if (!this.stream) {
      return { isSupported: false, isOn: false, canToggle: false };
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) {
        return { isSupported: false, isOn: false, canToggle: false };
      }

      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();

      return {
        isSupported: !!capabilities.torch,
        isOn: settings.torch || false,
        canToggle: !!capabilities.torch
      };
    } catch {
      return { isSupported: false, isOn: false, canToggle: false };
    }
  }

  /**
   * Focus camera (if supported) with enhanced feedback
   */
  async focusCamera(): Promise<{
    success: boolean;
    error?: string;
    isSupported?: boolean;
    focusMode?: string;
  }> {
    if (!this.stream) {
      return { success: false, error: 'Camera not initialized' };
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) {
        return { success: false, error: 'No video track found' };
      }

      // Check if focus is supported
      const capabilities = videoTrack.getCapabilities();
      if (!capabilities.focusMode || !capabilities.focusMode.includes('single-shot')) {
        return {
          success: false,
          error: 'Focus not supported on this device',
          isSupported: false
        };
      }

      // Apply focus
      await videoTrack.applyConstraints({
        focusMode: 'single-shot'
      });

      return {
        success: true,
        isSupported: true,
        focusMode: 'single-shot'
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error),
        isSupported: false
      };
    }
  }

  /**
   * Get focus capabilities and status
   */
  getFocusStatus(): {
    isSupported: boolean;
    availableModes: string[];
    currentMode?: string;
    canFocus: boolean;
  } {
    if (!this.stream) {
      return { isSupported: false, availableModes: [], canFocus: false };
    }

    try {
      const videoTrack = this.stream.getVideoTracks()[0];
      if (!videoTrack) {
        return { isSupported: false, availableModes: [], canFocus: false };
      }

      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();

      return {
        isSupported: !!capabilities.focusMode,
        availableModes: capabilities.focusMode || [],
        currentMode: settings.focusMode,
        canFocus: !!(capabilities.focusMode && capabilities.focusMode.includes('single-shot'))
      };
    } catch {
      return { isSupported: false, availableModes: [], canFocus: false };
    }
  }

  /**
   * Get comprehensive camera status
   */
  getCameraStatus(): {
    isActive: boolean;
    isScanning: boolean;
    hasVideo: boolean;
    videoReady: boolean;
    flash: {
      isSupported: boolean;
      isOn: boolean;
      canToggle: boolean;
    };
    focus: {
      isSupported: boolean;
      availableModes: string[];
      currentMode?: string;
      canFocus: boolean;
    };
    cameras: {
      available: number;
      canSwitch: boolean;
    };
  } {
    const scanningStatus = this.getScanningStatus();
    const flashStatus = this.getFlashStatus();
    const focusStatus = this.getFocusStatus();

    return {
      isActive: this.isActive(),
      isScanning: scanningStatus.isScanning,
      hasVideo: scanningStatus.hasVideo,
      videoReady: scanningStatus.videoReady,
      flash: flashStatus,
      focus: focusStatus,
      cameras: {
        available: 0, // Will be populated by getAvailableCameras()
        canSwitch: false
      }
    };
  }

  /**
   * Get camera capabilities
   */
  getCameraCapabilities(): MediaTrackCapabilities | null {
    if (!this.stream) {
      return null;
    }

    const videoTrack = this.stream.getVideoTracks()[0];
    return videoTrack?.getCapabilities() || null;
  }

  /**
   * Check if camera is active
   */
  isActive(): boolean {
    return this.stream !== null && this.isScanning;
  }

  /**
   * Clean up camera resources
   */
  cleanup(): void {
    this.stopScanning();

    // Remove orientation listeners
    if (this.orientationHandler) {
      window.removeEventListener('orientationchange', this.orientationHandler);
      window.removeEventListener('resize', this.orientationHandler);
      this.orientationHandler = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
      this.videoElement = null;
    }

    // Reset mobile state
    this.isMobile = false;
    this.currentOrientation = 'unknown';
  }

  /**
   * Get device information
   */
  getDeviceInfo(): {
    isMobile: boolean;
    orientation: string;
    userAgent: string;
    touchSupport: boolean;
  } {
    return {
      isMobile: this.isMobile,
      orientation: this.currentOrientation,
      userAgent: navigator.userAgent,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  }
}

/**
 * Detect QR code format based on content
 */
export const detectQrFormat = (data: string): QrCodeFormat => {
  if (!data || data.trim().length === 0) {
    return 'unknown';
  }

  // URL detection
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return 'url';
  }

  // WiFi detection
  if (data.startsWith('WIFI:')) {
    return 'wifi';
  }

  // Contact (vCard) detection
  if (data.startsWith('BEGIN:VCARD') && data.includes('END:VCARD')) {
    return 'contact';
  }

  // SMS detection
  if (data.startsWith('sms:')) {
    return 'sms';
  }

  // Email detection
  if (data.startsWith('mailto:')) {
    return 'email';
  }

  // Default to text for other content
  return 'text';
};
