import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Video, AVPlaybackStatus } from "expo-av";
import { ResizeMode } from "expo-av";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constants/utils";

type ITEM = {
  id: string;
  videoUri: string;
  username: string;
  title: string;
};

interface VideoItemProps {
  item: ITEM;
  viewableItems: ViewToken[];
  onLike: (item: ITEM) => void;
  isLiked: boolean;
}

const VideoItem = ({
  item,
  viewableItems,
  onLike,
  isLiked,
}: VideoItemProps) => {
  const isViewable = viewableItems.some(
    (viewable) => viewable.item.id === item.id
  );
  const videoRef = useRef<Video>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Reanimated shared values
  const animatedValue = useSharedValue(1);

  // Create animated styles using Reanimated 2
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(animatedValue.value, [1, 0], [50, 0]) },
        { scaleX: interpolate(animatedValue.value, [1, 0], [0.5, 1]) },
      ],
      opacity: interpolate(animatedValue.value, [1, 0], [0, 1]),
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
        animatedValue.value = withTiming(
          0,
          {
            duration: 500,
            easing: Easing.out(Easing.ease),
          },
          () => {
            runOnJS(markAnimationComplete)();
          }
        );
      }
    } else {
      videoRef.current?.pauseAsync();
    }
  }, [isViewable]);

  const onPressLike = useCallback(() => {
    onLike(item);
  }, [item]);

  const onPressShare = useCallback(() => {
    // TODO - HANDLE SHARE
  }, []);

  return (
    <View style={styles.shortItem}>
      <Video
        ref={videoRef}
        source={{ uri: item.videoUri }}
        rate={1.0}
        // volume={1.0}
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
      <View style={styles.footer}>
        <Pressable onPress={onPressLike} style={styles.footerCTA}>
          {isLiked ? (
            <Image
              source={require("@/assets/images/filled_heart.png")}
              style={styles.icon}
            />
          ) : (
            <Image
              source={require("@/assets/images/heart.png")}
              style={styles.icon}
            />
          )}
          <Text style={styles.footerCtaText}>LIKE</Text>
        </Pressable>
        <Pressable onPress={onPressShare} style={styles.footerCTA}>
          <Image
            source={require("@/assets/images/share.png")}
            style={styles.icon}
          />
          <Text style={styles.footerCtaText}>SHARE</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default VideoItem;

const styles = StyleSheet.create({
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    padding: 40,
    alignItems: "center",
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
    textAlign: "center",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: Platform.OS === "ios" ? 20 : 0,
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  footerCTA: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerCtaText: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  icon: {
    height: 24,
    width: 24,
    tintColor: "#fff",
  },
});
