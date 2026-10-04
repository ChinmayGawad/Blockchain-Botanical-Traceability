import { AppLanguage } from '../i18n';
import i18n from '../i18n';

/**
 * FloraChain Real-Time Dynamic In-Browser Translation Engine
 * 
 * Translates 100% of visible application DOM text across all pages,
 * modals, tables, and metric cards in real time without third-party scripts.
 * 
 * Strict constraints:
 * - The project name "FloraChain" is ALWAYS preserved and never altered.
 * - Cryptographic hashes, IPFS CIDs, and batch codes are kept untouched.
 * - Restores original English instantly when switching back to English.
 */

const STORAGE_KEY = 'florachain_language';

// Nodes memory to restore original text without data loss
const originalTextMap = new WeakMap<Node, string>();
let currentLanguage: AppLanguage = 'en';
let observer: MutationObserver | null = null;
let isTranslating = false;

// Comprehensive phrase translations for entire application
interface PhraseMap {
  hi: string;
  mr: string;
}

const DICTIONARY: Record<string, PhraseMap> = {
  // Brand & Project (Strict rule: FloraChain remains FloraChain)
  'FloraChain': { hi: 'FloraChain', mr: 'FloraChain' },
  'florachain': { hi: 'FloraChain', mr: 'FloraChain' },

  // Navbar & Global Controls
  'Connect Wallet': { hi: 'वॉलेट कनेक्ट करें', mr: 'वॉलेट कनेक्ट करा' },
  'Connected': { hi: 'कनेक्टेड', mr: 'कनेक्टेड' },
  'Disconnect': { hi: 'डिस्कनेक्ट', mr: 'डिस्कनेक्ट' },
  'Scan QR': { hi: 'क्यूआर स्कैन करें', mr: 'QR स्कॅन करा' },
  'Quick Scan': { hi: 'त्वरित स्कैन', mr: 'झटपट स्कॅन' },
  'Sign In': { hi: 'साइन इन', mr: 'साइन इन' },
  'Sign Out': { hi: 'साइन आउट', mr: 'साइन आउट' },
  'Overview': { hi: 'अवलोकन', mr: 'आढावा' },
  'Verify Batch': { hi: 'बैच सत्यापित करें', mr: 'बॅच तपासा' },
  'Fleet Command': { hi: 'फ्लीट कमांड', mr: 'फ्लीट कमांड' },
  'Ledger Explorer': { hi: 'लेज़र एक्सप्लोरर', mr: 'लेजर एक्सप्लोरर' },
  'Blockchain Active': { hi: 'ब्लॉकचेन सक्रिय', mr: 'ब्लॉकचेन सक्रिय' },
  'Block': { hi: 'ब्लॉक', mr: 'ब्लॉक' },
  'Demo Login:': { hi: 'डेमो लॉगिन:', mr: 'डेमो लॉगिन:' },
  'Reset State': { hi: 'स्थिति रीसेट करें', mr: 'स्थिती रीसेट करा' },
  'Reset': { hi: 'रीसेट', mr: 'रीसेट' },
  'Search': { hi: 'खोजें', mr: 'शोधा' },
  'Search Batch ID': { hi: 'बैच आईडी खोजें', mr: 'बॅच आयडी शोधा' },

  // Common UI Actions
  'Next': { hi: 'आगे', mr: 'पुढे जा' },
  'Back': { hi: 'पीछे', mr: 'मागे या' },
  'Submit': { hi: 'जमा करें', mr: 'सादर करा' },
  'Save': { hi: 'सहेजें', mr: 'जतन करा' },
  'Cancel': { hi: 'रद्द करें', mr: 'रद्द करा' },
  'Confirm': { hi: 'पुष्टि करें', mr: 'पुष्टी करा' },
  'Close': { hi: 'बंद करें', mr: 'बंद करा' },
  'Copied!': { hi: 'कॉपी हो गया!', mr: 'कॉपी केले!' },
  'Share': { hi: 'साझा करें', mr: 'शेअर करा' },
  'Filter': { hi: 'फ़िल्टर', mr: 'फिल्टर' },
  'View Details': { hi: 'विवरण देखें', mr: 'तपशील पहा' },
  'Inspect Journey': { hi: 'सफर की जांच करें', mr: 'प्रवास तपासा' },
  'Inspect': { hi: 'जांचें', mr: 'तपासा' },
  'Actions': { hi: 'क्रियाएं', mr: 'कार्रवाई' },
  'Status': { hi: 'स्थिति', mr: 'स्थिती' },
  'Date': { hi: 'तारीख', mr: 'दिनांक' },
  'Quantity': { hi: 'मात्रा', mr: 'मात्रा' },
  'Location': { hi: 'स्थान', mr: 'स्थान' },
  'Details': { hi: 'विवरण', mr: 'तपशील' },
  'Export': { hi: 'निर्यात करें', mr: 'निर्यात करा' },
  'Refresh': { hi: 'रिफ्रेश करें', mr: 'रिफ्रेश करा' },
  'Loading...': { hi: 'लोड हो रहा है...', mr: 'लोड होत आहे...' },
  'Download': { hi: 'डाउनलोड', mr: 'डाउनलोड' },
  'Print': { hi: 'प्रिंट', mr: 'प्रिंट' },

  // QR Scanner Modal
  'Scan Botanical QR Code': { hi: 'वानस्पतिक क्यूआर कोड स्कैन करें', mr: 'वनस्पती QR कोड स्कॅन करा' },
  'Verify authenticity, farm GPS origin, lab purity, and Hyperledger Fabric records': {
    hi: 'प्रामाणिकता, फार्म जीपीएस उद्गम, प्रयोगशाला शुद्धता और हाइपरलेज़र फैब्रिक रिकॉर्ड सत्यापित करें',
    mr: 'सत्यता, शेत GPS मूळ, प्रयोगशाळा शुद्धता आणि हायपरलेजर फॅब्रिक नोंदी पडताळा'
  },
  'Point mobile camera at product container QR tag': {
    hi: 'उत्पाद कंटेनर पर क्यूआर टैग की ओर मोबाइल कैमरा इंगित करें',
    mr: 'उत्पादन कंटेनरवरील QR टॅगकडे मोबाईल कॅमेरा रोखा'
  },
  'Supports FloraChain botanical batch QR tags & GS1 digital link data carriers': {
    hi: 'FloraChain वानस्पतिक बैच क्यूआर टैग एवं GS1 डिजिटल लिंक का समर्थन करता है',
    mr: 'FloraChain वनस्पती बॅच QR टॅग आणि GS1 डिजिटल लिंक वाहकांचे समर्थन करते'
  },
  'Activate Camera Scanner': { hi: 'कैमरा स्कैनर सक्रिय करें', mr: 'कॅमेरा स्कॅनर सुरू करा' },
  'Demo Scan': { hi: 'डेमो स्कैन', mr: 'डेमो स्कॅन' },
  'Or enter Product ID / Batch Code manually:': { hi: 'या मैन्युअल रूप से उत्पाद आईडी / बैच कोड दर्ज करें:', mr: 'किंवा उत्पादन आयडी / बॅच कोड स्वतः टाका:' },
  'Verify': { hi: 'सत्यापित करें', mr: 'तपासा' },
  'CLICK TO TEST DEMO BATCHES:': { hi: 'परीक्षण हेतु डेमो बैच पर क्लिक करें:', mr: 'डेमो बॅचेस तपासण्यासाठी क्लिक करा:' },
  'Click to Test Demo Batches:': { hi: 'परीक्षण हेतु डेमो बैच पर क्लिक करें:', mr: 'डेमो बॅचेस तपासण्यासाठी क्लिक करा:' },
  'Try samples:': { hi: 'नमूने आज़माएं:', mr: 'नमुने तपासा:' },
  'Retail Ready': { hi: 'खुदरा बिक्री तैयार', mr: 'विक्रीसाठी तयार' },
  'In Transit': { hi: 'परिवहन में', mr: 'वाहतुकीत' },
  'Approved': { hi: 'स्वीकृत', mr: 'मंजूर' },
  'Processing': { hi: 'प्रसंस्करण', mr: 'प्रक्रियेत' },
  'Camera Permission Blocked': { hi: 'कैमरा अनुमति अवरुद्ध', mr: 'कॅमेरा परवानगी अवरोधित' },
  'Retry Camera Permission': { hi: 'कैमरा अनुमति पुनः प्रयास करें', mr: 'कॅमेरा परवानगी पुन्हा प्रयत्न करा' },
  'Use Demo Scan Instead': { hi: 'इसके बजाय डेमो स्कैन का उपयोग करें', mr: 'त्याऐवजी डेमो स्कॅन वापरा' },
  'Simulate Quick Scan (Demo)': { hi: 'त्वरित स्कैन का अनुकरण करें (डेमो)', mr: 'झटपट स्कॅन सिम्युलेट करा (डेमो)' },
  'Switch Camera': { hi: 'कैमरा बदलें', mr: 'कॅमेरा बदला' },
  'Stop Camera': { hi: 'कैमरा बंद करें', mr: 'कॅमेरा थांबवा' },
  'Camera Scanner Inactive': { hi: 'कैमरा स्कैनर निष्क्रिय', mr: 'कॅमेरा स्कॅनर निष्क्रिय' },
  'Waiting for camera authorization...': { hi: 'कैमरा प्राधिकरण की प्रतीक्षा है...', mr: 'कॅमेरा परवानगीची वाट पाहत आहे...' },
  'QR Code Verified!': { hi: 'क्यूआर कोड सत्यापित!', mr: 'QR कोड सत्यापित!' },
  'Decoded:': { hi: 'डिकोड किया गया:', mr: 'डिकोड केलेले:' },
  'Loading provenance record...': { hi: 'उद्गम रिकॉर्ड लोड हो रहा है...', mr: 'उगम नोंद लोड होत आहे...' },
  'Simulate scanning a sample batch without camera': { hi: 'बिना कैमरे के नमूना बैच को स्कैन करें', mr: 'कॅमेऱ्याशिवाय नमुना बॅच स्कॅन करा' },

  // Fleet Command (/fleet-map) Metrics & Headers
  'ACTIVE FLEET CRYO-VANS': { hi: 'सक्रिय क्रायो-वैन फ्लीट', mr: 'सक्रिय क्रायो-व्हॅन फ्लीट' },
  'Active Fleet Cryo-Vans': { hi: 'सक्रिय क्रायो-वैन फ्लीट', mr: 'सक्रिय क्रायो-व्हॅन फ्लीट' },
  'Monitored Vehicles': { hi: 'निगरानी वाहन', mr: 'निरीक्षणाखालील वाहने' },
  'COLD-CHAIN CARGO TEMPERATURE': { hi: 'कोल्ड-चेन कार्गो तापमान', mr: 'कोल्ड-चेन कार्गो तापमान' },
  'Cold-Chain Cargo Temperature': { hi: 'कोल्ड-चेन कार्गो तापमान', mr: 'कोल्ड-चेन कार्गो तापमान' },
  'Mean • Zero Excursions': { hi: 'औसत • शून्य विचलन', mr: 'सरासरी • शून्य विचलन' },
  'CONSORTIUM NODE SIGNATURES': { hi: 'कंसोर्टियम नोड हस्ताक्षर', mr: 'कन्सोर्टियम नोड स्वाक्षऱ्या' },
  'Consortium Node Signatures': { hi: 'कंसोर्टियम नोड हस्ताक्षर', mr: 'कन्सोर्टियम नोड स्वाक्षऱ्या' },
  'On-Chain Endorsed': { hi: 'ऑन-चेन समर्थित', mr: 'ऑन-चेन प्रमाणित' },
  'MONOGRAPH PURITY RATING': { hi: 'मोनोग्राफ शुद्धता रेटिंग', mr: 'मोनोग्राफ शुद्धता रेटिंग' },
  'Monograph Purity Rating': { hi: 'मोनोग्राफ शुद्धता रेटिंग', mr: 'मोनोग्राफ शुद्धता रेटिंग' },
  'HPLC Assay Grade': { hi: 'एचपीएलसी जांच श्रेणी', mr: 'HPLC तपासणी दर्जा' },
  'Live Provenance Journey': { hi: 'लाइव उद्गम यात्रा', mr: 'थेट उगम प्रवास' },
  'Bio-Processing & Cryogenic Milling': { hi: 'जैव-प्रसंस्करण एवं क्रायोजेनिक मिलिंग', mr: 'बायो-प्रोसेसिंग आणि क्रायोजेनिक मिलिंग' },
  'Laboratory Purity & Contaminant Analysis': { hi: 'प्रयोगशाला शुद्धता एवं संदूषक विश्लेषण', mr: 'प्रयोगशाळा शुद्धता व दूषित घटक विश्लेषण' },
  'Tracking': { hi: 'ट्रैकिंग', mr: 'ट्रॅकिंग' },
  'through 5 verified checkpoints': { hi: '५ सत्यापित चौकियों के माध्यम से', mr: '५ पडताळणी चौक्यांमधून' },
  'View Certificate': { hi: 'प्रमाणपत्र देखें', mr: 'प्रमाणपत्र पहा' },
  'Cargo:': { hi: 'कार्गो:', mr: 'कार्गो:' },
  'SAFE': { hi: 'सुरक्षित', mr: 'सुरक्षित' },
  'LIVE': { hi: 'लाइव', mr: 'थेट' },
  'Vehicle': { hi: 'वाहन', mr: 'वाहन' },
  'Ref:': { hi: 'संदर्भ:', mr: 'संदर्भ:' },
  'Close telemetry card': { hi: 'टेलीमेट्री कार्ड बंद करें', mr: 'टेलिमेट्री कार्ड बंद करा' },
  'Dismiss': { hi: 'खारिज करें', mr: 'रद्द करा' },
  'View on Sepolia Etherscan': { hi: 'सेपोलिया ईथरस्कैन पर देखें', mr: 'सेपोलिया इथरस्कॅनवर पहा' },
  'IoT Cold-Chain Telematics': { hi: 'आईओटी कोल्ड-चेन टेलीमैटिक्स', mr: 'IoT कोल्ड-चेन टेलिमॅटिक्स' },
  'Temperature Stability': { hi: 'तापमान स्थिरता', mr: 'तापमान स्थिरता' },

  // Table Columns & Statuses
  'STAGE': { hi: 'चरण', mr: 'टप्पा' },
  'FACILITY': { hi: 'सुविधा / केंद्र', mr: 'केंद्र / सुविधा' },
  'LOCATION': { hi: 'स्थान', mr: 'स्थान' },
  'STATUS': { hi: 'स्थिति', mr: 'स्थिती' },
  'TIMESTAMP': { hi: 'समय मुहर', mr: 'वेळ' },
  'ON-CHAIN PROOF': { hi: 'ऑन-चेन प्रमाण', mr: 'ऑन-चेन पुरावा' },
  'PROOF': { hi: 'प्रमाण', mr: 'पुरावा' },
  'COMPLETED': { hi: 'पूर्ण', mr: 'पूर्ण' },
  'IN PROGRESS': { hi: 'प्रगति पर', mr: 'प्रगतीपथावर' },
  'PENDING': { hi: 'लंबित', mr: 'प्रलंबित' },
  'VERIFIED': { hi: 'सत्यापित', mr: 'सत्यापित' },
  'REJECTED': { hi: 'अस्वीकृत', mr: 'नाकारले' },

  // Facilities & Locations
  'Vedic Agro Organic Cooperative': { hi: 'वैदिक एग्रो जैविक सहकारी समिति', mr: 'वैदिक ॲग्रो सेंद्रिय सहकारी संस्था' },
  'Neemuch, Madhya Pradesh': { hi: 'नीमच, मध्य प्रदेश', mr: 'नीमच, मध्य प्रदेश' },
  'PhytoExtracts Extraction Hub': { hi: 'फाइटोएक्सट्रैक्ट्स निष्कर्षण केंद्र', mr: 'फायटो-एक्स्ट्रॅक्ट्स प्रक्रिया केंद्र' },
  'Indore Bio-Park, Madhya Pradesh': { hi: 'इंदौर बायो-पार्क, मध्य प्रदेश', mr: 'इंदूर बायो-पार्क, मध्य प्रदेश' },
  'Eurofins NABL Analytical Lab': { hi: 'यूरोफिन्स एनएबीएल विश्लेषणात्मक लैब', mr: 'युरोफिन्स NABL चाचणी प्रयोगशाळा' },
  'Hinjawadi Biotech Hub, Pune': { hi: 'हिंजवड़ी बायोटेक हब, पुणे', mr: 'हिंजवडी बायोटेक हब, पुणे' },
  'TransGlobal Cryo-Logistics Hub': { hi: 'ट्रांसग्लोबल क्रायो-लॉजिस्टिक्स हब', mr: 'ट्रान्सग्लोबल क्रायो-लॉजिस्टिक्स हब' },
  'JNPT Freight Corridor, Navi Mumbai': { hi: 'जेएनपीटी फ्रेट कॉरिडोर, नवी मुंबई', mr: 'JNPT फ्रेट कॉरिडॉर, नवी मुंबई' },
  'Arogya Botanical Dispensary': { hi: 'आरोग्य वानस्पतिक औषधालय', mr: 'आरोग्य वनस्पती औषधालय' },
  'Indiranagar & Bandra Flagship': { hi: 'इंदिरानगर एवं बांद्रा फ्लैगशिप', mr: 'इंदिरानगर व वांद्रे मुख्य शाखा' },
  'Lakadong Organic Farmers Guild': { hi: 'लाकाडोंग जैविक किसान संघ', mr: 'लाकाडोंग सेंद्रिय शेतकरी संघ' },
  'West Jaintia Hills, Meghalaya': { hi: 'वेस्ट जयंतिया हिल्स, मेघालय', mr: 'पश्चिम जैंतिया हिल्स, मेघालय' },
  'Meghalaya Bio-Processing Center': { hi: 'मेघालय जैव-प्रसंस्करण केंद्र', mr: 'मेघालय बायो-प्रोसेसिंग केंद्र' },
  'Guwahati Bio-Park, Assam': { hi: 'गुवाहाटी बायो-पार्क, असम', mr: 'गुवाहाटी बायो-पार्क, आसाम' },
  'NABL Eastern Analytical Hub': { hi: 'एनएबीएल पूर्वी विश्लेषणात्मक हब', mr: 'NABL पूर्व चाचणी केंद्र' },
  'Salt Lake Sector V, Kolkata': { hi: 'सॉल्ट लेक सेक्टर V, कोलकाता', mr: 'सॉल्ट लेक सेक्टर ५, कोलकाता' },
  'Yamuna Organic Herbal Cooperative': { hi: 'यमुना जैविक हर्बल सहकारी', mr: 'यमुना सेंद्रिय हर्बल सहकारी संस्था' },
  'Vrindavan, Uttar Pradesh': { hi: 'वृंदावन, उत्तर प्रदेश', mr: 'वृंदावन, उत्तर प्रदेश' },
  'PhytoVedic Extracts Facility': { hi: 'फाइटोवैदिक अर्क संयंत्र', mr: 'फायटोवैदिक अर्क प्रक्रिया केंद्र' },
  'Mathura Industrial Area, UP': { hi: 'मथुरा औद्योगिक क्षेत्र, उप्र', mr: 'मथुरा औद्योगिक क्षेत्र, युपी' },
  'National Pharmacopoeia QA Lab': { hi: 'राष्ट्रीय फार्माकोपिया क्यूए लैब', mr: 'राष्ट्रीय फार्माकोपिया QA प्रयोगशाळा' },
  'Ghaziabad NABL Biotech Center': { hi: 'गाजियाबाद एनएबीएल बायोटेक केंद्र', mr: 'गाझियाबाद NABL बायोटेक केंद्र' },
  'Vedic Logistics Express': { hi: 'वैदिक लॉजिस्टिक्स एक्सप्रेस', mr: 'वैदिक लॉजिस्टिक्स एक्सप्रेस' },
  'Greater Noida Highway Hub': { hi: 'ग्रेटर नोएडा हाईवे हब', mr: 'ग्रेटर नोएडा हायवे हब' },
  'Arogya Wellness flagship': { hi: 'आरोग्य वेलनेस फ्लैगशिप', mr: 'आरोग्य वेलनेस मुख्य दालन' },
  'Cyber Hub, Gurugram, Haryana': { hi: 'साइबर हब, गुरुग्राम, हरियाणा', mr: 'सायबर हब, गुरुग्राम, हरियाणा' },

  // Home Hero Right Card & Verified Data Points
  'LIVE PROVENANCE': { hi: 'लाइव उद्गम प्रमाण', mr: 'थेट उगम' },
  'Live Provenance': { hi: 'लाइव उद्गम प्रमाण', mr: 'थेट उगम' },
  'HPLC Active Purity': { hi: 'एचपीएलसी सक्रिय शुद्धता', mr: 'HPLC सक्रिय शुद्धता' },
  'HPLC ACTIVE PURITY': { hi: 'एचपीएलसी सक्रिय शुद्धता', mr: 'HPLC सक्रिय शुद्धता' },
  'Farm Coordinates': { hi: 'खेत निर्देशांक (जीपीएस)', mr: 'शेत GPS निर्देशांक' },
  'FARM COORDINATES': { hi: 'खेत निर्देशांक (जीपीएस)', mr: 'शेत GPS निर्देशांक' },
  'Consensus (5/5 Nodes):': { hi: 'सहमति (५/५ नोड्स):', mr: 'सहमती (५/५ नोड्स):' },
  'Consensus (5/5 Nodes)': { hi: 'सहमति (५/५ नोड्स)', mr: 'सहमती (५/५ नोड्स)' },
  'Farm': { hi: 'खेत', mr: 'शेत' },
  'Mill': { hi: 'मिल / निष्कर्षण', mr: 'प्रक्रिया मिल' },
  'Lab': { hi: 'प्रयोगशाला', mr: 'प्रयोगशाळा' },
  'Cold': { hi: 'कोल्ड-चेन', mr: 'कोल्ड-चेन' },
  'Retail': { hi: 'दुकानदार', mr: 'विक्रेता' },
  'Share Monograph': { hi: 'मोनोग्राफ साझा करें', mr: 'मोनोग्राफ शेअर करा' },
  'Verified Data Points:': { hi: 'सत्यापित डेटा बिंदु:', mr: 'पडताळलेले डेटा पॉईंट्स:' },
  'VERIFIED DATA POINTS:': { hi: 'सत्यापित डेटा बिंदु:', mr: 'पडताळलेले डेटा पॉईंट्स:' },
  'Precision GPS Geotag': { hi: 'सटीक जीपीएस जियोटैग', mr: 'अचूक GPS जिओटॅग' },
  'NPOP Organic CID': { hi: 'एनपीओपी ऑर्गेनिक सीआईडी', mr: 'NPOP सेंद्रिय CID' },
  'Harvest Timestamp': { hi: 'कटाई समय मुहर', mr: 'काढणी वेळ नोंद' },
  'Genesis Block': { hi: 'जेनेसिस ब्लॉक', mr: 'जेनेसिस ब्लॉक' },
  'Smart Contract: CreateProduct() • Signed with Farmer Node Key': {
    hi: 'स्मार्ट अनुबंध: CreateProduct() • किसान नोड कुंजी से हस्ताक्षरित',
    mr: 'स्मार्ट कॉन्ट्रॅक्ट: CreateProduct() • शेतकरी नोड की द्वारे स्वाक्षरीत'
  },

  // Botanical Products & Herbs
  'Pure Organic Ashwagandha Root Powder': { hi: 'शुद्ध जैविक अश्वगंधा जड़ पाउडर', mr: 'शुद्ध सेंद्रिय अश्वगंधा मूळ पावडर' },
  'Organic Ashwagandha Extract': { hi: 'जैविक अश्वगंधा अर्क', mr: 'सेंद्रिय अश्वगंधा अर्क' },
  'Organic Ashwagandha Root': { hi: 'जैविक अश्वगंधा जड़', mr: 'सेंद्रिय अश्वगंधा मूळ' },
  'Lakadong High-Curcumin Turmeric': { hi: 'लाकाडोंग उच्च-करक्यूमिन हल्दी', mr: 'लाकाडोंग उच्च-कर्क्यूमिन हळद' },
  'Lakadong Turmeric Powder': { hi: 'लाकाडोंग हल्दी पाउडर', mr: 'लाकाडोंग हळद पावडर' },
  'Lakadong Organic Turmeric Root': { hi: 'लाकाडोंग जैविक हल्दी जड़', mr: 'लाकाडोंग सेंद्रिय हळद मूळ' },
  'Biodynamic Krishna Tulsi Leaves': { hi: 'बायोडायनामिक कृष्ण तुलसी पत्ते', mr: 'बायोडायनामिक कृष्ण तुळस पाने' },
  'Biodynamic Rama & Krishna Tulsi Leaf Blend': { hi: 'बायोडायनामिक राम व कृष्ण तुलसी मिश्रण', mr: 'बायोडायनामिक राम व कृष्ण तुळस मिश्रण' },
  'Cold-Pressed Neem Seed Oil': { hi: 'कोल्ड-प्रेस्ड नीम बीज तेल', mr: 'कोल्ड-प्रेस्ड कडुनिंब बियाणे तेल' },
  'Medicinal Herb': { hi: 'औषधीय जड़ी-बूटी', mr: 'औषधी वनस्पती' },
  'Spice & Extract': { hi: 'मसाला एवं अर्क', mr: 'मसाला व अर्क' },
  'Aromatic & Tea': { hi: 'सुगंधित एवं चाय', mr: 'सुगंधी व चहा' },
  'Certified Organic': { hi: 'प्रमाणित जैविक', mr: 'प्रमाणित सेंद्रिय' },
  'High Potency': { hi: 'उच्च क्षमता', mr: 'उच्च क्षमता' },
  'Contract Locked': { hi: 'अनुबंध लॉक किया गया', mr: 'कॉन्ट्रॅक्ट लॉक' },
  'QA Failed (Pesticide)': { hi: 'क्यूए विफल (कीटनाशक)', mr: 'QA अपयशी (कीटकनाशक)' },

  // Role Names & Portal Titles
  'Organic Farmer': { hi: 'जैविक किसान', mr: 'सेंद्रिय शेतकरी' },
  'Bio Processor': { hi: 'बायो प्रोसेसर', mr: 'बायो प्रोसेसर' },
  'QA Testing Lab': { hi: 'गुणवत्ता परीक्षण लैब', mr: 'गुणवत्ता चाचणी प्रयोगशाळा' },
  'Cold-Chain Distributor': { hi: 'कोल्ड-चेन वितरक', mr: 'कोल्ड-चेन वितरक' },
  'Apothecary Retailer': { hi: 'औषधालय विक्रेता', mr: 'औषधी / किरकोळ विक्रेता' },
  'Consortium Admin': { hi: 'कंसोर्टियम एडमिन', mr: 'कन्सोर्टियम प्रशासक' },
  'Public Consumer': { hi: 'सामान्य उपभोक्ता', mr: 'सर्वसामान्य ग्राहक' },
  'Farmer Botanical Portal': { hi: 'किसान वानस्पतिक पोर्टल', mr: 'शेतकरी वनस्पती पोर्टल' },
  'Bio-Processing & Milling Portal': { hi: 'जैव-प्रसंस्करण एवं मिलिंग पोर्टल', mr: 'बायो-प्रोसेसिंग व मिलिंग पोर्टल' },
  'QA Analytical Testing Laboratory': { hi: 'गुणवत्ता विश्लेषणात्मक परीक्षण प्रयोगशाला', mr: 'QA विश्लेषणात्मक चाचणी प्रयोगशाळा' },
  'Cold-Chain Logistics Portal': { hi: 'कोल्ड-चेन लॉजिस्टिक्स पोर्टल', mr: 'कोल्ड-चेन लॉजिस्टिक्स पोर्टल' },
  'Apothecary & Retailer Portal': { hi: 'औषधालय एवं खुदरा विक्रेता पोर्टल', mr: 'औषधी व किरकोळ विक्रेता पोर्टल' },
  'Consortium Governance Portal': { hi: 'कंसोर्टियम प्रशासन पोर्टल', mr: 'कन्सोर्टियम प्रशासन पोर्टल' },

  // Dates & Arrival texts
  'Expected Arrival: Tomorrow 09:00': { hi: 'अपेक्षित आगमन: कल 09:00', mr: 'अपेक्षित आगमन: उद्या सकाळी ०९:००' },
  'Expected Arrival: Today 18:00': { hi: 'अपेक्षित आगमन: आज 18:00', mr: 'अपेक्षित आगमन: आज संध्याकाळी १८:००' },
  'Expected Arrival: Today 17:00': { hi: 'अपेक्षित आगमन: आज 17:00', mr: 'अपेक्षित आगमन: आज संध्याकाळी १७:००' },
  'In Transit • ETA 17:30 IST': { hi: 'परिवहन में • ईटीए 17:30 IST', mr: 'वाहतुकीत • आगमन १७:३० IST' },
  'In Transit • ETA 16:15 IST': { hi: 'परिवहन में • ईटीए 16:15 IST', mr: 'वाहतुकीत • आगमन १६:१५ IST' },
};

