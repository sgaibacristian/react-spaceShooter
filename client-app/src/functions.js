export const handleKeyboardInput = (canShoot, keys) => {
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
};

export const handleKeyboardMovement = (keys, player, playerSpeed) => {
  if (keys.left) player.current.x -= playerSpeed * 3;
  if (keys.right) player.current.x += playerSpeed * 3;
  if (keys.down) player.current.y += playerSpeed * 3;
  if (keys.up) player.current.y -= playerSpeed * 3;
};

export const movePlayer2 = (canvas, player2) => {
  // Boundaries check for player movement
  player2.current.x = Math.max(
    0,
    Math.min(player2.current.x, canvas.width - player2.current.width)
  );
  player2.current.y = Math.max(
    0,
    Math.min(player2.current.y, canvas.height - player2.current.height)
  );
};

export const handlePlayer2Shoot = (
  keys,
  canShoot,
  bullets,
  onBulletShoot,
  player2
) => {
  if (keys.shoot && canShoot.current) {
    onBulletShoot();
    bullets.current.push(
      {
        x: player2.current.x + 10, // Left bullet
        y: player2.current.y,
        width: 5,
        height: 10,
      },
      {
        x: player2.current.x + player2.current.width - 15, // Right bullet
        y: player2.current.y,
        width: 5,
        height: 10,
      }
    );
    canShoot.current = false;
    setTimeout(() => {
      canShoot.current = true;
    }, 300);
  }
};

export const handlePlayer1Shoot = (
  gamepad,
  canShoot,
  bullets,
  onBulletShoot,
  player
) => {
  if (gamepad.buttons[0].pressed && canShoot.current) {
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
};

export const handlePause = (gamepad, pause, setPause, pauseRef) => {
  if (gamepad.buttons[1].pressed && !pauseRef.current) {
    setPause(!pause);

    pauseRef.current = true;

    setTimeout(() => {}, 1000);
  }
};

export const updateBulletsPositions = (bullets) => {
  bullets.current.forEach((b, i) => {
    b.y -= 5;
    if (b.y < 0) bullets.current.splice(i, 1);
  });
};

export const updateEnemiesPositions = (
  enemies,
  player,
  player2,
  gameOverRef,
  setGameOver,
  canvas
) => {
  enemies.current.forEach((e, i) => {
    e.y += 2;
    if (e.y > canvas.height) enemies.current.splice(i, 1);

    if (detectCollision(e, player) || detectCollision(e, player2)) {
      gameOverRef.current = true;
      setGameOver(true);
    }
  });
};

export const detectCollision = (object1, object2) => {
  return (
    object1.x < object2.x + object2.width &&
    object1.x + object1.width > object2.x &&
    object1.y < object2.y + object2.height &&
    object1.y + object1.height > object2.y
  );
};

export const drawCanvas = (canvas, ctx, backgroundImage) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height); // Adds a border
  ctx.drawImage(backgroundImage.current, 0, 0, canvas.width, canvas.height);
};

export const drawPlayers = (ctx, spaceshipImage, player, player2) => {
  ctx.drawImage(
    spaceshipImage.current,
    player.current.x,
    player.current.y,
    player.current.width,
    player.current.height
  );

  ctx.drawImage(
    spaceshipImage.current,
    player2.current.x,
    player2.current.y,
    player2.current.width,
    player2.current.height
  );
};

export const drawBullets = (ctx, bullets) => {
  ctx.fillStyle = "white";
  bullets.current.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));
};

export const drawEnemies = (ctx, enemies, enemyImage) => {
  enemies.current.forEach((e) =>
    ctx.drawImage(enemyImage.current, e.x, e.y, e.width, e.height)
  );
};

export const drawScoreboard = (ctx, scoreRef) => {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + scoreRef.current, 10, 20);
};

export const handleGamepadMovement = (
  axisX,
  axisY,
  player,
  playerSpeed,
  canvas
) => {
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
        player.current.x + normalizedAxisX * playerSpeed * speedMultiplier, // Apply scaling factor
        canvas.width - player.current.width
      )
    );
    player.current.y = Math.max(
      0,
      Math.min(
        player.current.y + normalizedAxisY * playerSpeed * speedMultiplier, // Apply scaling factor
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
};

export const spawnEnemies = (
  enemyIntervalRef,
  gameOverRef,
  pauseRef,
  enemies,
  canvas
) => {
  enemyIntervalRef.current = setInterval(() => {
    if (!gameOverRef.current && !pauseRef.current) {
      enemies.current.push({
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 60,
        height: 60,
      });
    }
  }, 1000);
};
