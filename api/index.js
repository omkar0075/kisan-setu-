import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Load env vars
dotenv.config({ path: '../.env.local' });
dotenv.config(); // Fallback to .env

const app = express();
app.use(cors({ origin: '*' })); // Allow all origins for dev
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing! Check .env.local.");
} else {
  console.log(`Gemini API Key Loaded: ${API_KEY.substring(0, 8)}...`);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const getModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });
};

const model = getModel();

// News Proxy Endpoint (Existing)
app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url parameter');

  try {
    const response = await axios.get(target, {
      responseType: 'text',
      headers: {
        'User-Agent': 'Kisan-Setu-Proxy/1.0'
      },
      timeout: 10000
    });
    res.set('content-type', 'text/html; charset=utf-8');
    res.send(typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
  } catch (err) {
    console.error('proxy error', err?.message);
    res.status(500).send('Failed to fetch');
  }
});

// --- Gemini API Endpoints ---

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, language } = req.body;

    // Convert history format if needed
    // Assuming history comes as { role: 'user'|'model', parts: [{text: '...'}] }[]
    const chatHistory = history || [];

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
      systemInstruction: {
        role: "user",
        parts: [{
          text: `You are Kisan Setu, a highly knowledgeable agricultural expert and government scheme advisor. 
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
        1. STRICTLY answer in the user's requested language (${language || 'English'}).
        2. Keep answers simple, practical, and friendly.
        3. **IF asked about schemes or ministries, ALWAYS provide the exact official website link from the list above.**
        4. FORMATTING: Use Bullet points, Bold text for keywords, and short paragraphs.
        `}]
      }
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (error) {
    console.error('Chat API Error:', error);
    // Log detailed Gemini error if available
    if (error.response) {
      console.error('Gemini API Response Error:', JSON.stringify(error.response, null, 2));
    }
    res.status(500).json({
      error: error.message || "Unknown error",
      details: error.toString()
    });
  }
});

// Helper to extract JSON from AI response
const cleanJson = (text) => {
  let jsonStr = text;
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // Try to find array or object
    const firstCurly = text.indexOf('{');
    const firstSquare = text.indexOf('[');

    let startIndex = -1;
    let endIndex = -1;

    // Determine if it looks like an object or array starts first
    if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
      startIndex = firstCurly;
      endIndex = text.lastIndexOf('}');
    } else if (firstSquare !== -1) {
      startIndex = firstSquare;
      endIndex = text.lastIndexOf(']');
    }

    if (startIndex !== -1 && endIndex !== -1) {
      jsonStr = text.substring(startIndex, endIndex + 1);
    }
  }
  return JSON.parse(jsonStr);
};

// ... (Existing endpoints updated to use cleanJson)

// News Generation Endpoint
app.post('/api/news', async (req, res) => {
  try {
    const { location, language, currentDate, pibSummary, timesSummary } = req.body;

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
    2. **Accidents**: Any recent farming-related accidents.
    3. **Technology**: New farm machines, apps, etc.
    4. **Crops**: Sowing advice, pest alerts.
    5. **Market**: Price trends.

    STRICTLY output valid JSON string. Translate values to ${language || 'English'}.
    
    JSON Structure:
    {
      "news": [
        {
          "category": "Weather" | "Accidents" | "Technology" | "Crops" | "Market",
          "title": "Headline",
          "summary": "7-8 sentence detailed news summary.",
          "date": "Date/Time",
          "source": "Source Name",
          "link": "URL"
        }
      ]
    }
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    const parsed = cleanJson(text);
    res.json(parsed);
  } catch (error) {
    console.error('News API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Schemes Endpoint
app.post('/api/schemes', async (req, res) => {
  try {
    const { location, language } = req.body;

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
    Translate all content to ${language || 'English'}.

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

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    const parsed = cleanJson(text);
    res.json(parsed);
  } catch (error) {
    console.error('Schemes API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nearby Places Endpoint
app.post('/api/nearby-places', async (req, res) => {
  try {
    const { locationQuery, language } = req.body;

    const prompt = `
    Find "Soil Testing Laboratories" and "Agriculture Service Centers (Krushi Seva Kendra)" near: ${locationQuery}.
    Return a list of top 6 relevant results with real addresses.
    
    STRICTLY output a valid JSON array.
    
    JSON Format:
    [
      {
        "name": "Name",
        "address": "Full Address",
        "type": "Lab" | "Krushi Kendra",
        "rating": "4.5",
        "distance": "Distance"
      }
    ]
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const text = result.response.text();
    const parsed = cleanJson(text);
    res.json(parsed);
  } catch (error) {
    console.error('Nearby Places API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze Soil Report Endpoint
app.post('/api/analyze-soil', async (req, res) => {
  try {
    const { fileData, mimeType, language, currentDate } = req.body;

    const prompt = `
    Analyze the provided Soil Test Report (Image or PDF).
    Context: Current Date: ${currentDate}
    
    Output Format: STRICTLY return a valid JSON string matching this structure:
    {
      "extracted_location": "Village, District, State",
      "narrative": {
        "soil_condition_summary": "Summary of soil health...",
        "weather_location_analysis": "Weather context...",
        "soil_maintenance": ["Tip 1", "Tip 2"],
        "production_increase_tips": ["Tip 1", "Tip 2"],
        "fertilizer_recommendations": {
          "chemical": ["Item 1"],
          "organic": ["Item 2"]
        },
        "irrigation_requirements": "Requirements...",
        "crop_suggestions": [
          { "crop": "Name", "reasoning": "Reason..." }
        ],
        "disease_prediction": [
          { "disease_name": "Name", "likelihood_reason": "Reason...", "preventative_measures": ["Measure 1"] } 
        ]
      },
      "raw_data": {
        "ph": { "name": "pH", "value": "7.0", "unit": "", "status": "Normal", "effect": "...", "recommendation": "..." },
        "ec": { "name": "EC", "value": "...", "unit": "dS/m", "status": "...", "effect": "...", "recommendation": "..." },
        "oc": { "name": "Organic Carbon", "value": "...", "unit": "%", "status": "...", "effect": "...", "recommendation": "..." },
        "nitrogen": { "name": "Nitrogen", "value": "...", "unit": "kg/ha", "status": "...", "effect": "...", "recommendation": "..." },
        "phosphorus": { "name": "Phosphorus", "value": "...", "unit": "kg/ha", "status": "...", "effect": "...", "recommendation": "..." },
        "potassium": { "name": "Potassium", "value": "...", "unit": "kg/ha", "status": "...", "effect": "...", "recommendation": "..." },
        "secondary": [ { "name": "Sulphur", "value": "...", "unit": "ppm", "status": "...", "effect": "...", "recommendation": "..." } ],
        "micronutrients": [ { "name": "Zinc", "value": "...", "unit": "ppm", "status": "...", "effect": "...", "recommendation": "..." } ]
      }
    }
    Translate all narrative content to ${language || 'English'}.
    `;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: fileData } }
    ]);

    const responseText = result.response.text();
    const parsed = cleanJson(responseText);
    res.json(parsed);
  } catch (error) {
    console.error('Analyze Soil API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

export default app;
