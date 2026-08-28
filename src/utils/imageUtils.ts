/**
 * High-quality, verified botanical product imagery matching authentic herbs,
 * roots, leaves, spices, and tea varieties.
 */
export const BOTANICAL_IMAGES = {
  // Ashwagandha (Withania somnifera) - Authentic medicinal root powder & dried roots in mortar
  ASHWAGANDHA: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
  
  // Turmeric (Curcuma longa / Lakadong) - Fresh sliced golden rhizomes and pure turmeric powder
  TURMERIC: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  
  // Tulsi / Holy Basil (Ocimum tenuiflorum / Ocimum sanctum) - Fresh organic holy basil whole leaves
  TULSI: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
  
  // Neem (Azadirachta indica) - Fresh wild medicinal neem foliage
  NEEM: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80',
  
  // Silver Needle / Green Tea (Camellia sinensis) - Single-estate whole loose green tea leaves
  TEA: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  
  // Shatavari (Asparagus racemosus) - Dried medicinal root chips & ayurvedic herbal cuts
  SHATAVARI: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=600&auto=format&fit=crop&q=80',

  // Moringa (Moringa oleifera) - Pure green moringa leaf harvest
  MORINGA: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',

  // Botanical Liquid Extracts & Essential Tinctures
  EXTRACT: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80',

  // Aromatic Herbs & Botanicals
  AROMATIC: 'https://images.unsplash.com/photo-1515586000433-45406d8e6662?w=600&auto=format&fit=crop&q=80',
} as const;

const BROCCOLI_LEGACY_FRAGMENT = '1615485290382';

/**
 * Resolves an accurate botanical image based on product name, botanical name, and category.
 * Prevents legacy broccoli or mismatched placeholder images from being displayed.
 */
export function getBotanicalProductImage(product?: {
  name?: string;
  botanicalName?: string;
  category?: string;
  imageUrl?: string;
}): string {
  if (!product) {
    return BOTANICAL_IMAGES.ASHWAGANDHA;
  }

  const nameLower = (product.name || '').toLowerCase();
  const botanicalLower = (product.botanicalName || '').toLowerCase();
  const combined = `${nameLower} ${botanicalLower}`;

  // Priority 1: Botanical / Common Name Matching (always matches known herbs accurately)
  if (combined.includes('ashwagandha') || combined.includes('withania')) {
    return BOTANICAL_IMAGES.ASHWAGANDHA;
  }
  if (combined.includes('turmeric') || combined.includes('curcuma') || combined.includes('lakadong') || combined.includes('curcumin')) {
    return BOTANICAL_IMAGES.TURMERIC;
  }
  if (combined.includes('tulsi') || combined.includes('holy basil') || combined.includes('ocimum')) {
    return BOTANICAL_IMAGES.TULSI;
  }
  if (combined.includes('neem') || combined.includes('azadirachta')) {
    return BOTANICAL_IMAGES.NEEM;
  }
  if (combined.includes('tea') || combined.includes('camellia') || combined.includes('silver needle') || combined.includes('matcha')) {
    return BOTANICAL_IMAGES.TEA;
  }
  if (combined.includes('shatavari') || combined.includes('asparagus racemosus')) {
    return BOTANICAL_IMAGES.SHATAVARI;
  }
  if (combined.includes('moringa')) {
    return BOTANICAL_IMAGES.MORINGA;
  }

  // Priority 2: Custom valid image URL if provided and not broccoli
  if (product.imageUrl && !product.imageUrl.includes(BROCCOLI_LEGACY_FRAGMENT)) {
    return product.imageUrl;
  }

  // Category Matching Fallbacks
  const category = (product.category || '').toUpperCase();
  switch (category) {
    case 'SPICE':
      return BOTANICAL_IMAGES.TURMERIC;
    case 'TEA':
      return BOTANICAL_IMAGES.TEA;
    case 'EXTRACT':
      return BOTANICAL_IMAGES.EXTRACT;
    case 'AROMATIC':
      return BOTANICAL_IMAGES.AROMATIC;
    case 'MEDICINAL_HERB':
    default:
      return BOTANICAL_IMAGES.ASHWAGANDHA;
  }
}
