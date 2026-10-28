import ipaddr from 'ipaddr.js';

/**
 * IP Address and CIDR Converter Utility Functions
 *
 * This module provides functions for:
 * - IP address validation (IPv4 and IPv6)
 * - CIDR notation parsing and validation
 * - IP to CIDR conversion
 * - CIDR to IP range conversion
 * - Network analysis and calculations
 */

export interface IpValidationResult {
  isValid: boolean;
  version: 'ipv4' | 'ipv6' | null;
  error?: string;
}

export interface CidrValidationResult {
  isValid: boolean;
  ip: string;
  prefixLength: number;
  version: 'ipv4' | 'ipv6' | null;
  error?: string;
}

export interface IpRange {
  start: string;
  end: string;
  count: number;
}

export interface NetworkAnalysis {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  usableHosts: number;
  totalHosts: number;
  firstUsable: string;
  lastUsable: string;
}

export interface CidrParseResult {
  isValid: boolean;
  ip: string;
  prefixLength: number;
  version: 'ipv4' | 'ipv6' | null;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  totalHosts: number;
  usableHosts: number;
  firstUsable: string;
  lastUsable: string;
  error?: string;
}

export interface IpToCidrResult {
  isValid: boolean;
  ip: string;
  cidr: string;
  prefixLength: number;
  version: 'ipv4' | 'ipv6' | null;
  networkAddress: string;
  subnetMask: string;
  error?: string;
}

export interface CidrToRangeResult {
  isValid: boolean;
  cidr: string;
  startIp: string;
  endIp: string;
  totalHosts: number;
  usableHosts: number;
  version: 'ipv4' | 'ipv6' | null;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  error?: string;
}

export interface NetworkAnalysisResult {
  isValid: boolean;
  cidr: string;
  version: 'ipv4' | 'ipv6' | null;
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  prefixLength: number;
  totalHosts: number;
  usableHosts: number;
  firstUsable: string;
  lastUsable: string;
  networkClass: string;
  isPrivate: boolean;
  isLoopback: boolean;
  isMulticast: boolean;
  isLinkLocal: boolean;
  hostBits: number;
  networkBits: number;
  error?: string;
}

export interface SubnetInfo {
  isValid: boolean;
  cidr: string;
  subnets: {
    network: string;
    broadcast: string;
    firstUsable: string;
    lastUsable: string;
    usableHosts: number;
  }[];
  totalSubnets: number;
  hostsPerSubnet: number;
  error?: string;
}

/**
 * Validate an IP address (IPv4 or IPv6)
 */
export function validateIpAddress(ip: string): IpValidationResult {
  try {
    const addr = ipaddr.process(ip);

    if (addr.kind() === 'ipv4') {
      return {
        isValid: true,
        version: 'ipv4'
      };
    } else if (addr.kind() === 'ipv6') {
      return {
        isValid: true,
        version: 'ipv6'
      };
    }

    return {
      isValid: false,
      version: null,
      error: 'Unknown IP address format'
    };
  } catch (error) {
    return {
      isValid: false,
      version: null,
      error: error instanceof Error ? error.message : 'Invalid IP address format'
    };
  }
}

/**
 * Validate CIDR notation (e.g., "192.168.1.0/24")
 */
export function validateCidr(cidr: string): CidrValidationResult {
  try {
    const [ipPart, prefixPart] = cidr.split('/');

    if (!ipPart || !prefixPart) {
      return {
        isValid: false,
        ip: '',
        prefixLength: 0,
        version: null,
        error: 'Invalid CIDR format. Expected format: IP/PREFIX (e.g., 192.168.1.0/24)'
      };
    }

    const prefixLength = parseInt(prefixPart, 10);

    if (isNaN(prefixLength)) {
      return {
        isValid: false,
        ip: ipPart,
        prefixLength: 0,
        version: null,
        error: 'Prefix length must be a number'
      };
    }

    // Validate IP address
    const ipValidation = validateIpAddress(ipPart);
    if (!ipValidation.isValid) {
      return {
        isValid: false,
        ip: ipPart,
        prefixLength,
        version: null,
        error: ipValidation.error
      };
    }

    // Validate prefix length
    const maxPrefix = ipValidation.version === 'ipv4' ? 32 : 128;
    if (prefixLength < 0 || prefixLength > maxPrefix) {
      return {
        isValid: false,
        ip: ipPart,
        prefixLength,
        version: ipValidation.version,
        error: `Prefix length must be between 0 and ${maxPrefix} for ${ipValidation.version}`
      };
    }

    return {
      isValid: true,
      ip: ipPart,
      prefixLength,
      version: ipValidation.version!
    };
  } catch (error) {
    return {
      isValid: false,
      ip: '',
      prefixLength: 0,
      version: null,
      error: error instanceof Error ? error.message : 'Invalid CIDR format'
    };
  }
}