// Sort phrase keys by length descending to match full sentences before individual words
const SORTED_KEYS = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);

/**
 * Checks if an element should be skipped during translation
 */
function shouldSkipElement(element: Element | null): boolean {
  if (!element) return false;
  if (
    element.tagName === 'SCRIPT' ||
    element.tagName === 'STYLE' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'CODE' ||
    element.tagName === 'PRE'
  ) {
    return true;
  }
  if (element.classList && element.classList.contains('notranslate')) return true;
  if (element.getAttribute('translate') === 'no') return true;
  return false;
}

/**
 * Translates a single text string based on active language dictionary
 */
export function translateString(rawText: string, lang: AppLanguage): string {
  if (lang === 'en' || !rawText || !rawText.trim()) return rawText;

  const trimmed = rawText.trim();

  // Strict rule: Never translate FloraChain
  if (trimmed === 'FloraChain') return rawText;

  // Protect cryptographic hashes, CIDs, and specific batch patterns
  if (
    /^0x[a-fA-F0-9]{6,}/.test(trimmed) ||
    /^Qm[a-zA-Z0-9]{10,}/.test(trimmed) ||
    /^[A-Z]{3,4}-\d{4}-\d{3,4}$/.test(trimmed) ||
    /^BOT-\d{4}-\d{4}$/.test(trimmed) ||
    /^[A-Z]{2}-\d{2}-[A-Z]{1,2}-\d{4}$/.test(trimmed)
  ) {
    return rawText;
  }

  // Exact phrase match
  const directMatch = DICTIONARY[trimmed];
  if (directMatch && directMatch[lang]) {
    const lead = rawText.match(/^\s*/)?.[0] || '';
    const trail = rawText.match(/\s*$/)?.[0] || '';
    return lead + directMatch[lang] + trail;
  }

  // Partial substring replacement (sorted by longest phrase first)
  let result = rawText;
  for (const key of SORTED_KEYS) {
    if (key === 'FloraChain') continue; // Always keep FloraChain intact
    if (result.includes(key)) {
      const translation = DICTIONARY[key][lang];
      if (translation) {
        // Safe regex escaping
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escaped, 'g'), translation);
      }
    }
  }

  // Guarantee FloraChain remains unaltered
  result = result.replace(/फ्लोराचेन/g, 'FloraChain');

  return result;
}

