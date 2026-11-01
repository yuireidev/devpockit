/**
 * IP CIDR Converter Tool Configuration
 * Contains examples, common networks, and educational content
 */

export interface IpCidrExample {
  name: string
  description: string
  cidr: string
  category: string
  useCase: string
  hosts: number
  networkClass: string
}

export interface CommonNetwork {
  name: string
  cidr: string
  description: string
  hosts: number
  category: string
  isPrivate: boolean
}

export interface NetworkClass {
  name: string
  range: string
  defaultSubnet: string
  description: string
  hosts: number
}

// Default tool options
export const DEFAULT_IP_CIDR_OPTIONS = {
  inputType: 'cidr' as 'ip' | 'cidr',
  showNetworkInfo: true,
  showSubnetInfo: true,
  showStatistics: true,
  showExamples: true,
  maxSubnets: 8,
  includePrivate: true,
  includePublic: true,
  includeIPv6: true,
}

// Common IPv4 CIDR examples
export const IP_CIDR_EXAMPLES: IpCidrExample[] = [
  // Private Networks
  {
    name: 'Home Network',
    description: 'Typical home router network',
    cidr: '192.168.1.0/24',
    category: 'Private',
    useCase: 'Home networks, small offices',
    hosts: 254,
    networkClass: 'C',
  },
  {
    name: 'Corporate Network',
    description: 'Medium-sized corporate network',
    cidr: '10.0.0.0/16',
    category: 'Private',
    useCase: 'Corporate networks, data centers',
    hosts: 65534,
    networkClass: 'A',
  },
  {
    name: 'VPN Network',
    description: 'Point-to-point VPN connection',
    cidr: '172.16.0.0/30',
    category: 'Private',
    useCase: 'VPN tunnels, point-to-point links',
    hosts: 2,
    networkClass: 'B',
  },
  {
    name: 'DMZ Network',
    description: 'Demilitarized zone for servers',
    cidr: '192.168.100.0/28',
    category: 'Private',
    useCase: 'DMZ servers, public-facing services',
    hosts: 14,
    networkClass: 'C',
  },
  {
    name: 'Guest Network',
    description: 'Isolated guest wireless network',
    cidr: '192.168.200.0/24',
    category: 'Private',
    useCase: 'Guest access, visitor networks',
    hosts: 254,
    networkClass: 'C',
  },

  // Public Networks
  {
    name: 'ISP Allocation',
    description: 'Typical ISP customer allocation',
    cidr: '203.0.113.0/24',
    category: 'Public',
    useCase: 'ISP allocations, web hosting',
    hosts: 254,
    networkClass: 'C',
  },
  {
    name: 'Cloud Provider',
    description: 'Cloud infrastructure network',
    cidr: '198.51.100.0/22',
    category: 'Public',
    useCase: 'Cloud services, CDN networks',
    hosts: 1022,
    networkClass: 'C',
  },
  {
    name: 'Data Center',
    description: 'Large data center network',
    cidr: '203.0.113.0/20',
    category: 'Public',
    useCase: 'Data centers, hosting providers',
    hosts: 4094,
    networkClass: 'C',
  },

  // Special Purpose
  {
    name: 'Loopback',
    description: 'Local loopback interface',
    cidr: '127.0.0.1/32',
    category: 'Special',
    useCase: 'Local testing, loopback interfaces',
    hosts: 1,
    networkClass: 'A',
  },
  {
    name: 'Multicast',
    description: 'IPv4 multicast range',
    cidr: '224.0.0.0/4',
    category: 'Special',
    useCase: 'Multicast applications, streaming',
    hosts: 268435456,
    networkClass: 'D',
  },
  {
    name: 'Link Local',
    description: 'Automatic private addressing',
    cidr: '169.254.0.0/16',
    category: 'Special',
    useCase: 'APIPA, automatic configuration',
    hosts: 65534,
    networkClass: 'B',
  },
]

