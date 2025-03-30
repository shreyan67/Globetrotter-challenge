import React, { useState, useEffect } from "react";
import { Button, TextField, Typography } from "@mui/material";
import { registerUser, getUserScore } from "../api.js";
import Confetti from "react-confetti";
import axios from "axios";

export default function GlobetrotterGame() {
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [isRegistered, setIsRegistered] = useState(false);
  const [inviterUsername, setInviterUsername] = useState("");
  const [inviterScore, setInviterScore] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showNextButton, setShowNextButton] = useState(false);
  const [timer, setTimer] = useState(30);
  const [funFact, setFunFact] = useState("");
  const [trivia, setTrivia] = useState("");
  const [gameOver, setGameOver] = useState(false);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const inviter = queryParams.get("inviter");
    const inviterScore = parseInt(queryParams.get("score"), 10);
  
    if (inviter) {
      setInviterUsername(inviter);
      setInviterScore(!isNaN(inviterScore) ? inviterScore : 10); 
      console.log(`Inviter: ${inviter}, Score: ${inviterScore}`); // Debugging log
    }
  }, []);
  

  // GameOver Component
function GameOver({ score, restartGame }) {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      height: "100vh", 
      textAlign: "center"
    }}>
      <Typography variant="h4" color="error">Game Over!</Typography>
      <Typography variant="h6">Final Score: {score}</Typography>
      <Typography variant="subtitle1" style={{ margin: "10px" }}>
        Travel more to win next time!
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={restartGame}
        style={{ marginTop: "15px" }}
      >
        Restart
      </Button>
    </div>
  );
}


  // Load inviter score if available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviter = params.get("inviter");
    if (inviter) {
      setInviterUsername(inviter);
      getUserScore(inviter)
        .then((data) => setInviterScore(data.score))
        .catch((err) => console.error("No inviter found:", err));
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setGameOver(true);
    }
  }, [timer, gameStarted]);

  const handleRegister = async () => {
    try {
      await registerUser(username, score);
      setIsRegistered(true);
      alert("Registration successful!");
    } catch (error) {
      alert("Registration failed. Try again.");
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/questions");
      console.log("Fetched Question:", response.data);

      const data = response.data;

      if (data && data.city && data.clues && data.options) {
        // Randomly select a clue from the question's clues
        const randomClue = data.clues[Math.floor(Math.random() * data.clues.length)];

        setQuestion(randomClue); // Set the clue as the question
        setCorrectAnswer(data.city); // Set the correct answer

        // Combine the correct answer with the other options and shuffle them
        const allOptions = [...data.options, data.city];
        const shuffledOptions = allOptions.sort(() => Math.random() - 0.5); // Shuffle the options

        setOptions(shuffledOptions); // Set the shuffled options in state

        console.log("Options to display:", shuffledOptions); // Log options to verify
        setFunFact(data.fun_fact[0]);
        setTrivia(data.trivia[0]);
      } else {
        console.error("Invalid data format:", data);
        setQuestion("Failed to load question. Please try again.");
        setOptions(["Error loading options"]);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setQuestion("Failed to load question. Please try again.");
      setOptions(["Error loading options"]);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const startGame = () => {
    setGameStarted(true);
    fetchQuestion();
  };

  const handleNextQuestion = () => {
    fetchQuestion();
    setSelectedAnswer("");
    setFeedbackMessage("");
    setShowNextButton(false);
    setTimer(30); // Reset the timer
  };

  const handleAnswer = (answer) => {
    if (feedbackMessage) return; // Prevent multiple answers
    if (answer === correctAnswer) {
      setScore((prev) => prev + 10);
      setFeedbackMessage(`🎉 Correct! Fun Fact: ${funFact}`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    } else {
      setFeedbackMessage(`😢 Incorrect! The correct answer was "${correctAnswer}".`);
    }
    setShowNextButton(true);
  };
  function showGameOverScreen(score) {
    const gameArea = document.getElementById("gameArea");
    gameArea.innerHTML = `
        <div class="game-over">
            <h2>Game Over!</h2>
            <p>Your final score: ${score}</p>
            <p>Travel more to win next time!</p>
            <button onclick="restartGame()" class="restart-button">Restart</button>
        </div>
    `;
}
function restartGame() {
  setGameOver(false);
  setScore(0);
  setGameStarted(false);
  setTimer(30); // Reset the timer to 30 seconds or your default value
  startGame(); // Restart the game
}

const generateInviteLink = () => {
  const currentUrl = window.location.href.split('?')[0];
  const finalScore = score || 0; // Fallback to 0 if score is not set
  return `${currentUrl}?inviter=${encodeURIComponent(username)}&score=${encodeURIComponent(finalScore)}`;
};


  
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {showConfetti && <Confetti />}
      {gameOver ? (
        <GameOver score={score} restartGame={() => window.location.reload()} />
      ) : (
        <>
          {inviterUsername && inviterScore !== null && (
            <Typography variant="h6">
              Invited by {inviterUsername} (Score: {inviterScore})
            </Typography>
          )}
          {!isRegistered ? (
            <div>
              <Typography variant="h5">Enter your username to start:</Typography>
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ margin: "10px" }}
              />
              <Button variant="contained" onClick={handleRegister}>
                Register
              </Button>
            </div>
          ) : !gameStarted ? (
            <div>
              <Typography variant="h5">Welcome, {username}!</Typography>
              <Button variant="contained" color="primary" onClick={startGame}>
                Start Game
              </Button>
            </div>
          ) : (
            <div>
              <Typography variant="h6">Player: {username}</Typography>
              <Typography variant="h6">Score: {score}</Typography>
              <Typography variant="h6">Time left: {timer} seconds</Typography>
              {question ? (
                <Typography variant="h5">{question}</Typography>
              ) : (
                <Typography variant="h6" style={{ margin: "10px", color: "red" }}>
                  Loading question...
                </Typography>
              )}
              <div>
                {options && options.length > 0 ? (
                  options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      onClick={() => handleAnswer(option)}
                      style={{ margin: "5px" }}
                    >
                      {option}
                    </Button>
                  ))
                ) : (
                  <Typography variant="h6" style={{ margin: "10px", color: "blue" }}>
                    LOADING OPTIONS...
                  </Typography>
                )}
              </div>
              <Typography variant="h6" style={{ margin: "10px", color: "green" }}>
                {feedbackMessage}
              </Typography>
              {showNextButton && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleNextQuestion}
                  style={{ margin: "10px" }}
                >
                  Next Question
                </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => alert(`Share this link: ${generateInviteLink()}`)}
                style={{ margin: "10px" }}
              >
                Challenge a Friend
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}