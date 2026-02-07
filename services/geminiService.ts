import { GoogleGenAI, Chat, GenerateContentResponse, Content, Part } from "@google/genai";
import { AnalysisResponse, LanguageCode, NewsResponse, NewsItem, SchemeResponse, LabItem } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createAgriChatSession = (language: string, history: Content[] = []): Chat => {
  return ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `You are Kisan Setu, a highly knowledgeable and friendly agricultural expert. 
      Your goal is to assist farmers with questions regarding:
      - Weather forecasting and its impact on farming.
      - Soil health, types, and maintenance.
      - Fertilizers (organic and chemical).
      - Crop selection, rotation, and management.
      - Plant diseases and remedies.
      
      Rules:
      1. STRICTLY answer in the user's requested language (${language}).
      2. Keep answers simple, practical, and easy for a farmer to understand. Avoid overly complex jargon.
      3. Be encouraging and helpful.
      4. If a question is not related to farming/agriculture, politely guide the user back to farming topics.
      5. FORMATTING RULES: 
         - **Do not use long paragraphs.** Break text into small, digestible chunks (2-3 sentences max).
         - **Use Bullet Points** or numbered lists heavily to list steps, tips, or items.
         - Use **Bold** text for important keywords.`,
      temperature: 0.7,
    },
    history: history
  });
};

