export enum AppScreen {
  SPLASH,
  LANGUAGE_SELECT,
  LOGIN,
  FARMER_INFO,
  DASHBOARD, // New Main Container
  UPLOAD,
  ANALYSIS,
  CHAT
}

export type LanguageCode = 'en' | 'hi' | 'mr' | 'ur' | 'kn' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export interface FarmerDetails {
  village: string;
  taluka: string;
  district: string;
  state: string;
  crop: string;
  soilType: string;
  soilTexture: string;
  soilColor: string;
}

export interface ExtractedParameter {
  name: string;
  value: string;
  unit: string;
  status: 'Low' | 'Medium' | 'High' | 'Sufficient' | 'Deficient' | 'Normal' | 'Unknown';
  effect: string;
  recommendation: string;
}

export interface CropSuggestion {
  crop: string;
  reasoning: string;
}

export interface DiseasePrediction {
  disease_name: string;
  likelihood_reason: string;
  preventative_measures: string[];
}

export interface NarrativeAnalysis {
  soil_condition_summary: string; // How the soil is
  weather_location_analysis: string; // Weather and location check
  soil_maintenance: string[]; // How to maintain soil
  production_increase_tips: string[]; // How to grow more production
  fertilizer_recommendations: {
    chemical: string[]; // Specific brands
    organic: string[]; // Organic options
  };
  irrigation_requirements: string; // Requirement of irrigation
  crop_suggestions: CropSuggestion[]; // Different crops
  disease_prediction: DiseasePrediction[]; // New field for diseases
}

export interface AnalysisResponse {
  extracted_location: string; // Extracted from report
  narrative: NarrativeAnalysis;
  raw_data: {
    ph: ExtractedParameter;
    ec: ExtractedParameter;
    oc: ExtractedParameter;
    nitrogen: ExtractedParameter;
    phosphorus: ExtractedParameter;
    potassium: ExtractedParameter;
    secondary: ExtractedParameter[];
    micronutrients: ExtractedParameter[];
  };
}

export interface NewsItem {
  category: 'Weather' | 'Accidents' | 'Technology' | 'Crops' | 'Market' | 'General';
  title: string;
  summary: string;
  date?: string;
  imageUrl?: string;
  source?: string;
  link?: string;
}

export interface NewsResponse {
  news: NewsItem[];
  sources: { title: string; uri: string }[];
}

export interface LabItem {
  name: string;
  address: string;
  type: 'Lab' | 'Krushi Kendra';
  rating?: string;
  distance?: string;
}

export interface SchemeItem {
  name: string;
  description: string;
  benefits: string[];
  stepsToClaim: string[];
  officialLink: string;
}

export interface SchemeResponse {
  schemes: SchemeItem[];
}

export interface Translation {
  title: string;
  subtitle: string;
  loginBtn: string;
  signUpBtn: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  usernamePlaceholder: string; // New
  emailOrUsernamePlaceholder: string; // New
  noAccount: string;
  haveAccount: string;
  next: string;
  back: string;
  submit: string;
  uploadReport: string;
  dragDrop: string;
  analyzing: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  crop: string;
  soilType: string;
  soilTexture: string;
  soilColor: string;
  resultsTitle: string;
  retry: string;
  downloadReport: string;
  enterLocation: string;
  directChatBtn: string;
  chatTitle: string;
  chatSubtitle: string;
  chatPlaceholder: string;
  diseaseRisksTitle: string;
  // Dashboard Translations
  dashboardHome: string;
  dashboardNews: string; // New
  dashboardSchemes: string; // New
  dashboardAnalysis: string; // New
  menu: string;
  welcomeMessage: string;
  appDescription: string;
  features: string;
  feature1: string;
  feature1Desc: string; // New
  feature2: string;
  feature2Desc: string; // New
  feature3: string;
  feature3Desc: string; // New
  logout: string;
  // News Translations
  newsTitle: string;
  newsSubtitle: string;
  fetchNews: string;
  locationPlaceholder: string;
  sources: string;
  // Schemes Translations
  schemesTitle: string;
  schemesSubtitle: string;
  fetchSchemes: string;
  benefitsLabel: string;
  stepsLabel: string;
  applyLinkBtn: string;
  // Soil Guide Translations
  noReportBtn: string;
  guideTitle: string;
  guideSubtitle: string;
  whyTestTitle: string;
  whyTestDesc: string;
  howToSampleTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  findLabBtn: string;
  // Nearby Labs
  nearbyLabsTitle: string;
  nearbyLabsSubtitle: string;
  locating: string;
  allowLocation: string;
  labsSection: string;
  kendrasSection: string;
  getDirections: string;
}