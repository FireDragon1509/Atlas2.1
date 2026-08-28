export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "No message provided"
            });
        }

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        `Bearer ${process.env.GROQ_API_KEY}`
                },

                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are ATLAS, a personal AI assistant. Your personality is intelligent, calm, helpful, and slightly futuristic. Keep responses concise because they will be spoken aloud."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 500
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq error:", data);

            return res.status(500).json({
                error: "AI request failed"
            });
        }

        const reply =
            data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "No response from AI"
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}
