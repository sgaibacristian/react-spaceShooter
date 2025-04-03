import React, { useEffect, useRef, useState } from "react";
import GameOverScreen from "./GameOverScreen";
import { Box, Typography } from "@mui/material";
import {
  detectCollision,
  drawBullets,
  drawCanvas,
  drawEnemies,
  drawPlayers,
  handleGamepadMovement,
  handleKeyboardInput,
  handleKeyboardMovement,
  handlePause,
  handlePlayer1Shoot,
  handlePlayer2Shoot,
  movePlayer2,
  spawnEnemies,
  updateBulletsPositions,
  updateEnemiesPositions,
} from "../functions";
import PauseScreen from "./PauseScreen";

const GameCanvas = ({ onGameOver, onGameStart, onBulletShoot }) => {
  const canvasRef = useRef(null);
  const scoreRef = useRef(0);
  const highestScoreRef = useRef(0);
  const lastHighest = useRef(0);
  const scoreTextRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const [pause, setPause] = useState(false);
  const pauseRef = useRef(false);

  const gameOverRef = useRef(false);

  const player = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    width: 50,
    height: 50,
  });

  const player2 = useRef({
    x: window.innerWidth / 2 + 20,
    y: window.innerHeight / 2,
    width: 50,
    height: 50,
  });
  const playerSpeed = 1;

  const bullets = useRef([]);
  const enemies = useRef([]);
  const canShoot = useRef(true);
  const canShoot2 = useRef(true);

  const animationRef = useRef(null);
  const gamepadAnimationRef = useRef(null);

  const spaceshipImage = useRef(new Image());
  const spaceshipImage2 = useRef(new Image());

  const enemyImage = useRef(new Image());
  const backgroundImage = useRef(new Image());
  const enemyIntervalRef = useRef(null);

  const resetGame = () => {
    scoreRef.current = 0;
    if (scoreTextRef.current) {
      scoreTextRef.current.innerText = `Score: ${scoreRef.current}`;
    }
    lastHighest.current = highestScoreRef.current;
    bullets.current = [];
    enemies.current = [];
    player.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      width: 50,
      height: 50,
    };

    player2.current = {
      x: window.innerWidth / 2 + 20,
      y: window.innerHeight / 2,
      width: 50,
      height: 50,
    };
    gameOverRef.current = false;
    pauseRef.current = false;
    setGameOver(false);
    setPause(false);
  };

  const resumeGame = () => {
    pauseRef.current = false;
    setPause(false);
  };

  const updateScore = () => {
    scoreRef.current += 10;
    if (scoreTextRef.current) {
      scoreTextRef.current.innerText = `Score: ${scoreRef.current}`; // Update the score directly in the DOM
    }
    if (highestScoreRef.current < scoreRef.current) {
      highestScoreRef.current = scoreRef.current;
    }
  };

  useEffect(() => {
    if (gameOverRef.current || pauseRef.current) return;

    spaceshipImage.current.src = "/spaceship.png";
    spaceshipImage2.current.src = "/spaceship2.png";
    enemyImage.current.src = "/enemy.png";
    backgroundImage.current.src = "/background.jpg";

    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    onGameStart();

    handleKeyboardInput(canShoot2, keys, setPause, pauseRef, pause);

    function update() {
      handleKeyboardMovement(keys, player2, playerSpeed);
      movePlayer2(canvas, player2);
      handlePlayer2Shoot(keys, canShoot2, bullets, onBulletShoot, player2);
      updateBulletsPositions(bullets);

      updateEnemiesPositions(
        enemies,
        player,
        player2,
        gameOverRef,
        setGameOver,
        canvas
      );

      bullets.current.forEach((b, bi) => {
        enemies.current.forEach((e, ei) => {
          if (detectCollision(b, e)) {
            bullets.current.splice(bi, 1);
            enemies.current.splice(ei, 1);
            updateScore();
          }
        });
      });
    }

    function draw() {
      drawCanvas(canvas, ctx, backgroundImage);
      drawPlayers(ctx, spaceshipImage, spaceshipImage2, player, player2);
      drawBullets(ctx, bullets);
      drawEnemies(ctx, enemies, enemyImage);
    }

    function gameLoop() {
      if (gameOverRef.current) return;
      update();
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    function gamepadLoop() {
      if (gameOverRef.current) return;
      const gamepad = navigator.getGamepads()[0];
      if (gamepad) {
        const axisX = gamepad.axes[0];
        const axisY = gamepad.axes[1];

        handleGamepadMovement(axisX, axisY, player, playerSpeed, canvas);
        handlePlayer1Shoot(gamepad, canShoot, bullets, onBulletShoot, player);
        handlePause(gamepad, pause, setPause, pauseRef);
      }
      gamepadAnimationRef.current = requestAnimationFrame(gamepadLoop);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
    gamepadAnimationRef.current = requestAnimationFrame(gamepadLoop);

    spawnEnemies(enemyIntervalRef, gameOverRef, pauseRef, enemies, canvas);

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      clearInterval(enemyIntervalRef.current);
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(gamepadAnimationRef.current); // Properly stopping gamepad loop
      animationRef.current = null;
      gamepadAnimationRef.current = null;
    };
  }, [gameOver, onBulletShoot, onGameStart, pause]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <canvas ref={canvasRef}></canvas>
      {gameOver && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <GameOverScreen
            onGameOver={onGameOver}
            score={scoreRef.current}
            highScore={lastHighest.current}
            onRestart={resetGame}
          />
        </div>
      )}
      {pause && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PauseScreen
            onGameOver={onGameOver}
            score={scoreRef.current}
            highScore={lastHighest.current}
            onResume={resumeGame}
          />
        </div>
      )}

      <Box
        sx={{
          position: "absolute",
          backgroundColor: "rgba(14, 13, 13, 0.7)",
          top: "10%",
          minWidth: "200px",
          p: 2,
        }}
      >
        <Typography variant="h6" color="white" sx={{}} ref={scoreTextRef}>
          Score: {scoreRef.current}
        </Typography>

        <Typography
          variant="h6"
          color="white"
          sx={{
            color: "white",
          }}
        >
          High score: {lastHighest.current}
        </Typography>
      </Box>
    </Box>
  );
};

export default GameCanvas;
