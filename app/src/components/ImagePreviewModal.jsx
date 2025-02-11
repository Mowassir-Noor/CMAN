import React from 'react';
import { Modal, View, Image } from 'react-native';
import { Button } from 'react-native-paper';

const ImagePreviewModal = ({ isVisible, imageUri, onClose }) => (
  <Modal
    animationType="fade"
    transparent={false}
    visible={isVisible}
    onRequestClose={onClose}
  >
    <View className="flex-1 bg-black items-center justify-center">
      <Image
        source={{ uri: imageUri }}
        className="w-full h-4/5"
        resizeMode="contain"
      />
      <Button
        mode="contained"
        buttonColor="#f00"
        onPress={onClose}
        className="mt-5"
        icon={'close'}
      >
        Close
      </Button>
    </View>
  </Modal>
);

export default ImagePreviewModal;
