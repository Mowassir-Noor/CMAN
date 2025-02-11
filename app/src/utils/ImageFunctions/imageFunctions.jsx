import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable,Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const pickImages = async (setSelectedImages) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prevImages) => [...prevImages, ...result.assets]);
    }
  } catch (error) {
    console.error("Error picking images: ", error);
  }
};

export const removeImage = (index, setSelectedImages) => {
  setSelectedImages((prevImages) => prevImages.filter((_, i) => i !== index));
};

export const openPreview = (uri, setPreviewImage, setIsPreviewVisible) => {
  setPreviewImage(uri);
  setIsPreviewVisible(true);
};

export const closePreview = (setIsPreviewVisible, setPreviewImage) => {
  setIsPreviewVisible(false);
  setPreviewImage(null);
};


