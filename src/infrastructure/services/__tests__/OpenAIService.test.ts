import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIService } from '../OpenAIService';

describe('OpenAIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return false when API key is not configured', () => {
      expect(OpenAIService.isConfigured()).toBe(false);
    });
  });

  describe('analyzeProduct', () => {
    it('should return mock analysis when not configured', async () => {
      const result = await OpenAIService.analyzeProduct({
        productName: 'Test Product',
        description: 'Test Description',
        price: 100,
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('optimizations');
      expect(result).toHaveProperty('seoScore');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should suggest improvements for short titles', async () => {
      const result = await OpenAIService.analyzeProduct({
        productName: 'Test', // Very short title
        description: 'Test Description that is long enough',
        price: 100,
      });

      const titleIssues = result.issues.filter(i => i.category === 'seo');
      expect(titleIssues.length).toBeGreaterThan(0);
    });

    it('should suggest improvements for short descriptions', async () => {
      const result = await OpenAIService.analyzeProduct({
        productName: 'Test Product Name That Is Long Enough',
        description: 'Short', // Very short description
        price: 100,
      });

      const descIssues = result.issues.filter(i => i.category === 'content');
      expect(descIssues.length).toBeGreaterThan(0);
    });
  });

  describe('generateSEOTitle', () => {
    it('should generate a title with category', async () => {
      const result = await OpenAIService.generateSEOTitle(
        'Test Product',
        'Electronics'
      );

      expect(result).toContain('Test Product');
      expect(result.length).toBeGreaterThan(10);
    });

    it('should generate a title without category', async () => {
      const result = await OpenAIService.generateSEOTitle('Test Product');

      expect(result).toContain('Test Product');
    });
  });

  describe('analyzeBulkProducts', () => {
    it('should analyze multiple products', async () => {
      const products = [
        {
          productName: 'Product 1',
          description: 'Description 1 that is long enough for analysis',
          price: 100,
        },
        {
          productName: 'Product 2',
          description: 'Description 2 that is also long enough',
          price: 200,
        },
      ];

      const results = await OpenAIService.analyzeBulkProducts(products);

      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('issues');
      });
    });
  });
});
