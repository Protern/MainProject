// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";
// import OpenAI from "openai";


// const router = express.Router();
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// router.post("/review", async (req, res) => {
//   const { code, language } = req.body;

//   if (!code || !language) {
//     return res.status(400).json({ error: "Code and language are required." });
//   }

//   const prompt = `
// You're an experienced software engineer.
// Please review the following ${language} code and provide:
// 1. Code quality and readability feedback
// 2. Optimization suggestions (if any)
// 3. Common issues or bugs
// 4. Best practices followed or missed.

// Code:
// \`\`\`${language}
// ${code}
// \`\`\`
//   `;

//   try {
//     const completion = await openai.chat.completions.create({
//   model: "gpt-3.5-turbo",
//   messages: [{ role: "user", content: prompt }],
//   temperature: 0.3,
//   max_tokens: 700,
// });


//     const feedback = completion.data.choices[0].message.content;
//     return res.json({ feedback });
//   } catch (err) {
//     console.error("AI Review Error:", err.message);
//     return res.status(500).json({ error: "Failed to fetch AI review." });
//   }
// });

// export default router;

import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/review",authMiddleware, async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language are required." });
  }

 const prompt = `
You're an experienced software engineer.
Review the following ${language} code and give a **concise summary** (3-5 bullet points, max 2 sentences each) covering:
- Code quality or style issues (if any)
- One best practice to improve it
- Any critical bug or problem (if present)

Keep your review clear and as short as possible.

Code:
\`\`\`${language}
${code}
\`\`\`
`;


  try {
const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text();
    return res.json({ feedback });
  } catch (error) {
    console.error("Gemini Review Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch AI review." });
  }
});

export default router;