// IPv6 examples
export const IPV6_EXAMPLES: IpCidrExample[] = [
  {
    name: 'IPv6 Global Unicast',
    description: 'Global IPv6 address space',
    cidr: '2001:db8::/32',
    category: 'IPv6',
    useCase: 'Global IPv6 networks, internet',
    hosts: 79228162514264337593543950336,
    networkClass: 'IPv6',
  },
  {
    name: 'IPv6 Link Local',
    description: 'IPv6 link-local addresses',
    cidr: 'fe80::/64',
    category: 'IPv6',
    useCase: 'Local network communication',
    hosts: 18446744073709551616,
    networkClass: 'IPv6',
  },
  {
    name: 'IPv6 Unique Local',
    description: 'IPv6 unique local addresses',
    cidr: 'fd00::/8',
    category: 'IPv6',
    useCase: 'Private IPv6 networks',
    hosts: 340282366920938463463374607431768211456,
    networkClass: 'IPv6',
  },
  {
    name: 'IPv6 Multicast',
    description: 'IPv6 multicast addresses',
    cidr: 'ff00::/8',
    category: 'IPv6',
    useCase: 'IPv6 multicast applications',
    hosts: 340282366920938463463374607431768211456,
    networkClass: 'IPv6',
  },
]

// Common network blocks
export const COMMON_NETWORKS: CommonNetwork[] = [
  // Private IPv4 ranges
  {
    name: 'Class A Private',
    cidr: '10.0.0.0/8',
    description: 'Class A private network (RFC 1918)',
    hosts: 16777214,
    category: 'Private',
    isPrivate: true,
  },
  {
    name: 'Class B Private',
    cidr: '172.16.0.0/12',
    description: 'Class B private network (RFC 1918)',
    hosts: 1048574,
    category: 'Private',
    isPrivate: true,
  },
  {
    name: 'Class C Private',
    cidr: '192.168.0.0/16',
    description: 'Class C private network (RFC 1918)',
    hosts: 65534,
    category: 'Private',
    isPrivate: true,
  },

  // Common subnet sizes
  {
    name: '/24 Network',
    cidr: '192.168.1.0/24',
    description: 'Standard /24 network (254 hosts)',
    hosts: 254,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/25 Network',
    cidr: '192.168.1.0/25',
    description: 'Half /24 network (126 hosts)',
    hosts: 126,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/26 Network',
    cidr: '192.168.1.0/26',
    description: 'Quarter /24 network (62 hosts)',
    hosts: 62,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/27 Network',
    cidr: '192.168.1.0/27',
    description: 'Eighth /24 network (30 hosts)',
    hosts: 30,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/28 Network',
    cidr: '192.168.1.0/28',
    description: 'Sixteenth /24 network (14 hosts)',
    hosts: 14,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/30 Network',
    cidr: '192.168.1.0/30',
    description: 'Point-to-point network (2 hosts)',
    hosts: 2,
    category: 'Common',
    isPrivate: true,
  },
  {
    name: '/32 Network',
    cidr: '192.168.1.1/32',
    description: 'Single host network (1 host)',
    hosts: 1,
    category: 'Common',
    isPrivate: true,
  },

  // Special purpose networks
  {
    name: 'Loopback',
    cidr: '127.0.0.0/8',
    description: 'Loopback addresses (RFC 3330)',
    hosts: 16777214,
    category: 'Special',
    isPrivate: false,
  },
  {
    name: 'Link Local',
    cidr: '169.254.0.0/16',
    description: 'Link-local addresses (RFC 3927)',
    hosts: 65534,
    category: 'Special',
    isPrivate: false,
  },
  {
    name: 'Multicast',
    cidr: '224.0.0.0/4',
    description: 'Multicast addresses (RFC 3171)',
    hosts: 268435456,
    category: 'Special',
    isPrivate: false,
  },
]

