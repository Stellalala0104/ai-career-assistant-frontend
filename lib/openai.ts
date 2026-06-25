import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RewriteBulletInput = {
  bullet: string;
  tone: string;
};

export async function rewriteBulletWithAI({
  bullet,
  tone,
}: RewriteBulletInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are an expert resume editor. Rewrite resume bullets for frontend developer job applications. Be concise, professional, ATS-friendly, and do not invent fake metrics.",
      },
      {
        role: "user",
        content: `Rewrite this resume bullet in a ${tone} tone.

Original bullet:
${bullet}

Requirements:
- Return only one rewritten bullet.
- Keep it under 35 words.
- Start with a strong action verb.
- Preserve the original meaning.
- Do not add fake numbers, fake company names, or fake achievements.`,
      },
    ],
    max_output_tokens: 120,
  });

  const text = response.output_text.trim();

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return text;
}