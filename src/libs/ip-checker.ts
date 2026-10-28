export interface IpInfo {
  ipv4: string | null;
  ipv6: string | null;
  country: string;
  region: string;
  city: string;
  isp: string;
  organization: string;
  timezone: string;
  latitude: number;
  longitude: number;
  query_time: string;
}

interface IpServiceResponse {
  ip?: string;
  query?: string;
  country_name?: string;
  country?: string;
  region?: string;
  regionName?: string;
  city?: string;
  org?: string;
  isp?: string;
  organization?: string;
  timezone?: string;
  latitude?: number;
  lat?: number;
  longitude?: number;
  lon?: number;
}

export interface IpCheckerOptions {
  showLocation: boolean;
  showISP: boolean;
  showTimezone: boolean;
  showIPv6: boolean;
}

export const DEFAULT_IP_OPTIONS: IpCheckerOptions = {
  showLocation: true,
  showISP: true,
  showTimezone: true,
  showIPv6: true
};

/**
 * Check if an IP address is IPv4
 */
function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Check if an IP address is IPv6
 */
function isIPv6(ip: string): boolean {
  // Full IPv6 format: 8 groups of 4 hex digits
  const ipv6FullRegex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  // Compressed IPv6 format with :: (simplified)
  const ipv6CompressedRegex = /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

  // IPv4-mapped IPv6
  const ipv6MappedRegex = /^::ffff:(\d{1,3}\.){3}\d{1,3}$/;

  // Simple check: contains colons and is not IPv4
  const hasColons = ip.includes(':');
  const isNotIPv4 = !isIPv4(ip);

  // If it has colons and is not IPv4, it's likely IPv6
  if (hasColons && isNotIPv4) {
    return true;
  }

  return ipv6FullRegex.test(ip) ||
         ipv6CompressedRegex.test(ip) ||
         ipv6MappedRegex.test(ip);
}

/**
 * Get IP address information for a specific IP or current public IP
 * @param ip - Optional IP address to check. If not provided, checks current public IP
 * @returns IP information including location, ISP, and timezone
 */
export async function getIpInfo(ip?: string): Promise<IpInfo> {
  // If IP is provided, validate and query that specific IP
  if (ip) {
    const trimmedIp = ip.trim();

    // Validate IP format
    if (!isIPv4(trimmedIp) && !isIPv6(trimmedIp)) {
      throw new Error('Invalid IP address format. Please enter a valid IPv4 or IPv6 address.');
    }

    // Use ipapi.co to query the specific IP
    try {
      const response = await fetch(`https://ipapi.co/${trimmedIp}/json/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('IP address not found or invalid');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later. (Free tier: 1,000 requests/day)');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. This may be due to rate limiting or service restrictions.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for error in response
      if (data.error) {
        // ipapi.co returns error messages in the response
        if (data.reason) {
          if (data.reason.includes('rate limit') || data.reason.includes('quota')) {
            throw new Error('Rate limit exceeded. Please try again later. (Free tier: 1,000 requests/day)');
          }
          throw new Error(data.reason);
        }
        throw new Error('Failed to get IP information');
      }

      const queriedIp = data.ip || trimmedIp;
      const ipv4 = isIPv4(queriedIp) ? queriedIp : null;
      const ipv6 = isIPv6(queriedIp) ? queriedIp : null;

      return {
        ipv4,
        ipv6,
        country: data.country_name || data.country || 'Unknown',
        region: data.region || data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        isp: data.org || data.isp || 'Unknown',
        organization: data.org || data.organization || 'Unknown',
        timezone: data.timezone || 'Unknown',
        latitude: data.latitude || data.lat || 0,
        longitude: data.longitude || data.lon || 0,
        query_time: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to get IP information');
    }
  }

  // If no IP provided, get current public IP (original behavior)
  return getPublicIpInfo();
}

/**
 * Get public IP address and basic network information
 * Uses multiple services for reliability with fallbacks
 */
export async function getPublicIpInfo(): Promise<IpInfo> {
  const services = [
    'https://ipapi.co/json/',
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json'
  ];

  let lastError: Error | null = null;
  let ipv4: string | null = null;
  let ipv6: string | null = null;
  let locationData: IpServiceResponse | null = null;

  // Try to get both IPv4 and IPv6
  for (const service of services) {
    try {
      const response = await fetch(service, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden. This may be due to rate limiting.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as IpServiceResponse;
      const ip = data.ip || data.query;

      if (ip) {
        if (isIPv4(ip)) {
          ipv4 = ip;
        } else if (isIPv6(ip)) {
          ipv6 = ip;
        }

        // Store location data from the first successful response
        if (!locationData) {
          locationData = data;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Service ${service} failed:`, lastError.message);
      continue;
    }
  }

  // If we have at least one IP, return the info
  if (ipv4 || ipv6) {
    return {
      ipv4,
      ipv6,
      country: locationData?.country_name || locationData?.country || 'Unknown',
      region: locationData?.region || locationData?.regionName || 'Unknown',
      city: locationData?.city || 'Unknown',
      isp: locationData?.org || locationData?.isp || 'Unknown',
      organization: locationData?.org || locationData?.organization || 'Unknown',
      timezone: locationData?.timezone || 'Unknown',
      latitude: locationData?.latitude || locationData?.lat || 0,
      longitude: locationData?.longitude || locationData?.lon || 0,
      query_time: new Date().toISOString()
    };
  }

  throw new Error(`All IP services failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Format IP information for display
 * Enhanced to support both IPv4 and IPv6
 */
export function formatIpInfo(ipInfo: IpInfo, options: IpCheckerOptions): string {
  let output = `🕒 Checked at: ${new Date(ipInfo.query_time).toLocaleString()}\n\n`;

  // Display IP addresses
  output += `🌐 Public IP Addresses:\n`;

  if (ipInfo.ipv4) {
    output += `   IPv4: ${ipInfo.ipv4}\n`;
  }

  if (ipInfo.ipv6 && options.showIPv6) {
    output += `   IPv6: ${ipInfo.ipv6}\n`;
  }

  if (!ipInfo.ipv4 && !ipInfo.ipv6) {
    output += `   No IP addresses detected\n`;
  }

  output += `\n`;

  if (options.showLocation) {
    output += `📍 Location Information:\n`;
    output += `   Country: ${ipInfo.country}\n`;
    output += `   Region: ${ipInfo.region}\n`;
    output += `   City: ${ipInfo.city}\n`;
    if (ipInfo.latitude !== 0 && ipInfo.longitude !== 0) {
      output += `   Coordinates: ${ipInfo.latitude}, ${ipInfo.longitude}\n`;
    }
    output += `\n`;
  }

  if (options.showISP) {
    output += `🏢 Network Information:\n`;
    output += `   ISP: ${ipInfo.isp}\n`;
    output += `   Organization: ${ipInfo.organization}\n`;
    output += `\n`;
  }

  if (options.showTimezone) {
    output += `⏰ Timezone: ${ipInfo.timezone}\n`;
  }

  return output;
}