// Network classes
export const NETWORK_CLASSES: NetworkClass[] = [
  {
    name: 'Class A',
    range: '1.0.0.0 - 126.255.255.255',
    defaultSubnet: '/8',
    description: 'Large networks, government, major corporations',
    hosts: 16777214,
  },
  {
    name: 'Class B',
    range: '128.0.0.0 - 191.255.255.255',
    defaultSubnet: '/16',
    description: 'Medium networks, universities, large companies',
    hosts: 65534,
  },
  {
    name: 'Class C',
    range: '192.0.0.0 - 223.255.255.255',
    defaultSubnet: '/24',
    description: 'Small networks, small businesses, home networks',
    hosts: 254,
  },
  {
    name: 'Class D',
    range: '224.0.0.0 - 239.255.255.255',
    defaultSubnet: '/4',
    description: 'Multicast addresses',
    hosts: 268435456,
  },
  {
    name: 'Class E',
    range: '240.0.0.0 - 255.255.255.255',
    defaultSubnet: '/4',
    description: 'Reserved for future use',
    hosts: 268435456,
  },
]

// Subnet mask reference
export const SUBNET_MASKS = [
  { cidr: '/8', mask: '255.0.0.0', hosts: 16777214, class: 'A' },
  { cidr: '/9', mask: '255.128.0.0', hosts: 8388606, class: 'A' },
  { cidr: '/10', mask: '255.192.0.0', hosts: 4194302, class: 'A' },
  { cidr: '/11', mask: '255.224.0.0', hosts: 2097150, class: 'A' },
  { cidr: '/12', mask: '255.240.0.0', hosts: 1048574, class: 'A' },
  { cidr: '/13', mask: '255.248.0.0', hosts: 524286, class: 'A' },
  { cidr: '/14', mask: '255.252.0.0', hosts: 262142, class: 'A' },
  { cidr: '/15', mask: '255.254.0.0', hosts: 131070, class: 'A' },
  { cidr: '/16', mask: '255.255.0.0', hosts: 65534, class: 'B' },
  { cidr: '/17', mask: '255.255.128.0', hosts: 32766, class: 'B' },
  { cidr: '/18', mask: '255.255.192.0', hosts: 16382, class: 'B' },
  { cidr: '/19', mask: '255.255.224.0', hosts: 8190, class: 'B' },
  { cidr: '/20', mask: '255.255.240.0', hosts: 4094, class: 'B' },
  { cidr: '/21', mask: '255.255.248.0', hosts: 2046, class: 'B' },
  { cidr: '/22', mask: '255.255.252.0', hosts: 1022, class: 'B' },
  { cidr: '/23', mask: '255.255.254.0', hosts: 510, class: 'B' },
  { cidr: '/24', mask: '255.255.255.0', hosts: 254, class: 'C' },
  { cidr: '/25', mask: '255.255.255.128', hosts: 126, class: 'C' },
  { cidr: '/26', mask: '255.255.255.192', hosts: 62, class: 'C' },
  { cidr: '/27', mask: '255.255.255.224', hosts: 30, class: 'C' },
  { cidr: '/28', mask: '255.255.255.240', hosts: 14, class: 'C' },
  { cidr: '/29', mask: '255.255.255.248', hosts: 6, class: 'C' },
  { cidr: '/30', mask: '255.255.255.252', hosts: 2, class: 'C' },
  { cidr: '/31', mask: '255.255.255.254', hosts: 0, class: 'C' },
  { cidr: '/32', mask: '255.255.255.255', hosts: 1, class: 'C' },
]

// Tool descriptions
export const IP_CIDR_TOOL_DESCRIPTIONS = {
  title: 'IP Address CIDR Converter',
  description:
    'Convert between IP addresses and CIDR notation, analyze network properties, and calculate subnet information.',
  features: [
    'IP to CIDR conversion',
    'CIDR to IP range conversion',
    'Network analysis and statistics',
    'Subnet planning and calculation',
    'IPv4 and IPv6 support',
    'Private and public network detection',
    'Network class identification',
    'Host count calculations',
  ],
  useCases: [
    'Network planning and design',
    'Subnet calculation and optimization',
    'IP address management',
    'Network troubleshooting',
    'Security policy configuration',
    'Cloud infrastructure planning',
  ],
}

