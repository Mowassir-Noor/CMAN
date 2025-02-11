// In ProductCard component
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
// import axiosInstance from '../path/to/axiosInstance'; // Add the correct path to axiosInstance

import * as React from 'react';
import { View, Text, Image } from 'react-native';
import { Card, Button } from 'react-native-paper';
import axiosInstance from '../api/axiosInstance';
import { Alert } from 'react-native';

const ProductCard = ({ 
  imageSource, 
  productName, 
  productPrice, 
  discountedPrice, 
  quantity, 
  availability, 
  otherStyle, 
  productId,
  refreshPage, // Add refreshPage prop
  onDelete, // Add onDelete prop
  ...props
}) => {
  const handleDelete = async () => {
    try {
      Alert.alert("Delete Product", 
        "Are you sure you want to delete this product?", 
        [ {
          text: "Cancel",
          style: "cancel"
        }, 
        {
          text: "Delete",
          onPress: () =>axiosInstance.delete(`products/${productId}`),
          style: "destructive"
        } ]);
     
      onDelete(); // Trigger refresh after deletion
    } catch (error) {
      console.error('Error deleting product', error);
    }
  };

  return (
    <View className={`my-2 mx-4  ${otherStyle}`}>
      <Card className="rounded-lg shadow-lg bg-white overflow-hidden">
        <View className="flex-row p-3">
          <Image
            source={{ uri: imageSource }}
            className="w-24 h-24 rounded-full mr-4 bg-black"
            resizeMode="contain"
          />
          <View className="flex-1 justify-center">
            <Text className="text-xl font-semibold text-gray-800 mb-1">{productName}</Text>
            <Text className={`text-lg ${discountedPrice ? 'line-through text-gray-500' : 'text-gray-700'}`}>
              ${productPrice}
            </Text>
            {discountedPrice && (
              <Text className="text-lg text-red-500 mt-1">${discountedPrice}</Text>
            )}
            <Text className="text-sm text-gray-600 mt-2">Quantity: {quantity}</Text>
            <Text className={`text-sm font-bold mt-1 ${availability === 'Available' ? 'text-green-600' : 'text-red-600'}`} >
              {availability}
            </Text>
          </View>
        </View>

        <Card.Actions className="bg-gray-100 p-3 space-x-2">
          <Button
            mode="outlined"
            onPress={() => console.log("Edit pressed")} // Correctly call goToProductDetails
            className="border-gray-400"
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            onPress={handleDelete} // Correctly call deleteProduct
            className="border-gray-400"
          >
            Delete
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

export default ProductCard;
