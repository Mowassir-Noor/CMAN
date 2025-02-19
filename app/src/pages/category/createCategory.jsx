import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Button } from 'react-native-paper'
import { MaterialIcons } from '@expo/vector-icons'
import CustomTextInput from '../../components/CustomTextInput'
import { pickSingleImage, openPreview, closePreview, removeImage } from '../../utils/ImageFunctions/imageFunctions'
import ImagePreviewModal from '../../components/ImagePreviewModal'

const CreateCategory = () => {
  const [name, setName] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  const handlePickImage = async () => {
    try {
      await pickSingleImage(setSelectedImages);
    } catch (error) {
      console.error('Image picking failed:', error);
      Alert.alert(
        'Error',
        'Failed to pick image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleOpenPreview = uri => openPreview(uri, setPreviewImage, setIsPreviewVisible);
  const handleClosePreview = () => closePreview(setIsPreviewVisible, setPreviewImage);

  const handleDeleteImage = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => setSelectedImages([]),
          style: 'destructive'
        }
      ]
    );
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log({ name, minPrice, maxPrice, selectedImages })
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaView className="flex-1" backgroundColor="black">
        <ScrollView>
          {/* Image Section */}
          <View backgroundColor="black" className="items-center p-4">
            <View className="relative">
              <TouchableOpacity 
                onPress={handlePickImage}
                className="border-2 border-dashed border-gray-600 rounded-xl items-center justify-center bg-gray-800/30 h-[200px] w-[200px] overflow-hidden"
              >
                {selectedImages[0] ? (
                  <View className="relative w-full h-full">
                    <TouchableOpacity 
                      onPress={() => handleOpenPreview(selectedImages[0].uri)}
                      className="h-full w-full"
                    >
                      <Image 
                        source={{ uri: selectedImages[0].uri }} 
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleDeleteImage}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center justify-center h-full w-full">
                    <MaterialIcons name="add-photo-alternate" size={40} color="#666" />
                    <Text className="text-gray-400 mt-2">Add Image</Text>
                    <Text className="text-gray-500 text-xs mt-1">Category Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Section */}
          <View className="flex-1 justify-center items-center" backgroundColor="black">
            <View className="w-5/6 flex-1 justify-center align-center" backgroundColor="black">
              <CustomTextInput
                label="Category Name"
                value={name}
                onChangeText={setName}
              />
              <CustomTextInput
                label="Minimum Price"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <CustomTextInput
                label="Maximum Price"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>

            <Button
              mode="contained"
              buttonColor="purple"
              onPress={handleSubmit}
              className="mt-4 mb-5"
            >
              Create Category
            </Button>
          </View>

          {/* Image Preview Modal */}
          <ImagePreviewModal
            isVisible={isPreviewVisible}
            imageUri={previewImage}
            onClose={handleClosePreview}
          />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default CreateCategory