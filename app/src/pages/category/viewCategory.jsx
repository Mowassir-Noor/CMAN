import { View, Text, FlatList, StatusBar, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { FAB } from 'react-native-paper';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCategory } from '../../hooks/useCategory';
import CategoryCard from '../../components/CategoryCard';

const ViewCategory = () => {
  const { categories, loading, error, fetchCategories, deleteCategory } = useCategory();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = (categoryId) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCategory(categoryId);
            if (success) {
              Alert.alert('Success', 'Category deleted successfully');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (category) => {
    // Implement edit navigation here
    // router.push({
    //   pathname: '../category/createCategory',
    //   params: { category: JSON.stringify(category) }
    // });
    console.log('Edit category button pressed:', category);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }, [fetchCategories]);

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-black justify-center items-center p-4">
        <Text className="text-white text-center">{error}</Text>
        <TouchableOpacity 
          className="mt-4 bg-purple-600 px-4 py-2 rounded-full"
          onPress={fetchCategories}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      
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
        renderItem={({ item, index }) => (
          <CategoryCard 
            item={item} 
            index={index} 
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7c3aed"
            colors={['#7c3aed']}
            progressBackgroundColor="#1f1f1f"
          />
        }
      />
      
      <FAB
        icon="plus"
        label="Add Category"
        className="absolute right-2 bottom-4 bg-purple-600/90"
        style={{ backgroundColor: '#7c3aed' }}
        color="white"
        onPress={() => router.push('../category/createCategory')}
      />
    </View>
  );
};

export default ViewCategory;

