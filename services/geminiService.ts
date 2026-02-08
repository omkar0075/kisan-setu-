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

const ALLORIGINS = process.env.NEWS_PROXY_URL || 'https://api.allorigins.win/raw?url=';

export const fetchPibPressReleases = async (location?: string): Promise<{ title: string; link: string }[]> => {
  try {
    // Target Ministry of Agriculture specifically if possible, but main page is safer for generic scraping
    const url = 'https://pib.gov.in/AllRelease.aspx';
    const res = await fetch(`${ALLORIGINS}${encodeURIComponent(url)}`);
    const html = await res.text();

    // Regex to capture standard PIB press release links clearly
    // Adjusted to be more flexible with quotes and whitespace
    const regex = /href=['"](https:\/\/pib\.gov\.in\/PressRelease(?:Page|Detail)\.aspx\?PRID=\d+)['"][^>]*>([^<]+?)<\/a>/gi;
    const items: { title: string; link: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
      const link = m[1];
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      if (title && link) items.push({ title, link });
      if (items.length >= 15) break;
    }

    // Also fallback to relative paths if absolute not found
    if (items.length === 0) {
      const relativeRegex = /href=['"](\/PressRelease(?:Page|Detail)\.aspx\?PRID=\d+)['"][^>]*>([^<]+?)<\/a>/gi;
      while ((m = relativeRegex.exec(html)) !== null) {
        const link = "https://pib.gov.in" + m[1];
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        if (title && link) items.push({ title, link });
        if (items.length >= 15) break;
      }
    }

    return items;
  } catch (error) {
    console.warn('Failed to fetch PIB press releases:', error);
    return [];
  }
};

export const fetchTimesOfIndia = async (section?: string): Promise<{ title: string; link: string }[]> => {
  try {
    const url = 'https://timesofindia.indiatimes.com/topic/agriculture';
    const res = await fetch(`${ALLORIGINS}${encodeURIComponent(url)}`);
    const html = await res.text();

    const regex = /href\s*=\s*"(?:https?:\/\/timesofindia\.indiatimes\.com)?(\/articleshow\/\d+[^\"]*\.cms)"[^>]*>([^<]+?)<\/a>/gi;
    const items: { title: string; link: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(html)) !== null) {
      const rel = m[1];
      const title = m[2].replace(/<[^>]+>/g, '').trim();
      const link = new URL(rel, 'https://timesofindia.indiatimes.com').toString();
      if (title && link) items.push({ title, link });
      if (items.length >= 10) break;
    }

    return items;
  } catch (error) {
    console.warn('Failed to fetch Times of India articles:', error);
    return [];
  }
};

// Helper: fetch HTML via AllOrigins proxy
const fetchHtml = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(`${ALLORIGINS}${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn('fetchHtml failed for', url, err);
    return null;
  }
};

const extractTitleAndSnippet = (html: string): { title: string; snippet: string } => {
  const metaOgTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const metaTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  const title = (metaOgTitle && metaOgTitle[1]) || (metaTitle && metaTitle[1]) || 'Untitled';
  const snippet = (metaDesc && metaDesc[1]) || (ogDesc && ogDesc[1]) || (() => {
    const p = html.match(/<p[^>]*>([^<]{40,}?)<\/p>/i);
    return p ? p[1].replace(/\s+/g, ' ').trim() : '';
  })();

  return { title: title.trim(), snippet: snippet ? snippet.trim() : title.trim() };
};

const fetchAndSummarizeFromOfficialLinks = async (location: string, language: LanguageCode): Promise<NewsResponse | null> => {
  const links = [
    { url: 'https://agricoop.nic.in', source: 'Ministry of Agriculture' },
    { url: 'https://pib.gov.in', source: 'PIB' },
    { url: 'https://pmkisan.gov.in', source: 'PM-Kisan' },
    { url: 'https://apeda.gov.in', source: 'APEDA' },
    { url: 'https://enam.gov.in', source: 'eNAM' },
    { url: 'https://icar.org.in', source: 'ICAR' },
    { url: 'https://timesofindia.indiatimes.com/topic/agriculture', source: 'Times of India' }
  ];

  const collected: { title: string; snippet: string; link: string; source: string; suggestedCategory?: string }[] = [];

  for (const l of links) {
    const html = await fetchHtml(l.url);
    if (!html) continue;
    const { title, snippet } = extractTitleAndSnippet(html);

    // Improved category guessing
    let suggestedCategory = 'Crops';
    if (/market|mandi|price|trade|export/i.test(snippet + title)) suggestedCategory = 'Market';
    else if (/weather|rain|monsoon|storm|flood/i.test(snippet + title)) suggestedCategory = 'Weather';
    else if (/tech|drone|app|digital|ai|satellite/i.test(snippet + title)) suggestedCategory = 'Technology';
    else if (/accident|fire|damage|loss|death/i.test(snippet + title)) suggestedCategory = 'Accidents';

    collected.push({ title, snippet, link: l.url, source: l.source, suggestedCategory });
    if (collected.length >= 10) break;
  }

  if (!collected.length) return null;

  const languageNames: Record<LanguageCode, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi', ur: 'Urdu', kn: 'Kannada', te: 'Telugu' };
  const targetLanguage = languageNames[language] || 'English';

  const itemsForPrompt = collected.map((c, i) => `ITEM_${i + 1}\nSource: ${c.source}\nLink: ${c.link}\nTitle: ${c.title}\nSnippet: ${c.snippet}\nSuggestedCategory: ${c.suggestedCategory}`).join('\n\n');

  const prompt = `You are a news editor. Generate a JSON object with key "news". 
  For each item below, write a news summary (7-8 short sentences) in ${targetLanguage}.
  
  Prioritize:
  1. Weather for ${location || 'India'}
  2. Agricultural Accidents
  3. Market/crops info

  ${itemsForPrompt}

  Output JSON format: { "news": [{ "category": "Weather|Accidents|Technology|Crops|Market", "title": "...", "summary": "...", "date": "...", "source": "...", "link": "..." }] }`;

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = resp.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    const sources = collected.map(c => ({ title: c.title, uri: c.link }));
    return { news: parsed.news || [], sources } as NewsResponse;
  } catch (err) {
    console.warn('AI summarization of official links failed', err);
    return null;
  }
};


export const createAgriChatSession = (language: string, history: Content[] = []): Chat => {
  return ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `You are Kisan Setu, a highly knowledgeable agricultural expert and government scheme advisor. 
      Your goal is to assist farmers with questions regarding farming, schemes, weather, and department info.

      **KEY KNOWLEDGE BASE (Use this for queries about Ministries & Schemes):**
      1. **Ministry of Agriculture & Farmers Welfare**: Main official body. Website: https://agricoop.nic.in
      2. **PM-Kisan Samman Nidhi**: Direct income support (₹6000/year). Official Portal: https://pmkisan.gov.in
      3. **Pradhan Mantri Fasal Bima Yojana (PMFBY)**: Crop insurance. Portal: https://pmfby.gov.in
      4. **e-NAM (National Agriculture Market)**: Online trading for better prices. Portal: https://enam.gov.in
      5. **APEDA Farmer Connect**: Export promotion and links to state agriculture departments. Website: https://apeda.gov.in
      6. **Kisan Call Center**: Toll-free number 1800-180-1551.
      7. **Soil Health Card**: https://soilhealth.dac.gov.in

      **Rules:**
      1. STRICTLY answer in the user's requested language (${language}).
      2. Keep answers simple, practical, and friendly.
      3. **IF asked about schemes or ministries, ALWAYS provide the exact official website link from the list above.**
      4. FORMATTING: Use Bullet points, Bold text for keywords, and short paragraphs.
      `,
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

  // Fetch recent PIB press releases
  const pibItems = await fetchPibPressReleases(location);
  const pibSummary = pibItems.length ? pibItems.map(p => `- ${p.title} (${p.link})`).join('\n') : '';

  // Fetch recent Times of India agriculture articles
  const timesItems = await fetchTimesOfIndia(location);
  const timesSummary = timesItems.length ? timesItems.map(t => `- ${t.title} (${t.link})`).join('\n') : '';

  // Attempt direct summarization if we have good source hits, otherwise fall through to generative
  // (We'll skip the exclusive direct return here to ensure we get a nice mix including the generative prompt if needed, 
  // or we can mix them. For now, let's trust the Generative Model to synthesize the scraped data.)

  const prompt = `
    Find the latest agricultural news and updates for farmers in ${location || 'India'}. 
    Today is ${currentDate}.
    
    **CRITICAL REQUIREMENT:**
    You must fetch and generate valid news items for specific categories.
    
    **SOURCES TO USE:**
    1. **PIB (Press Information Bureau)**: ${pibSummary ? 'Use these fetched items: ' + pibSummary : 'Search pib.gov.in for agriculture releases.'}
    2. **Times of India/Local News**: ${timesSummary ? 'Use these fetched items: ' + timesSummary : 'Search reliable news sources.'}
    3. Ministry of Agriculture (agricoop.nic.in)
    4. IMD (Weather)

    **CATEGORIES TO GENERATE (Must have 1-2 items per category if possible):**
    1. **Weather**: [CRITICAL] Forecast for ${location}. Rain, storm, or heat alerts.
    2. **Accidents**: Any recent farming-related accidents (fire, machinery, animal attacks) in the region/state. If none, general safety warnings.
    3. **Technology**: New farm machines, apps, drones, or solar pumps.
    4. **Crops**: Sowing advice, pest alerts, harvest news.
    5. **Market**: Price trends (Mandi rates) for local crops.

    STRICTLY output JSON. Translate values to ${targetLanguage}.
    
    JSON Structure:
    {
      "news": [
        {
          "category": "Weather" | "Accidents" | "Technology" | "Crops" | "Market",
          "title": "Headline",
          "summary": "7-8 sentence detailed news summary.",
          "date": "Date/Time",
          "source": "Source Name", // e.g. "PIB", "Times of India", "IMD"
          "link": "URL"
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

    // Build source list
    const sources: { title: string; uri: string }[] = [];
    if (parsedData.news) {
      parsedData.news.forEach((n: any) => {
        if (n.link && n.source) sources.push({ title: n.source, uri: n.link });
      });
    }
    // Add scraped sources if they were used
    if (pibItems) pibItems.forEach(p => sources.push({ title: "PIB: " + p.title, uri: p.link }));
    if (timesItems) timesItems.forEach(t => sources.push({ title: "ToI: " + t.title, uri: t.link }));

    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i).slice(0, 10);

    return {
      news: parsedData.news || [],
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Error fetching news:", error);

    // Fallback: If AI fails, return some static or scraped data formatted as news
    return {
      news: [
        {
          category: 'Weather',
          title: 'Weather Update Service Unavailable',
          summary: 'We could not fetch the live weather at this moment. Please check local TV or Radio.',
          date: currentDate,
          source: 'System',
          link: ''
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

  // Construct a location string for the search query
  const locationQuery = typeof location === 'string'
    ? location
    : `${location.lat}, ${location.lng}`;

  const prompt = `
    Find "Soil Testing Labs" and "Government Krushi Seva Kendra" near ${locationQuery}.
    I need real, existing places found via Google Search.
    
    Return a list of the 8 closest places found.
    For each place, identify if it is a 'Lab' or 'Krushi Kendra' based on its name or description.
    
    STRICTLY return the response as a JSON array of objects. 
    Translate relevant names/addresses to ${targetLanguage} ONLY if they are not proper nouns, otherwise keep original.
    
    JSON Format:
    [
      {
        "name": "Name of place",
        "address": "Address or approximate location",
        "type": "Lab" | "Krushi Kendra",
        "rating": "4.5" (if available, else empty),
        "distance": "2.5 km" (approximate)
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        // Use googleSearch tool to find real places
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "";
    // Clean up potential markdown code blocks
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr) as LabItem[];
    } else {
      // Fallback: try parsing the raw text if it looks like JSON
      try {
        return JSON.parse(text) as LabItem[];
      } catch (e) {
        console.warn("Could not parse JSON from nearby places response", text);
        return [];
      }
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