export const getAgriculturalNews = async (location: string, language: LanguageCode): Promise<NewsResponse> => {
  const languageNames: Record<LanguageCode, string> = {
    en: 'English', hi: 'Hindi', mr: 'Marathi', ur: 'Urdu', kn: 'Kannada', te: 'Telugu'
  };
  const targetLanguage = languageNames[language];
  const currentDate = new Date().toDateString();

  const prompt = `
    Find the latest agricultural news and updates for farmers in ${location || 'India'}. 
    Today is ${currentDate}.
    Generate at least 8-10 diverse news items across the requested categories.
    
    You MUST search and prioritize data from these specific official sources:
    1. agricoop.nic.in (Govt Schemes)
    2. icar.org.in (Research & Tech)
    3. kisanportal.org (General Advisories)
    4. doordarshan.gov.in/ddkisan (News)
    5. agmarknet.gov.in (Market Prices)
    6. krishakjagat.org (Latest Agri News)
    7. tractorguru.in/news (Machinery & Tech)

    Categorize the news into exactly these 5 categories:
    1. **Weather**: Rain alerts, temperature, monsoon updates.
    2. **Accidents**: Farming related accidents, safety warnings, fire incidents in fields.
    3. **Technology**: New machinery, drones, app launches, scientific breakthroughs.
    4. **Crops**: Sowing/harvesting updates, fertilizers, disease outbreaks.
    5. **Market**: Mandi prices, MSP updates, export/import news.

    STRICTLY output the response in valid JSON format ONLY. 
    The JSON should be a list of objects under the key "news".
    Translate all content to ${targetLanguage}.

    JSON Structure:
    {
      "news": [
        {
          "category": "Weather" | "Accidents" | "Technology" | "Crops" | "Market",
          "title": "Short Headline (Newspaper style)",
          "summary": "2-3 sentence summary.",
          "date": "Date of news (e.g. 2 hours ago, or DD MMM)",
          "source": "Name of the website/source",
          "link": "URL to the article if found"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty response");

    const parsedData = JSON.parse(responseText);

    // Extract grounding chunks for sources
    const sources: { title: string; uri: string }[] = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    // Deduplicate sources
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i).slice(0, 5);

    return {
      news: parsedData.news || [],
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Error fetching news:", error);
    // Fallback data structure in case of error
    return {
      news: [
        {
          category: 'Crops',
          title: 'News Service Unavailable',
          summary: 'We are currently unable to fetch the latest updates from the requested sources. Please check your internet connection.',
          date: new Date().toLocaleDateString(),
          source: 'System'
        }
      ],
      sources: []
    };
  }
};

export const getGovernmentSchemes = async (location: string, language: LanguageCode): Promise<SchemeResponse> => {
  const languageNames: Record<LanguageCode, string> = {
    en: 'English', hi: 'Hindi', mr: 'Marathi', ur: 'Urdu', kn: 'Kannada', te: 'Telugu'
  };
  const targetLanguage = languageNames[language];

  const prompt = `
    Find detailed Government Agricultural Schemes for farmers in ${location || 'India'}.
    
    You MUST prioritize data from these specific official portals:
    1. https://kisanportal.org/
    2. https://pmkisan.gov.in
    3. https://agricoop.nic.in
    4. https://www.mygov.in
    5. https://doordarshan.gov.in/ddkisan
    
    Select 30-40 major active and beneficial government schemes for farmers from these sources.
    
    For EACH scheme, generate:
    1. A detailed explanation (approximately 5 short lines/sentences) written in very simple, easy-to-understand language. Keep each sentence short and actionable.
    2. At least 5 specific benefits (bullet points) that explain why the scheme helps farmers in practical terms.
    3. A clear, detailed, step-by-step application process using short numbered steps. Make steps easy to follow for farmers with limited digital experience (e.g., include visits to local CSC, required documents, and alternatives).
    
    STRICTLY output the response in valid JSON format ONLY.
    Translate all content to ${targetLanguage}.

    JSON Structure:
    {
      "schemes": [
        {
          "name": "Scheme Name",
          "description": "Detailed 5-line explanation of the scheme...",
          "benefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
          "stepsToClaim": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
          "officialLink": "Official URL from the grounding sources"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty response");

    return JSON.parse(responseText) as SchemeResponse;

  } catch (error) {
    console.error("Error fetching schemes:", error);
    return {
      schemes: [
        {
          name: "PM-Kisan Samman Nidhi",
          description: "PM-Kisan gives small cash support directly to eligible landholding farmers. It helps meet basic cultivation and household expenses. Payments are transferred to the farmer's bank account in 3 instalments per year. Registration is simple and can be done through local CSC or online. This support improves cash flow during sowing and harvesting seasons.",
          benefits: [
            "Direct cash into farmer's bank account for immediate use",
            "Helps cover input costs like seeds and fertiliser",
            "Reduces dependency on informal loans with high interest",
            "Improves household financial stability during lean months",
            "Easy access through local Common Service Centres (CSCs)"
          ],
          stepsToClaim: [
            "Collect Aadhaar, land record (khata), and bank details",
            "Visit your nearest Common Service Centre (CSC) or local agriculture office",
            "Fill the PM-Kisan registration form and submit required documents",
            "Wait for verification (usually a few weeks) and track status online",
            "Receive instalments directly in your bank account once approved"
          ],
          officialLink: "https://pmkisan.gov.in"
        },
        {
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          description: "PMFBY provides affordable crop insurance against yield losses from natural calamities. The scheme protects farmers from income loss due to weather, pests, or disease. Premium rates are subsidised and depend on the crop and season. Claims are processed after yield assessment or notified losses. This insurance helps farmers recover and replant without severe financial strain.",
          benefits: [
            "Financial protection against crop loss due to natural calamities",
            "Low, subsidised premium rates for farmers",
            "Quick assessment and compensation process for many events",
            "Encourages investment in better inputs and technology",
            "Available through banks and authorised insurance providers"
          ],
          stepsToClaim: [
            "Keep records of sowing dates and crop type",
            "Register for PMFBY at your bank branch, insurance office, or CSC before the cut-off",
            "Pay the applicable premium (often partially subsidised)",
            "In case of loss, inform the insurer/local authority immediately and provide evidence",
            "Complete required damage assessment steps and submit documents for claim settlement"
          ],
          officialLink: "https://pmfby.gov.in"
        },
        {
          name: "Kisan Credit Card (KCC)",
          description: "KCC provides short-term credit to farmers for cultivation and allied activities. It offers flexible withdrawal and repayment tailored to crop cycles. Interest rates are competitive and can include concessions for timely repayment. KCC supports purchase of seeds, fertilisers, equipment, and other farm inputs. It also builds credit history for farmers to access larger loans.",
          benefits: [
            "Quick and flexible access to working capital for farming",
            "Lower interest rates compared to informal lenders",
            "Repayment schedules aligned with crop harvests",
            "Helps purchase inputs timely to improve yields",
            "Builds formal credit history for future loans"
          ],
          stepsToClaim: [
            "Visit a bank branch that offers KCC with identity and land documents",
            "Submit Aadhaar, land ownership papers, and recent land tax receipts",
            "Fill KCC application and provide proposed credit limit details",
            "Bank verifies documents and may inspect the land",
            "On approval, KCC is issued and funds are available as per limit"
          ],
          officialLink: "https://pmkisan.gov.in"
        },
        {
          name: "Soil Health Card Scheme",
          description: "The Soil Health Card Scheme gives farmers a detailed report on soil nutrient status. The card lists pH, organic carbon, and macro/micronutrient levels for the sampled field. It recommends the right type and quantity of fertilisers to improve soil health. Regular testing helps track improvements and reduce unnecessary fertiliser use. Farmers can use recommendations to increase yield and save money.",
          benefits: [
            "Know exact nutrient needs of your soil",
            "Avoid overuse of fertilisers and save costs",
            "Better crop recommendations and higher yields",
            "Monitors soil health changes over time",
            "Supports sustainable and balanced fertiliser use"
          ],
          stepsToClaim: [
            "Collect soil sample as per instructions (depth and quantity)",
            "Submit the sample to the nearest soil testing lab or collection centre",
            "Receive the Soil Health Card with test results and recommendations",
            "Follow the recommended fertiliser and crop practices",
            "Re-test periodically (every 2-3 years) to monitor changes"
          ],
          officialLink: "https://soilhealth.dac.gov.in"
        },
        {
          name: "National Agriculture Market (e-NAM) Support",
          description: "e-NAM connects farmers to national markets and creates better price discovery. By listing produce on e-NAM, farmers can access larger buyer pools and competitive bids. The platform helps get fairer prices and reduces the need to rely on local middlemen. Integration with mandi infrastructure enables easier trade. Training and onboarding support are offered at local mandis and through state agencies.",
          benefits: [
            "Access to a wider market and more buyers",
            "Transparent price discovery and competitive bids",
            "Reduced dependence on local intermediaries",
            "Improved market linkages for surplus produce",
            "Supports digital record-keeping and traceability"
          ],
          stepsToClaim: [
            "Register as a seller on the e-NAM portal or through the local mandi",
            "Provide required identity and farm/plot details",
            "List produce with quality and quantity details on the platform",
            "Accept bids or participate in e-auctions as available",
            "Complete payment and logistics arrangements as per mandi rules"
          ],
          officialLink: "https://enam.gov.in"
        }
      ]
    };
  }
};

export const findNearbyPlaces = async (
  location: string | { lat: number; lng: number },
  language: LanguageCode
): Promise<LabItem[]> => {
  const languageNames: Record<LanguageCode, string> = {
    en: 'English', hi: 'Hindi', mr: 'Marathi', ur: 'Urdu', kn: 'Kannada', te: 'Telugu'
  };
  const targetLanguage = languageNames[language];

  const locationContext = typeof location === 'string'
    ? `near ${location}`
    : `near coordinates ${location.lat}, ${location.lng}`;

  // If we have strict coordinates, we use retrievalConfig, otherwise we rely on the prompt context
  const toolConfig = typeof location !== 'string' ? {
    retrievalConfig: {
      latLng: {
        latitude: location.lat,
        longitude: location.lng
      }
    }
  } : undefined;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Find "Soil Testing Labs" and "Government Krushi Seva Kendra" ${locationContext}.
      
      Return a list of the 6-8 closest places found.
      For each place, identify if it is a 'Lab' or 'Krushi Kendra'.
      
      STRICTLY return the response as a JSON array of objects. 
      Translate relevant text to ${targetLanguage}.
      
      JSON Format:
      [
        {
          "name": "Name of place",
          "address": "Address or approximate location",
          "type": "Lab" | "Krushi Kendra",
          "rating": "4.5" (if available, else empty),
          "distance": "2.5 km" (approximate)
        }
      ]`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig ? toolConfig : undefined,
      }
    });

    const text = response.text || "";
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr) as LabItem[];
    } else {
      console.warn("Could not parse JSON from nearby places response", text);
      return [];
    }

  } catch (error) {
    console.error("Error finding nearby places:", error);
    return [];
  }
};


export const analyzeSoilReport = async (
  fileData: string,
  mimeType: string,
  language: LanguageCode
): Promise<AnalysisResponse> => {

  const languageNames: Record<LanguageCode, string> = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
    ur: 'Urdu',
    kn: 'Kannada',
    te: 'Telugu'
  };

  const targetLanguage = languageNames[language];
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prompt = `
    You are a friendly and expert Agricultural Consultant. 
    Analyze the provided Soil Test Report (Image or PDF).
    
    Context:
    - Current Date: ${currentDate}

    Task:
    Perform a deep analysis and generate a report in the following strict order:
    
    1. **Location Extraction**: Carefully read the header of the report to find the Farmer's address, Village, Taluka, or District. If the location is explicitly found, use it. If not found, assume a general region based on the language or headers, or simply state "Unknown Region".
    2. **Soil Condition Analysis**: Explain clearly how the soil is according to the report parameters (pH, EC, Nutrients). Is it healthy? Saline? Acidic? Deficient?
    3. **Weather & Location Analysis**: Use the *Extracted Location* from step 1. Based on the current month (${currentDate}), what is the typical weather/climate for that specific location right now? How does this weather interact with the soil condition?
    4. **Maintenance Plan**: How to maintain this specific soil based on the report?
    5. **Production Increase**: Tips to grow more production (yield).
    6. **Fertilizer Plan**: 
       - **Chemical Brands**: Recommend specific **Commercial Brands** of fertilizers that are popular and easily available in the region of *{extracted_location}* (e.g., IFFCO, Mahadhan, Coromandel, Tata Rallis, YarMila, etc.). Do NOT just list chemical components (like "Urea"); name the brands/products.
       - **Organic Options**: Recommend specific **Organic Fertilizers** or Bio-fertilizers available locally (e.g., Vermicompost, Neem Cake, City Compost, specific organic brands).
    7. **Irrigation**: What are the irrigation requirements?
    8. **Crop Suggestions**: Suggest 3-4 different crops that are best suitable for this specific soil AND the extracted location/weather.
    9. **Disease Prediction**: Based on the *Soil Condition* (e.g., pH, deficiencies) and *Weather* (e.g., humidity, temperature), predict 2-3 common crop diseases or pests that are likely to thrive in these conditions. Provide the name, why it's likely (Reason), and a simple solution/prevention.

    Output Format:
    Return a JSON object in this structure. All text values must be in ${targetLanguage}, except keys.

    {
      "extracted_location": "Village, District (e.g. Rampur, Pune)", 
      "narrative": {
        "soil_condition_summary": "Detailed paragraph explaining the soil status...",
        "weather_location_analysis": "Analysis of weather for the extracted location and how it affects this soil...",
        "soil_maintenance": ["Tip 1", "Tip 2", ...],
        "production_increase_tips": ["Tip 1", "Tip 2", ...],
        "fertilizer_recommendations": {
          "chemical": ["Brand A (Details on qty)", "Brand B (Details on qty)"],
          "organic": ["Organic Option A", "Organic Option B"]
        },
        "irrigation_requirements": "Detailed advice on irrigation...",
        "crop_suggestions": [
          { "crop": "Name of Crop", "reasoning": "Why this crop is good for this soil and weather..." }
        ],
        "disease_prediction": [
          { 
            "disease_name": "Name of Disease", 
            "likelihood_reason": "Why this disease might occur based on soil/weather...",
            "preventative_measures": ["Solution 1", "Solution 2"] 
          }
        ]
      },
      "raw_data": {
         // Extract values from the image. If missing, mark "value" as "Not Available".
         // Ensure "name" and "unit" are populated.
        "ph": { "name": "pH", "value": "...", "unit": "", "status": "Low/Medium/High/Normal", "effect": "Effect on crop...", "recommendation": "..." },
        "ec": { "name": "Electrical Conductivity", "value": "...", "unit": "dS/m", "status": "Low/Medium/High/Normal", "effect": "...", "recommendation": "..." },
        "oc": { "name": "Organic Carbon", "value": "...", "unit": "%", "status": "Low/Medium/High/Normal", "effect": "...", "recommendation": "..." },
        "nitrogen": { "name": "Nitrogen", "value": "...", "unit": "kg/ha", "status": "Low/Medium/High/Normal", "effect": "...", "recommendation": "..." },
        "phosphorus": { "name": "Phosphorus", "value": "...", "unit": "kg/ha", "status": "Low/Medium/High/Normal", "effect": "...", "recommendation": "..." },
        "potassium": { "name": "Potassium", "value": "...", "unit": "kg/ha", "status": "Low/Medium/High/Normal", "effect": "...", "recommendation": "..." },
        "secondary": [ { "name": "Sulphur", "value": "...", "unit": "ppm", "status": "...", "effect": "...", "recommendation": "..." } ],
        "micronutrients": [ { "name": "Zinc", "value": "...", "unit": "ppm", "status": "...", "effect": "...", "recommendation": "..." } ]
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType, data: fileData } },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from model");
    }
    return JSON.parse(responseText) as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing soil report:", error);
    throw new Error("Failed to analyze report. Please try again.");
  }
};