/**
 * Check if an IP address is private
 */
export function isPrivateIp(ip: string): boolean {
  try {
    const addr = ipaddr.process(ip);
    return addr.range() !== 'unicast';
  } catch {
    return false;
  }
}

/**
 * Check if an IP address is a loopback address
 */
export function isLoopbackIp(ip: string): boolean {
  try {
    const addr = ipaddr.process(ip);
    return addr.range() === 'loopback';
  } catch {
    return false;
  }
}

/**
 * Get IP address information
 */
export function getIpInfo(ip: string): {
  version: 'ipv4' | 'ipv6' | null;
  isPrivate: boolean;
  isLoopback: boolean;
  isMulticast: boolean;
  isLinkLocal: boolean;
  range: string;
} {
  try {
    const addr = ipaddr.process(ip);
    const range = addr.range();
    return {
      version: addr.kind() as 'ipv4' | 'ipv6',
      isPrivate: range !== 'unicast',
      isLoopback: range === 'loopback',
      isMulticast: range === 'multicast',
      isLinkLocal: range === 'linkLocal',
      range
    };
  } catch {
    return {
      version: null,
      isPrivate: false,
      isLoopback: false,
      isMulticast: false,
      isLinkLocal: false,
      range: 'unknown'
    };
  }
}

/**
 * Parse CIDR notation and extract network information
 */
export function parseCidr(cidr: string): CidrParseResult {
  try {
    // First validate the CIDR format
    const cidrValidation = validateCidr(cidr);
    if (!cidrValidation.isValid) {
      return {
        isValid: false,
        ip: cidrValidation.ip,
        prefixLength: cidrValidation.prefixLength,
        version: cidrValidation.version,
        networkAddress: '',
        broadcastAddress: '',
        subnetMask: '',
        totalHosts: 0,
        usableHosts: 0,
        firstUsable: '',
        lastUsable: '',
        error: cidrValidation.error
      };
    }

    const addr = ipaddr.process(cidrValidation.ip);
    const prefixLength = cidrValidation.prefixLength;
    const version = cidrValidation.version!;

    // Calculate network address
    const networkAddr = addr.toString();

    // Calculate broadcast address and other network info
    let broadcastAddr = '';
    let subnetMask = '';
    let totalHosts = 0;
    let usableHosts = 0;
    let firstUsable = '';
    let lastUsable = '';

    if (version === 'ipv4') {
      // For IPv4, calculate broadcast address
      const addrBytes = addr.toByteArray();
      const hostBits = 32 - prefixLength;
      const hostMask = (1 << hostBits) - 1;
      // Calculate broadcast address
      const broadcastBytes = [...addrBytes];
      for (let i = 0; i < 4; i++) {
        const byteIndex = 3 - i;
        const bitsInThisByte = Math.min(hostBits - (i * 8), 8);
        if (bitsInThisByte > 0) {
          const byteMask = (1 << bitsInThisByte) - 1;
          broadcastBytes[byteIndex] |= byteMask;
        }
      }
      broadcastAddr = broadcastBytes.join('.');

      // Calculate subnet mask
      const maskBytes = [0, 0, 0, 0];
      for (let i = 0; i < prefixLength; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = 7 - (i % 8);
        maskBytes[byteIndex] |= (1 << bitIndex);
      }
      subnetMask = maskBytes.join('.');

      // Calculate host counts
      totalHosts = Math.pow(2, hostBits);
      usableHosts = Math.max(0, totalHosts - 2); // Subtract network and broadcast

      // Calculate first and last usable addresses
      if (usableHosts > 0) {
        const networkBytes = [...addrBytes];
        networkBytes[3] = (networkBytes[3] & ~hostMask) + 1; // First usable
        firstUsable = networkBytes.join('.');

        const lastBytes = [...broadcastBytes];
        lastBytes[3] = (lastBytes[3] & ~hostMask) + (hostMask - 1); // Last usable
        lastUsable = lastBytes.join('.');
      }
    } else if (version === 'ipv6') {
      // For IPv6, use different calculations
      const hostBits = 128 - prefixLength;
      totalHosts = Math.pow(2, hostBits);
      usableHosts = totalHosts; // IPv6 doesn't have broadcast address

      // For IPv6, we'll use the network address as first usable
      firstUsable = networkAddr;
      lastUsable = networkAddr; // Simplified for now
      broadcastAddr = networkAddr; // IPv6 doesn't have broadcast
      subnetMask = `/${prefixLength}`; // IPv6 uses prefix notation
    }

    return {
      isValid: true,
      ip: cidrValidation.ip,
      prefixLength,
      version,
      networkAddress: networkAddr,
      broadcastAddress: broadcastAddr,
      subnetMask,
      totalHosts,
      usableHosts,
      firstUsable,
      lastUsable
    };
  } catch (error) {
    return {
      isValid: false,
      ip: '',
      prefixLength: 0,
      version: null,
      networkAddress: '',
      broadcastAddress: '',
      subnetMask: '',
      totalHosts: 0,
      usableHosts: 0,
      firstUsable: '',
      lastUsable: '',
      error: error instanceof Error ? error.message : 'Failed to parse CIDR notation'
    };
  }
}

