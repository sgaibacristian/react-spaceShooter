import React, { useEffect, useRef } from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";

export default function PauseScreen({ onResume }) {
  const gamepadHandled = useRef(false);

  useEffect(() => {
    const handleGamepadInput = () => {
      const gamepad = navigator.getGamepads()[0];
      if (gamepad && gamepad.buttons[0].pressed && !gamepadHandled.current) {
        gamepadHandled.current = true;
        onResume();
      }

      requestAnimationFrame(handleGamepadInput);
    };

    gamepadHandled.current = false;
    const animationFrame = requestAnimationFrame(handleGamepadInput);

    return () => cancelAnimationFrame(animationFrame);
  }, [onResume]);

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
        <Typography variant="h2" color="white" fontWeight="bold" gutterBottom>
          Game Paused
        </Typography>
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
            click below to resume
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
              onResume();
            }}
          >
            Resume
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
