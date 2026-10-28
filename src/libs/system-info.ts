// Type definitions
export interface BrowserInfo {
  userAgent: string;
  vendor: string;
  appName: string;
  appVersion: string;
  platform: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  onLine: boolean;
  javaEnabled: boolean;
  parsed: {
    browser: string;
    browserVersion: string;
    engine: string;
    engineVersion: string;
    os: string;
    osVersion: string;
    device: string;
  };
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  osVersion: string;
  platform: string;
  orientation: string;
  touchSupport: boolean;
  maxTouchPoints: number;
  cores: number | null;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
}

export interface DisplayInfo {
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    colorDepth: number;
    pixelDepth: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  window: {
    outerWidth: number;
    outerHeight: number;
    innerWidth: number;
    innerHeight: number;
  };
  pixelRatio: number;
  orientation: {
    angle: number;
    type: string;
  } | null;
}

export interface NetworkInfo {
  available: boolean;
  type?: string;
  effectiveType?: string;
  downlink?: number | null;
  rtt?: number | null;
  saveData?: boolean;
  message?: string;
}

export interface PerformanceInfo {
  memory: {
    available: boolean;
    used?: string;
    total?: string;
    limit?: string;
  } | null;
  hardwareConcurrency: number | null;
  deviceMemory: number | null;
  navigationTiming: {
    available: boolean;
    dns?: number;
    connect?: number;
    load?: number;
    domContentLoaded?: number;
  } | null;
}

export interface StorageInfo {
  features: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    cacheAPI: boolean;
  };
  quota: number | null;
  usage: number | null;
  usageDetails: {
    indexedDB?: number;
    caches?: number;
    serviceWorkerRegistrations?: number;
  } | null;
  available: boolean;
  error?: string;
}

export interface MediaInfo {
  available: boolean;
  devices?: {
    videoInput: number;
    audioInput: number;
    audioOutput: number;
  };
  supportedConstraints?: string[];
  getUserMedia?: boolean;
  error?: string;
}

export interface PermissionsInfo {
  available: boolean;
  permissions: Record<string, string>;
  message?: string;
}

export interface TimeLocaleInfo {
  timezone: string;
  timezoneOffset: string;
  locale: string;
  locales: string[];
  calendar: string;
  numberingSystem: string;
  dateTime: string;
  dateTimeISO: string;
}

export interface SecurityInfo {
  https: boolean;
  secureContext: boolean;
  cookieEnabled: boolean;
  doNotTrack: string;
  webgl: {
    vendor: string;
    renderer: string;
  } | null;
  privateBrowsing: boolean;
}

export interface SystemInfo {
  browser: BrowserInfo;
  device: DeviceInfo;
  display: DisplayInfo;
  network: NetworkInfo;
  performance: PerformanceInfo;
  storage: StorageInfo;
  media: MediaInfo;
  permissions: PermissionsInfo;
  timeLocale: TimeLocaleInfo;
  security: SecurityInfo;
  collectedAt: string;
}

export interface SystemInfoOptions {
  showBrowser: boolean;
  showDevice: boolean;
  showDisplay: boolean;
  showNetwork: boolean;
  showPerformance: boolean;
  showStorage: boolean;
  showMedia: boolean;
  showPermissions: boolean;
  showTimeLocale: boolean;
  showSecurity: boolean;
  format: 'json' | 'formatted';
}

