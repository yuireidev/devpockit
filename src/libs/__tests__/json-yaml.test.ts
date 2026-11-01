import {
  convertFormat,
  detectFormat,
  formatContent,
  getConversionStats,
  jsonToYaml,
  validateJson,
  validateYaml,
  yamlToJson,
} from '../json-yaml'

describe('json-yaml', () => {
  describe('jsonToYaml', () => {
    it('should convert simple JSON to YAML', () => {
      const json = '{"name": "John", "age": 30}'
      const result = jsonToYaml(json)

      expect(result.success).toBe(true)
      expect(result.format).toBe('yaml')
      expect(result.output).toContain('name: John')
      expect(result.output).toContain('age: 30')
    })

    it('should convert nested JSON to YAML', () => {
      const json = '{"user": {"name": "John", "profile": {"age": 30}}}'
      const result = jsonToYaml(json)

      expect(result.success).toBe(true)
      expect(result.output).toContain('user:')
      expect(result.output).toContain('name: John')
    })

    it('should handle invalid JSON', () => {
      const json = '{"name": "John", "age":}'
      const result = jsonToYaml(json)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('yamlToJson', () => {
    it('should convert simple YAML to JSON', () => {
      const yaml = 'name: John\nage: 30'
      const result = yamlToJson(yaml)

      expect(result.success).toBe(true)
      expect(result.format).toBe('json')
      expect(result.output).toContain('"name": "John"')
      expect(result.output).toContain('"age": 30')
    })

    it('should convert nested YAML to JSON', () => {
      const yaml = 'user:\n  name: John\n  profile:\n    age: 30'
      const result = yamlToJson(yaml)

      expect(result.success).toBe(true)
      expect(result.output).toContain('"user"')
      expect(result.output).toContain('"name": "John"')
    })

    it('should handle invalid YAML', () => {
      const yaml = 'name: John\nage: [invalid yaml'
      const result = yamlToJson(yaml)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateJson', () => {
    it('should validate correct JSON', () => {
      const result = validateJson('{"name": "John", "age": 30}')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('json')
    })

    it('should reject invalid JSON', () => {
      const result = validateJson('{"name": "John", "age":}')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateYaml', () => {
    it('should validate correct YAML', () => {
      const result = validateYaml('name: John\nage: 30')
      expect(result.isValid).toBe(true)
      expect(result.format).toBe('yaml')
    })

    it('should reject invalid YAML', () => {
      const result = validateYaml('name: John\nage: [invalid yaml')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('detectFormat', () => {
    it('should detect JSON format', () => {
      expect(detectFormat('{"name": "John"}')).toBe('json')
      expect(detectFormat('[1, 2, 3]')).toBe('json')
    })

    it('should detect YAML format', () => {
      expect(detectFormat('name: John\nage: 30')).toBe('yaml')
      expect(detectFormat('items:\n  - item1\n  - item2')).toBe('yaml')
    })

    it('should return unknown for invalid content', () => {
      expect(detectFormat('invalid content with [brackets')).toBe('unknown')
    })
  })

  describe('convertFormat', () => {
    it('should convert JSON to YAML', () => {
      const result = convertFormat('{"name": "John"}', 'yaml')
      expect(result.success).toBe(true)
      expect(result.format).toBe('yaml')
    })

    it('should convert YAML to JSON', () => {
      const result = convertFormat('name: John', 'json')
      expect(result.success).toBe(true)
      expect(result.format).toBe('json')
    })

    it('should handle unknown format', () => {
      const result = convertFormat('invalid content with [brackets', 'json')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('formatContent', () => {
    it('should format JSON content', () => {
      const result = formatContent('{"name":"John","age":30}', 'json')
      expect(result.success).toBe(true)
      expect(result.output).toContain('"name": "John"')
    })

    it('should format YAML content', () => {
      const result = formatContent('name:John\nage:30', 'yaml')
      expect(result.success).toBe(true)
      expect(result.output).toContain('name:John')
    })
  })

  describe('getConversionStats', () => {
    it('should calculate conversion statistics', () => {
      const input = '{"name": "John"}'
      const output = 'name: John'
      const stats = getConversionStats(input, output, 'yaml')

      expect(stats.inputSize).toBe(input.length)
      expect(stats.outputSize).toBe(output.length)
      expect(stats.format).toBe('yaml')
      expect(stats.compressionRatio).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      const jsonResult = jsonToYaml('')
      const yamlResult = yamlToJson('')

      expect(jsonResult.success).toBe(false)
      expect(yamlResult.success).toBe(true) // Empty YAML is valid
    })

    it('should handle arrays', () => {
      const json = '[1, 2, 3]'
      const result = jsonToYaml(json)

      expect(result.success).toBe(true)
      expect(result.output).toContain('- 1')
      expect(result.output).toContain('- 2')
      expect(result.output).toContain('- 3')
    })

    it('should handle boolean and null values', () => {
      const json = '{"active": true, "value": null}'
      const result = jsonToYaml(json)

      expect(result.success).toBe(true)
      expect(result.output).toContain('active: true')
      expect(result.output).toContain('value: null')
    })
  })
})
