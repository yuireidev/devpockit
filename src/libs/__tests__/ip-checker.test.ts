import { DEFAULT_IP_OPTIONS, formatIpInfo, getPublicIpInfo } from '../ip-checker'

// Mock fetch
global.fetch = jest.fn()

describe('IP Checker Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPublicIpInfo', () => {
    it('should return IPv4 information from successful API call', async () => {
      const mockResponse = {
        ip: '192.168.1.1',
      }

      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

      const result = await getPublicIpInfo()

      expect(result.ipv4).toBe('192.168.1.1')
      expect(result.ipv6).toBe(null)
      expect(result.country).toBe('Unknown')
      expect(result.region).toBe('Unknown')
      expect(result.city).toBe('Unknown')
      expect(result.isp).toBe('Unknown')
      expect(result.organization).toBe('Unknown')
      expect(result.timezone).toBe('Unknown')
      expect(result.latitude).toBe(0)
      expect(result.longitude).toBe(0)
      expect(result.query_time).toBeDefined()
      expect(fetch).toHaveBeenCalledWith(
        'https://ipapi.co/json/',
        expect.objectContaining({
          method: 'GET',
          headers: { Accept: 'application/json' },
        })
      )
    })

    it('should return IPv6 information from successful API call', async () => {
      const mockResponse = {
        ip: '2001:db8::1',
      }

      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })

      const result = await getPublicIpInfo()

      expect(result.ipv4).toBe(null)
      expect(result.ipv6).toBe('2001:db8::1')
    })

    it('should handle API failures gracefully', async () => {
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(getPublicIpInfo()).rejects.toThrow('All IP services failed. Last error: Network error')
    })

    it('should handle HTTP error responses', async () => {
      // Mock all services to return HTTP error
      ;(fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })

      await expect(getPublicIpInfo()).rejects.toThrow('All IP services failed. Last error: HTTP error! status: 500')
    })

    it('should handle missing IP in response', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await expect(getPublicIpInfo()).rejects.toThrow('All IP services failed')
    })
  })

  describe('formatIpInfo', () => {
    const mockIpInfo = {
      ipv4: '192.168.1.1',
      ipv6: '2001:db8::1',
      country: 'United States',
      region: 'New York',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.006,
      query_time: '2024-01-01T00:00:00.000Z',
    }

    it('should format basic IP information', () => {
      const options = {
        ...DEFAULT_IP_OPTIONS,
        showLocation: false,
        showISP: false,
        showTimezone: false,
        showIPv6: true,
      }
      const result = formatIpInfo(mockIpInfo, options)

      expect(result).toContain('🌐 Public IP Addresses:')
      expect(result).toContain('IPv4: 192.168.1.1')
      expect(result).toContain('IPv6: 2001:db8::1')
      expect(result).toContain('🕒 Checked at:')
      expect(result).not.toContain('📍 Location Information:')
      expect(result).not.toContain('🏢 Network Information:')
      expect(result).not.toContain('⏰ Timezone:')
    })

    it('should include location information when enabled', () => {
      const options = { ...DEFAULT_IP_OPTIONS, showLocation: true }
      const result = formatIpInfo(mockIpInfo, options)

      expect(result).toContain('📍 Location Information:')
      expect(result).toContain('Country: United States')
      expect(result).toContain('Region: New York')
      expect(result).toContain('City: New York')
      expect(result).toContain('Coordinates: 40.7128, -74.006')
    })

    it('should include ISP information when enabled', () => {
      const options = { ...DEFAULT_IP_OPTIONS, showISP: true }
      const result = formatIpInfo(mockIpInfo, options)

      expect(result).toContain('🏢 Network Information:')
      expect(result).toContain('ISP: Test ISP')
      expect(result).toContain('Organization: Test Org')
    })

    it('should include timezone information when enabled', () => {
      const options = { ...DEFAULT_IP_OPTIONS, showTimezone: true }
      const result = formatIpInfo(mockIpInfo, options)

      expect(result).toContain('⏰ Timezone: America/New_York')
    })

    it('should not show coordinates when they are zero', () => {
      const ipInfoWithZeroCoords = { ...mockIpInfo, latitude: 0, longitude: 0 }
      const options = { ...DEFAULT_IP_OPTIONS, showLocation: true }
      const result = formatIpInfo(ipInfoWithZeroCoords, options)

      expect(result).toContain('📍 Location Information:')
      expect(result).toContain('Country: United States')
      expect(result).not.toContain('Coordinates:')
    })

    it('should format all information when all options are enabled', () => {
      const result = formatIpInfo(mockIpInfo, DEFAULT_IP_OPTIONS)

      expect(result).toContain('🌐 Public IP Addresses:')
      expect(result).toContain('IPv4: 192.168.1.1')
      expect(result).toContain('IPv6: 2001:db8::1')
      expect(result).toContain('🕒 Checked at:')
      expect(result).toContain('📍 Location Information:')
      expect(result).toContain('🏢 Network Information:')
      expect(result).toContain('⏰ Timezone: America/New_York')
    })

    it('should hide IPv6 when showIPv6 is false', () => {
      const options = { ...DEFAULT_IP_OPTIONS, showIPv6: false }
      const result = formatIpInfo(mockIpInfo, options)

      expect(result).toContain('IPv4: 192.168.1.1')
      expect(result).not.toContain('IPv6: 2001:db8::1')
    })
  })

  describe('DEFAULT_IP_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_IP_OPTIONS.showLocation).toBe(true)
      expect(DEFAULT_IP_OPTIONS.showISP).toBe(true)
      expect(DEFAULT_IP_OPTIONS.showTimezone).toBe(true)
      expect(DEFAULT_IP_OPTIONS.showIPv6).toBe(true)
    })
  })
})