export const DEFAULT_SYSTEM_INFO_OPTIONS: SystemInfoOptions = {
  showBrowser: true,
  showDevice: true,
  showDisplay: true,
  showNetwork: true,
  showPerformance: true,
  showStorage: true,
  showMedia: true,
  showPermissions: true,
  showTimeLocale: true,
  showSecurity: true,
  format: 'formatted',
};

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function parseUserAgent(userAgent: string): BrowserInfo['parsed'] {
  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = 'Unknown';
  let browserVersion = 'Unknown';

  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
    const match = userAgent.match(/(?:Opera|OPR)\/([\d.]+)/);
    browserVersion = match ? match[1] : 'Unknown';
  }

  // Engine detection
  let engine = 'Unknown';
  let engineVersion = 'Unknown';

  if (ua.includes('webkit')) {
    engine = 'WebKit';
    const match = userAgent.match(/Version\/([\d.]+)/);
    engineVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('gecko')) {
    engine = 'Gecko';
    const match = userAgent.match(/rv:([\d.]+)/);
    engineVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('trident')) {
    engine = 'Trident';
    const match = userAgent.match(/rv:([\d.]+)/);
    engineVersion = match ? match[1] : 'Unknown';
  }

  // OS detection
  let os = 'Unknown';
  let osVersion = 'Unknown';

  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10/11';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    os = 'macOS';
    const match = userAgent.match(/Mac OS X ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = userAgent.match(/Android ([\d.]+)/);
    osVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = userAgent.match(/OS ([\d_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  }

  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile') || ua.includes('android')) {
    device = 'Mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'Tablet';
  }

  return {
    browser,
    browserVersion,
    engine,
    engineVersion,
    os,
    osVersion,
    device,
  };
}

function detectDeviceType(): DeviceInfo['type'] {
  const ua = navigator.userAgent.toLowerCase();

  if (ua.includes('mobile') && !ua.includes('tablet')) {
    return 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  } else if (ua.includes('android') && !ua.includes('mobile')) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

// Collection functions
interface NetworkConnectionInfo {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

type ExtendedNavigator = Navigator & {
  javaEnabled?: () => boolean;
  deviceMemory?: number;
  connection?: NetworkConnectionInfo;
  mozConnection?: NetworkConnectionInfo;
  webkitConnection?: NetworkConnectionInfo;
};

type ExtendedPerformance = Performance & {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
};

type ExtendedStorageEstimate = StorageEstimate & { usageDetails?: Record<string, number> };

export function getBrowserInfo(): BrowserInfo {
  try {
    const parsed = parseUserAgent(navigator.userAgent);
    const extendedNavigator = navigator as ExtendedNavigator;

    return {
      userAgent: navigator.userAgent || 'Unknown',
      vendor: navigator.vendor || 'Unknown',
      appName: navigator.appName || 'Unknown',
      appVersion: navigator.appVersion || 'Unknown',
      platform: navigator.platform || 'Unknown',
      language: navigator.language || 'Unknown',
      languages: [...(navigator.languages || [])],
      cookieEnabled: navigator.cookieEnabled ?? true,
      onLine: navigator.onLine ?? true,
      javaEnabled: typeof extendedNavigator.javaEnabled === 'function'
        ? extendedNavigator.javaEnabled()
        : false,
      parsed,
    };
  } catch {
    return {
      userAgent: 'Unknown',
      vendor: 'Unknown',
      appName: 'Unknown',
      appVersion: 'Unknown',
      platform: 'Unknown',
      language: 'Unknown',
      languages: [],
      cookieEnabled: false,
      onLine: false,
      javaEnabled: false,
      parsed: {
        browser: 'Unknown',
        browserVersion: 'Unknown',
        engine: 'Unknown',
        engineVersion: 'Unknown',
        os: 'Unknown',
        osVersion: 'Unknown',
        device: 'Unknown',
      },
    };
  }
}

export function getDeviceInfo(): DeviceInfo {
  try {
    const parsed = parseUserAgent(navigator.userAgent);
    const deviceType = detectDeviceType();

    let orientation = 'unknown';
    try {
      const orientationAngle = (window as Window & { orientation?: number }).orientation;
      if (screen.orientation) {
        orientation = screen.orientation.type || 'unknown';
      } else if (orientationAngle !== undefined) {
        const angle = orientationAngle;
        if (angle === 0 || angle === 180) orientation = 'portrait';
        else orientation = 'landscape';
      }
    } catch {
      // Orientation not available
    }

    return {
      type: deviceType,
      os: parsed.os,
      osVersion: parsed.osVersion,
      platform: navigator.platform || 'Unknown',
      orientation,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cores: navigator.hardwareConcurrency || null,
      deviceMemory: (navigator as ExtendedNavigator).deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
    };
  } catch {
    return {
      type: 'unknown',
      os: 'Unknown',
      osVersion: 'Unknown',
      platform: 'Unknown',
      orientation: 'unknown',
      touchSupport: false,
      maxTouchPoints: 0,
      cores: null,
      deviceMemory: null,
      hardwareConcurrency: null,
    };
  }
}

export function getDisplayInfo(): DisplayInfo {
  try {
    let orientation = null;
    try {
      if (screen.orientation) {
        orientation = {
          angle: screen.orientation.angle || 0,
          type: screen.orientation.type || 'unknown',
        };
      }
    } catch {
      // Orientation not available
    }

    return {
      screen: {
        width: screen.width || 0,
        height: screen.height || 0,
        availWidth: screen.availWidth || 0,
        availHeight: screen.availHeight || 0,
        colorDepth: screen.colorDepth || 0,
        pixelDepth: screen.pixelDepth || 0,
      },
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
      },
      window: {
        outerWidth: window.outerWidth || 0,
        outerHeight: window.outerHeight || 0,
        innerWidth: window.innerWidth || 0,
        innerHeight: window.innerHeight || 0,
      },
      pixelRatio: window.devicePixelRatio || 1,
      orientation,
    };
  } catch {
    return {
      screen: {
        width: 0,
        height: 0,
        availWidth: 0,
        availHeight: 0,
        colorDepth: 0,
        pixelDepth: 0,
      },
      viewport: {
        width: 0,
        height: 0,
      },
      window: {
        outerWidth: 0,
        outerHeight: 0,
        innerWidth: 0,
        innerHeight: 0,
      },
      pixelRatio: 1,
      orientation: null,
    };
  }
}

export function getNetworkInfo(): NetworkInfo {
  try {
    const extendedNavigator = navigator as ExtendedNavigator;
    const connection =
      extendedNavigator.connection ||
      extendedNavigator.mozConnection ||
      extendedNavigator.webkitConnection;

    if (!connection) {
      return {
        available: false,
        message: 'Network Information API not supported in this browser',
      };
    }

    return {
      available: true,
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink ?? null,
      rtt: connection.rtt ?? null,
      saveData: connection.saveData || false,
    };
  } catch {
    return {
      available: false,
      message: 'Failed to retrieve network information',
    };
  }
}

export function getPerformanceInfo(): PerformanceInfo {
  try {
    let memory = null;
    try {
      const perfMemory = (performance as ExtendedPerformance).memory;
      if (perfMemory) {
        memory = {
          available: true,
          used: formatBytes(perfMemory.usedJSHeapSize),
          total: formatBytes(perfMemory.totalJSHeapSize),
          limit: formatBytes(perfMemory.jsHeapSizeLimit),
        };
      }
    } catch {
      // Memory API not available
    }

    let navigationTiming = null;
    try {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navTiming) {
        navigationTiming = {
          available: true,
          dns: navTiming.domainLookupEnd - navTiming.domainLookupStart,
          connect: navTiming.connectEnd - navTiming.connectStart,
          load: navTiming.loadEventEnd - navTiming.loadEventStart,
          domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
        };
      }
    } catch {
      // Navigation timing not available
    }

    return {
      memory,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: (navigator as ExtendedNavigator).deviceMemory || null,
      navigationTiming,
    };
  } catch {
    return {
      memory: null,
      hardwareConcurrency: null,
      deviceMemory: null,
      navigationTiming: null,
    };
  }
}

export async function getStorageInfo(): Promise<StorageInfo> {
  try {
    const features = {
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      indexedDB: 'indexedDB' in window,
      cacheAPI: 'caches' in window,
    };

    let quota = null;
    let usage = null;
    let usageDetails = null;
    let available = false;

    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota ?? null;
        usage = estimate.usage ?? null;
        usageDetails = (estimate as ExtendedStorageEstimate).usageDetails ?? null;
        available = true;
      } catch {
        // Storage estimate failed
      }
    }

    return {
      features,
      quota,
      usage,
      usageDetails,
      available,
    };
  } catch {
    return {
      features: {
        localStorage: typeof Storage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        indexedDB: 'indexedDB' in window,
        cacheAPI: 'caches' in window,
      },
      quota: null,
      usage: null,
      usageDetails: null,
      available: false,
      error: 'Storage information unavailable',
    };
  }
}

