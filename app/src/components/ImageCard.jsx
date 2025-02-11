import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { IconButton, RadioButton } from 'react-native-paper';

const ImageCard = ({ uri, index, bannerImage, onDoubleTap, onLongPress, onSetBannerImage }) => {
  return (
    <View className="w-52 m-2 items-center">
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
      </Pressable>
      <View className="flex-row items-center mt-2">
        <RadioButton
          value={index}
          status={bannerImage === index ? 'checked' : 'unchecked'}
          onPress={() => onSetBannerImage(index)}
        />
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
