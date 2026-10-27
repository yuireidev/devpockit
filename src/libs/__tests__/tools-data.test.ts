import { getAllTools, getCategoryById, getPopularTools, getToolById, toolCategories } from '../tools-data';
import { toolComponentNames } from '../tool-components';

describe('Tools Data', () => {
  describe('toolCategories', () => {
    it('should have the correct number of categories', () => {
      expect(toolCategories).toHaveLength(7);
    });

    it('should have all required category properties', () => {
      toolCategories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('icon');
        expect(category).toHaveProperty('color');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('tools');
        expect(Array.isArray(category.tools)).toBe(true);
      });
    });

    it('should have unique category IDs', () => {
      const ids = toolCategories.map(cat => cat.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have all required tool properties', () => {
      toolCategories.forEach(category => {
        category.tools.forEach(tool => {
          expect(tool).toHaveProperty('id');
          expect(tool).toHaveProperty('name');
          expect(tool).toHaveProperty('description');
          expect(tool).toHaveProperty('category');
          expect(tool).toHaveProperty('icon');
          expect(tool).toHaveProperty('path');
          expect(tool).toHaveProperty('component');
          expect(typeof tool.component).toBe('string');
        });
      });
    });

    it('should have tools with matching category IDs', () => {
      toolCategories.forEach(category => {
        category.tools.forEach(tool => {
          expect(tool.category).toBe(category.id);
        });
      });
    });
  });

  describe('getToolById', () => {
    it('should return the correct tool for valid ID', () => {
      const tool = getToolById('lorem-ipsum');
      expect(tool).toBeDefined();
      expect(tool?.id).toBe('lorem-ipsum');
      expect(tool?.name).toBe('Lorem Ipsum Generator');
    });

    it('should return undefined for invalid ID', () => {
      const tool = getToolById('non-existent');
      expect(tool).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const tool = getToolById('');
      expect(tool).toBeUndefined();
    });
  });

  describe('getCategoryById', () => {
    it('should return the correct category for valid ID', () => {
      const category = getCategoryById('text-tools');
      expect(category).toBeDefined();
      expect(category?.id).toBe('text-tools');
      expect(category?.name).toBe('Text Tools');
    });

    it('should return undefined for invalid ID', () => {
      const category = getCategoryById('non-existent');
      expect(category).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const category = getCategoryById('');
      expect(category).toBeUndefined();
    });
  });

  describe('getPopularTools', () => {
    it('should return only popular tools', () => {
      const popularTools = getPopularTools();
      expect(popularTools.length).toBeGreaterThan(0);
      popularTools.forEach(tool => {
        expect(tool.isPopular).toBe(true);
      });
    });

    it('should return tools from multiple categories', () => {
      const popularTools = getPopularTools();
      const categories = new Set(popularTools.map(tool => tool.category));
      expect(categories.size).toBeGreaterThan(1);
    });
  });

  describe('getAllTools', () => {
    it('should return all tools from all categories', () => {
      const allTools = getAllTools();
      const expectedCount = toolCategories.reduce((sum, cat) => sum + cat.tools.length, 0);
      expect(allTools).toHaveLength(expectedCount);
    });

    it('should have unique tool IDs', () => {
      const allTools = getAllTools();
      const ids = allTools.map(tool => tool.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should register a component loader for every tool', () => {
      const registeredComponents = new Set(toolComponentNames);
      const unregisteredComponents = getAllTools()
        .map(tool => tool.component)
        .filter(component => !registeredComponents.has(component));

      expect(unregisteredComponents).toEqual([]);
    });

    it('should include all tool properties', () => {
      const allTools = getAllTools();
      allTools.forEach(tool => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('category');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('path');
        expect(tool).toHaveProperty('component');
      });
    });
  });

  describe('category structure', () => {
    it('should have text-tools category', () => {
      const textCategory = toolCategories.find(cat => cat.id === 'text-tools');
      expect(textCategory).toBeDefined();
      expect(textCategory?.name).toBe('Text Tools');
      expect(textCategory?.icon).toBe('📝');
      expect(textCategory?.color).toBe('blue');
    });

    it('should have formatters category', () => {
      const formattersCategory = toolCategories.find(cat => cat.id === 'formatters');
      expect(formattersCategory).toBeDefined();
      expect(formattersCategory?.name).toBe('Formatters');
      expect(formattersCategory?.icon).toBe('🔧');
      expect(formattersCategory?.color).toBe('green');
    });

    it('should have converters category', () => {
      const convertersCategory = toolCategories.find(cat => cat.id === 'converters');
      expect(convertersCategory).toBeDefined();
      expect(convertersCategory?.name).toBe('Converters');
      expect(convertersCategory?.icon).toBe('🔀');
      expect(convertersCategory?.color).toBe('teal');
    });

    it('should have network category', () => {
      const networkCategory = toolCategories.find(cat => cat.id === 'network');
      expect(networkCategory).toBeDefined();
      expect(networkCategory?.name).toBe('Network Tools');
      expect(networkCategory?.icon).toBe('🌐');
      expect(networkCategory?.color).toBe('indigo');
    });

    it('should have cryptography category', () => {
      const cryptographyCategory = toolCategories.find(cat => cat.id === 'cryptography');
      expect(cryptographyCategory).toBeDefined();
      expect(cryptographyCategory?.name).toBe('Cryptography & Security');
      expect(cryptographyCategory?.icon).toBe('🔐');
      expect(cryptographyCategory?.color).toBe('red');
    });
  });
});
