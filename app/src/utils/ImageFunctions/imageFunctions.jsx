import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, Modal, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const pickImages = async (setSelectedImages) => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery was denied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: false,
    });

    console.log('Image picker result:', result); // For debugging

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.uri.split('/').pop() || 'image.jpg'
      }));
      setSelectedImages(prevImages => [...prevImages, ...newImages]);
      return newImages;
    }
    return null;
  } catch (error) {
    console.error("Error picking images:", error);
    Alert.alert('Error', 'Failed to pick images. Please try again.');
    return null;
  }
};

const pickSingleImage = async (setSelectedImages) => {
  try {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access gallery was denied');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: false,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      setSelectedImages([result.assets[0]]);
    }
  } catch (error) {
    console.error("Error picking image: ", error);
    Alert.alert('Error', 'Failed to pick image');
  }
};

const removeImage = (index, setSelectedImages) => {
  try {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
  } catch (error) {
    console.error("Error removing image:", error);
    Alert.alert('Error', 'Failed to remove image');
  }
};

const openPreview = (uri, setPreviewImage, setIsPreviewVisible) => {
  setPreviewImage(uri);
  setIsPreviewVisible(true);
};

const closePreview = (setIsPreviewVisible, setPreviewImage) => {
  setIsPreviewVisible(false);
  setPreviewImage(null);
};

export {
  pickImages,
  pickSingleImage,
  removeImage,
  openPreview,
  closePreview
};


