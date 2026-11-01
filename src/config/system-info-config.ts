// Re-export from libs for convenience
export { DEFAULT_SYSTEM_INFO_OPTIONS } from '@/libs/system-info'
export type { SystemInfoOptions } from '@/libs/system-info'

export const SYSTEM_INFO_FORMAT_OPTIONS = [
  { value: 'formatted', label: 'Formatted Text', description: 'Human-readable formatted output' },
  { value: 'json', label: 'JSON', description: 'Structured JSON output' },
]

export const SYSTEM_INFO_HELP = {
  title: 'System Information',
  description: 'View detailed information about your browser, device, display, network, and system capabilities',
  features: [
    'Browser information (name, version, engine, vendor)',
    'Device information (type, OS, platform, hardware)',
    'Display information (screen resolution, viewport, pixel ratio)',
    'Network information (connection type, speed estimates)',
    'Performance metrics (memory usage, CPU cores)',
    'Storage information (quota, usage, supported features)',
    'Media capabilities (camera, microphone availability)',
    'Permissions status (camera, microphone, geolocation, etc.)',
    'Time & locale information (timezone, locale preferences)',
    'Security & privacy settings (HTTPS, cookies, WebGL)',
  ],
  tips: [
    'Some information may not be available in all browsers',
    'Network information requires Network Information API support',
    'Media device enumeration may require user permission',
    'Storage quota information is approximate',
    'Private browsing mode may limit some features',
    'All information is collected client-side for privacy',
  ],
}
