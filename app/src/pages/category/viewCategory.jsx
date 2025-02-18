import { View, Text, FlatList, Image, StatusBar, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('category');
      console.log(response.data.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity activeOpacity={0.9}>
      <Animated.View 
        entering={FadeInRight.delay(index * 100).springify()}
        className="mb-6 mx-4 bg-gray-900/90 rounded-3xl overflow-hidden border border-purple-500/20"
      >
        <View className="relative">
          <Image
            source={{ uri: item.image }}
            className="w-full h-56 rounded-t-3xl"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          {/* Category Label */}
          <View className="absolute top-4 left-4 bg-purple-600/90 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">Category</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            className="absolute top-4 right-4 bg-purple-600/90 rounded-full p-2"
            activeOpacity={0.8}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Info Row - Replaces the old stats row */}
        <View className="p-4 border-t border-purple-500/20">
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-1">Category Name</Text>
              <Text className="text-white text-lg font-semibold">{item.name}</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-gray-400 text-xs mb-1">Price Range</Text>
              <Text className="text-purple-400 text-base font-bold">
                ₹{item.minPrice} - ₹{item.maxPrice}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 bg-gray-900/80">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-white">Categories</Text>
            <Text className="text-sm text-gray-400 mt-1">
              {categories.length} total categories
            </Text>
          </View>
          <TouchableOpacity 
            className="bg-purple-600/20 p-2 rounded-full"
            activeOpacity={0.8}
          >
            <MaterialIcons name="filter-list" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
      />
      
      <FAB
        icon="plus"
        label="Add Category"
        className="absolute right-2 bottom-4 bg-purple-600/90"
        style={{
          backgroundColor: '#7c3aed',
        }}
        color="white"
        onPress={() => router.push('../category/createCategory')}
      />
    </View>
  );
};

export default ViewCategory;

