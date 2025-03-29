import React, { useEffect, useRef, useState } from "react";
import GameOverScreen from "./GameOverScreen";
import { Box, Typography } from "@mui/material";

const GameCanvas = ({ onGameOver, onGameStart, onBulletShoot }) => {
  const canvasRef = useRef(null);
  const scoreRef = useRef(0);
  const highestScoreRef = useRef(0);
  const lastHighest = useRef(0);
  const scoreTextRef = useRef(null);

  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);

  const player = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    width: 50,
    height: 50,
  });
  const playerSpeed = 1;

  const bullets = useRef([]);
  const enemies = useRef([]);
  const canShoot = useRef(true);

  const animationRef = useRef(null);
  const gamepadAnimationRef = useRef(null);

  const spaceshipImage = useRef(new Image());
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
    gameOverRef.current = false;
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOverRef.current) return;
    spaceshipImage.current.src = "/spaceship.png";
    enemyImage.current.src = "/enemy.png";
    backgroundImage.current.src = "/background.jpg";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    onGameStart();

    // Key press handler
    const keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
    };

    function handleKeyDown(event) {
      if (event.key === "ArrowLeft" || event.key === "a") keys.left = true;
      if (event.key === "ArrowRight" || event.key === "d") keys.right = true;
      if (event.key === "ArrowUp" || event.key === "w") keys.up = true;
      if (event.key === "ArrowDown" || event.key === "s") keys.down = true;
      if (event.key === " " && canShoot.current) keys.shoot = true;
    }

    function handleKeyUp(event) {
      if (event.key === "ArrowLeft" || event.key === "a") keys.left = false;
      if (event.key === "ArrowRight" || event.key === "d") keys.right = false;
      if (event.key === "ArrowUp" || event.key === "w") keys.up = false;
      if (event.key === "ArrowDown" || event.key === "s") keys.down = false;
      if (event.key === " ") keys.shoot = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function update() {
      if (keys.left) player.current.x -= playerSpeed * 3;
      if (keys.right) player.current.x += playerSpeed * 3;
      if (keys.up) player.current.y -= playerSpeed * 3;
      if (keys.down) player.current.y += playerSpeed * 3;

      // Boundaries check for player movement
      player.current.x = Math.max(
        0,
        Math.min(player.current.x, canvas.width - player.current.width)
      );
      player.current.y = Math.max(
        0,
        Math.min(player.current.y, canvas.height - player.current.height)
      );

      if (keys.shoot && canShoot.current && bullets.current.length < 5) {
        onBulletShoot();
        bullets.current.push(
          {
            x: player.current.x + 10, // Left bullet
            y: player.current.y,
            width: 5,
            height: 10,
          },
          {
            x: player.current.x + player.current.width - 15, // Right bullet
            y: player.current.y,
            width: 5,
            height: 10,
          }
        );
        canShoot.current = false;
        setTimeout(() => {
          canShoot.current = true;
        }, 300);
      }

      bullets.current.forEach((b, i) => {
        b.y -= 5;
        if (b.y < 0) bullets.current.splice(i, 1);
      });

      enemies.current.forEach((e, i) => {
        e.y += 2;
        if (e.y > canvas.height) enemies.current.splice(i, 1);

        if (
          e.x < player.current.x + player.current.width &&
          e.x + e.width > player.current.x &&
          e.y < player.current.y + player.current.height &&
          e.y + e.height > player.current.y
        ) {
          gameOverRef.current = true;
          setGameOver(true);
        }
      });

      bullets.current.forEach((b, bi) => {
        enemies.current.forEach((e, ei) => {
          if (
            b.x < e.x + e.width &&
            b.x + b.width > e.x &&
            b.y < e.y + e.height &&
            b.y + b.height > e.y
          ) {
            bullets.current.splice(bi, 1);
            enemies.current.splice(ei, 1);
            scoreRef.current += 10;
            if (scoreTextRef.current) {
              scoreTextRef.current.innerText = `Score: ${scoreRef.current}`; // Update the score directly in the DOM
            }
            if (highestScoreRef.current < scoreRef.current) {
              highestScoreRef.current = scoreRef.current;
            }
          }
        });
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeRect(0, 0, canvas.width, canvas.height); // Adds a border
      ctx.drawImage(backgroundImage.current, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "blue";

      ctx.drawImage(
        spaceshipImage.current,
        player.current.x,
        player.current.y,
        player.current.width,
        player.current.height
      );

      ctx.fillStyle = "white";
      bullets.current.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));

      enemies.current.forEach((e) =>
        ctx.drawImage(enemyImage.current, e.x, e.y, e.width, e.height)
      );

      ctx.fillStyle = "black";
      ctx.fillText("Score: " + scoreRef.current, 10, 20);
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

        // Calculate total movement distance (Pythagorean theorem)
        const magnitude = Math.sqrt(axisX * axisX + axisY * axisY);

        // Speed scaling factor
        const speedMultiplier = 1 + magnitude * 4; // Adjust "4" to control movement speed

        // Normalize movement if above a threshold (e.g., 0.2)
        if (magnitude > 0.2) {
          const normalizedAxisX = axisX / magnitude;
          const normalizedAxisY = axisY / magnitude;

          player.current.x = Math.max(
            0,
            Math.min(
              player.current.x +
                normalizedAxisX * playerSpeed * speedMultiplier, // Apply scaling factor
              canvas.width - player.current.width
            )
          );
          player.current.y = Math.max(
            0,
            Math.min(
              player.current.y +
                normalizedAxisY * playerSpeed * speedMultiplier, // Apply scaling factor
              canvas.height - player.current.height
            )
          );
        } else {
          player.current.x = Math.max(
            0,
            Math.min(player.current.x, canvas.width - player.current.width)
          );
          player.current.y = Math.max(
            0,
            Math.min(player.current.y, canvas.height - player.current.height)
          );
        }

        if (
          gamepad.buttons[0].pressed &&
          canShoot.current &&
          bullets.current.length < 5
        ) {
          onBulletShoot();
          bullets.current.push(
            {
              x: player.current.x + 10, // Left bullet
              y: player.current.y,
              width: 5,
              height: 10,
            },
            {
              x: player.current.x + player.current.width - 15, // Right bullet
              y: player.current.y,
              width: 5,
              height: 10,
            }
          );
          canShoot.current = false;
          setTimeout(() => {
            canShoot.current = true;
          }, 300);
        }
      }

      gamepadAnimationRef.current = requestAnimationFrame(gamepadLoop);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
    gamepadAnimationRef.current = requestAnimationFrame(gamepadLoop);

    enemyIntervalRef.current = setInterval(() => {
      if (!gameOverRef.current) {
        enemies.current.push({
          x: Math.random() * (canvas.width - 30),
          y: 0,
          width: 60,
          height: 60,
        });
      }
    }, 1000);

    return () => {
      clearInterval(enemyIntervalRef.current);
      cancelAnimationFrame(animationRef.current);
      cancelAnimationFrame(gamepadAnimationRef.current); // ✅ Properly stopping gamepad loop
      animationRef.current = null;
      gamepadAnimationRef.current = null;
    };
  }, [gameOver]);

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
