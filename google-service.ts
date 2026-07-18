import { GoogleGenAI } from "@google/genai";


const apiKey = process.env.apikeynew;
// console.log("api key", apiKey)
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY2,
// });

export async function reviewPaper(fileUri: string) {
    // Fetch file from url
    const responseFile = await fetch(fileUri);
    if (!responseFile.ok) {
        throw new Error(`Failed to fetch file from URL. HTTP Status: ${responseFile.status} ${responseFile.statusText}`);
    }

    const contentType = responseFile.headers.get("content-type") || "";
    if (contentType && !contentType.includes("application/pdf") && !contentType.includes("application/octet-stream")) {
        console.warn(`Warning: Content-Type is ${contentType}, expected application/pdf.`);
    }

    const arrayBuffer = await responseFile.arrayBuffer();
    if (arrayBuffer.byteLength === 0) {
        throw new Error("The fetched document is empty (0 bytes) or could not be parsed.");
    }

    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: "application/pdf",
                        },
                    },
                    {
                        text: `
Review this research paper.

Check:
1. Plagiarism likelihood.
2. AI-generated content likelihood.
3. Grammar issues.
4. Citation issues.
5. Formatting issues.
6. Overall recommendation.

Return JSON only:

{
  "approved": true,
  "score": 92,
  "plagiarism": 18,
  "issues": [],
  "summary": ""
}
`
                    }
                ]
            }
        ]
    });

    const rawText = response.text || "";
    // Sanitize any markdown code blocks returned by Gemini
    const cleanedText = rawText
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();

    return cleanedText;
}