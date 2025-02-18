import React, { useState, useEffect } from 'react'
import {
  SafeAreaView,
  View,
  FlatList,
  Alert,
  Text,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native'
import { Button } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSharedValue, runOnJS } from 'react-native-reanimated'
import {
  pickImages,
  openPreview,
  closePreview,
  removeImage
} from '../../utils/ImageFunctions/imageFunctions'
import ImagePreviewModal from '../../components/ImagePreviewModal'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import ImageCard from '../../components/ImageCard'
import CustomTextInput from '../../components/CustomTextInput'
import axiosInstance from '../../utils/axiosInstance'
import * as SecureStore from 'expo-secure-store'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialIcons } from '@expo/vector-icons'

const AddProducts = () => {
  // const { user, login, logout, loading } = useAuth()

  // ----------------------------create a function to handle the loading status based on authentication------------
  const [loading, setLoading] = useState(false)
  // -----------------------------------------------------------------

  const [selectedImages, setSelectedImages] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [bannerImage, setBannerImage] = useState(null)
  const lastTap = useSharedValue(0)

  const [productDetails, setProductDetails] = useState({
    productName: '',
    price: '',
    discountedPrice: '',
    quantity: '',
    brand: '',
    category: '',
    description: '',
    productSpecification: '',
    experiencePeriod: '',
    availability: ''
  })
  const [formData, setFormData] = useState(new FormData())

  const [value, setIsValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('category')
        const data = response.data.data.map(category => ({
          label: category.name,
          value: category.name
        }))
        setCategories(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchCategories()
  }, [])

  // ------------------------------create a new function to handle the loading state--------------------
  if (loading) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center'>
        <Text>Loading...</Text>
      </SafeAreaView>
    )
  }
  // -----------------------------------------------------------------------------

  const handlePickImages = async () => {
    try {
      await pickImages(setSelectedImages)
    } catch (error) {
      console.error('Image picking failed:', error)
    }
  }

  const handleOpenPreview = uri =>
    openPreview(uri, setPreviewImage, setIsPreviewVisible)
  const handleClosePreview = () =>
    closePreview(setIsPreviewVisible, setPreviewImage)
  const handleRemoveImage = index => {
    if (index === bannerImage) {
      setBannerImage(null)
    }
    removeImage(index, setSelectedImages)
  }

  const updateLastTap = now => {
    lastTap.value = now
  }

  const handleLongPress = index => {
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => handleRemoveImage(index),
        style: 'destructive'
      }
    ])
  }

  const renderItem = ({ item, index }) => {
    const handleDoubleTap = () => {
      const now = Date.now()
      const DOUBLE_PRESS_DELAY = 300

      if (lastTap.value && now - lastTap.value < DOUBLE_PRESS_DELAY) {
        runOnJS(handleOpenPreview)(item.uri)
      }
      runOnJS(updateLastTap)(now)
    }

    return (
      <View className='relative mr-2'>
        <Image
          source={{ uri: item.uri }}
          className='w-[200px] h-[200px] rounded-xl'
          resizeMode='cover'
        />
        {index === bannerImage && (
          <View className='absolute top-2 left-2 bg-purple-600/70 px-2 py-1 rounded'>
            <Text className='text-white text-xs'>Banner</Text>
          </View>
        )}
        <TouchableOpacity
          onPress={() => setBannerImage(index)}
          className='absolute bottom-2 right-2 bg-black/50 p-2 rounded-full'
        >
          <MaterialIcons
            name={index === bannerImage ? 'star' : 'star-border'}
            size={20}
            color='white'
          />
        </TouchableOpacity>
      </View>
    )
  }

  const renderAddButton = () => (
    <TouchableOpacity
      onPress={handlePickImages}
      className='ml-2 border-2 border-dashed border-gray-600 rounded-xl p-8 items-center justify-center bg-gray-800/30 h-[200px] w-[200px]'
    >
      <MaterialIcons name='add-photo-alternate' size={40} color='#666' />
      <Text className='text-gray-400 mt-2'>Add More</Text>
      <Text className='text-gray-500 text-xs mt-1'>Images</Text>
    </TouchableOpacity>
  )

  const handleSubmit = () => {
    const newFormData = new FormData()
    newFormData.append('name', productDetails.productName)
    newFormData.append('price', productDetails.price)
    newFormData.append('discountedPrice', productDetails.discountedPrice)
    newFormData.append('quantity', productDetails.quantity)
    newFormData.append('category', productDetails.category)
    newFormData.append('description', productDetails.description)
    newFormData.append('experiencePeriod', productDetails.experiencePeriod)
    newFormData.append('availability', productDetails.availability)

    productDetails.productSpecification.split(',').forEach(spec => {
      newFormData.append('specifications[]', spec.trim())
    })

    selectedImages.forEach((image, index) => {
      newFormData.append('images', {
        uri: image.uri,
        type: 'image/jpeg',
        name: `image${index}.jpg`
      })
    })

    if (bannerImage !== null) {
      newFormData.append('bannerImage', {
        uri: selectedImages[bannerImage].uri,
        type: 'image/jpeg',
        name: 'bannerImage.jpg'
      })
    }

    setFormData(newFormData)
    console.log('Form Data:', newFormData)
  }

  const postProduct = async formData => {
    try {
      const response = await axiosInstance.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Product added:', response.data)
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data)
      } else if (error.request) {
        console.error('Network Error:', error.request)
      } else {
        console.error('Error:', error.message)
      }
    }
  }
  return (
    <GestureHandlerRootView className='flex-1'>
      <SafeAreaView className='flex-1' backgroundColor='black'>
        <ScrollView>
          <View className='p-4'>
            <Text className='text-white text-2xl font-bold mb-4'>
              Add New Product
            </Text>

            {/* Image Section */}
            <View className='mb-6'>
              <Text className='text-gray-300 text-sm font-medium mb-2'>
                Product Images
              </Text>
              <FlatList
                data={[...selectedImages, { isAddButton: true }]}
                renderItem={({ item, index }) =>
                  item.isAddButton ? renderAddButton() : renderItem({ item, index })
                }
                keyExtractor={(item, index) => item.uri || index.toString()}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <TouchableOpacity
                    onPress={handlePickImages}
                    className='border-2 border-dashed border-gray-600 rounded-xl p-8 items-center justify-center bg-gray-800/30 w-full'
                  >
                    <MaterialIcons
                      name='add-photo-alternate'
                      size={40}
                      color='#666'
                    />
                    <Text className='text-gray-400 mt-2'>
                      Upload Product Images
                    </Text>
                    <Text className='text-gray-500 text-xs mt-1'>
                      Tap to choose files
                    </Text>
                  </TouchableOpacity>
                }
              />
            </View>

            <View
              className='items-center justify-center mt-4'
              backgroundColor='black'
            >
              <Button
                mode='contained'
                buttonColor='purple'
                onPress={handlePickImages}
                icon={'image-multiple'}
              >
                Add Images
              </Button>
            </View>

            <View
              className='flex-1 justify-center items-center'
              backgroundColor='black'
            >
              <View
                className=' w-5/6 h-80 flex-1 justify-center align-center'
                backgroundColor='black'
              >
                <CustomTextInput
                  label='Product Name'
                  value={productDetails.productName}
                  onChangeText={text =>
                    setProductDetails({ ...productDetails, productName: text })
                  }
                />
                <CustomTextInput
                  label='Price'
                  value={productDetails.price}
                  onChangeText={text =>
                    setProductDetails({ ...productDetails, price: text })
                  }
                  keyboardType={'numeric'}
                />
                <CustomTextInput
                  label='Discounted Price'
                  value={productDetails.discountedPrice}
                  onChangeText={text =>
                    setProductDetails({
                      ...productDetails,
                      discountedPrice: text
                    })
                  }
                  keyboardType={'numeric'}
                />
              </View>

              <View
                className=' w-5/6 h-80 flex-1 justify-center align-center'
                backgroundColor='black'
              >
                <CustomTextInput
                  label='Quantity'
                  value={productDetails.quantity}
                  onChangeText={text =>
                    setProductDetails({ ...productDetails, quantity: text })
                  }
                  keyboardType={'numeric'}
                />
                <CustomTextInput
                  label='Brand'
                  value={productDetails.brand}
                  onChangeText={text =>
                    setProductDetails({ ...productDetails, brand: text })
                  }
                />
              </View>

              <View className=' w-5/6' backgroundColor='black'>
                <View className='p-4 w-5/6'>
                  <Dropdown
                    className='border border-gray-300 rounded p-2 bg-white shadow-md '
                    data={categories}
                    search
                    maxHeight={300}
                    labelField={'label'}
                    valueField={'value'}
                    placeholder={!isFocused ? 'Select Category' : '...'}
                    searchPlaceholder='Search...'
                    value={value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onChange={item => {
                      setProductDetails({
                        ...productDetails,
                        category: item.value
                      })
                      setIsFocused(false)
                    }}
                    selectedTextStyle={{ color: 'white', fontWeight: 'bold' }}
                    placeholderStyle={{ color: 'white', fontStyle: 'italic' }}
                    containerStyle={{ borderRadius: 10, overflow: 'hidden' }}
                    itemTextStyle={{ color: 'black' }}
                    inputSearchStyle={{ color: 'black' }}
                  />
                </View>
                <CustomTextInput
                  label='Description'
                  multiline={true}
                  value={productDetails.description}
                  onChangeText={text =>
                    setProductDetails({ ...productDetails, description: text })
                  }
                />
                <CustomTextInput
                  label='Product Specification'
                  multiline={true}
                  value={productDetails.productSpecification}
                  onChangeText={text =>
                    setProductDetails({
                      ...productDetails,
                      productSpecification: text
                    })
                  }
                />
              </View>

              <View
                className=' w-5/6 h-80 flex-1 justify-center align-center'
                backgroundColor='black'
              >
                <CustomTextInput
                  label='Experience Period'
                  value={productDetails.experiencePeriod}
                  onChangeText={text =>
                    setProductDetails({
                      ...productDetails,
                      experiencePeriod: text
                    })
                  }
                  keyboardType={'numeric'}
                />
                <CustomTextInput
                  label='Availability'
                  value={productDetails.availability}
                  onChangeText={text =>
                    setProductDetails({
                      ...productDetails,
                      availability: text
                    })
                  }
                />
              </View>

              <Button
                mode='contained'
                buttonColor='purple'
                onPress={handleSubmit}
                className='mt-4'
              >
                Save
              </Button>
              <Button
                mode='contained'
                buttonColor='purple'
                onPress={() => postProduct(formData)}
                className='mt-4 mb-5'
              >
                Submit
              </Button>
            </View>

            <ImagePreviewModal
              isVisible={isPreviewVisible}
              imageUri={previewImage}
              onClose={handleClosePreview}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

export default AddProducts