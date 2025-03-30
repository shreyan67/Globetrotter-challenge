  const express = require("express");
  const cors = require("cors");
  const bodyParser = require("body-parser");
  const fs = require("fs");

  const app = express();
  const PORT = "5000";

  app.use(cors());
  app.use(bodyParser.json());

  const dataFilePath = "./data.json";

  // Helper function to read and write JSON data
  function readData() {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  }

  function writeData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  }

  // API to register or update a user score
  app.post("/api/register", (req, res) => {
    const { username, score } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const data = readData();
    const existingUser = data.users.find((user) => user.username === username);

    if (existingUser) {
      existingUser.score = score;
    } else {
      data.users.push({ username, score });
    }

    writeData(data);
    res.json({ message: "User registered/updated successfully" });
  });

  // API to get user score
  app.get("/api/user/:username", (req, res) => {
    const { username } = req.params;
    const data = readData();
    const user = data.users.find((user) => user.username === username);

    if (user) {
      res.json({ username: user.username, score: user.score });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  app.get('/api/get-inviter-score/:username', async (req, res) => {
      const { username } = req.params;
      try {
        const user = await User.findOne({ username });
        if (user) {
          res.json({ score: user.score });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error fetching inviter score' });
      }
  });

  app.get("/api/questions", (req, res) => {
      fs.readFile("./data/questions.json", "utf8", (err, data) => {
        if (err) {
          res.status(500).json({ message: "Error reading questions" });
        } else {
          try {
            const questions = JSON.parse(data);
            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
            // Construct the expected data format
            const responseData = {
              city: randomQuestion.city,
              clues: randomQuestion.clues || [],
              fun_fact: randomQuestion.fun_fact || [],
              trivia: randomQuestion.trivia || [],
              options: [...new Set([randomQuestion.city, ...questions
                .map(q => q.city)
                .filter(city => city !== randomQuestion.city)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)])] // Generate 3 random unique options from other cities
            };
    
            res.json(responseData);
          } catch (parseError) {
            res.status(500).json({ message: "Invalid data format" });
          }
        }
      });
  });
    
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
