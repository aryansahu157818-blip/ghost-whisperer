const GEMINI_API_KEY = 'AIzaSyD61BEcxxzqkuylnEX-1kZVDFXN2XR3WuQ';

// Only return the ghost log string, not the full response object
export const generateGhostLog = async (
  projectName: string,
  description: string,
  stats: { stars: number; forks: number; lastUpdated: string }
): Promise<string> => {
  const prompt = `Analyze this project title and description. Provide a unique, creative, and technical 3-sentence summary of what this project does. Do not use generic ghost metaphors. Project: ${projectName}, Description: ${description}, Stars: ${stats.stars}, Forks: ${stats.forks}, Last Updated: ${stats.lastUpdated}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 256,
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!textResponse) {
      console.error('Gemini Error: No response text received', data);
      throw new Error('No response text from Gemini API');
    }
    
    // Return only the ghost log text
    return textResponse.trim();
  } catch (error) {
    console.error('Gemini Error:', error);
    // Smart Fallback: Generate a unique technical summary using the project's title and description
    return `This project, ${projectName}, provides a specialized framework for ${description || 'various applications'}. It features a modular architecture and is currently optimized for its core MVP phase, awaiting future scaling.`;
  }
};