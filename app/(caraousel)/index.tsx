import { StyleSheet, View, FlatList, ViewToken, StatusBar } from "react-native";
import React, { memo, useCallback, useRef, useState } from "react";
import VideoItem from "@/components/VideoItem";
import SHORTS_DATA from "@/constants/rawData";
import { SCREEN_HEIGHT } from "@/constants/utils";

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
}

const Caraousel = () => {
  const [likedItems, setLikedItems] = useState({});
  const [viewableItems, setViewableItems] = useState<ViewToken[]>([]);
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: ViewableItemsChanged) => {
      setViewableItems(viewableItems);
    },
    []
  );

  const onLikeVideo = useCallback((item) => {
    setLikedItems((items) => {
      items = { ...items, [item.id]: !items[item.id] };
      return items;
    });
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={SHORTS_DATA}
        extraData={likedItems}
        renderItem={({ item }) => (
          <VideoItem
            item={item}
            viewableItems={viewableItems}
            onLike={onLikeVideo}
            isLiked={likedItems[item.id]}
          />
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

export default memo(Caraousel);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00000080",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
});
