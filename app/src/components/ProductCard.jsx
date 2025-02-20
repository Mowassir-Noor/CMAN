import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';

const ProductCard = ({ item, index, onDelete, onEdit }) => {
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={() => onEdit?.(item)}>
      <Animated.View 
        entering={FadeInRight.delay(index * 10).springify()}
        className="mb-4 mx-3  bg-black rounded-2xl overflow-hidden border border-gray-300"
      >
        <View className="relative">
          <Image
            source={{ uri: item.bannerImage }}
            className="w-full h-40 rounded-t-2xl"
            resizeMode="cover"
          />
          
          <View className="absolute top-2 left-2 bg-gray-900/90 px-2 py-0.5 rounded-full">
            <Text className="text-white text-xs   font-bold">
              {item.availability ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          <TouchableOpacity 
            className="absolute top-2 right-2 bg-gray-900/90 rounded-full p-2 border-purple-500/20 border-2"
            activeOpacity={0.8}
            onPress={() => onEdit?.(item)}
          >
            <MaterialIcons name="edit" size={20} color="white" />
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
                
                <Text className="text-white text-base font-bold">
                ₹ {item.discountedPrice || item.price}
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
              className="flex-row items-center  bg-white rounded-full px-3 py-1.5"
              activeOpacity={0.8}
              onPress={() => onDelete?.(item._id)}
            >
              {/* <MaterialIcons name="delete" size={20} color="#ef4444" /> */}
              <MaterialIcons name="delete" size={20} color="purple" />
              <Text className=" text-gray-900/90 text-sm ml-1 font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};



export default ProductCard;
