const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000; // Dynamic port (not used in Vercel)

app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory storage (Replace with MongoDB for persistence)
let users = [];

// Register or update user score
app.post("/api/register", (req, res) => {
  const { username, score } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    existingUser.score = score;
  } else {
    users.push({ username, score });
  }

  res.json({ message: "User registered/updated successfully", users });
});

// Get user score
app.get("/api/user/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find((user) => user.username === username);

  if (user) {
    res.json({ username: user.username, score: user.score });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Placeholder for future database connection (MongoDB)
app.get("/api/get-inviter-score/:username", async (req, res) => {
  return res.status(501).json({ message: "Database not connected. Use MongoDB." });
});

// Get a random question
app.get("/api/questions", (req, res) => {
  try {
    const questions = require("./data/questions.json"); // Load questions file
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    res.json({
      city: randomQuestion.city,
      clues: randomQuestion.clues || [],
      fun_fact: randomQuestion.fun_fact || [],
      trivia: randomQuestion.trivia || [],
      options: [...new Set([randomQuestion.city, ...questions
        .map(q => q.city)
        .filter(city => city !== randomQuestion.city)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)])] // Generate 3 random unique options from other cities
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions" });
  }
});

// Export the app for Vercel (DO NOT use app.listen)
module.exports = app;