export async function getMediaCapabilities(): Promise<MediaInfo> {
  try {
    if (!navigator.mediaDevices) {
      return {
        available: false,
        error: 'Media Devices API not supported',
      };
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const constraints = navigator.mediaDevices.getSupportedConstraints();

      return {
        available: true,
        devices: {
          videoInput: devices.filter(d => d.kind === 'videoinput').length,
          audioInput: devices.filter(d => d.kind === 'audioinput').length,
          audioOutput: devices.filter(d => d.kind === 'audiooutput').length,
        },
        supportedConstraints: Object.keys(constraints),
        getUserMedia: 'getUserMedia' in navigator.mediaDevices,
      };
    } catch {
      return {
        available: false,
        error: 'Failed to enumerate media devices',
      };
    }
  } catch {
    return {
      available: false,
      error: 'Media capabilities unavailable',
    };
  }
}

export async function getPermissionsInfo(): Promise<PermissionsInfo> {
  try {
    if (!navigator.permissions || !navigator.permissions.query) {
      return {
        available: false,
        message: 'Permissions API not supported',
        permissions: {},
      };
    }

    const permissions: Record<string, string> = {};
    const permissionNames: (PermissionName | string)[] = [
      'camera',
      'microphone',
      'geolocation',
      'notifications',
      'clipboard-read',
      'clipboard-write',
    ];

    for (const name of permissionNames) {
      try {
        const result = await navigator.permissions.query({ name: name as PermissionName });
        permissions[name] = result.state;
      } catch {
        permissions[name] = 'not-supported';
      }
    }

    return {
      available: true,
      permissions,
    };
  } catch {
    return {
      available: false,
      message: 'Failed to check permissions',
      permissions: {},
    };
  }
}

