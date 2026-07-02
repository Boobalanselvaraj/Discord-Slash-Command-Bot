import Groq from "groq-sdk";

// Initialize Groq only if the key is provided
let groq = null;
if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export const analyzeCommand = async (commandName, text) => {
  if (!groq) {
    console.warn("GROQ_API_KEY is not set. Skipping AI analysis.");
    return null;
  }

  try {
    let systemPrompt = "You are an intelligent triage assistant.";
    let userPrompt = `The user used the command "/${commandName}".\nInput: "${text}"`;

    if (commandName === 'leave') {
      systemPrompt = `You are an HR triage assistant. You categorize employee leave requests accurately based on the reason provided. 
      DO NOT default to "Vacation" or "PTO". 
      If the reason mentions sickness, medical issues, or emergencies, categorize it as "Sick Leave" or "Medical Emergency" and mark the urgency as High.
      If it's for personal reasons, categorize it appropriately.
      Respond ONLY with a single-line summary containing the Type, Urgency, and a tiny note. 
      Example: "Type: Medical Emergency | Urgency: High | Note: Unplanned medical issue."`;
          } else if (commandName === 'roastme') {
      systemPrompt = `You are a witty, slightly sarcastic Discord bot.
      The user wants you to playfully roast or grill them based on their username or the prompt they provided.
      Keep the roast fun, lighthearted, and under 2 sentences. Include some emojis.`;
      userPrompt = `Roast this user: ${text}`;
    } else if (commandName === 'report') {
            systemPrompt = `You are a community moderation and support assistant. You analyze user reports.
      Categorize the report accurately (e.g., Bug Report, Harassment, Spam, Feature Request, Feedback).
      Respond ONLY with a single-line summary containing the Category, Severity, and a tiny note.
      Example: "Category: Harassment | Severity: High | Note: Requires immediate admin review."`;
          }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
    });

    return chatCompletion.choices[0]?.message?.content || "No analysis generated";
  } catch (error) {
    console.error("Error analyzing command with Groq:", error);
    return "Error generating analysis";
  }
};
