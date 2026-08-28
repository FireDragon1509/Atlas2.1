export default async function handler(req, res) {
    // Allow requests from the ATLAS website
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Handle browser CORS check
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only accept POST requests
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

        const groqResponse = await fetch(
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
                                "You are ATLAS, a personal AI assistant. You are intelligent, calm, helpful, concise, and futuristic. Your responses will be spoken aloud, so keep them natural and reasonably short."
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

        const data = await groqResponse.json();

        console.log("Groq response:", data);

        if (!groqResponse.ok) {
            return res.status(500).json({
                error: "Groq error",
                details: data
            });
        }

        const reply =
            data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "No AI response received"
            });
        }

        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("Server error:", error);

        return res.status(500).json({
            error: "Server error",
            details: error.message
        });
    }
}
