<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Uy6CW8p6Uf4JU5p_hPelfsgiZQqtZg5M

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
Kisan Setu
Kisan Setu Logo 
Overview
Kisan Setu (meaning "Farmer Bridge" in Hindi) is an AI-powered web application designed to assist farmers with soil analysis and agricultural insights. Built using modern web technologies, it integrates Google's Gemini API for AI-driven recommendations and Firebase for backend services like authentication and data storage. The app allows users to run soil analysis queries, potentially through text inputs or image uploads, to receive advice on soil quality, crop suitability, fertilizers, and more.
This project is ideal for agricultural tech enthusiasts, farmers, or developers looking to explore AI applications in farming.
Live Demo
Check out the deployed application here: Kisan Setu on Vercel
Features

AI Soil Analysis: Leverage Gemini AI to analyze soil data and provide personalized farming recommendations.
User Authentication: Secure login and data management powered by Firebase.
Responsive UI: A modern, user-friendly interface built with React and TypeScript for seamless experience on desktop and mobile.
Local Development Support: Easy setup to run and test the app locally.
Modular Architecture: Organized into components and services for easy maintenance and scalability.

Technologies Used

Frontend: React, TypeScript
Build Tool: Vite
Backend/Integrations: Firebase (authentication, database), Gemini API (AI capabilities)
Environment Management: .env files for API keys
Deployment: Vercel

Installation and Setup
Prerequisites

Node.js (v18 or higher recommended)
A Google Gemini API key (sign up at Google AI Studio)

Steps

Clone the Repository:textgit clone https://github.com/omkar0075/kisan-setu-.git
cd kisan-setu-
Install Dependencies:textnpm install
Configure Environment Variables:
Create a .env.local file in the root directory.
Add your Gemini API key:textGEMINI_API_KEY=your_api_key_here
(Optional) Configure Firebase in firebaseConfig.ts if needed.

Run the App Locally:textnpm run devThe app will be available at http://localhost:5173 (or the port specified by Vite).
Build for Production:textnpm run build

Usage

Open the app in your browser.
Sign in using Firebase authentication (if implemented).
Input soil-related queries, such as descriptions of soil type, pH levels, or even upload images (if supported).
Receive AI-generated insights from Gemini, including recommendations for crops, soil improvement, and best practices.

For more details on the AI prompt and behavior, refer to the associated AI Studio prompt: View in AI Studio (requires Google account).
Project Structure

components/: Reusable UI components (e.g., forms, chat interfaces).
services/: Business logic, API calls, and integrations (e.g., Gemini service).
App.tsx: Main application component.
index.tsx: Entry point for React.
firebaseConfig.ts: Firebase setup.
constants.ts & types.ts: Shared constants and TypeScript types.
vite.config.ts: Vite configuration for fast builds.

Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch: git checkout -b feature/your-feature.
Commit your changes: git commit -m 'Add your feature'.
Push to the branch: git push origin feature/your-feature.
Open a Pull Request.

Please ensure your code follows the project's style and includes tests where applicable.
