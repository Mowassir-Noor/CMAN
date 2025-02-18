import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const ProductCard = ({ item, index, onDelete, onEdit }) => {
  return (
    <TouchableOpacity activeOpacity={0.9}>
      <Animated.View 
        entering={FadeInRight.delay(index * 100).springify()}
        className="mb-4 mx-3 bg-gray-900/90 rounded-2xl overflow-hidden border border-purple-500/20"
      >
        <View className="relative">
          <Image
            source={{ uri: item.bannerImage }}
            className="w-full h-40 rounded-t-2xl"
            resizeMode="cover"
          />
          
          <View className="absolute top-2 left-2 bg-purple-600/90 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs font-medium">
              {item.availability ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <TouchableOpacity 
            className="absolute top-2 right-2 bg-purple-600/90 rounded-full p-2"
            activeOpacity={0.8}
            onPress={() => onEdit?.(item)}
          >
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View className="p-3 border-t border-purple-500/20">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-white text-base font-bold mb-0.5 mr-2">
                {item.name}
              </Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                <MaterialIcons name="attach-money" size={16} color="#fff" />
                <Text className="text-white text-base font-bold">
                  {item.discountedPrice || item.price}
                </Text>
              </View>
              {item.discountedPrice && (
                <Text className="text-gray-500 text-xs line-through">
                  ₹{item.price}
                </Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between items-center pt-2 border-t border-purple-500/20">
            <View className="flex-row items-center">
              <MaterialIcons name="inventory" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-xs ml-1">
                Qty: {item.quantity}
              </Text>
            </View>
            <TouchableOpacity 
              className="flex-row items-center bg-red-500/20 rounded-full px-3 py-1.5"
              activeOpacity={0.8}
              onPress={() => onDelete?.(item._id)}
            >
              <MaterialIcons name="delete" size={20} color="#ef4444" />
              <Text className="text-red-500 text-sm ml-1 font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ProductCard;
