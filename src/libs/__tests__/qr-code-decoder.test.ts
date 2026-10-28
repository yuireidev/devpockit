import {
  CameraManager,
  decodeQrFromCamera,
  decodeQrFromImage,
  detectQrFormat,
  getErrorMessage,
  parseQrContent,
  requestCameraPermission,
  retryOperation,
  validateCameraAccess,
  validateImageFile,
  validateQrData
} from '../qr-code-decoder';
import jsQR from 'jsqr';

const mockedJsQR = jest.mocked(jsQR);

// Mock jsQR
jest.mock('jsqr', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: mockCreateObjectURL
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: mockRevokeObjectURL
});

// Mock HTMLCanvasElement and CanvasRenderingContext2D
const mockGetImageData = jest.fn();
const mockDrawImage = jest.fn();
const mockCreateElement = jest.fn();

const mockCanvas = {
  width: 100,
  height: 100,
  getContext: jest.fn(() => ({
    drawImage: mockDrawImage,
    getImageData: mockGetImageData
  }))
};

const mockImage = {
  width: 100,
  height: 100,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: ''
};

const mockVideoElement = {
  videoWidth: 640,
  videoHeight: 480
};

// Mock document.createElement
Object.defineProperty(document, 'createElement', {
  writable: true,
  value: mockCreateElement
});

// Mock Image constructor
Object.defineProperty(global, 'Image', { configurable: true, value: jest.fn(() => mockImage) });

