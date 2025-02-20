import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable,Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const pickImages = async (setSelectedImages) => {
  try {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access gallery was denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages((prevImages) => [...prevImages, ...result.assets]);
    }
  } catch (error) {
    console.error("Error picking images: ", error);
    alert('Failed to pick images');
  }
};

export const pickSingleImage = async (setSelectedImages) => {
  try {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access gallery was denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      quality: 1,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setSelectedImages([result.assets[0]]);
    }
  } catch (error) {
    console.error("Error picking image: ", error);
    alert('Failed to pick image');
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


