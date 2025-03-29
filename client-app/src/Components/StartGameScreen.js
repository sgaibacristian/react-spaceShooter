import React, { useEffect, useRef, useState } from "react";
import { Button, Box } from "@mui/material";

export default function StartGameScreen({ onStartGame }) {
  const [isGameStarting, setIsGameStarting] = useState(false);
  const startEngineSound = useRef(new Audio("/audio/start-engine.mp3"));
  const gamepadHandled = useRef(false);

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad && gamepad.buttons[0].pressed && !gamepadHandled.current) {
        gamepadHandled.current = true;
        tryStartGame();
      }

      requestAnimationFrame(handleGamepadInput);
    };

    gamepadHandled.current = false;
    const animationFrame = requestAnimationFrame(handleGamepadInput);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const tryStartGame = () => {
    startEngineSound.current.play();

    setIsGameStarting(true);

    setTimeout(() => {
      startEngineSound.current.currentTime = 0;
      startEngineSound.current.pause();
      onStartGame();
    }, 5000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        backgroundSize: "cover",
        backgroundImage: "url('start-screen.jpg')",
        minHeight: "100vh",
        minWidth: "100vw",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {isGameStarting && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "black",
            opacity: 0,
            animation: "fadeIn 3s forwards",
            zIndex: "111111",
          }}
        ></Box>
      )}

      <Button
        variant="contained"
        sx={{
          marginTop: 2,
          width: "100px",
          height: "100px",
          borderRadius: "100%",
          backgroundColor: "rgb(45, 37, 37)",
          padding: 0,
        }}
        onClick={tryStartGame}
      >
        <img
          src="start-button.png"
          alt="start"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </Button>
    </Box>
  );
}
