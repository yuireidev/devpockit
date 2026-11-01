import { DEFAULT_IP_OPTIONS as LIB_DEFAULT_IP_OPTIONS, IpCheckerOptions } from '@/libs/ip-checker'

export const DEFAULT_IP_OPTIONS: IpCheckerOptions = LIB_DEFAULT_IP_OPTIONS

export const IP_CHECKER_EXAMPLES = [
  {
    name: 'Basic IP Check',
    description: 'Get your public IP address',
    options: { ...DEFAULT_IP_OPTIONS, showLocation: false, showISP: false, showTimezone: false, showIPv6: false },
  },
  {
    name: 'Full Network Info',
    description: 'Get IP with location and ISP details',
    options: DEFAULT_IP_OPTIONS,
  },
  {
    name: 'IPv4 Only',
    description: 'Get IPv4 address only',
    options: { ...DEFAULT_IP_OPTIONS, showIPv6: false },
  },
  {
    name: 'IPv6 Only',
    description: 'Get IPv6 address only',
    options: { ...DEFAULT_IP_OPTIONS, showLocation: false, showISP: false, showTimezone: false },
  },
]

export const IP_CHECKER_HELP = {
  title: 'IP Address Lookup',
  description: 'Look up information about any IP address or your current public IP address and network details',
  features: [
    'Check any IP address (IPv4 and IPv6)',
    'Get your public IP address automatically',
    'View location information (country, region, city)',
    'Check ISP and organization details',
    'See timezone information',
    'Toggle IPv6 display on/off',
    'Multiple service fallbacks for reliability',
  ],
  tips: [
    'Switch between "My IP" and "Custom IP" modes using the buttons',
    'Enter any valid IPv4 or IPv6 address to check',
    'Location information is approximate and based on IP geolocation',
    'Information is retrieved from reliable sources',
  ],
}
