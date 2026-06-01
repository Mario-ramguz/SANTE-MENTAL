const fallbackResponses = [
  "Je suis là pour vous soutenir. Pouvez-vous me dire comment vous vous sentez aujourd'hui?",
  "Je vous écoute. N'hésitez pas à partager ce qui vous préoccupe.",
  "Prendre soin de sa santé mentale est très important. Comment puis-je vous aider?",
  "Je suis Sérénité, votre assistant de bien-être. Parlez-moi de votre journée.",
  "Chaque jour est une nouvelle opportunité. Comment allez-vous en ce moment?",
  "Je suis là pour vous accompagner. Qu'est-ce qui vous amène aujourd'hui?",
  "Votre bien-être est ma priorité. Dites-moi comment je peux vous aider.",
];

export async function invokeLLM({ messages }: { messages: Array<{ role: string; content: string }> }): Promise<{ choices: Array<{ message: { content: string } }> }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  // Extract system message
  const systemMsg = messages.find(m => m.role === "system");
  const chatMessages = messages.filter(m => m.role !== "system");

  // Convert to Gemini format
  const contents = chatMessages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }],
  }));

  const systemInstruction = systemMsg?.content ||
    "You are Sérénité, a compassionate mental wellness assistant. Be warm, supportive and helpful. Respond in the same language the user writes in.";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  if (!response.ok) {
    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return { choices: [{ message: { content: fallback } }] };
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || fallbackResponses[0];

  return {
    choices: [{ message: { content: text } }],
  };
}
