import { Platform, StyleSheet, Text, View, ViewToken } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Video, AVPlaybackStatus } from "expo-av";
import { ResizeMode } from "expo-av";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants/utils";

interface VideoItemProps {
  item: {
    id: string;
    videoUri: string;
    username: string;
    title: string;
  };
  viewableItems: ViewToken[];
}

const VideoItem = ({ item, viewableItems }: VideoItemProps) => {
  const isViewable = viewableItems.some(
    (viewable) => viewable.item.id === item.id
  );
  const videoRef = useRef<Video>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Reanimated shared values
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);

  // Create animated styles using Reanimated 2
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Function to mark animation as completed
  const markAnimationComplete = () => {
    setHasAnimated(true);
  };

  // Handle video playback and animation based on viewability
  useEffect(() => {
    if (isViewable) {
      videoRef.current?.playAsync();

      // Animate text only the first time this card becomes visible
      if (!hasAnimated) {
        translateY.value = withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        });

        opacity.value = withTiming(
          1,
          {
            duration: 500,
            easing: Easing.out(Easing.ease),
          },
          () => {
            // Mark animation as complete (execute on JS thread)
            runOnJS(markAnimationComplete)();
          }
        );
      }
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isViewable]);

  return (
    <View style={styles.shortItem}>
      <Video
        ref={videoRef}
        source={{ uri: item.videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isLooping
        style={styles.video}
        useNativeControls={false}
        posterSource={{ uri: item.videoUri + "?poster" }}
        posterStyle={styles.video}
        // Performance optimizations
        progressUpdateIntervalMillis={1000}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          // Only handle essential status updates
          if (status.isLoaded && status.didJustFinish) {
            videoRef.current?.replayAsync();
          }
        }}
      />

      <View style={styles.overlay}>
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.title}>{item.title}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

export default VideoItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  shortItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    padding: 20,
  },
  textContainer: {
    marginTop: Platform.OS === "ios" ? 50 : 30,
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});