/**
 * Extract IP address from CIDR notation
 */
export function extractIpFromCidr(cidr: string): string {
  const parts = cidr.split('/');
  return parts[0] || '';
}

/**
 * Extract prefix length from CIDR notation
 */
export function extractPrefixFromCidr(cidr: string): number {
  const parts = cidr.split('/');
  return parseInt(parts[1] || '0', 10);
}

/**
 * Check if an IP address is within a CIDR range
 */
export function isIpInCidr(ip: string, cidr: string): boolean {
  try {
    const ipAddr = ipaddr.process(ip);
    const [networkIp, prefixLength] = cidr.split('/');
    const networkAddr = ipaddr.process(networkIp);
    const prefix = parseInt(prefixLength, 10);

    // For IPv4
    if (ipAddr.kind() === 'ipv4' && networkAddr.kind() === 'ipv4') {
      const ipBytes = ipAddr.toByteArray();
      const networkBytes = networkAddr.toByteArray();

      // Check if the IP matches the network prefix
      const bytesToCheck = Math.floor(prefix / 8);
      const bitsInLastByte = prefix % 8;

      for (let i = 0; i < bytesToCheck; i++) {
        if (ipBytes[i] !== networkBytes[i]) {
          return false;
        }
      }

      if (bitsInLastByte > 0) {
        const mask = (0xFF << (8 - bitsInLastByte)) & 0xFF;
        if ((ipBytes[bytesToCheck] & mask) !== (networkBytes[bytesToCheck] & mask)) {
          return false;
        }
      }

      return true;
    }

    // For IPv6 (simplified)
    if (ipAddr.kind() === 'ipv6' && networkAddr.kind() === 'ipv6') {
      const ipBytes = ipAddr.toByteArray();
      const networkBytes = networkAddr.toByteArray();

      const bytesToCheck = Math.floor(prefix / 8);
      const bitsInLastByte = prefix % 8;

      for (let i = 0; i < bytesToCheck; i++) {
        if (ipBytes[i] !== networkBytes[i]) {
          return false;
        }
      }

      if (bitsInLastByte > 0) {
        const mask = (0xFF << (8 - bitsInLastByte)) & 0xFF;
        if ((ipBytes[bytesToCheck] & mask) !== (networkBytes[bytesToCheck] & mask)) {
          return false;
        }
      }

      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Convert IP address to CIDR notation with specified prefix length
 */
export function ipToCidr(ip: string, prefixLength: number): IpToCidrResult {
  try {
    // Validate IP address first
    const ipValidation = validateIpAddress(ip);
    if (!ipValidation.isValid) {
      return {
        isValid: false,
        ip,
        cidr: '',
        prefixLength: 0,
        version: null,
        networkAddress: '',
        subnetMask: '',
        error: ipValidation.error
      };
    }

    const version = ipValidation.version!;
    const maxPrefix = version === 'ipv4' ? 32 : 128;

    // Validate prefix length
    if (prefixLength < 0 || prefixLength > maxPrefix) {
      return {
        isValid: false,
        ip,
        cidr: '',
        prefixLength,
        version,
        networkAddress: '',
        subnetMask: '',
        error: `Prefix length must be between 0 and ${maxPrefix} for ${version}`
      };
    }

    const addr = ipaddr.process(ip);
    const cidr = `${ip}/${prefixLength}`;

    // Calculate network address and subnet mask
    let networkAddress = '';
    let subnetMask = '';

    if (version === 'ipv4') {
      // Calculate network address for IPv4
      const addrBytes = addr.toByteArray();
      const hostBits = 32 - prefixLength;
      // Calculate network address
      const networkBytes = [...addrBytes];
      for (let i = 0; i < 4; i++) {
        const byteIndex = 3 - i;
        const bitsInThisByte = Math.min(hostBits - (i * 8), 8);
        if (bitsInThisByte > 0) {
          const byteMask = (1 << bitsInThisByte) - 1;
          networkBytes[byteIndex] &= ~byteMask;
        }
      }
      networkAddress = networkBytes.join('.');

      // Calculate subnet mask
      const maskBytes = [0, 0, 0, 0];
      for (let i = 0; i < prefixLength; i++) {
        const byteIndex = Math.floor(i / 8);
        const bitIndex = 7 - (i % 8);
        maskBytes[byteIndex] |= (1 << bitIndex);
      }
      subnetMask = maskBytes.join('.');
    } else if (version === 'ipv6') {
      // For IPv6, use the IP as network address
      networkAddress = ip;
      subnetMask = `/${prefixLength}`;
    }

    return {
      isValid: true,
      ip,
      cidr,
      prefixLength,
      version,
      networkAddress,
      subnetMask
    };
  } catch (error) {
    return {
      isValid: false,
      ip,
      cidr: '',
      prefixLength: 0,
      version: null,
      networkAddress: '',
      subnetMask: '',
      error: error instanceof Error ? error.message : 'Failed to convert IP to CIDR'
    };
  }
}

/**
 * Convert IP address to CIDR with automatic prefix length detection
 */
export function ipToCidrAuto(ip: string): IpToCidrResult {
  try {
    const ipValidation = validateIpAddress(ip);
    if (!ipValidation.isValid) {
      return {
        isValid: false,
        ip,
        cidr: '',
        prefixLength: 0,
        version: null,
        networkAddress: '',
        subnetMask: '',
        error: ipValidation.error
      };
    }

    const version = ipValidation.version!;

    // For automatic detection, use common prefix lengths
    let suggestedPrefix = 24; // Default for IPv4
    if (version === 'ipv6') {
      suggestedPrefix = 64; // Default for IPv6
    }

    // Check if it's a private IP and suggest appropriate prefix
    const ipInfo = getIpInfo(ip);
    if (ipInfo.isPrivate) {
      if (version === 'ipv4') {
        // Suggest common private network prefixes
        if (ip.startsWith('10.')) {
          suggestedPrefix = 8; // Class A private
        } else if (ip.startsWith('172.16.') || ip.startsWith('172.17.') ||
                   ip.startsWith('172.18.') || ip.startsWith('172.19.') ||
                   ip.startsWith('172.20.') || ip.startsWith('172.21.') ||
                   ip.startsWith('172.22.') || ip.startsWith('172.23.') ||
                   ip.startsWith('172.24.') || ip.startsWith('172.25.') ||
                   ip.startsWith('172.26.') || ip.startsWith('172.27.') ||
                   ip.startsWith('172.28.') || ip.startsWith('172.29.') ||
                   ip.startsWith('172.30.') || ip.startsWith('172.31.')) {
          suggestedPrefix = 12; // Class B private
        } else if (ip.startsWith('192.168.')) {
          suggestedPrefix = 16; // Class C private
        }
      }
    }

    return ipToCidr(ip, suggestedPrefix);
  } catch (error) {
    return {
      isValid: false,
      ip,
      cidr: '',
      prefixLength: 0,
      version: null,
      networkAddress: '',
      subnetMask: '',
      error: error instanceof Error ? error.message : 'Failed to convert IP to CIDR automatically'
    };
  }
}

/**
 * Get common CIDR suggestions for an IP address
 */
export function getCidrSuggestions(ip: string): string[] {
  try {
    const ipValidation = validateIpAddress(ip);
    if (!ipValidation.isValid) {
      return [];
    }

    const version = ipValidation.version!;
    const suggestions: string[] = [];

    if (version === 'ipv4') {
      // Common IPv4 CIDR suggestions
      suggestions.push(`${ip}/32`); // Single host
      suggestions.push(`${ip}/24`); // /24 network
      suggestions.push(`${ip}/16`); // /16 network
      suggestions.push(`${ip}/8`);  // /8 network

      // Add private network suggestions if applicable
      if (ip.startsWith('192.168.')) {
        suggestions.push('192.168.0.0/16');
      } else if (ip.startsWith('10.')) {
        suggestions.push('10.0.0.0/8');
      } else if (ip.startsWith('172.')) {
        suggestions.push('172.16.0.0/12');
      }
    } else if (version === 'ipv6') {
      // Common IPv6 CIDR suggestions
      suggestions.push(`${ip}/128`); // Single host
      suggestions.push(`${ip}/64`);  // /64 network
      suggestions.push(`${ip}/48`);  // /48 network
      suggestions.push(`${ip}/32`);  // /32 network
    }

    return suggestions;
  } catch {
    return [];
  }
}

/**
 * Convert CIDR notation to IP range
 */
export function cidrToRange(cidr: string): CidrToRangeResult {
  try {
    // First validate the CIDR format
    const cidrValidation = validateCidr(cidr);
    if (!cidrValidation.isValid) {
      return {
        isValid: false,
        cidr,
        startIp: '',
        endIp: '',
        totalHosts: 0,
        usableHosts: 0,
        version: null,
        networkAddress: '',
        broadcastAddress: '',
        firstUsable: '',
        lastUsable: '',
        error: cidrValidation.error
      };
    }

    const addr = ipaddr.process(cidrValidation.ip);
    const prefixLength = cidrValidation.prefixLength;
    const version = cidrValidation.version!;

    let startIp = '';
    let endIp = '';
    let totalHosts = 0;
    let usableHosts = 0;
    let networkAddress = '';
    let broadcastAddress = '';
    let firstUsable = '';
    let lastUsable = '';

    if (version === 'ipv4') {
      const addrBytes = addr.toByteArray();
      const hostBits = 32 - prefixLength;
      totalHosts = Math.pow(2, hostBits);
      usableHosts = Math.max(0, totalHosts - 2); // Subtract network and broadcast

      // Calculate network address (start IP)
      const networkBytes = [...addrBytes];
      for (let i = 0; i < 4; i++) {
        const byteIndex = 3 - i;
        const bitsInThisByte = Math.min(hostBits - (i * 8), 8);
        if (bitsInThisByte > 0) {
          const byteMask = (1 << bitsInThisByte) - 1;
          networkBytes[byteIndex] &= ~byteMask;
        }
      }
      networkAddress = networkBytes.join('.');
      startIp = networkAddress;

      // Calculate broadcast address (end IP)
      const broadcastBytes = [...networkBytes];
      for (let i = 0; i < 4; i++) {
        const byteIndex = 3 - i;
        const bitsInThisByte = Math.min(hostBits - (i * 8), 8);
        if (bitsInThisByte > 0) {
          const byteMask = (1 << bitsInThisByte) - 1;
          broadcastBytes[byteIndex] |= byteMask;
        }
      }
      broadcastAddress = broadcastBytes.join('.');
      endIp = broadcastAddress;

      // Calculate first and last usable addresses
      if (usableHosts > 0) {
        const firstBytes = [...networkBytes];
        firstBytes[3] = (firstBytes[3] & ~((1 << hostBits) - 1)) + 1;
        firstUsable = firstBytes.join('.');

        const lastBytes = [...broadcastBytes];
        lastBytes[3] = (lastBytes[3] & ~((1 << hostBits) - 1)) + ((1 << hostBits) - 2);
        lastUsable = lastBytes.join('.');
      }
    } else if (version === 'ipv6') {
      // For IPv6, use the network address as both start and end
      networkAddress = addr.toString();
      startIp = networkAddress;
      endIp = networkAddress;
      broadcastAddress = networkAddress;
      firstUsable = networkAddress;
      lastUsable = networkAddress;

      const hostBits = 128 - prefixLength;
      totalHosts = Math.pow(2, hostBits);
      usableHosts = totalHosts; // IPv6 doesn't have broadcast address
    }

    return {
      isValid: true,
      cidr,
      startIp,
      endIp,
      totalHosts,
      usableHosts,
      version,
      networkAddress,
      broadcastAddress,
      firstUsable,
      lastUsable
    };
  } catch (error) {
    return {
      isValid: false,
      cidr,
      startIp: '',
      endIp: '',
      totalHosts: 0,
      usableHosts: 0,
      version: null,
      networkAddress: '',
      broadcastAddress: '',
      firstUsable: '',
      lastUsable: '',
      error: error instanceof Error ? error.message : 'Failed to convert CIDR to IP range'
    };
  }
}

/**
 * Generate all IP addresses in a CIDR range (for small ranges only)
 */
export function generateIpRange(cidr: string, maxIps: number = 1000): string[] {
  try {
    const rangeResult = cidrToRange(cidr);
    if (!rangeResult.isValid || rangeResult.version !== 'ipv4') {
      return [];
    }

    const ips: string[] = [];
    const startBytes = ipaddr.process(rangeResult.startIp).toByteArray();
    const endBytes = ipaddr.process(rangeResult.endIp).toByteArray();

    // Convert to numbers for comparison
    const startNum = (startBytes[0] << 24) | (startBytes[1] << 16) | (startBytes[2] << 8) | startBytes[3];
    const endNum = (endBytes[0] << 24) | (endBytes[1] << 16) | (endBytes[2] << 8) | endBytes[3];

    let currentNum = startNum;
    let count = 0;

    // Generate IPs until we reach the end or hit the limit
    while (count < maxIps && currentNum <= endNum) {
      const bytes = [
        (currentNum >>> 24) & 0xFF,
        (currentNum >>> 16) & 0xFF,
        (currentNum >>> 8) & 0xFF,
        currentNum & 0xFF
      ];
      ips.push(bytes.join('.'));
      currentNum++;
      count++;
    }

    return ips;
  } catch {
    return [];
  }
}

/**
 * Check if two CIDR ranges overlap
 */
export function cidrRangesOverlap(cidr1: string, cidr2: string): boolean {
  try {
    const range1 = cidrToRange(cidr1);
    const range2 = cidrToRange(cidr2);

    if (!range1.isValid || !range2.isValid || range1.version !== range2.version) {
      return false;
    }

    if (range1.version === 'ipv4') {
      // Convert IPs to numbers for comparison
      const start1Bytes = ipaddr.process(range1.startIp).toByteArray();
      const end1Bytes = ipaddr.process(range1.endIp).toByteArray();
      const start2Bytes = ipaddr.process(range2.startIp).toByteArray();
      const end2Bytes = ipaddr.process(range2.endIp).toByteArray();

      const start1Num = (start1Bytes[0] << 24) | (start1Bytes[1] << 16) | (start1Bytes[2] << 8) | start1Bytes[3];
      const end1Num = (end1Bytes[0] << 24) | (end1Bytes[1] << 16) | (end1Bytes[2] << 8) | end1Bytes[3];
      const start2Num = (start2Bytes[0] << 24) | (start2Bytes[1] << 16) | (start2Bytes[2] << 8) | start2Bytes[3];
      const end2Num = (end2Bytes[0] << 24) | (end2Bytes[1] << 16) | (end2Bytes[2] << 8) | end2Bytes[3];

      // Check if ranges overlap
      return (start1Num <= end2Num && end1Num >= start2Num);
    }

    // For IPv6, simplified comparison
    return range1.startIp === range2.startIp;
  } catch {
    return false;
  }
}

/**
 * Get the next available IP in a CIDR range
 */
export function getNextIpInRange(cidr: string, currentIp: string): string | null {
  try {
    const rangeResult = cidrToRange(cidr);
    if (!rangeResult.isValid || rangeResult.version !== 'ipv4') {
      return null;
    }

    const currentBytes = ipaddr.process(currentIp).toByteArray();
    const endBytes = ipaddr.process(rangeResult.endIp).toByteArray();

    // Convert to numbers for comparison
    const currentNum = (currentBytes[0] << 24) | (currentBytes[1] << 16) | (currentBytes[2] << 8) | currentBytes[3];
    const endNum = (endBytes[0] << 24) | (endBytes[1] << 16) | (endBytes[2] << 8) | endBytes[3];

    if (currentNum >= endNum) {
      return null; // Already at or past the end
    }

    const nextNum = currentNum + 1;
    if (nextNum > endNum) {
      return null; // Next IP would be past the end
    }

    // Convert back to IP address
    const nextBytes = [
      (nextNum >>> 24) & 0xFF,
      (nextNum >>> 16) & 0xFF,
      (nextNum >>> 8) & 0xFF,
      nextNum & 0xFF
    ];

    return nextBytes.join('.');
  } catch {
    return null;
  }
}

/**
 * Perform comprehensive network analysis
 */
export function analyzeNetwork(cidr: string): NetworkAnalysisResult {
  try {
    // First validate the CIDR format
    const cidrValidation = validateCidr(cidr);
    if (!cidrValidation.isValid) {
      return {
        isValid: false,
        cidr,
        version: null,
        networkAddress: '',
        broadcastAddress: '',
        subnetMask: '',
        wildcardMask: '',
        prefixLength: 0,
        totalHosts: 0,
        usableHosts: 0,
        firstUsable: '',
        lastUsable: '',
        networkClass: '',
        isPrivate: false,
        isLoopback: false,
        isMulticast: false,
        isLinkLocal: false,
        hostBits: 0,
        networkBits: 0,
        error: cidrValidation.error
      };
    }

    const addr = ipaddr.process(cidrValidation.ip);
    const prefixLength = cidrValidation.prefixLength;
    const version = cidrValidation.version!;

    // Get basic network info from existing functions
    const parseResult = parseCidr(cidr);
    const ipInfo = getIpInfo(cidrValidation.ip);

    let networkAddress = '';
    let broadcastAddress = '';
    let subnetMask = '';
    let wildcardMask = '';
    let totalHosts = 0;
    let usableHosts = 0;
    let firstUsable = '';
    let lastUsable = '';
    let networkClass = '';
    let hostBits = 0;
    let networkBits = 0;

    if (version === 'ipv4') {
      networkAddress = parseResult.networkAddress;
      broadcastAddress = parseResult.broadcastAddress;
      subnetMask = parseResult.subnetMask;
      totalHosts = parseResult.totalHosts;
      usableHosts = parseResult.usableHosts;
      firstUsable = parseResult.firstUsable;
      lastUsable = parseResult.lastUsable;
      hostBits = 32 - prefixLength;
      networkBits = prefixLength;

      // Calculate wildcard mask (inverse of subnet mask)
      const maskBytes = subnetMask.split('.').map(Number);
      const wildcardBytes = maskBytes.map(byte => 255 - byte);
      wildcardMask = wildcardBytes.join('.');

      // Determine network class
      const firstOctet = parseInt(cidrValidation.ip.split('.')[0]);
      if (firstOctet >= 1 && firstOctet <= 126) {
        networkClass = 'A';
      } else if (firstOctet >= 128 && firstOctet <= 191) {
        networkClass = 'B';
      } else if (firstOctet >= 192 && firstOctet <= 223) {
        networkClass = 'C';
      } else if (firstOctet >= 224 && firstOctet <= 239) {
        networkClass = 'D (Multicast)';
      } else if (firstOctet >= 240 && firstOctet <= 255) {
        networkClass = 'E (Reserved)';
      } else {
        networkClass = 'Unknown';
      }
    } else if (version === 'ipv6') {
      networkAddress = addr.toString();
      broadcastAddress = addr.toString(); // IPv6 doesn't have broadcast
      subnetMask = `/${prefixLength}`;
      wildcardMask = `/${128 - prefixLength}`;
      hostBits = 128 - prefixLength;
      networkBits = prefixLength;
      totalHosts = Math.pow(2, hostBits);
      usableHosts = totalHosts;
      firstUsable = networkAddress;
      lastUsable = networkAddress;
      networkClass = 'IPv6';
    }

    return {
      isValid: true,
      cidr,
      version,
      networkAddress,
      broadcastAddress,
      subnetMask,
      wildcardMask,
      prefixLength,
      totalHosts,
      usableHosts,
      firstUsable,
      lastUsable,
      networkClass,
      isPrivate: ipInfo.isPrivate,
      isLoopback: ipInfo.isLoopback,
      isMulticast: ipInfo.isMulticast,
      isLinkLocal: ipInfo.isLinkLocal,
      hostBits,
      networkBits
    };
  } catch (error) {
    return {
      isValid: false,
      cidr,
      version: null,
      networkAddress: '',
      broadcastAddress: '',
      subnetMask: '',
      wildcardMask: '',
      prefixLength: 0,
      totalHosts: 0,
      usableHosts: 0,
      firstUsable: '',
      lastUsable: '',
      networkClass: '',
      isPrivate: false,
      isLoopback: false,
      isMulticast: false,
      isLinkLocal: false,
      hostBits: 0,
      networkBits: 0,
      error: error instanceof Error ? error.message : 'Failed to analyze network'
    };
  }
}

/**
 * Calculate subnet information for a given network
 */
export function calculateSubnets(cidr: string, subnetCount: number): SubnetInfo {
  try {
    const analysis = analyzeNetwork(cidr);
    if (!analysis.isValid || analysis.version !== 'ipv4') {
      return {
        isValid: false,
        cidr,
        subnets: [],
        totalSubnets: 0,
        hostsPerSubnet: 0,
        error: analysis.error || 'Invalid CIDR or not IPv4'
      };
    }

    // Calculate how many bits we need to borrow for the subnets
    const bitsNeeded = Math.ceil(Math.log2(subnetCount));
    const newPrefixLength = analysis.prefixLength + bitsNeeded;

    if (newPrefixLength > 32) {
      return {
        isValid: false,
        cidr,
        subnets: [],
        totalSubnets: 0,
        hostsPerSubnet: 0,
        error: 'Too many subnets requested'
      };
    }

    const subnets: SubnetInfo['subnets'] = [];
    const networkBytes = ipaddr.process(analysis.networkAddress).toByteArray();
    const subnetSize = Math.pow(2, 32 - newPrefixLength);
    const hostsPerSubnet = Math.max(0, subnetSize - 2);

    for (let i = 0; i < subnetCount; i++) {
      // Calculate subnet network address
      const subnetOffset = i * subnetSize;
      const subnetNetworkBytes = [...networkBytes];
      let carry = subnetOffset;

      for (let j = 3; j >= 0; j--) {
        const sum = subnetNetworkBytes[j] + carry;
        subnetNetworkBytes[j] = sum & 0xFF;
        carry = Math.floor(sum / 256);
      }

      const subnetNetwork = subnetNetworkBytes.join('.');

      // Calculate subnet broadcast address
      const subnetBroadcastBytes = [...subnetNetworkBytes];
      const broadcastOffset = subnetSize - 1;
      let broadcastCarry = broadcastOffset;

      for (let j = 3; j >= 0; j--) {
        const sum = subnetBroadcastBytes[j] + broadcastCarry;
        subnetBroadcastBytes[j] = sum & 0xFF;
        broadcastCarry = Math.floor(sum / 256);
      }

      const subnetBroadcast = subnetBroadcastBytes.join('.');

      let firstUsable = '';
      let lastUsable = '';

      if (hostsPerSubnet > 0) {
        // First usable = network + 1
        const firstUsableBytes = [...subnetNetworkBytes];
        let firstCarry = 1;
        for (let j = 3; j >= 0; j--) {
          const sum = firstUsableBytes[j] + firstCarry;
          firstUsableBytes[j] = sum & 0xFF;
          firstCarry = Math.floor(sum / 256);
        }
        firstUsable = firstUsableBytes.join('.');

        // Last usable = broadcast - 1
        const lastUsableBytes = [...subnetBroadcastBytes];
        let lastCarry = -1;
        for (let j = 3; j >= 0; j--) {
          const sum = lastUsableBytes[j] + lastCarry;
          if (sum < 0) {
            lastUsableBytes[j] = 256 + sum;
            lastCarry = -1;
          } else {
            lastUsableBytes[j] = sum;
            lastCarry = 0;
          }
        }
        lastUsable = lastUsableBytes.join('.');
      }

      subnets.push({
        network: subnetNetwork,
        broadcast: subnetBroadcast,
        firstUsable,
        lastUsable,
        usableHosts: hostsPerSubnet
      });
    }

    return {
      isValid: true,
      cidr,
      subnets,
      totalSubnets: subnetCount,
      hostsPerSubnet
    };
  } catch (error) {
    return {
      isValid: false,
      cidr,
      subnets: [],
      totalSubnets: 0,
      hostsPerSubnet: 0,
      error: error instanceof Error ? error.message : 'Failed to calculate subnets'
    };
  }
}

/**
 * Get network statistics and summary
 */
export function getNetworkStats(cidr: string): {
  isValid: boolean;
  cidr: string;
  version: 'ipv4' | 'ipv6' | null;
  networkSize: string;
  hostDensity: string;
  subnetRecommendations: string[];
  commonUses: string[];
  error?: string;
} {
  try {
    const analysis = analyzeNetwork(cidr);
    if (!analysis.isValid) {
      return {
        isValid: false,
        cidr,
        version: null,
        networkSize: '',
        hostDensity: '',
        subnetRecommendations: [],
        commonUses: [],
        error: analysis.error
      };
    }

    let networkSize = '';
    let hostDensity = '';
    const subnetRecommendations: string[] = [];
    const commonUses: string[] = [];

    if (analysis.version === 'ipv4') {
      // Network size classification
      if (analysis.totalHosts <= 2) {
        networkSize = 'Point-to-Point';
        commonUses.push('VPN tunnels', 'Point-to-point links');
      } else if (analysis.totalHosts <= 254) {
        networkSize = 'Small Network';
        commonUses.push('Home networks', 'Small offices', 'Branch offices');
      } else if (analysis.totalHosts <= 65534) {
        networkSize = 'Medium Network';
        commonUses.push('Department networks', 'Campus networks');
      } else if (analysis.totalHosts <= 16777214) {
        networkSize = 'Large Network';
        commonUses.push('Enterprise networks', 'ISP allocations');
      } else {
        networkSize = 'Very Large Network';
        commonUses.push('ISP backbone', 'Major enterprise');
      }

      // Host density
      const density = (analysis.usableHosts / analysis.totalHosts) * 100;
      if (density >= 90) {
        hostDensity = 'High density (90%+ usable)';
      } else if (density >= 70) {
        hostDensity = 'Medium density (70-90% usable)';
      } else if (density >= 50) {
        hostDensity = 'Low density (50-70% usable)';
      } else {
        hostDensity = 'Very low density (<50% usable)';
      }

      // Subnet recommendations based on network size
      if (analysis.totalHosts > 254) {
        subnetRecommendations.push(`Split into /${analysis.prefixLength + 1} subnets (${Math.pow(2, 1)} subnets)`);
        subnetRecommendations.push(`Split into /${analysis.prefixLength + 2} subnets (${Math.pow(2, 2)} subnets)`);
        subnetRecommendations.push(`Split into /${analysis.prefixLength + 3} subnets (${Math.pow(2, 3)} subnets)`);
      }
    } else if (analysis.version === 'ipv6') {
      networkSize = 'IPv6 Network';
      hostDensity = 'IPv6 networks typically have abundant addresses';
      commonUses.push('IPv6 networks', 'Modern internet infrastructure');
    }

    return {
      isValid: true,
      cidr,
      version: analysis.version,
      networkSize,
      hostDensity,
      subnetRecommendations,
      commonUses
    };
  } catch (error) {
    return {
      isValid: false,
      cidr,
      version: null,
      networkSize: '',
      hostDensity: '',
      subnetRecommendations: [],
      commonUses: [],
      error: error instanceof Error ? error.message : 'Failed to get network statistics'
    };
  }
}
