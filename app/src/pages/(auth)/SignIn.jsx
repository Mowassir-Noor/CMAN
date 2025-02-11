import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import CustomButton from '../../components/customButton';
import Form from '../../components/formField';
// import axiosInstance from '../../api/axiosInstance';
import axiosInstance from '../../utils/axiosInstance';
import * as SecureStore from 'expo-secure-store';

const SignIn = () => {
  const router = useRouter();

  // State for input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Loading state to show activity indicator while API call is in progress
  const [loading, setIsLoading] = useState(false);

  // Error message to display invalid credentials or other issues
  const [error, setError] = useState('');

  // Function to handle login
  const handleLogin = async () => {
    setIsLoading(true); // Show loading indicator
    setError(''); // Clear previous error messages

    try {
      // Make an API call to the login endpoint
      const response = await axiosInstance.post('login', { email, password });

      // Extract the token from the response
      const token = response.data.data;

      // Store the token securely in SecureStore
      await SecureStore.setItemAsync('authtoken', token);

      setIsLoading(false); // Hide loading indicator

      // Navigate to the products page after successful login
      router.replace('../(tabs)/home');

    } catch (error) {
      // Handle login errors
      setIsLoading(false); // Hide loading indicator
      setError('Invalid email or password'); // Set error message
      console.error('Login error:', error); // Log error for debugging
    }
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black p-5">
      {/* Header Section */}
      <View className="items-center mb-8">
        <Text className="text-white text-5xl font-fregular mb-4">Log In</Text>
        <Text className="text-white font-pextrabold text-xs mb-4">
          New to this site?{' '}
          <Link href="./SignUp" className="text-vansayaPurple underline">
            Sign Up
          </Link>
        </Text>
      </View>

      {/* Form Section */}
      <View className="w-5/6">
        {/* Email Field */}
        <Form
          title="Email"
          value={email}
          placeholder=""
          handleChangeText={setEmail}
          keyboardType="email-address"
        />
        {/* Password Field */}
        <Form
          title="Password"
          value={password}
          placeholder=""
          handleChangeText={setPassword}
        />

        {/* Forgot Password Link */}
        <View className="w-full flex-row justify-start mb-4">
          <Link href="/home" className="text-white">
            Forgot Password?
          </Link>
        </View>
      </View>

      {/* Submit Button */}
      {loading ? (
        // Show loading spinner if login is in progress
        <ActivityIndicator size="large" color="#6200EE" />
      ) : (
        // Custom button to trigger login
        <CustomButton
          buttonTitle="Log In"
          otherStyles="w-5/6"
          onPress={handleLogin}
        />
      )}

      {/* Error Message */}
      {error && (
        <Text className="text-red-500 mt-4">
          {error} {/* Display error message if it exists */}
        </Text>
      )}
    </SafeAreaView>
  );
};

export default SignIn;
