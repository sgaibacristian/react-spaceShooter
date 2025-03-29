import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  createTheme,
  ThemeProvider,
  Typography,
} from "@mui/material";
import GameCanvas from "./Components/GameCanvas";
import "./App.css";
import StartGameScreen from "./Components/StartGameScreen";

// Creează tema cu fontul dorit
const theme = createTheme({
  typography: {
    fontFamily: '"Play", sans-serif',
  },
});

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const gameAudio = useRef(new Audio("/audio/game-music.mp3"));
  const gameOverAudio = useRef(new Audio("/audio/game-over-music.mp3"));

  const handleStartGame = () => {
    gameOverAudio.current.pause();
    gameOverAudio.current.currentTime = 0;
    gameAudio.current.play();
  };

  const handleGameOver = () => {
    gameAudio.current.pause();
    gameAudio.current.currentTime = 0;
    gameOverAudio.current.play();
  };
  const handleBulletSound = () => {
    let bulletSound = new Audio("/audio/bullet-sound.mp3");
    bulletSound.volume = 0.3; // Volum la jumătate (50%)
    bulletSound.play();

    bulletSound.addEventListener("ended", () => {
      // Eliberăm obiectul audio din memorie
      bulletSound = null;
    });
  };

  const handlePressStart = () => {
    setIsGameStarted(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!isGameStarted ? (
          <StartGameScreen onStartGame={handlePressStart} />
        ) : (
          <GameCanvas
            onGameOver={handleGameOver}
            onGameStart={handleStartGame}
            onBulletShoot={handleBulletSound}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
