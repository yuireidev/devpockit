import { NumberBase } from '@/config/number-base-converter-config';

export interface ConversionResult {
  input: string;
  inputBase: NumberBase;
  outputs: Record<NumberBase, string>;
  error?: string;
  isValid: boolean;
  decimalValue?: number;
}

export interface BitVisualization {
  bits: string;
  bitArray: string[];
  groups: string[][];
  bitCount: number;
  signedRange: {
    min: string;
    max: string;
  };
  unsignedRange: {
    min: string;
    max: string;
  };
}

export interface BaseRangeInfo {
  base: NumberBase;
  minValue: string;
  maxValue: string;
  maxDecimal: number;
  maxBits: number;
  description: string;
}

/**
 * Convert a number from one base to another
 */
export function convertBase(
  value: string,
  fromBase: NumberBase,
  toBase: NumberBase,
  options?: { showPrefix?: boolean; uppercase?: boolean }
): string {
  if (!value.trim()) return '';

  // Remove prefix if present
  const cleanValue = value.replace(/^0[xXbBoO]/, '').trim();
  if (!cleanValue) return '';

  try {
    // Convert to decimal first
    const decimal = parseInt(cleanValue, fromBase);
    if (isNaN(decimal)) {
      throw new Error(`Invalid number for base ${fromBase}`);
    }

    // Convert to target base
    let result = decimal.toString(toBase);

    // Apply uppercase for hex
    if (toBase === 16 && options?.uppercase) {
      result = result.toUpperCase();
    } else if (toBase > 16 && options?.uppercase) {
      result = result.toUpperCase();
    }

    // Add prefix if requested
    if (options?.showPrefix) {
      const prefix = getPrefix(toBase);
      if (prefix) {
        result = prefix + result;
      }
    }

    return result;
  } catch (error) {
    throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert to multiple bases simultaneously
 */
export function convertToMultipleBases(
  value: string,
  fromBase: NumberBase,
  toBases: NumberBase[],
  options?: { showPrefix?: boolean; uppercase?: boolean }
): Record<NumberBase, string> {
  const results: Partial<Record<NumberBase, string>> = {};

  for (const toBase of toBases) {
    try {
      results[toBase] = convertBase(value, fromBase, toBase, options);
    } catch (error) {
      results[toBase] = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  return results as Record<NumberBase, string>;
}

/**
 * Validate if a number is valid for a given base
 */
export function isValidForBase(value: string, base: NumberBase): boolean {
  const cleanValue = value.replace(/^0[xXbBoO]/, '').trim();
  if (!cleanValue) return false;

  try {
    // Try to parse and see if it's valid
    const parsed = parseInt(cleanValue, base);
    if (isNaN(parsed)) return false;

    // Check if all characters are valid for the base
    const maxDigit = base <= 10
      ? String(base - 1)
      : String.fromCharCode(54 + base); // A-Z for bases > 10

    const regex = new RegExp(`^[0-${maxDigit}]+$`, base <= 10 ? 'i' : '');
    return regex.test(cleanValue);
  } catch {
    return false;
  }
}

/**
 * Get prefix for a base
 */
function getPrefix(base: NumberBase): string {
  switch (base) {
    case 2: return '0b';
    case 8: return '0o';
    case 16: return '0x';
    default: return '';
  }
}

/**
 * Process batch conversion
 */
export function convertBatch(
  values: string[],
  fromBase: NumberBase,
  toBases: NumberBase[],
  options?: { showPrefix?: boolean; uppercase?: boolean }
): ConversionResult[] {
  return values.map(value => {
    const isValid = isValidForBase(value, fromBase);
    let outputs: Record<NumberBase, string> = {} as Record<NumberBase, string>;
    let error: string | undefined;
    let decimalValue: number | undefined;

    if (isValid) {
      try {
        const cleanValue = value.replace(/^0[xXbBoO]/, '').trim();
        decimalValue = parseInt(cleanValue, fromBase);
        outputs = convertToMultipleBases(value, fromBase, toBases, options);
      } catch (err) {
        error = err instanceof Error ? err.message : 'Conversion failed';
      }
    } else {
      error = `Invalid number for base ${fromBase}`;
    }

    return {
      input: value,
      inputBase: fromBase,
      outputs,
      error,
      isValid,
      decimalValue
    };
  });
}

/**
 * Get bit visualization for a number
 */
export function getBitVisualization(
  value: string,
  fromBase: NumberBase,
  maxBits: number = 64
): BitVisualization | null {
  if (!value.trim()) return null;

  try {
    const cleanValue = value.replace(/^0[xXbBoO]/, '').trim();
    if (!cleanValue) return null;

    const decimal = parseInt(cleanValue, fromBase);
    if (isNaN(decimal)) return null;

    // Handle negative numbers (two's complement)
    const isNegative = decimal < 0;
    const absDecimal = Math.abs(decimal);

    // Convert to binary
    let binary = absDecimal.toString(2);

    // Pad to maxBits
    if (binary.length < maxBits) {
      binary = binary.padStart(maxBits, '0');
    } else if (binary.length > maxBits) {
      binary = binary.slice(-maxBits);
    }

    // For negative numbers, use two's complement
    if (isNegative) {
      // Invert bits
      binary = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
      // Add 1
      let carry = 1;
      binary = binary.split('').reverse().map(bit => {
        if (carry) {
          if (bit === '0') {
            carry = 0;
            return '1';
          } else {
            return '0';
          }
        }
        return bit;
      }).reverse().join('');
    }

    // Split into array
    const bitArray = binary.split('');

    // Group into 8-bit groups
    const groups: string[][] = [];
    for (let i = 0; i < bitArray.length; i += 8) {
      groups.push(bitArray.slice(i, i + 8));
    }

    // Calculate ranges
    const bitCount = binary.length;
    const maxUnsigned = Math.pow(2, bitCount) - 1;
    const maxSigned = Math.pow(2, bitCount - 1) - 1;
    const minSigned = -Math.pow(2, bitCount - 1);

    return {
      bits: binary,
      bitArray,
      groups,
      bitCount,
      signedRange: {
        min: minSigned.toString(),
        max: maxSigned.toString()
      },
      unsignedRange: {
        min: '0',
        max: maxUnsigned.toString()
      }
    };
  } catch {
    return null;
  }
}

/**
 * Get range information for a specific base
 */
export function getBaseRangeInfo(base: NumberBase, bitSize: number = 32): BaseRangeInfo {
  const maxDecimal = Math.pow(2, bitSize) - 1;
  const maxValue = maxDecimal.toString(base);
  const minValue = '0';

  let description = '';
  switch (base) {
    case 2:
      description = `Binary (${bitSize}-bit): 0 to ${maxValue} (${maxDecimal} in decimal)`;
      break;
    case 8:
      description = `Octal (${bitSize}-bit): 0 to ${maxValue} (${maxDecimal} in decimal)`;
      break;
    case 10:
      description = `Decimal (${bitSize}-bit): 0 to ${maxValue}`;
      break;
    case 16:
      description = `Hexadecimal (${bitSize}-bit): 0 to ${maxValue} (${maxDecimal} in decimal)`;
      break;
    default:
      description = `Base ${base} (${bitSize}-bit): 0 to ${maxValue} (${maxDecimal} in decimal)`;
  }

  return {
    base,
    minValue,
    maxValue,
    maxDecimal,
    maxBits: bitSize,
    description
  };
}

/**
 * Get range information for multiple bit sizes
 */
export function getBaseRangesForBitSizes(base: NumberBase, bitSizes: number[] = [8, 16, 32, 64]): BaseRangeInfo[] {
  return bitSizes.map(bitSize => getBaseRangeInfo(base, bitSize));
}

/**
 * Get all common ranges for a base
 */
export function getAllRangesForBase(base: NumberBase): {
  signed8: BaseRangeInfo;
  unsigned8: BaseRangeInfo;
  signed16: BaseRangeInfo;
  unsigned16: BaseRangeInfo;
  signed32: BaseRangeInfo;
  unsigned32: BaseRangeInfo;
  signed64: BaseRangeInfo;
  unsigned64: BaseRangeInfo;
} {
  const signed8 = getBaseRangeInfo(base, 8);
  const unsigned8 = getBaseRangeInfo(base, 8);
  const signed16 = getBaseRangeInfo(base, 16);
  const unsigned16 = getBaseRangeInfo(base, 16);
  const signed32 = getBaseRangeInfo(base, 32);
  const unsigned32 = getBaseRangeInfo(base, 32);
  const signed64 = getBaseRangeInfo(base, 64);
  const unsigned64 = getBaseRangeInfo(base, 64);

  // Adjust for signed ranges
  signed8.minValue = (-Math.pow(2, 7)).toString();
  signed8.maxValue = (Math.pow(2, 7) - 1).toString();
  signed16.minValue = (-Math.pow(2, 15)).toString();
  signed16.maxValue = (Math.pow(2, 15) - 1).toString();
  signed32.minValue = (-Math.pow(2, 31)).toString();
  signed32.maxValue = (Math.pow(2, 31) - 1).toString();
  signed64.minValue = (-Math.pow(2, 63)).toString();
  signed64.maxValue = (Math.pow(2, 63) - 1).toString();

  return {
    signed8,
    unsigned8,
    signed16,
    unsigned16,
    signed32,
    unsigned32,
    signed64,
    unsigned64
  };
}

/**
 * Format number with separators for readability
 */
export function formatNumberWithSeparators(value: string, base: NumberBase, groupSize: number = 4): string {
  const cleanValue = value.replace(/^0[xXbBoO]/, '').trim();
  if (!cleanValue) return value;

  // Split into groups
  const groups: string[] = [];
  for (let i = cleanValue.length; i > 0; i -= groupSize) {
    groups.unshift(cleanValue.slice(Math.max(0, i - groupSize), i));
  }

  const prefix = getPrefix(base);
  return prefix + groups.join(' ');
}

