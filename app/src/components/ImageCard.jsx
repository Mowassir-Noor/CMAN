import React from 'react';
import { View, Image, Pressable, Text } from 'react-native';
import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ImageCard = ({ uri, index, bannerImage, onDoubleTap, onLongPress, onSetBannerImage }) => {
  return (
    <View className="w-52 m-2 items-center">
      <View className="relative w-full">
        <Pressable
          onPress={onDoubleTap}
          onLongPress={() => onLongPress(index)}
          className="w-full h-52 rounded-xl"
        >
          <Image
            source={{ uri }}
            className="w-full h-full rounded-xl"
            resizeMode="contain"
          />
          {bannerImage === index && (
            <View className="absolute top-2 left-2 bg-black/50 px-2 py-1 rounded">
              <Text className="text-green-500 font-bold">Banner</Text>
            </View>
          )}
          <Pressable 
            onPress={() => onSetBannerImage(index)} 
            className="absolute top-2 right-0"
          >
            <MaterialCommunityIcons
              name={bannerImage === index ? "star" : "star-outline"}
              size={28}
              color={bannerImage === index ? "#FFD700" : "#666"}
            />
          </Pressable>
        </Pressable>
      </View>
      <View className="flex-row items-center mt-2">
        <IconButton
          icon="delete"
          color="#f00"
          size={20}
          onPress={() => onLongPress(index)}
        />
      </View>
    </View>
  );
};

export default ImageCard;