export function getTimeLocaleInfo(): TimeLocaleInfo {
  try {
    const dateOptions = Intl.DateTimeFormat().resolvedOptions();
    const timezoneOffset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
    const offsetMinutes = Math.abs(timezoneOffset % 60);
    const offsetSign = timezoneOffset <= 0 ? '+' : '-';

    return {
      timezone: dateOptions.timeZone || 'Unknown',
      timezoneOffset: `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`,
      locale: dateOptions.locale || 'Unknown',
      locales: [...(navigator.languages || [])],
      calendar: dateOptions.calendar || 'gregory',
      numberingSystem: dateOptions.numberingSystem || 'latn',
      dateTime: new Date().toLocaleString(),
      dateTimeISO: new Date().toISOString(),
    };
  } catch {
    return {
      timezone: 'Unknown',
      timezoneOffset: '+00:00',
      locale: 'Unknown',
      locales: [],
      calendar: 'gregory',
      numberingSystem: 'latn',
      dateTime: new Date().toLocaleString(),
      dateTimeISO: new Date().toISOString(),
    };
  }
}

export function getSecurityInfo(): SecurityInfo {
  try {
    const isHTTPS = window.location.protocol === 'https:';
    const isSecureContext = window.isSecureContext !== false;

    let webglInfo = null;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl && 'getParameter' in gl) {
        const webglContext = gl as WebGLRenderingContext;
        webglInfo = {
          vendor: webglContext.getParameter(webglContext.VENDOR) || 'Unknown',
          renderer: webglContext.getParameter(webglContext.RENDERER) || 'Unknown',
        };
      }
    } catch {
      // WebGL not available
    }

    let isPrivateBrowsing = false;
    try {
      localStorage.setItem('__test__', 'test');
      localStorage.removeItem('__test__');
    } catch {
      isPrivateBrowsing = true;
    }

    return {
      https: isHTTPS,
      secureContext: isSecureContext,
      cookieEnabled: navigator.cookieEnabled ?? true,
      doNotTrack: navigator.doNotTrack || 'unspecified',
      webgl: webglInfo,
      privateBrowsing: isPrivateBrowsing,
    };
  } catch {
    return {
      https: false,
      secureContext: false,
      cookieEnabled: false,
      doNotTrack: 'unspecified',
      webgl: null,
      privateBrowsing: false,
    };
  }
}

