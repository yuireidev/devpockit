/**
 * Unit tests for IP CIDR utility functions
 */

import {
  analyzeNetwork,
  calculateSubnets,
  cidrRangesOverlap,
  cidrToRange,
  generateIpRange,
  getCidrSuggestions,
  getIpInfo,
  getNetworkStats,
  getNextIpInRange,
  ipToCidr,
  ipToCidrAuto,
  isIpInCidr,
  isLoopbackIp,
  isPrivateIp,
  parseCidr,
  validateCidr,
  validateIpAddress,
} from '../ip-cidr'

describe('IP CIDR Utility Functions', () => {
  describe('validateIpAddress', () => {
    it('should validate IPv4 addresses', () => {
      expect(validateIpAddress('192.168.1.1')).toEqual({
        isValid: true,
        version: 'ipv4',
      })

      expect(validateIpAddress('8.8.8.8')).toEqual({
        isValid: true,
        version: 'ipv4',
      })
    })

    it('should validate IPv6 addresses', () => {
      expect(validateIpAddress('2001:db8::1')).toEqual({
        isValid: true,
        version: 'ipv6',
      })

      expect(validateIpAddress('fe80::1')).toEqual({
        isValid: true,
        version: 'ipv6',
      })
    })

    it('should reject invalid IP addresses', () => {
      expect(validateIpAddress('256.1.1.1')).toEqual({
        isValid: false,
        version: null,
        error: 'ipaddr: the address has neither IPv6 nor IPv4 format',
      })

      expect(validateIpAddress('not-an-ip')).toEqual({
        isValid: false,
        version: null,
        error: 'ipaddr: the address has neither IPv6 nor IPv4 format',
      })
    })
  })

  describe('validateCidr', () => {
    it('should validate IPv4 CIDR notation', () => {
      expect(validateCidr('192.168.1.0/24')).toEqual({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4',
      })

      expect(validateCidr('10.0.0.0/8')).toEqual({
        isValid: true,
        ip: '10.0.0.0',
        prefixLength: 8,
        version: 'ipv4',
      })
    })

    it('should validate IPv6 CIDR notation', () => {
      expect(validateCidr('2001:db8::/32')).toEqual({
        isValid: true,
        ip: '2001:db8::',
        prefixLength: 32,
        version: 'ipv6',
      })
    })

    it('should reject invalid CIDR notation', () => {
      expect(validateCidr('192.168.1.0/33')).toEqual({
        isValid: false,
        ip: '192.168.1.0',
        prefixLength: 33,
        version: 'ipv4',
        error: 'Prefix length must be between 0 and 32 for ipv4',
      })

      expect(validateCidr('192.168.1.0')).toEqual({
        isValid: false,
        ip: '',
        prefixLength: 0,
        version: null,
        error: 'Invalid CIDR format. Expected format: IP/PREFIX (e.g., 192.168.1.0/24)',
      })
    })
  })

  describe('isPrivateIp', () => {
    it('should identify private IPv4 addresses', () => {
      expect(isPrivateIp('192.168.1.1')).toBe(true)
      expect(isPrivateIp('10.0.0.1')).toBe(true)
      expect(isPrivateIp('172.16.0.1')).toBe(true)
      expect(isPrivateIp('8.8.8.8')).toBe(false)
    })

    it('should identify private IPv6 addresses', () => {
      expect(isPrivateIp('fd00::1')).toBe(true)
      expect(isPrivateIp('2001:db8::1')).toBe(true) // 2001:db8::/32 is reserved for documentation
    })
  })

  describe('isLoopbackIp', () => {
    it('should identify loopback addresses', () => {
      expect(isLoopbackIp('127.0.0.1')).toBe(true)
      expect(isLoopbackIp('::1')).toBe(true)
      expect(isLoopbackIp('192.168.1.1')).toBe(false)
    })
  })

  describe('getIpInfo', () => {
    it('should return comprehensive IP information', () => {
      const info = getIpInfo('192.168.1.1')
      expect(info.version).toBe('ipv4')
      expect(info.isPrivate).toBe(true)
      expect(info.isLoopback).toBe(false)
      expect(info.isMulticast).toBe(false)
      expect(info.isLinkLocal).toBe(false)
      expect(info.range).toBe('private')
    })
  })

  describe('parseCidr', () => {
    it('should parse IPv4 CIDR notation', () => {
      const result = parseCidr('192.168.1.0/24')
      expect(result.isValid).toBe(true)
      expect(result.networkAddress).toBe('192.168.1.0')
      expect(result.broadcastAddress).toBe('192.168.1.255')
      expect(result.subnetMask).toBe('255.255.255.0')
      expect(result.totalHosts).toBe(256)
      expect(result.usableHosts).toBe(254)
      expect(result.firstUsable).toBe('192.168.1.1')
      expect(result.lastUsable).toBe('192.168.1.254')
    })

    it('should parse IPv6 CIDR notation', () => {
      const result = parseCidr('2001:db8::/64')
      expect(result.isValid).toBe(true)
      expect(result.networkAddress).toBe('2001:db8::')
      expect(result.version).toBe('ipv6')
    })

    it('should handle invalid CIDR notation', () => {
      const result = parseCidr('192.168.1.0/33')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('isIpInCidr', () => {
    it('should check if IP is in CIDR range', () => {
      expect(isIpInCidr('192.168.1.1', '192.168.1.0/24')).toBe(true)
      expect(isIpInCidr('192.168.2.1', '192.168.1.0/24')).toBe(false)
      expect(isIpInCidr('10.0.0.1', '10.0.0.0/8')).toBe(true)
    })
  })

  describe('ipToCidr', () => {
    it('should convert IP to CIDR notation', () => {
      const result = ipToCidr('192.168.1.1', 24)
      expect(result.isValid).toBe(true)
      expect(result.cidr).toBe('192.168.1.1/24')
      expect(result.networkAddress).toBe('192.168.1.0')
      expect(result.subnetMask).toBe('255.255.255.0')
    })

    it('should handle invalid prefix lengths', () => {
      const result = ipToCidr('192.168.1.1', 33)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('ipToCidrAuto', () => {
    it('should automatically suggest CIDR for private IPs', () => {
      const result = ipToCidrAuto('192.168.1.1')
      expect(result.isValid).toBe(true)
      expect(result.cidr).toBe('192.168.1.1/16')
      expect(result.networkAddress).toBe('192.168.0.0')
    })

    it('should automatically suggest CIDR for public IPs', () => {
      const result = ipToCidrAuto('8.8.8.8')
      expect(result.isValid).toBe(true)
      expect(result.cidr).toBe('8.8.8.8/24')
    })
  })

  describe('getCidrSuggestions', () => {
    it('should provide CIDR suggestions for IPv4', () => {
      const suggestions = getCidrSuggestions('192.168.1.1')
      expect(suggestions).toContain('192.168.1.1/32')
      expect(suggestions).toContain('192.168.1.1/24')
      expect(suggestions).toContain('192.168.1.1/16')
      expect(suggestions).toContain('192.168.1.1/8')
    })

    it('should provide CIDR suggestions for IPv6', () => {
      const suggestions = getCidrSuggestions('2001:db8::1')
      expect(suggestions).toContain('2001:db8::1/128')
      expect(suggestions).toContain('2001:db8::1/64')
      expect(suggestions).toContain('2001:db8::1/48')
      expect(suggestions).toContain('2001:db8::1/32')
    })
  })

  describe('cidrToRange', () => {
    it('should convert CIDR to IP range', () => {
      const result = cidrToRange('192.168.1.0/24')
      expect(result.isValid).toBe(true)
      expect(result.startIp).toBe('192.168.1.0')
      expect(result.endIp).toBe('192.168.1.255')
      expect(result.totalHosts).toBe(256)
      expect(result.usableHosts).toBe(254)
      expect(result.firstUsable).toBe('192.168.1.1')
      expect(result.lastUsable).toBe('192.168.1.254')
    })

    it('should handle small networks', () => {
      const result = cidrToRange('192.168.1.0/30')
      expect(result.isValid).toBe(true)
      expect(result.startIp).toBe('192.168.1.0')
      expect(result.endIp).toBe('192.168.1.3')
      expect(result.totalHosts).toBe(4)
      expect(result.usableHosts).toBe(2)
    })
  })

  describe('generateIpRange', () => {
    it('should generate IP addresses in range', () => {
      const ips = generateIpRange('192.168.1.0/30', 10)
      expect(ips).toEqual(['192.168.1.0', '192.168.1.1', '192.168.1.2', '192.168.1.3'])
    })

    it('should respect maximum IP limit', () => {
      const ips = generateIpRange('192.168.1.0/24', 5)
      expect(ips.length).toBe(5)
    })
  })

  describe('cidrRangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      expect(cidrRangesOverlap('192.168.1.0/24', '192.168.1.0/25')).toBe(true)
      expect(cidrRangesOverlap('192.168.1.0/24', '192.168.2.0/24')).toBe(false)
      expect(cidrRangesOverlap('192.168.1.0/24', '192.168.1.128/25')).toBe(true)
    })
  })

  describe('getNextIpInRange', () => {
    it('should get next IP in range', () => {
      expect(getNextIpInRange('192.168.1.0/30', '192.168.1.0')).toBe('192.168.1.1')
      expect(getNextIpInRange('192.168.1.0/30', '192.168.1.1')).toBe('192.168.1.2')
      expect(getNextIpInRange('192.168.1.0/30', '192.168.1.2')).toBe('192.168.1.3')
      expect(getNextIpInRange('192.168.1.0/30', '192.168.1.3')).toBe(null)
    })
  })

  describe('analyzeNetwork', () => {
    it('should analyze IPv4 network', () => {
      const result = analyzeNetwork('192.168.1.0/24')
      expect(result.isValid).toBe(true)
      expect(result.networkAddress).toBe('192.168.1.0')
      expect(result.broadcastAddress).toBe('192.168.1.255')
      expect(result.subnetMask).toBe('255.255.255.0')
      expect(result.wildcardMask).toBe('0.0.0.255')
      expect(result.networkClass).toBe('C')
      expect(result.isPrivate).toBe(true)
      expect(result.hostBits).toBe(8)
      expect(result.networkBits).toBe(24)
    })

    it('should analyze IPv6 network', () => {
      const result = analyzeNetwork('2001:db8::/64')
      expect(result.isValid).toBe(true)
      expect(result.networkAddress).toBe('2001:db8::')
      expect(result.networkClass).toBe('IPv6')
      expect(result.hostBits).toBe(64)
      expect(result.networkBits).toBe(64)
    })
  })

  describe('calculateSubnets', () => {
    it('should calculate subnets for a network', () => {
      const result = calculateSubnets('192.168.1.0/24', 4)
      expect(result.isValid).toBe(true)
      expect(result.totalSubnets).toBe(4)
      expect(result.hostsPerSubnet).toBe(62)
      expect(result.subnets).toHaveLength(4)

      // Check first subnet
      expect(result.subnets[0].network).toBe('192.168.1.0')
      expect(result.subnets[0].broadcast).toBe('192.168.1.63')
      expect(result.subnets[0].usableHosts).toBe(62)
    })

    it('should handle small networks', () => {
      const result = calculateSubnets('192.168.1.0/30', 2)
      expect(result.isValid).toBe(true)
      expect(result.totalSubnets).toBe(2)
      expect(result.hostsPerSubnet).toBe(0)
    })
  })

  describe('getNetworkStats', () => {
    it('should provide network statistics', () => {
      const result = getNetworkStats('192.168.1.0/24')
      expect(result.isValid).toBe(true)
      expect(result.networkSize).toBe('Medium Network')
      expect(result.hostDensity).toBe('High density (90%+ usable)')
      expect(result.commonUses).toContain('Department networks')
      expect(result.subnetRecommendations.length).toBeGreaterThan(0)
    })

    it('should handle large networks', () => {
      const result = getNetworkStats('10.0.0.0/8')
      expect(result.isValid).toBe(true)
      expect(result.networkSize).toBe('Very Large Network')
      expect(result.commonUses).toContain('ISP backbone')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      expect(validateIpAddress('')).toEqual({
        isValid: false,
        version: null,
        error: 'ipaddr: the address has neither IPv6 nor IPv4 format',
      })
    })

    it('should handle malformed CIDR', () => {
      expect(validateCidr('192.168.1.0/')).toEqual({
        isValid: false,
        ip: '',
        prefixLength: 0,
        version: null,
        error: 'Invalid CIDR format. Expected format: IP/PREFIX (e.g., 192.168.1.0/24)',
      })
    })

    it('should handle out of range prefix lengths', () => {
      expect(validateCidr('192.168.1.0/33')).toEqual({
        isValid: false,
        ip: '192.168.1.0',
        prefixLength: 33,
        version: 'ipv4',
        error: 'Prefix length must be between 0 and 32 for ipv4',
      })
    })
  })

  describe('Performance', () => {
    it('should handle large networks efficiently', () => {
      const start = Date.now()
      const result = analyzeNetwork('10.0.0.0/8')
      const end = Date.now()

      expect(result.isValid).toBe(true)
      expect(end - start).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should handle multiple operations efficiently', () => {
      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        validateIpAddress('192.168.1.1')
        parseCidr('192.168.1.0/24')
        analyzeNetwork('192.168.1.0/24')
      }

      const end = Date.now()
      expect(end - start).toBeLessThan(1000) // Should complete in under 1 second
    })
  })
})