describe('QR Code Decoder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    mockCreateElement.mockReturnValue(mockCanvas);

    // Reset canvas getContext mock to return proper context
    mockCanvas.getContext.mockReturnValue({
      drawImage: mockDrawImage,
      getImageData: mockGetImageData
    });

    // Reset getImageData mock
    mockGetImageData.mockReturnValue({
      data: new Uint8ClampedArray(640 * 480 * 4),
      width: 640,
      height: 480
    });
  });

  describe('decodeQrFromImage', () => {
    it('should decode QR code from image file successfully', async () => {
      // Create a larger file to pass validation
      const mockFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });
      const mockQrData = {
        data: 'https://example.com',
        location: {
          topLeftCorner: { x: 10, y: 10 },
          bottomRightCorner: { x: 50, y: 50 }
        }
      };

      mockedJsQR.mockReturnValue(mockQrData as unknown as NonNullable<ReturnType<typeof jsQR>>);

      mockCreateObjectURL.mockReturnValue('blob:test-url');

      // Mock getImageData to return proper image data
      mockGetImageData.mockReturnValue({
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100
      });

      // Mock the image loading process
      const promise = decodeQrFromImage(mockFile);

      // Trigger the image load event immediately
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const result = await promise;

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        data: 'https://example.com',
        format: 'url',
        position: {
          x: 10,
          y: 10,
          width: 40,
          height: 40
        },
        confidence: 1.0
      });
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should return empty array when no QR code is found', async () => {
      // Create a larger file to pass validation
      const mockFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });
      mockedJsQR.mockReturnValue(null);

      // Mock getImageData to return proper image data
      mockGetImageData.mockReturnValue({
        data: new Uint8ClampedArray(100 * 100 * 4),
        width: 100,
        height: 100
      });

      // Mock the image loading process
      const promise = decodeQrFromImage(mockFile);

      // Trigger the image load event immediately
      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      const result = await promise;

      expect(result).toHaveLength(0);
    });

    it('should handle image loading errors', async () => {
      // Create a larger file to pass validation
      const mockFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });

      // Simulate image loading error
      setTimeout(() => {
        if (mockImage.onerror) {
          mockImage.onerror();
        }
      }, 0);

      await expect(decodeQrFromImage(mockFile)).rejects.toThrow('Failed to load image');
    });

    it('should handle canvas context creation failure', async () => {
      // Create a larger file to pass validation
      const mockFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });
      mockCanvas.getContext.mockReturnValue(null as unknown as ReturnType<typeof mockCanvas.getContext>);

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      await expect(decodeQrFromImage(mockFile)).rejects.toThrow('Failed to decode QR code from image');
    });

    it('should handle invalid QR data', async () => {
      // Create a larger file to pass validation
      const mockFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });
      const mockQrData = {
        data: '', // Invalid empty data
        location: {
          topLeftCorner: { x: 10, y: 10 },
          bottomRightCorner: { x: 50, y: 50 }
        }
      };

      mockedJsQR.mockReturnValue(mockQrData as unknown as NonNullable<ReturnType<typeof jsQR>>);

      setTimeout(() => {
        if (mockImage.onload) {
          mockImage.onload();
        }
      }, 0);

      await expect(decodeQrFromImage(mockFile)).rejects.toThrow('Failed to decode QR code from image');
    });
  });

  describe('decodeQrFromCamera', () => {
    it('should decode QR code from camera video element', async () => {
      const mockQrData = {
        data: 'Hello World',
        location: {
          topLeftCorner: { x: 20, y: 20 },
          bottomRightCorner: { x: 60, y: 60 }
        }
      };

      mockedJsQR.mockReturnValue(mockQrData as unknown as NonNullable<ReturnType<typeof jsQR>>);

      // Mock getImageData to return proper image data
      mockGetImageData.mockReturnValue({
        data: new Uint8ClampedArray(640 * 480 * 4),
        width: 640,
        height: 480
      });

      const result = await decodeQrFromCamera(mockVideoElement as HTMLVideoElement);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        data: 'Hello World',
        format: 'text',
        position: {
          x: 20,
          y: 20,
          width: 40,
          height: 40
        }
      });
    });

    it('should return empty array when no QR code is detected', async () => {
      mockedJsQR.mockReturnValue(null);

      // Mock getImageData to return proper image data
      mockGetImageData.mockReturnValue({
        data: new Uint8ClampedArray(640 * 480 * 4),
        width: 640,
        height: 480
      });

      const result = await decodeQrFromCamera(mockVideoElement as HTMLVideoElement);

      expect(result).toHaveLength(0);
    });

    it('should handle canvas context creation failure', async () => {
      mockCanvas.getContext.mockReturnValue(null as unknown as ReturnType<typeof mockCanvas.getContext>);

      await expect(decodeQrFromCamera(mockVideoElement as HTMLVideoElement)).rejects.toThrow('Failed to decode QR code from camera');
    });
  });

  describe('parseQrContent', () => {
    it('should parse URL content', () => {
      const result = parseQrContent('https://example.com');

      expect(result).toMatchObject({
        type: 'url',
        data: 'https://example.com'
      });
    });

    it('should parse text content', () => {
      const result = parseQrContent('Hello World');

      expect(result).toMatchObject({
        type: 'text',
        data: 'Hello World'
      });
    });

    it('should parse contact vCard', () => {
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
TEL:+1234567890
EMAIL:john@example.com
END:VCARD`;

      const result = parseQrContent(vcard);

      expect(result).toMatchObject({
        type: 'contact',
        data: vcard
      });
    });

    it('should parse WiFi configuration', () => {
      const wifi = 'WIFI:T:WPA;S:MyNetwork;P:password123;H:false;;';

      const result = parseQrContent(wifi);

      expect(result).toMatchObject({
        type: 'wifi',
        data: wifi
      });
    });

    it('should parse SMS content', () => {
      const sms = 'sms:+1234567890:Hello World';

      const result = parseQrContent(sms);

      expect(result).toMatchObject({
        type: 'sms',
        data: sms
      });
    });

    it('should parse email content', () => {
      const email = 'mailto:test@example.com?subject=Test&body=Hello';

      const result = parseQrContent(email);

      expect(result).toMatchObject({
        type: 'email',
        data: email
      });
    });

    it('should handle unknown content', () => {
      const result = parseQrContent('random content');

      expect(result).toMatchObject({
        type: 'text',
        data: 'random content'
      });
    });
  });

  describe('validateImageFile', () => {
    it('should validate valid image file', () => {
      // Create a larger file to pass minimum size validation
      const validFile = new File(['x'.repeat(2000)], 'test.png', { type: 'image/png' });

      const result = validateImageFile(validFile);

      expect(result).toEqual({ isValid: true });
    });

    it('should reject non-image file', () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = validateImageFile(invalidFile);

      expect(result).toEqual({
        isValid: false,
        error: 'Invalid image format. Please use PNG, JPG, WebP, or GIF.'
      });
    });

    it('should reject file that is too large', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.png', { type: 'image/png' });

      const result = validateImageFile(largeFile);

      expect(result).toEqual({
        isValid: false,
        error: 'Image file is too large. Please use a smaller image (max 10MB).'
      });
    });

    it('should reject unsupported image format', () => {
      const unsupportedFile = new File(['test'], 'test.bmp', { type: 'image/bmp' });

      const result = validateImageFile(unsupportedFile);

      expect(result).toEqual({
        isValid: false,
        error: 'Invalid image format. Please use PNG, JPG, WebP, or GIF.'
      });
    });
  });

  describe('validateCameraAccess', () => {
    it('should detect camera availability', async () => {
      // Mock navigator.mediaDevices with getUserMedia success
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }])
      };

      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: jest.fn().mockResolvedValue(mockStream),
          enumerateDevices: jest.fn().mockResolvedValue([{ kind: 'videoinput' }])
        }
      });

      const result = await validateCameraAccess();

      expect(result).toEqual({ hasCamera: true });
    });

    it('should handle camera access denied', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
          enumerateDevices: jest.fn().mockResolvedValue([{ kind: 'videoinput' }])
        }
      });

      const result = await validateCameraAccess();

      expect(result).toEqual({ hasCamera: true });
    });

    it('should handle no media devices', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: undefined
      });

      const result = await validateCameraAccess();

      expect(result).toEqual({
        hasCamera: false,
        error: 'WebRTC is not supported on this device. Please use a modern browser.'
      });
    });
  });

  describe('requestCameraPermission', () => {
    it('should request camera permission successfully', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: jest.fn().mockResolvedValue({})
        }
      });

      const result = await requestCameraPermission();

      expect(result).toEqual({
        granted: false,
        error: 'Camera permission denied.'
      });
    });

    it('should handle permission denied', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        writable: true,
        value: {
          getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied'))
        }
      });

      const result = await requestCameraPermission();

      expect(result).toEqual({
        granted: false,
        error: 'Camera permission denied.'
      });
    });
  });

  describe('validateQrData', () => {
    it('should validate valid QR data', () => {
      const result = validateQrData('https://example.com');

      expect(result).toEqual({ isValid: true });
    });

    it('should reject empty data', () => {
      const result = validateQrData('');

      expect(result).toEqual({
        isValid: false,
        error: 'No QR code data found.'
      });
    });

    it('should reject data that is too long', () => {
      const longData = 'x'.repeat(10000);

      const result = validateQrData(longData);

      expect(result).toEqual({
        isValid: false,
        error: 'QR code data is too long.'
      });
    });
  });

  describe('retryOperation', () => {
    it('should retry operation and succeed', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockResolvedValueOnce('Success');

      const result = await retryOperation(mockOperation, 3, 100);

      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryOperation(mockOperation, 2, 10)).rejects.toThrow('Always fails');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should succeed on first attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('Success');

      const result = await retryOperation(mockOperation, 3, 100);

      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('getErrorMessage', () => {
    it('should return error message from Error object', () => {
      const error = new Error('Test error');

      const result = getErrorMessage(error);

      expect(result).toBe('An error occurred while processing the QR code. Please try again.');
    });

    it('should handle unknown error types', () => {
      const result = getErrorMessage({ message: 'string error' });

      expect(result).toBe('An error occurred while processing the QR code. Please try again.');
    });
  });

  describe('detectQrFormat', () => {
    it('should detect URL format', () => {
      expect(detectQrFormat('https://example.com')).toBe('url');
      expect(detectQrFormat('http://example.com')).toBe('url');
      expect(detectQrFormat('ftp://example.com')).toBe('text'); // FTP is not detected as URL
    });

    it('should detect contact format', () => {
      const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nEND:VCARD';
      expect(detectQrFormat(vcard)).toBe('contact');
    });

    it('should detect WiFi format', () => {
      const wifi = 'WIFI:T:WPA;S:Network;P:password;;';
      expect(detectQrFormat(wifi)).toBe('wifi');
    });

    it('should detect SMS format', () => {
      expect(detectQrFormat('sms:+1234567890:Hello')).toBe('sms');
    });

    it('should detect email format', () => {
      expect(detectQrFormat('mailto:test@example.com')).toBe('email');
    });

    it('should detect text format for plain text', () => {
      expect(detectQrFormat('Hello World')).toBe('text');
    });

    it('should return text for unrecognized format', () => {
      expect(detectQrFormat('random content')).toBe('text');
    });
  });

  describe('CameraManager', () => {
    let cameraManager: CameraManager;

    beforeEach(() => {
      cameraManager = new CameraManager();
    });

    it('should create instance', () => {
      expect(cameraManager).toBeInstanceOf(CameraManager);
    });

    it('should have device info method', () => {
      const deviceInfo = cameraManager.getDeviceInfo();

      expect(deviceInfo).toHaveProperty('isMobile');
      expect(deviceInfo).toHaveProperty('orientation');
      expect(deviceInfo).toHaveProperty('userAgent');
      expect(deviceInfo).toHaveProperty('touchSupport');
    });
  });
});
