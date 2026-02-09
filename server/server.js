const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// Allow frontend requests
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-r1",

        // 🔥 IMPORTANT — limit token usage
        max_tokens: 500,

        messages: [
          { role: "user", content: message }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://deepseek-chatbot-beta.vercel.app/"
        },

        // helps avoid timeout when Render wakes
        timeout: 60000
      }
    );

    const botReply =
      response.data.choices?.[0]?.message?.content ||
      "No response received.";

    res.json({ reply: botReply });

  } catch (error) {
    console.error(
      "OpenRouter FULL ERROR:",
      error.response?.data || error.message
    );

    // clearer error to frontend
    res.status(500).json({
      error: "⚠ AI temporarily unavailable or credit limit reached. Try again shortly."
    });
  }
});

// Required for Render dynamic port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