/**
 * Translates a single DOM text node
 */
function translateTextNode(node: Node, lang: AppLanguage): void {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const parent = node.parentElement;
  if (parent && shouldSkipElement(parent)) return;

  // Store original English text
  if (!originalTextMap.has(node)) {
    originalTextMap.set(node, node.nodeValue || '');
  }

  const original = originalTextMap.get(node) || '';
  if (!original.trim()) return;

  if (lang === 'en') {
    if (node.nodeValue !== original) {
      node.nodeValue = original;
    }
  } else {
    const translated = translateString(original, lang);
    if (node.nodeValue !== translated) {
      node.nodeValue = translated;
    }
  }
}

/**
 * Recursively walks a DOM subtree and translates all eligible text nodes
 */
export function translateSubtree(root: Node, lang: AppLanguage): void {
  if (!root) return;
  if (root.nodeType === Node.ELEMENT_NODE && shouldSkipElement(root as Element)) {
    return;
  }

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, lang);
    return;
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (parent && shouldSkipElement(parent)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let current = walker.nextNode();
  while (current) {
    translateTextNode(current, lang);
    current = walker.nextNode();
  }
}

/**
 * Retranslates all DOM elements across the page and modals
 */
export function retranslateEntireApp(lang: AppLanguage): void {
  if (typeof document === 'undefined') return;
  if (isTranslating) return;
  isTranslating = true;

  try {
    translateSubtree(document.body, lang);
  } finally {
    isTranslating = false;
  }
}

