
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error("API Key not found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Error:", error.message);
    }
}

test();
