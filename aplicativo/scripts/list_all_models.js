const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }
    let allModels = [];
    let pageToken = "";
    try {
        do {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ""}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.models) {
                allModels.push(...data.models.map(m => m.name));
            }
            pageToken = data.nextPageToken;
        } while (pageToken);

        allModels.sort().forEach(name => console.log(name));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listAllModels();
