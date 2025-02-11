import { View, Text, FlatList, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

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

  // Render item for FlatList
  const renderItem = ({ item }) => (
    <View
      style={{
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 6,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: '100%', height: 220, borderRadius: 15 }}
      />
      <View style={{ padding: 15 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 5,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: '#666',
            marginBottom: 5,
            lineHeight: 24,
          }}
        >
          Price Range: ₹{item.minPrice} - ₹{item.maxPrice}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#888',
            fontStyle: 'italic',
            marginTop: 10,
          }}
        >
          Tap to view details
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: '#f4f4f4' }}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ViewCategory;
