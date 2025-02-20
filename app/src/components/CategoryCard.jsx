import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const CategoryCard = ({ item, index, onDelete, onEdit }) => (
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
        
        <View className="absolute top-4 left-4 bg-purple-600/90 px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-medium">Category</Text>
        </View>

        <View className="absolute top-4 right-4 flex-row space-x-2">
          <TouchableOpacity 
            className="bg-purple-600/90 rounded-full p-2"
            activeOpacity={0.8}
            onPress={() => onEdit(item)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-red-600/90 rounded-full p-2"
            activeOpacity={0.8}
            onPress={() => onDelete(item._id)}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

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

export default CategoryCard;
