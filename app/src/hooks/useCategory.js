import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/category');
      setCategories(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await axiosInstance.delete(`/category/${categoryId}`);
      await fetchCategories();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      return false;
    }
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    deleteCategory
  };
};