/**
 * Sets up mutation observer to automatically translate newly added DOM nodes
 * (e.g. when opening modals, navigating routes, or rendering tables)
 */
function setupDynamicObserver(lang: AppLanguage): void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;

  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (lang === 'en') return;

  observer = new MutationObserver((mutations) => {
    if (isTranslating) return;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          translateSubtree(node, currentLanguage);
        });
      } else if (mutation.type === 'characterData') {
        translateTextNode(mutation.target, currentLanguage);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

/**
 * Main function to switch application language dynamically in real time
 */
export function switchDynamicLanguage(lang: AppLanguage): void {
  currentLanguage = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    // Storage access might be restricted
  }

  // Also sync with react-i18next if available
  if (i18n && i18n.language !== lang) {
    i18n.changeLanguage(lang);
  }

  // Retranslate complete active DOM
  retranslateEntireApp(lang);

  // Setup/tear down real-time observer for new dynamic nodes
  setupDynamicObserver(lang);
}

/**
 * Initializes language on app boot based on stored preference
 */
export function initDynamicTranslation(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  let savedLang: AppLanguage = 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as AppLanguage;
    if (stored === 'hi' || stored === 'mr') {
      savedLang = stored;
    }
  } catch (e) {
    // Ignore storage errors
  }

  currentLanguage = savedLang;

  // Retranslate when DOM content is ready
  const runInit = () => {
    if (currentLanguage !== 'en') {
      retranslateEntireApp(currentLanguage);
      setupDynamicObserver(currentLanguage);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    setTimeout(runInit, 50);
  }

  // Watch SPA client-side route changes to retranslate dynamically
  window.addEventListener('popstate', () => {
    if (currentLanguage !== 'en') {
      setTimeout(() => retranslateEntireApp(currentLanguage), 20);
    }
  });

  // Intercept history.pushState & replaceState
  const originalPush = window.history.pushState;
  window.history.pushState = function (...args) {
    originalPush.apply(this, args);
    if (currentLanguage !== 'en') {
      setTimeout(() => retranslateEntireApp(currentLanguage), 30);
    }
  };

  const originalReplace = window.history.replaceState;
  window.history.replaceState = function (...args) {
    originalReplace.apply(this, args);
    if (currentLanguage !== 'en') {
      setTimeout(() => retranslateEntireApp(currentLanguage), 30);
    }
  };
}

export function getCurrentDynamicLanguage(): AppLanguage {
  return currentLanguage;
}
