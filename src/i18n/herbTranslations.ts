/**
 * Botanical Herb & Chemical Spec Localization Dictionary
 * Translates botanical product names, plant categories, and compounds
 * into Hindi and Marathi while preserving scientific accuracy.
 */

export interface HerbLocalization {
  name: { en: string; hi: string; mr: string };
  category?: { en: string; hi: string; mr: string };
  commonName?: { en: string; hi: string; mr: string };
}

export const HERB_LOCALIZATION: Record<string, { hi: string; mr: string }> = {
  // Product Names
  'Pure Organic Ashwagandha Root Powder': {
    hi: 'शुद्ध जैविक अश्वगंधा जड़ पाउडर',
    mr: 'शुद्ध सेंद्रिय अश्वगंधा मूळ पावडर',
  },
  'Organic Ashwagandha Root Extract': {
    hi: 'जैविक अश्वगंधा जड़ अर्क',
    mr: 'सेंद्रिय अश्वगंधा मूळ अर्क',
  },
  'Lakadong High-Curcumin Turmeric Powder': {
    hi: 'लाकाडोंग उच्च-करक्यूमिन हल्दी पाउडर',
    mr: 'लाकाडोंग उच्च-कर्क्यूमिन हळद पावडर',
  },
  'Wild-Harvested Shatavari Extract': {
    hi: 'प्राकृतिक जंगली शतावरी अर्क',
    mr: 'नैसर्गिक जंगली शतावरी अर्क',
  },
  'Adulterated Neem Leaf Powder (Flagged)': {
    hi: 'मिलावटी नीम पत्ती पाउडर (अस्वीकृत/फ्लैग्ड)',
    mr: 'भेसळयुक्त कडुनिंब पान पावडर (अस्वीकृत/फ्लॅग केलेले)',
  },
  'Certified Organic Brahmi Extract': {
    hi: 'प्रमाणित जैविक ब्राह्मी अर्क',
    mr: 'प्रमाणित सेंद्रिय ब्राह्मी अर्क',
  },
  'Krishna Tulsi Holy Basil Powder': {
    hi: 'कृष्ण तुलसी पवित्र पत्ती पाउडर',
    mr: 'कृष्ण तुळस पवित्र पान पावडर',
  },
  'Wild Forest Amla Extract 45% Tannins': {
    hi: 'जंगली आंवला अर्क (४५% टैनिन)',
    mr: 'रानटी आवळा अर्क (४५% टॅनिन्स)',
  },
  'Giloy / Guduchi Stems Extract': {
    hi: 'गिलोय / गुडुची तना अर्क',
    mr: 'गुळवेल / गुडुची खोड अर्क',
  },
};

export const CULTIVATION_LOCALIZATION: Record<string, { hi: string; mr: string }> = {
  ORGANIC: { hi: 'जैविक (प्रमाणित सेंद्रिय)', mr: 'सेंद्रिय (NPOP प्रमाणित)' },
  REGENERATIVE: { hi: 'पुनर्योजी कृषि', mr: 'पुनरुत्पादक शेती' },
  WILD_CRAFTED: { hi: 'प्राकृतिक वन संग्रह', mr: 'नैसर्गिक वन संकलन' },
  CONVENTIONAL: { hi: 'पारंपरिक कृषि', mr: 'पारंपारिक शेती' },
};

export const CATEGORY_LOCALIZATION: Record<string, { hi: string; mr: string }> = {
  MEDICINAL_HERB: { hi: 'औषधीय जड़ी-बूटी', mr: 'औषधी वनस्पती' },
  AROMATIC_PLANT: { hi: 'सुगंधित पौधा', mr: 'सुगंधी वनस्पती' },
  SPICE_ROOT: { hi: 'मसाला जड़ / प्रकंद', mr: 'मसाला कंद / मूळ' },
  AYURVEDIC_EXTRACT: { hi: 'आयुर्वेदिक अर्क', mr: 'आयुर्वेदिक अर्क' },
};

export function getTranslatedHerbName(name: string, lang: string): string {
  if (!name || lang === 'en') return name;
  const match = HERB_LOCALIZATION[name.trim()];
  if (match) {
    return lang === 'hi' ? match.hi : match.mr;
  }
  return name;
}

export function getTranslatedCultivation(method: string, lang: string): string {
  if (!method || lang === 'en') return method;
  const match = CULTIVATION_LOCALIZATION[method.toUpperCase()];
  if (match) {
    return lang === 'hi' ? match.hi : match.mr;
  }
  return method;
}

export function getTranslatedCategory(category: string, lang: string): string {
  if (!category || lang === 'en') return category;
  const match = CATEGORY_LOCALIZATION[category.toUpperCase()];
  if (match) {
    return lang === 'hi' ? match.hi : match.mr;
  }
  return category;
}
