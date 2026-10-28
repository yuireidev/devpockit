import {
    detectQrCodeType,
    generateQrCodeContent,
    getEstimatedCapacity,
    getQrCodeStats,
    validateQrCodeInput,
    validateQrCodeOptions
} from '@/libs/qr-code-generator';
import type { QrCodeOptions } from '@/libs/qr-code-generator';

// Mock the QRCode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code-data')
}));

describe('QR Code Generator Utility Functions', () => {
  describe('generateQrCodeContent', () => {
    it('should generate text content for text type', () => {
      const input = { text: 'Hello, World!' };
      const content = generateQrCodeContent(input, 'text');
      expect(content).toBe('Hello, World!');
    });

    it('should generate URL content for url type', () => {
      const input = { url: 'https://example.com' };
      const content = generateQrCodeContent(input, 'url');
      expect(content).toBe('https://example.com');
    });

    it('should add https protocol to URLs without protocol', () => {
      const input = { url: 'example.com' };
      const content = generateQrCodeContent(input, 'url');
      expect(content).toBe('https://example.com');
    });

    it('should generate vCard content for contact type', () => {
      const input = {
        contact: {
          name: 'John Doe',
          phone: '+1-555-123-4567',
          email: 'john@example.com'
        }
      };
      const content = generateQrCodeContent(input, 'contact');
      expect(content).toContain('BEGIN:VCARD');
      expect(content).toContain('FN:John Doe');
      expect(content).toContain('TEL:+1-555-123-4567');
      expect(content).toContain('EMAIL:john@example.com');
      expect(content).toContain('END:VCARD');
    });

    it('should generate WiFi content for wifi type', () => {
      const input = {
        wifi: {
          ssid: 'MyWiFi',
          password: 'password123',
          security: 'WPA' as const,
          hidden: false
        }
      };
      const content = generateQrCodeContent(input, 'wifi');
      expect(content).toBe('WIFI:T:WPA;S:MyWiFi;P:password123;H:false;;');
    });

    it('should generate SMS content for sms type', () => {
      const input = {
        sms: {
          phone: '+1-555-123-4567',
          message: 'Hello World'
        }
      };
      const content = generateQrCodeContent(input, 'sms');
      expect(content).toBe('sms:+1-555-123-4567:Hello World');
    });

    it('should generate email content for email type', () => {
      const input = {
        email: {
          to: 'test@example.com',
          subject: 'Test Subject',
          body: 'Test Body'
        }
      };
      const content = generateQrCodeContent(input, 'email');
      expect(content).toBe('mailto:test@example.com?subject=Test%20Subject&body=Test%20Body');
    });

    it('should throw error for missing text', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'text')).toThrow('Text is required for text QR codes');
    });

    it('should throw error for missing URL', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'url')).toThrow('URL is required for URL QR codes');
    });

    it('should throw error for missing contact', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'contact')).toThrow('Contact information is required for contact QR codes');
    });

    it('should throw error for missing WiFi info', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'wifi')).toThrow('WiFi information is required for WiFi QR codes');
    });

    it('should throw error for missing SMS info', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'sms')).toThrow('SMS information is required for SMS QR codes');
    });

    it('should throw error for missing email info', () => {
      const input = {};
      expect(() => generateQrCodeContent(input, 'email')).toThrow('Email information is required for email QR codes');
    });
  });

  describe('validateQrCodeInput', () => {
    it('should validate text input', () => {
      const input = { text: 'Valid text' };
      expect(() => validateQrCodeInput(input, 'text')).not.toThrow();
    });

    it('should reject empty text', () => {
      const input = { text: '' };
      expect(() => validateQrCodeInput(input, 'text')).toThrow('Text is required and cannot be empty');
    });

    it('should reject text that is too long', () => {
      const input = { text: 'a'.repeat(3000) };
      expect(() => validateQrCodeInput(input, 'text')).toThrow('Text is too long (maximum 2953 characters)');
    });

    it('should validate URL input', () => {
      const input = { url: 'https://example.com' };
      expect(() => validateQrCodeInput(input, 'url')).not.toThrow();
    });

    it('should reject empty URL', () => {
      const input = { url: '' };
      expect(() => validateQrCodeInput(input, 'url')).toThrow('URL is required and cannot be empty');
    });

    it('should reject URL that is too long', () => {
      const input = { url: 'https://example.com/' + 'a'.repeat(2100) };
      expect(() => validateQrCodeInput(input, 'url')).toThrow('URL is too long (maximum 2048 characters)');
    });

    it('should validate contact input with name', () => {
      const input = { contact: { name: 'John Doe' } };
      expect(() => validateQrCodeInput(input, 'contact')).not.toThrow();
    });

    it('should reject contact without name', () => {
      const input = { contact: { name: '' } };
      expect(() => validateQrCodeInput(input, 'contact')).toThrow('Contact name is required');
    });

    it('should validate WiFi input with SSID', () => {
      const input = { wifi: { ssid: 'MyWiFi', password: 'password123', security: 'WPA' as const } };
      expect(() => validateQrCodeInput(input, 'wifi')).not.toThrow();
    });

    it('should reject WiFi without SSID', () => {
      const input = { wifi: { ssid: '', password: 'password123', security: 'WPA' as const } };
      expect(() => validateQrCodeInput(input, 'wifi')).toThrow('WiFi SSID is required');
    });

    it('should validate SMS input with phone and message', () => {
      const input = { sms: { phone: '+1-555-123-4567', message: 'Hello' } };
      expect(() => validateQrCodeInput(input, 'sms')).not.toThrow();
    });

    it('should reject SMS without phone', () => {
      const input = { sms: { phone: '', message: 'Hello' } };
      expect(() => validateQrCodeInput(input, 'sms')).toThrow('Phone number is required for SMS QR codes');
    });

    it('should reject SMS without message', () => {
      const input = { sms: { phone: '+1-555-123-4567', message: '' } };
      expect(() => validateQrCodeInput(input, 'sms')).toThrow('Message is required for SMS QR codes');
    });

    it('should validate email input with to address', () => {
      const input = { email: { to: 'test@example.com' } };
      expect(() => validateQrCodeInput(input, 'email')).not.toThrow();
    });

    it('should reject email without to address', () => {
      const input = { email: { to: '' } };
      expect(() => validateQrCodeInput(input, 'email')).toThrow('Email address is required for email QR codes');
    });
  });

  describe('validateQrCodeOptions', () => {
    const validOptions = {
      type: 'text' as const,
      size: 256,
      errorCorrection: 'M' as const,
      format: 'png' as const,
      margin: 4,
      color: { dark: '#000000', light: '#FFFFFF' }
    };

    it('should validate correct options', () => {
      expect(() => validateQrCodeOptions(validOptions)).not.toThrow();
    });

    it('should reject size that is too small', () => {
      const options = { ...validOptions, size: 50 };
      expect(() => validateQrCodeOptions(options)).toThrow('Size must be between 100 and 1000 pixels');
    });

    it('should reject size that is too large', () => {
      const options = { ...validOptions, size: 1500 };
      expect(() => validateQrCodeOptions(options)).toThrow('Size must be between 100 and 1000 pixels');
    });

    it('should reject invalid error correction', () => {
      const options = { ...validOptions, errorCorrection: 'X' as unknown as QrCodeOptions['errorCorrection'] };
      expect(() => validateQrCodeOptions(options)).toThrow('Error correction must be L, M, Q, or H');
    });

    it('should reject invalid format', () => {
      const options = { ...validOptions, format: 'jpg' as unknown as QrCodeOptions['format'] };
      expect(() => validateQrCodeOptions(options)).toThrow('Format must be png or svg');
    });

    it('should reject negative margin', () => {
      const options = { ...validOptions, margin: -1 };
      expect(() => validateQrCodeOptions(options)).toThrow('Margin must be between 0 and 10');
    });

    it('should reject margin that is too large', () => {
      const options = { ...validOptions, margin: 15 };
      expect(() => validateQrCodeOptions(options)).toThrow('Margin must be between 0 and 10');
    });

    it('should reject missing dark color', () => {
      const options = { ...validOptions, color: { dark: '', light: '#FFFFFF' } };
      expect(() => validateQrCodeOptions(options)).toThrow('Both dark and light colors are required');
    });

    it('should reject missing light color', () => {
      const options = { ...validOptions, color: { dark: '#000000', light: '' } };
      expect(() => validateQrCodeOptions(options)).toThrow('Both dark and light colors are required');
    });
  });

  describe('detectQrCodeType', () => {
    it('should detect URL type', () => {
      expect(detectQrCodeType('https://example.com')).toBe('url');
      expect(detectQrCodeType('http://example.com')).toBe('url');
    });

    it('should detect email type', () => {
      expect(detectQrCodeType('mailto:test@example.com')).toBe('email');
    });

    it('should detect SMS type', () => {
      expect(detectQrCodeType('sms:+1-555-123-4567:Hello')).toBe('sms');
    });

    it('should detect WiFi type', () => {
      expect(detectQrCodeType('WIFI:T:WPA;S:MyWiFi;P:password;;')).toBe('wifi');
    });

    it('should detect contact type', () => {
      expect(detectQrCodeType('BEGIN:VCARD\nFN:John Doe\nEND:VCARD')).toBe('contact');
    });

    it('should default to text type', () => {
      expect(detectQrCodeType('Hello, World!')).toBe('text');
    });
  });

  describe('getEstimatedCapacity', () => {
    it('should return correct capacity for text with L error correction', () => {
      const capacity = getEstimatedCapacity('text', 'L');
      expect(capacity).toBe(2953);
    });

    it('should return correct capacity for text with M error correction', () => {
      const capacity = getEstimatedCapacity('text', 'M');
      expect(capacity).toBe(2331);
    });

    it('should return correct capacity for text with Q error correction', () => {
      const capacity = getEstimatedCapacity('text', 'Q');
      expect(capacity).toBe(1663);
    });

    it('should return correct capacity for text with H error correction', () => {
      const capacity = getEstimatedCapacity('text', 'H');
      expect(capacity).toBe(1273);
    });

    it('should return reduced capacity for URL type', () => {
      const capacity = getEstimatedCapacity('url', 'M');
      expect(capacity).toBe(Math.floor(2331 * 0.8));
    });

    it('should return reduced capacity for contact type', () => {
      const capacity = getEstimatedCapacity('contact', 'M');
      expect(capacity).toBe(Math.floor(2331 * 0.6));
    });

    it('should return reduced capacity for WiFi type', () => {
      const capacity = getEstimatedCapacity('wifi', 'M');
      expect(capacity).toBe(Math.floor(2331 * 0.4));
    });

    it('should return reduced capacity for SMS type', () => {
      const capacity = getEstimatedCapacity('sms', 'M');
      expect(capacity).toBe(Math.floor(2331 * 0.5));
    });

    it('should return reduced capacity for email type', () => {
      const capacity = getEstimatedCapacity('email', 'M');
      expect(capacity).toBe(Math.floor(2331 * 0.7));
    });
  });

  describe('getQrCodeStats', () => {
    const mockResult = {
      dataUrl: 'data:image/png;base64,mock-data',
      type: 'text' as const,
      options: {
        type: 'text' as const,
        size: 256,
        errorCorrection: 'M' as const,
        format: 'png' as const,
        margin: 4,
        color: { dark: '#000000', light: '#FFFFFF' }
      },
      input: { text: 'Hello, World!' },
      size: 256,
      errorCorrection: 'M' as const,
      format: 'png' as const
    };

    it('should return correct stats', () => {
      const stats = getQrCodeStats(mockResult);
      expect(stats.type).toBe('text');
      expect(stats.size).toBe(256);
      expect(stats.errorCorrection).toBe('M');
      expect(stats.format).toBe('png');
      expect(stats.dataUrlLength).toBe(mockResult.dataUrl.length);
      expect(stats.estimatedCapacity).toBe(Math.floor(2331 * 1));
    });
  });
});
