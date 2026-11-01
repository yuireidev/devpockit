// Mock UUID library for Jest tests
const mockUuid = {
  v1: jest.fn(() => '550e8400-e29b-41d4-a716-446655440001'),
  v4: jest.fn(() => '550e8400-e29b-41d4-a716-446655440002'),
  v5: jest.fn(() => '550e8400-e29b-41d4-a716-446655440003'),
  v7: jest.fn(() => '550e8400-e29b-41d4-a716-446655440004'),
  validate: jest.fn((uuid) => {
    // Simple UUID validation - check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }),
  version: jest.fn((uuid) => {
    // Determine UUID version based on the third group
    const parts = uuid.split('-')
    if (parts.length !== 5) return null

    const thirdGroup = parts[2]
    if (thirdGroup.startsWith('1')) return 1
    if (thirdGroup.startsWith('2')) return 2
    if (thirdGroup.startsWith('3')) return 3
    if (thirdGroup.startsWith('4')) return 4
    if (thirdGroup.startsWith('5')) return 5
    if (thirdGroup.startsWith('6')) return 6
    if (thirdGroup.startsWith('7')) return 7
    if (thirdGroup.startsWith('8')) return 8
    if (thirdGroup.startsWith('9')) return 9
    return null
  }),
  NIL: '00000000-0000-0000-0000-000000000000',
  DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
  MAX: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
}

module.exports = mockUuid
