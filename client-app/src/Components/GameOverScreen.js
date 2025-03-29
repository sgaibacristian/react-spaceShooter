import React, { useEffect, useRef } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

const GameOverScreen = ({ score, onRestart, highScore, onGameOver }) => {
  const gamepadHandled = useRef(false);

  useEffect(() => {
    onGameOver();
  }, [onGameOver]);

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad && gamepad.buttons[0].pressed && !gamepadHandled.current) {
        gamepadHandled.current = true;
        onRestart();
      }

      requestAnimationFrame(handleGamepadInput);
    };

    gamepadHandled.current = false;
    const animationFrame = requestAnimationFrame(handleGamepadInput);

    return () => cancelAnimationFrame(animationFrame);
  }, [onRestart]);

  return (
    <Card
      sx={{
        width: 500,
        margin: "auto",
        marginTop: 10,
        padding: 3,
        textAlign: "center",
        backgroundColor: "rgba(8, 6, 6, 0.62)",
        color: "white",
        borderRadius: 3,
        boxShadow: 5,
      }}
    >
      <CardContent>
        <Typography variant="h2" color="red" fontWeight="bold" gutterBottom>
          Game Over!
        </Typography>
        {highScore > score && (
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography>
              {`You needed ${
                highScore - score
              } more points to beat the high score.`}
            </Typography>
            <Typography> Don't give up!</Typography>
          </Box>
        )}
        {score > highScore && (
          <>
            <Typography variant="h4">New high score!</Typography>
            <Typography>You just beat the record. Keep it up!</Typography>
          </>
        )}
        <Box
          marginBlockStart="50px"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h7" color="gray" gutterBottom>
            Press <span style={{ color: "#3cdb4e" }}>Ⓐ</span> on Gamepad or
            click below to restart
          </Typography>
          <Button
            variant="contained"
            sx={{
              marginTop: 2,
              width: "80%",
              backgroundColor: "rgb(45, 37, 37)",
            }}
            onClick={() => {
              gamepadHandled.current = true;
              onRestart();
            }}
          >
            Retry
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GameOverScreen;
