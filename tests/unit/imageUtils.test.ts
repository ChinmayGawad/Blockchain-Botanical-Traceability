import { describe, it, expect } from 'vitest';
import { getBotanicalProductImage, BOTANICAL_IMAGES } from '../../src/utils/imageUtils';

describe('imageUtils Unit Tests', () => {
  it('should return Ashwagandha image when product is undefined or null', () => {
    expect(getBotanicalProductImage(undefined)).toBe(BOTANICAL_IMAGES.ASHWAGANDHA);
  });

  it('should accurately resolve Ashwagandha by name or botanical name', () => {
    expect(getBotanicalProductImage({ name: 'Organic Ashwagandha Root Powder' })).toBe(BOTANICAL_IMAGES.ASHWAGANDHA);
    expect(getBotanicalProductImage({ botanicalName: 'Withania somnifera' })).toBe(BOTANICAL_IMAGES.ASHWAGANDHA);
  });

  it('should accurately resolve Turmeric / Curcuma / Lakadong', () => {
    expect(getBotanicalProductImage({ name: 'Lakadong Turmeric Root' })).toBe(BOTANICAL_IMAGES.TURMERIC);
    expect(getBotanicalProductImage({ botanicalName: 'Curcuma longa' })).toBe(BOTANICAL_IMAGES.TURMERIC);
  });

  it('should accurately resolve Tulsi / Holy Basil / Ocimum', () => {
    expect(getBotanicalProductImage({ name: 'Holy Basil Blend' })).toBe(BOTANICAL_IMAGES.TULSI);
    expect(getBotanicalProductImage({ botanicalName: 'Ocimum tenuiflorum' })).toBe(BOTANICAL_IMAGES.TULSI);
  });

  it('should accurately resolve Shatavari, Neem, Tea, Moringa', () => {
    expect(getBotanicalProductImage({ name: 'Certified Organic Shatavari Flakes' })).toBe(BOTANICAL_IMAGES.SHATAVARI);
    expect(getBotanicalProductImage({ botanicalName: 'Azadirachta indica' })).toBe(BOTANICAL_IMAGES.NEEM);
    expect(getBotanicalProductImage({ name: 'Silver Needle White Tea' })).toBe(BOTANICAL_IMAGES.TEA);
    expect(getBotanicalProductImage({ name: 'Wild-Crafted Moringa Leaf' })).toBe(BOTANICAL_IMAGES.MORINGA);
  });

  it('should reject legacy broccoli placeholder and fall back to category or default', () => {
    const broccoliUrl = 'https://images.unsplash.com/photo-1615485290382-eed4a5ad8108?w=600';
    const result = getBotanicalProductImage({
      name: 'Custom Botanical Formula',
      category: 'SPICE',
      imageUrl: broccoliUrl,
    });
    expect(result).toBe(BOTANICAL_IMAGES.TURMERIC);
  });

  it('should use valid custom image URL when not matching legacy broken fragments', () => {
    const customUrl = 'https://images.unsplash.com/photo-99999999-valid?w=600';
    const result = getBotanicalProductImage({
      name: 'Unique Rare Herb',
      category: 'MEDICINAL_HERB',
      imageUrl: customUrl,
    });
    expect(result).toBe(customUrl);
  });

  it('should map categories correctly as fallback', () => {
    expect(getBotanicalProductImage({ category: 'TEA' })).toBe(BOTANICAL_IMAGES.TEA);
    expect(getBotanicalProductImage({ category: 'SPICE' })).toBe(BOTANICAL_IMAGES.TURMERIC);
    expect(getBotanicalProductImage({ category: 'EXTRACT' })).toBe(BOTANICAL_IMAGES.EXTRACT);
    expect(getBotanicalProductImage({ category: 'AROMATIC' })).toBe(BOTANICAL_IMAGES.AROMATIC);
  });
});