// Main collection function
export async function collectSystemInfo(): Promise<SystemInfo> {
  const [browser, device, display, network, performance, storage, media, permissions, timeLocale, security] = await Promise.allSettled([
    Promise.resolve(getBrowserInfo()),
    Promise.resolve(getDeviceInfo()),
    Promise.resolve(getDisplayInfo()),
    Promise.resolve(getNetworkInfo()),
    Promise.resolve(getPerformanceInfo()),
    getStorageInfo(),
    getMediaCapabilities(),
    getPermissionsInfo(),
    Promise.resolve(getTimeLocaleInfo()),
    Promise.resolve(getSecurityInfo()),
  ]);

  return {
    browser: browser.status === 'fulfilled' ? browser.value : getBrowserInfo(),
    device: device.status === 'fulfilled' ? device.value : getDeviceInfo(),
    display: display.status === 'fulfilled' ? display.value : getDisplayInfo(),
    network: network.status === 'fulfilled' ? network.value : { available: false, message: 'Not available' },
    performance: performance.status === 'fulfilled' ? performance.value : getPerformanceInfo(),
    storage: storage.status === 'fulfilled' ? storage.value : await getStorageInfo(),
    media: media.status === 'fulfilled' ? media.value : { available: false },
    permissions: permissions.status === 'fulfilled' ? permissions.value : { available: false, permissions: {} },
    timeLocale: timeLocale.status === 'fulfilled' ? timeLocale.value : getTimeLocaleInfo(),
    security: security.status === 'fulfilled' ? security.value : getSecurityInfo(),
    collectedAt: new Date().toISOString(),
  };
}

