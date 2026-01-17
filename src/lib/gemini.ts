// src/lib/gemini.ts

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// NOTE:
// For latest models (fast + free-tier friendly), use gemini-2.0-flash.
// If this ever fails, you can change to:
// "gemini-1.5-flash" or "gemini-1.5-pro"
const GEMINI_MODEL = "gemini-2.0-flash";

function requireGeminiKey() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY in .env. Add it and restart dev server."
    );
  }
}

async function callGemini(prompt: string, opts?: { temperature?: number; maxOutputTokens?: number }) {
  requireGeminiKey();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: opts?.temperature ?? 0.8,
          maxOutputTokens: opts?.maxOutputTokens ?? 256,
        },
      }),
    }
  );

  const raw = await response.text();

  if (!response.ok) {
    console.error("Gemini API error:", response.status, raw);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = JSON.parse(raw);
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  if (!text) {
    console.error("Gemini returned empty text:", data);
    throw new Error("Gemini returned empty response.");
  }

  return text;
}

/**
 * ✅ Generates Ghost Log summary (3 sentences)
 */
export const generateGhostLog = async (
  projectName: string,
  description: string,
  stats: { stars: number; forks: number; lastUpdated: string }
): Promise<string> => {
  const prompt = `
Generate a Ghost Dossier in this exact Markdown format:

# 👻 GHOST DOSSIER: ${projectName}
## 🛠 Technical Summary
[${description || "No description provided"}]

### 📊 Vulnerability Table
| Component | Risk | Status |
| :--- | :--- | :--- |
| Data Privacy | High | 🛡️ MASKED |
| Access Control | Medium | 🔐 SECURE |
| Dependencies | Low | ✅ VERIFIED |

Project Title: ${projectName}
Description: ${description || "No description provided"}
Stars: ${stats.stars}
Forks: ${stats.forks}
Last Updated: ${stats.lastUpdated}

Return only the Markdown content with the exact format shown above.
`;

  try {
    return await callGemini(prompt, { temperature: 0.8, maxOutputTokens: 220 });
  } catch (error) {
    console.error("Gemini Error (GhostLog):", error);

    // fallback
    return `This project (${projectName}) focuses on ${description || "building a useful software tool"} with a modular architecture. It currently shows early traction and can be extended with new features and improved scalability. With further development, it can become a production-ready solution with better reliability and documentation.`;
  }
};

/**
 * ✅ Generates a PERFECT image prompt for AI thumbnail
 * (This uses Google Gemini AI prompt-engineering)
 *
 * Output: single-line prompt string
 */
export const generateThumbnailPrompt = async (
  projectTitle: string,
  ghostLog: string
): Promise<string> => {
  const prompt = `
You are an expert prompt engineer for AI thumbnail generation.

Create ONE single-line prompt to generate a cinematic thumbnail image for a software project.
Constraints:
- NO text, NO letters, NO watermark
- Style: cyberpunk neon + spooky ghost aesthetic + clean minimal UI look
- Include: code fragments, terminal glow, haunted digital aura
- Make it professional, startup-like, NOT childish
- Keep prompt under 35 words

Project title: ${projectTitle}
Ghost log: ${ghostLog}

Return ONLY the prompt line.
`;

  try {
    // lower temperature for prompt stability
    const result = await callGemini(prompt, { temperature: 0.4, maxOutputTokens: 120 });

    // sanitize in case Gemini returns quotes/new lines
    return result
      .replace(/\n/g, " ")
      .replace(/["']/g, "")
      .trim()
      .slice(0, 250);
  } catch (error) {
    console.error("Gemini Error (ThumbnailPrompt):", error);

    // fallback prompt
    return `cinematic cyberpunk ghost-themed software project thumbnail, neon glow, code fragments, haunted digital aura, minimal clean illustration, dark background, high detail, no text`;
  }
}

/**
 * ✅ Generates a Ghost Security Dossier in Markdown format
 */
export const generateSecurityReport = async (
  projectName: string,
  description: string,
  stats: { stars: number; forks: number; lastUpdated: string }
): Promise<string> => {
  const prompt = `
Analyze the provided project details: ${description || "No description provided"}. Generate a 'Ghost Security Dossier' in Markdown format. Include:
- A main heading for the dossier (e.g., '# Ghost Security Dossier for ${projectName}').
- A sub-heading for 'Vulnerability Overview'.
- A Markdown table with columns 'Component', 'Potential Risk', and 'Recommendation'.
- A final section with 'Actionable Steps' in a bulleted list.

Project Title: ${projectName}
Stars: ${stats.stars}
Forks: ${stats.forks}
Last Updated: ${stats.lastUpdated}

Format the response in Markdown with proper headings, tables, and lists.
Return only the Markdown content without any additional text.
`;

  try {
    const result = await callGemini(prompt, { temperature: 0.5, maxOutputTokens: 800 });
    return result;
  } catch (error) {
    console.error("Gemini Error (SecurityReport):", error);

    // fallback security report
    return `# Ghost Security Dossier: ${projectName}

## Executive Summary
This security analysis evaluates the project for potential risks and vulnerabilities.

## Risk Level Assessment

| Risk Level | Areas |
|------------|-------|
| Critical   | 0     |
| High       | 0     |
| Medium     | 1-2   |
| Low        | 2-3   |

## Security Recommendations
- Implement proper input validation
- Add authentication and authorization
- Regular security audits

## Potential Vulnerabilities
- Code injection possibilities
- Weak authentication mechanisms
`;
  }
};