// Example sets for different scenarios
export const IP_CIDR_EXAMPLE_SETS = {
  'Home Networks': ['192.168.1.0/24', '192.168.0.0/16', '10.0.0.0/8', '172.16.0.0/12'],
  'Corporate Networks': ['10.0.0.0/16', '10.1.0.0/16', '10.2.0.0/16', '172.16.0.0/12'],
  'Cloud Networks': ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '203.0.113.0/24'],
  'Point-to-Point': ['192.168.1.0/30', '10.0.0.0/30', '172.16.0.0/30', '203.0.113.0/30'],
  'IPv6 Networks': ['2001:db8::/32', 'fe80::/64', 'fd00::/8', 'ff00::/8'],
}

// Validation rules
export const IP_CIDR_VALIDATION_RULES = {
  ipv4: {
    format: 'Must be in dotted decimal notation (e.g., 192.168.1.1)',
    range: 'Each octet must be between 0 and 255',
    private: 'Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16',
    special: 'Special addresses: 127.0.0.0/8 (loopback), 169.254.0.0/16 (link-local)',
  },
  ipv6: {
    format: 'Must be in colon-separated hexadecimal notation',
    compression: 'Double colon (::) can be used once to compress consecutive zeros',
    examples: '2001:db8::1, fe80::1, ::1',
  },
  cidr: {
    format: 'Must include IP address and prefix length (e.g., 192.168.1.0/24)',
    prefixRange: 'IPv4: /0 to /32, IPv6: /0 to /128',
    networkBits: 'Prefix length indicates number of network bits',
  },
}

// Educational content
export const IP_CIDR_EDUCATIONAL_CONTENT = {
  whatIsCidr: {
    title: 'What is CIDR?',
    content:
      'CIDR (Classless Inter-Domain Routing) is a method for allocating IP addresses and routing IP packets. It allows for more flexible allocation of IP addresses than the traditional class-based system.',
  },
  howItWorks: {
    title: 'How CIDR Works',
    content:
      'CIDR uses a prefix length to indicate how many bits represent the network portion of an IP address. The remaining bits represent the host portion. For example, 192.168.1.0/24 means the first 24 bits are the network, and the last 8 bits are for hosts.',
  },
  benefits: {
    title: 'Benefits of CIDR',
    content: [
      'More efficient use of IP address space',
      'Reduced routing table sizes',
      'Flexible subnet sizing',
      'Better network organization',
      'Easier network management',
    ],
  },
  commonUses: {
    title: 'Common Uses',
    content: [
      'Network planning and design',
      'Subnet creation and management',
      'Firewall rule configuration',
      'Cloud infrastructure setup',
      'Network troubleshooting',
    ],
  },
}

// Help text for the tool
export const IP_CIDR_HELP_TEXT = {
  input: 'Enter an IP address or CIDR notation to analyze',
  examples: 'Click on example networks to load them into the tool',
  analysis: 'View detailed network analysis including subnet mask, host count, and network class',
  subnets: 'Calculate subnet divisions for network planning',
  statistics: 'Get network statistics and recommendations',
  copy: 'Copy results to clipboard for use in configuration files',
}

// Categories for organizing examples
export const IP_CIDR_CATEGORIES = [
  { name: 'Private Networks', description: 'RFC 1918 private address ranges', icon: '🏠' },
  { name: 'Public Networks', description: 'Internet-routable address ranges', icon: '🌐' },
  { name: 'Special Purpose', description: 'Loopback, multicast, and reserved ranges', icon: '⚙️' },
  { name: 'Common Sizes', description: 'Frequently used subnet sizes', icon: '📏' },
  { name: 'IPv6 Networks', description: 'IPv6 address examples', icon: '🔢' },
]

// Quick reference for common calculations
export const IP_CIDR_QUICK_REFERENCE = {
  '/24 Network': '254 hosts, 255.255.255.0 mask',
  '/25 Network': '126 hosts, 255.255.255.128 mask',
  '/26 Network': '62 hosts, 255.255.255.192 mask',
  '/27 Network': '30 hosts, 255.255.255.224 mask',
  '/28 Network': '14 hosts, 255.255.255.240 mask',
  '/29 Network': '6 hosts, 255.255.255.248 mask',
  '/30 Network': '2 hosts, 255.255.255.252 mask',
  '/32 Network': '1 host, 255.255.255.255 mask',
}