// Formatting function
export function formatSystemInfo(info: SystemInfo, options: SystemInfoOptions): string {
  if (options.format === 'json') {
    return JSON.stringify(info, null, 2);
  }

  let output = `🕒 Collected at: ${new Date(info.collectedAt).toLocaleString()}\n\n`;

  if (options.showBrowser) {
    output += `🌐 Browser Information:\n`;
    output += `   Browser: ${info.browser.parsed.browser} ${info.browser.parsed.browserVersion}\n`;
    output += `   Engine: ${info.browser.parsed.engine} ${info.browser.parsed.engineVersion}\n`;
    output += `   Vendor: ${info.browser.vendor}\n`;
    output += `   Platform: ${info.browser.platform}\n`;
    output += `   Language: ${info.browser.language}\n`;
    output += `   Languages: ${info.browser.languages.join(', ')}\n`;
    output += `   Cookies: ${info.browser.cookieEnabled ? 'Enabled' : 'Disabled'}\n`;
    output += `   Online: ${info.browser.onLine ? 'Yes' : 'No'}\n`;
    output += `\n`;
  }

  if (options.showDevice) {
    output += `📱 Device Information:\n`;
    output += `   Type: ${info.device.type.charAt(0).toUpperCase() + info.device.type.slice(1)}\n`;
    output += `   OS: ${info.device.os} ${info.device.osVersion}\n`;
    output += `   Platform: ${info.device.platform}\n`;
    output += `   Orientation: ${info.device.orientation}\n`;
    output += `   Touch Support: ${info.device.touchSupport ? 'Yes' : 'No'}\n`;
    output += `   Max Touch Points: ${info.device.maxTouchPoints}\n`;
    if (info.device.cores) output += `   CPU Cores: ${info.device.cores}\n`;
    if (info.device.deviceMemory) output += `   Device Memory: ${info.device.deviceMemory} GB\n`;
    output += `\n`;
  }

  if (options.showDisplay) {
    output += `🖥️ Display Information:\n`;
    output += `   Screen Resolution: ${info.display.screen.width} × ${info.display.screen.height}\n`;
    output += `   Available Size: ${info.display.screen.availWidth} × ${info.display.screen.availHeight}\n`;
    output += `   Viewport: ${info.display.viewport.width} × ${info.display.viewport.height}\n`;
    output += `   Window Size: ${info.display.window.outerWidth} × ${info.display.window.outerHeight}\n`;
    output += `   Color Depth: ${info.display.screen.colorDepth} bits\n`;
    output += `   Pixel Ratio: ${info.display.pixelRatio}\n`;
    if (info.display.orientation) {
      output += `   Orientation: ${info.display.orientation.type} (${info.display.orientation.angle}°)\n`;
    }
    output += `\n`;
  }

  if (options.showNetwork && info.network.available) {
    output += `📶 Network Information:\n`;
    output += `   Type: ${info.network.type}\n`;
    output += `   Effective Type: ${info.network.effectiveType}\n`;
    if (info.network.downlink) output += `   Downlink: ${info.network.downlink} Mbps\n`;
    if (info.network.rtt) output += `   RTT: ${info.network.rtt} ms\n`;
    output += `   Save Data: ${info.network.saveData ? 'Enabled' : 'Disabled'}\n`;
    output += `\n`;
  } else if (options.showNetwork) {
    output += `📶 Network Information:\n`;
    output += `   ${info.network.message || 'Not available'}\n`;
    output += `\n`;
  }

  if (options.showPerformance) {
    output += `⚡ Performance Information:\n`;
    if (info.performance.memory?.available) {
      output += `   Memory Used: ${info.performance.memory.used}\n`;
      output += `   Memory Total: ${info.performance.memory.total}\n`;
      output += `   Memory Limit: ${info.performance.memory.limit}\n`;
    }
    if (info.performance.hardwareConcurrency) {
      output += `   CPU Cores: ${info.performance.hardwareConcurrency}\n`;
    }
    if (info.performance.deviceMemory) {
      output += `   Device Memory: ${info.performance.deviceMemory} GB\n`;
    }
    if (info.performance.navigationTiming?.available) {
      output += `   DNS Lookup: ${info.performance.navigationTiming.dns} ms\n`;
      output += `   Connection: ${info.performance.navigationTiming.connect} ms\n`;
      output += `   Load Time: ${info.performance.navigationTiming.load} ms\n`;
    }
    output += `\n`;
  }

  if (options.showStorage) {
    output += `💾 Storage Information:\n`;
    output += `   LocalStorage: ${info.storage.features.localStorage ? 'Supported' : 'Not Supported'}\n`;
    output += `   SessionStorage: ${info.storage.features.sessionStorage ? 'Supported' : 'Not Supported'}\n`;
    output += `   IndexedDB: ${info.storage.features.indexedDB ? 'Supported' : 'Not Supported'}\n`;
    output += `   Cache API: ${info.storage.features.cacheAPI ? 'Supported' : 'Not Supported'}\n`;
    if (info.storage.quota) {
      output += `   Quota: ${formatBytes(info.storage.quota)}\n`;
    }
    if (info.storage.usage) {
      output += `   Usage: ${formatBytes(info.storage.usage)}\n`;
    }
    output += `\n`;
  }

  if (options.showMedia) {
    output += `🎥 Media Capabilities:\n`;
    if (info.media.available) {
      output += `   Video Input Devices: ${info.media.devices?.videoInput || 0}\n`;
      output += `   Audio Input Devices: ${info.media.devices?.audioInput || 0}\n`;
      output += `   Audio Output Devices: ${info.media.devices?.audioOutput || 0}\n`;
      output += `   getUserMedia: ${info.media.getUserMedia ? 'Supported' : 'Not Supported'}\n`;
    } else {
      output += `   ${info.media.error || 'Not available'}\n`;
    }
    output += `\n`;
  }

  if (options.showPermissions) {
    output += `🔐 Permissions:\n`;
    if (info.permissions.available) {
      Object.entries(info.permissions.permissions).forEach(([name, status]) => {
        output += `   ${name}: ${status}\n`;
      });
    } else {
      output += `   ${info.permissions.message || 'Not available'}\n`;
    }
    output += `\n`;
  }

  if (options.showTimeLocale) {
    output += `🕐 Time & Locale:\n`;
    output += `   Timezone: ${info.timeLocale.timezone}\n`;
    output += `   Timezone Offset: UTC${info.timeLocale.timezoneOffset}\n`;
    output += `   Locale: ${info.timeLocale.locale}\n`;
    output += `   Locales: ${info.timeLocale.locales.join(', ')}\n`;
    output += `   Calendar: ${info.timeLocale.calendar}\n`;
    output += `   Numbering System: ${info.timeLocale.numberingSystem}\n`;
    output += `   Current Time: ${info.timeLocale.dateTime}\n`;
    output += `\n`;
  }

  if (options.showSecurity) {
    output += `🔒 Security & Privacy:\n`;
    output += `   HTTPS: ${info.security.https ? 'Yes' : 'No'}\n`;
    output += `   Secure Context: ${info.security.secureContext ? 'Yes' : 'No'}\n`;
    output += `   Cookies Enabled: ${info.security.cookieEnabled ? 'Yes' : 'No'}\n`;
    output += `   Do Not Track: ${info.security.doNotTrack}\n`;
    if (info.security.webgl) {
      output += `   WebGL Vendor: ${info.security.webgl.vendor}\n`;
      output += `   WebGL Renderer: ${info.security.webgl.renderer}\n`;
    }
    output += `   Private Browsing: ${info.security.privateBrowsing ? 'Likely' : 'No'}\n`;
  }

  return output;
}

