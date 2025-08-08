import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const prompt = `Generate creative usernames following these strict requirements:
- Length: 3-20 characters only
- Characters: Only letters (a-z) and numbers (0-9), no special characters
- Style: All lowercase
- Sources: Anime characters, famous things

Categories to generate from:
1. Popular or simple anime character names (modified for uniqueness)
2. Famous historical/modern figures 
4. Creative combinations of words + numbers

Each username must:
- Be memorable and easy to type
- Be unique and simple
- Follow the regex pattern: /^[a-zA-Z0-9]+$/

OUTPUT FORMAT: Return exactly 5 usernames, each on a separate line with no explanations, categories, numbers, or additional text. Just the usernames.

Example output format:
codeluffy
zoro
quantum42
mario
pikachu

Generate unique 5 usernames now:`;

export const generateUsername = async () => {
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const usernames = result.text;
    if (!usernames) {
      return null;
    }
    const usernamesArray = usernames.split('\n');
    return usernamesArray;
  } catch (error) {
    console.error('Error generating username:', error);
    return null;
  }
};
