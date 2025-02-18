import { View, SafeAreaView, FlatList, RefreshControl, ActivityIndicator, Text, StatusBar, TouchableOpacity, Image, Alert } from 'react-native';
import { ProgressBar, FAB, Portal, PaperProvider } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { icons } from '../../constants';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SearchBar } from '@rneui/themed';
import ProductCard from '../../components/ProductCard';

const Products = () => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  const [visible, setVisible] = React.useState(true);

  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAllProducts = async (pageNumber = 1) => {
    if (!hasMore && pageNumber !== 1) return;
    setIsLoading(true);
  
    try {
      const response = await axiosInstance.get(`products?page=${pageNumber}`);
      const newProducts = response.data.data.products; // Ensure this is the correct structure
  
      setProducts(prevProducts => 
        pageNumber === 1 ? newProducts : [...prevProducts, ...newProducts]
      );
  
      setHasMore(newProducts.length > 0);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAllProducts(1);
  };

  const loadMoreProducts = () => {
    if (!hasMore || loading) return;  // Prevent multiple calls
    fetchAllProducts(page + 1);
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleDelete = async (productId) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`products/${productId}`);
              fetchAllProducts(1); // Refresh the list
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    router.push({
      pathname: "../products/editProduct",
      params: { productId: item._id }
    });
  };

  const renderItem = ({ item, index }) => (
    <ProductCard 
      item={item}
      index={index}
      onDelete={handleDelete}
      onEdit={handleEdit}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="px-4 pt-5 pb-4 bg-gray-900/80">
        
        {/* Original SearchBar */}
        <SearchBar
          platform="default"
          containerStyle={{ 
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0
          }}
          inputContainerStyle={{
            backgroundColor: 'rgba(55, 65, 81, 0.8)',
            borderRadius: 25
          }}
          inputStyle={{ color: 'white' }}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          onChangeText={text => setSearchQuery(text)}
          value={searchQuery}
          round={true}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#7c3aed"
          />
        }
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.1}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading && (
          <View className="py-4">
            <ActivityIndicator color="#7c3aed" />
          </View>
        )}
      />
      
      <FAB.Group
        open={state.open}
        visible
        icon={state.open ? 'close' : 'plus'}
        actions={[
          {
            icon: icons.category,
            label: "Add New Category",
            onPress: () => router.push('../category/viewCategory'),
          },
          {
            icon: icons.addProduct,
            label: 'Add New Product',
            onPress: () => router.push('../products/addProducts'),
          },
        ]}
        onStateChange={onStateChange}
        fabStyle={{
          backgroundColor: '#7c3aed',
          borderRadius: 50,
        }}
        color="white"
      />
    </View>
  );
};

export default Products;

