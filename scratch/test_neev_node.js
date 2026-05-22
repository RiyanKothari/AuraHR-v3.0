const OpenAI = require('openai');

const NEEV_API_KEY = 'sk-nc-kpI9ZaZf2wcHRckskFTCdisRSfO3gq4eMiMgrRk2qVc';
const NEEV_BASE_URL = 'https://inference.ai.neevcloud.com/v1';
const MODEL = 'gpt-oss-20b';

const neev = new OpenAI({
  apiKey: NEEV_API_KEY,
  baseURL: NEEV_BASE_URL,
});

async function run() {
  try {
    console.log("Calling NeevCloud with model:", MODEL);
    const response = await neev.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: "You are a strict technical professor. Return perfect JSON array." },
        { role: 'user', content: "Generate 2 simple MCQ questions about React. Return a JSON array." }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    console.log("SUCCESS!");
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error("FAILED WITH ERROR:");
    console.error(error);
  }
}

run();
