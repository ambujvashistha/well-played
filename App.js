import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import { Accelerometer } from "expo-sensors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 20;

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [subscription, setSubscription] = useState(null);
  const [bullet, setBullet] = useState([]);
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });

  const handelBullet = () => {
    const bullet = {
      id: Date.now(),
      x: playerX + (PLAYER_WIDTH - BULLET_WIDTH) / 2,
      y: PLAYER_HEIGHT,
    };
    setBullet((prev) => [...prev, bullet]);
  };
  useEffect(() => {
    Accelerometer.setUpdateInterval(25);

    const subscription = Accelerometer.addListener((data) => {
      setData(data);
      setPlayerX((prev) => {
        const move = prev - data.x * 50;
        return Math.max(0, Math.min(screenWidth - PLAYER_WIDTH, move));
      });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBullet((prev) => prev.map((b) => ({ ...b, y: b.y - 20 })));
    }, 100);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handelBullet}>
      <View style={styles.container}>
        <View style={[styles.player, { left: playerX }]} />
        <Text style={styles.instruction}>Tilt your phone to move</Text>
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
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#000",
  },
  instruction: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 14,
  },
  bullet: {
    position: "absolute",
    width: BULLET_WIDTH,
    height: BULLET_HEIGHT,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#000",
  },
  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
  },
  gameOverText: {
    position: "absolute",
    top: screenHeight / 2 - 40,
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Courier",
  },
});
