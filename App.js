import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 120;
const PLAYER_HEIGHT = 80;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 20;

const ENEMY_WIDTH = 120;
const ENEMY_HEIGHT = 80;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);

  const [bullet, setBullet] = useState([]);

  const [enemyX, setEnemyX] = useState(screenWidth / 2);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);

  const [gameOver, setGameOver] = useState(false);

  const [{ x }, setData] = useState({ x: 0 });

  const handelBullet = () => {
    if (gameOver) return;
    const b = {
      id: Date.now(),
      x: playerX + (PLAYER_WIDTH - BULLET_WIDTH) / 2,
      y: PLAYER_HEIGHT,
    };
    setBullet((prev) => [...prev, b]);
  };

  useEffect(() => {
    if (gameOver) return;

    Accelerometer.setUpdateInterval(25);

    const subscription = Accelerometer.addListener((data) => {
      setData(data);
      setPlayerX((prev) => {
        const move = prev - data.x * 50;
        return Math.max(0, Math.min(screenWidth - PLAYER_WIDTH, move));
      });
    });

    return () => subscription.remove();
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;

    let shootAccumulator = 0;

    const interval = setInterval(() => {
      setBullet((prevBullets) =>
        prevBullets
          .map((b) => ({ ...b, y: b.y + 20 }))
          .filter((b) => b.y < screenHeight)
      );

      setEnemyBullets((prev) =>
        prev.map((b) => ({ ...b, y: b.y - 16 })).filter((b) => b.y > 0)
      );

      setEnemyX((prev) => {
        const randomMove = (Math.random() - 0.5) * 24;
        const next = Math.max(
          0,
          Math.min(screenWidth - ENEMY_WIDTH, prev + randomMove)
        );
        return next;
      });

      shootAccumulator += 16;
      if (shootAccumulator >= 90) {
        shootAccumulator = 0;

        setEnemyBullets((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: enemyX + ENEMY_WIDTH / 2 - BULLET_WIDTH / 2,
            y: screenHeight - ENEMY_HEIGHT - 30,
          },
        ]);
      }

      setBullet((prevBullets) =>
        prevBullets.filter((b) => {
          const bulletLeft = b.x;
          const bulletRight = b.x + BULLET_WIDTH;
          const enemyLeft = enemyX;
          const enemyRight = enemyX + ENEMY_WIDTH;
          const enemyTop = screenHeight - ENEMY_HEIGHT - 30;
          const enemyBottom = enemyTop + ENEMY_HEIGHT;

          const hitsEnemy =
            bulletRight > enemyLeft &&
            bulletLeft < enemyRight &&
            b.y + BULLET_HEIGHT > enemyTop &&
            b.y < enemyBottom;

          if (hitsEnemy) {
            setEnemyHP((hp) => {
              const next = Math.max(0, hp - 10);
              return next;
            });
            return false;
          }
          return true;
        })
      );

      setEnemyBullets((prevBullets) =>
        prevBullets.filter((b) => {
          const bulletLeft = b.x;
          const bulletRight = b.x + BULLET_WIDTH;
          const playerLeft = playerX;
          const playerRight = playerX + PLAYER_WIDTH;
          const playerTop = 20 + PLAYER_HEIGHT;
          const playerBottom = 20 + PLAYER_HEIGHT + 10;

          const hitsPlayer =
            bulletRight > playerLeft &&
            bulletLeft < playerRight &&
            b.y < playerTop + 10;

          if (hitsPlayer) {
            setPlayerHP((hp) => Math.max(0, hp - 10));
            return false;
          }
          return true;
        })
      );
    }, 16);

    return () => clearInterval(interval);
  }, [gameOver, enemyX, playerX]);
  useEffect(() => {
    if (playerHP <= 0 || enemyHP <= 0) {
      setGameOver(true);
    }
  }, [playerHP, enemyHP]);

  const restartGame = () => {
    setGameOver(false);
    setPlayerHP(100);
    setEnemyHP(100);
    setBullet([]);
    setEnemyBullets([]);
    setPlayerX((screenWidth - PLAYER_WIDTH) / 2);
    setEnemyX(screenWidth / 2);
  };

  return (
    <TouchableWithoutFeedback onPress={gameOver ? restartGame : handelBullet}>
      <View style={styles.container}>
        {/* ⭐ Enemy health bar */}
        <View style={[styles.healthBar, { top: 50 }]}>
          <View style={[styles.healthFill, { width: `${enemyHP}%` }]} />
        </View>

        <Image
          source={{
            uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/6.png",
          }}
          style={[styles.enemy, { left: enemyX }]}
        />

        {enemyBullets.map((b) => (
          <View
            key={b.id}
            style={[styles.enemyBullet, { left: b.x, top: screenHeight - b.y }]}
          />
        ))}

        {bullet.map((b) => (
          <View
            key={b.id}
            style={[
              styles.bullet,
              {
                left: b.x,
                bottom: b.y,
              },
            ]}
          />
        ))}

        <View style={[styles.healthBar, { bottom: 120 }]}>
          <View style={[styles.healthFill, { width: `${playerHP}%` }]} />
        </View>

        <Image
          source={{
            uri: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png",
          }}
          style={[styles.player, { left: playerX }]}
        />

        <Text style={styles.instruction}>Tilt your phone to move</Text>

        {gameOver && (
          <Text style={styles.gameOverText}>GAME OVER - Tap to Restart</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },

  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    resizeMode: "contain",
  },

  enemy: {
    position: "absolute",
    top: 60,
    width: ENEMY_WIDTH,
    height: ENEMY_HEIGHT,
    resizeMode: "contain",
  },

  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "#FFF",
  },

  enemyBullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "red",
  },

  instruction: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 14,
  },

  healthBar: {
    position: "absolute",
    left: 20,
    width: screenWidth - 40,
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
  },

  healthFill: {
    height: "100%",
    backgroundColor: "lime",
    borderRadius: 5,
  },

  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 40,
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Courier",
    textAlign: "center",
    width: "100%",
  },
});
