export type NumberBase =
  | 2
  | 8
  | 10
  | 16
  | 3
  | 4
  | 5
  | 6
  | 7
  | 9
  | 11
  | 12
  | 13
  | 14
  | 15
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36

export interface BaseOption {
  value: NumberBase
  label: string
  prefix: string
  description: string
  maxDigits?: number
}

export const SUPPORTED_BASES: BaseOption[] = [
  { value: 2, label: 'Binary', prefix: '0b', description: 'Base 2 (0-1)' },
  { value: 8, label: 'Octal', prefix: '0o', description: 'Base 8 (0-7)' },
  { value: 10, label: 'Decimal', prefix: '', description: 'Base 10 (0-9)' },
  { value: 16, label: 'Hexadecimal', prefix: '0x', description: 'Base 16 (0-9, A-F)' },
]

export const CUSTOM_BASES: BaseOption[] = Array.from({ length: 20 }, (_, i) => i + 17).map((base) => ({
  value: base as NumberBase,
  label: `Base ${base}`,
  prefix: '',
  description: `Base ${base} (0-${String.fromCharCode(54 + base)})`,
}))

export const ALL_BASES: BaseOption[] = [...SUPPORTED_BASES, ...CUSTOM_BASES]

export interface NumberBaseOptions {
  inputBase: NumberBase
  outputBases: NumberBase[]
  showPrefix: boolean
  uppercase: boolean
  batchMode: boolean
}

export const DEFAULT_OPTIONS: NumberBaseOptions = {
  inputBase: 10,
  outputBases: [2, 8, 10, 16],
  showPrefix: true,
  uppercase: false,
  batchMode: false,
}

export const BASE_EXAMPLES: Record<NumberBase, string[]> = {
  2: ['1010', '1111', '1000000', '11111111'],
  3: ['101', '222', '1000'],
  4: ['22', '333', '1000'],
  5: ['20', '444', '1000'],
  6: ['14', '555', '1000'],
  7: ['13', '666', '1000'],
  8: ['12', '377', '1000', '777'],
  9: ['11', '888', '1000'],
  10: ['10', '255', '1024', '65535'],
  11: ['A', 'AA', '1000'],
  12: ['A', 'BB', '1000'],
  13: ['A', 'CC', '1000'],
  14: ['A', 'DD', '1000'],
  15: ['A', 'EE', '1000'],
  16: ['A', 'FF', '1000', 'FFFF'],
  17: ['10', 'GG', '1000'],
  18: ['10', 'HH', '1000'],
  19: ['10', 'II', '1000'],
  20: ['10', 'JJ', '1000'],
  21: ['10', 'KK', '1000'],
  22: ['10', 'LL', '1000'],
  23: ['10', 'MM', '1000'],
  24: ['10', 'NN', '1000'],
  25: ['10', 'OO', '1000'],
  26: ['10', 'PP', '1000'],
  27: ['10', 'QQ', '1000'],
  28: ['10', 'RR', '1000'],
  29: ['10', 'SS', '1000'],
  30: ['10', 'TT', '1000'],
  31: ['10', 'UU', '1000'],
  32: ['10', 'VV', '1000'],
  33: ['10', 'WW', '1000'],
  34: ['10', 'XX', '1000'],
  35: ['10', 'YY', '1000'],
  36: ['10', 'ZZ', '1000'],
}

export const NUMBER_BASE_QUANTITY_LIMITS = {
  min: 1,
  max: 1000,
  default: 1,
}

export const BIT_VISUALIZATION_OPTIONS = {
  maxBits: 64,
  groupSize: 8,
  showLabels: true,
}
