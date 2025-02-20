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

// Add this utility function at the top of the file
function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

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
  const [searchLoading, setSearchLoading] = useState(false);
  const [isRefetchError, setIsRefetchError] = useState(false);

  const fetchAllProducts = async (pageNumber = 1, search = '') => {
    if (!hasMore && pageNumber !== 1) return;
    
    if (pageNumber === 1) {
      setSearchLoading(true);
      setIsRefetchError(false); // Reset error state on new fetch
    } else {
      setIsLoading(true);
    }
  
    try {
      const response = await axiosInstance.get(`products?page=${pageNumber}&name=${search}`);
      const newProducts = response.data.data.products;
      const isLastPage = newProducts.length < 10;
      
      setProducts(prevProducts => 
        pageNumber === 1 ? newProducts : [...prevProducts, ...newProducts]
      );
  
      setHasMore(!isLastPage);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching products:', error);
      setHasMore(false);
      setIsRefetchError(true);
      if (pageNumber === 1) {
        setProducts([]); // Clear products on error for first page
      }
    } finally {
      setIsLoading(false);
      setSearchLoading(false);
      setRefreshing(false);
    }
  };

  // Add debounced search function
  const debouncedSearch = React.useCallback(
    debounce((searchText) => {
      setPage(1);
      fetchAllProducts(1, searchText);
    }, 500),
    []
  );

  // Update search handler
  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAllProducts(1);
  };

  const loadMoreProducts = () => {
    if (!hasMore || loading || searchLoading) return;
    console.log('Loading more products, page:', page + 1);
    fetchAllProducts(page + 1, searchQuery);
  };

  useEffect(() => {
    fetchAllProducts(1, searchQuery);
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
      pathname: "../products/editProducts",
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
          onChangeText={handleSearch}
          value={searchQuery}
          round={true}
          showLoading={searchLoading}
          onClear={() => {
            setSearchQuery('');
            fetchAllProducts(1, '');
          }}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setPage(1);
              setHasMore(true);
              fetchAllProducts(1, searchQuery);
            }}
            tintColor="#7c3aed"
            colors={["#7c3aed"]}
            progressBackgroundColor="#1f2937"
          />
        }
        onEndReached={() => {
          if (!loading && !searchLoading && hasMore) {
            loadMoreProducts();
          }
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ 
          paddingVertical: 16,
          flexGrow: 1, // This ensures the empty state is centered
          ...(products.length === 0 && { justifyContent: 'center' })
        }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading && !refreshing && (
            <View className="py-4">
              <ActivityIndicator color="#7c3aed" />
            </View>
          )
        }
        ListEmptyComponent={
          !loading && !searchLoading && (
            <View className="flex-1 items-center p-4">
              {isRefetchError ? (
                <>
                  <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                  <Text className="text-red-500 text-lg mt-2">Failed to load products</Text>
                  <TouchableOpacity 
                    className="mt-4 bg-purple-600 px-4 py-2 rounded-full"
                    onPress={() => fetchAllProducts(1, searchQuery)}
                  >
                    <Text className="text-white">Try Again</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text className="text-white text-lg">
                  {searchQuery ? 'No matching products found' : 'No products available'}
                </Text>
              )}
            </View>
          )
        }
      />
      
      <FAB.Group
        open={state.open}
        visible
        icon={state.open ? 'close' : 'plus'}
        backdropColor='rgba(0, 0, 0, 0.7)'
        
        
        actions={[
          {
            icon: icons.category,
            label: "Add New Category",
            size: 30,
            labelTextColor: 'white',
            color: 'purple',
           

            style: {
              backgroundColor: 'white',
              borderRadius: 20,
              borderColor: 'purple',
              borderWidth: 3,
            },
            onPress: () => router.push('../category/viewCategory'),
          },
          {
            icon: icons.addProduct,
            label: 'Add New Product',
            size: 30,
            labelTextColor: 'white',
            color: 'purple',
          

            style: {
              backgroundColor: 'white',
              borderRadius: 20,
              borderColor: 'purple',
              borderWidth: 3,

            },

            
            onPress: () => router.push('../products/addProducts'),
          },
        ]}
         color="white"
        onStateChange={onStateChange}
        fabStyle={{
          backgroundColor: 'purple',
          borderRadius: 50,
        
         

          
        
         
        }}
       
      />
    </View>
  );
};

export default Products;

