import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import CustomButton from '../../components/customButton';
import Form from '../../components/formField';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import axiosInstance from '../../../src/api/axiosInstance';
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
    // Validate inputs
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      // Store both the token and uid for app-wide access
      await SecureStore.setItemAsync('userToken', idToken);
      await SecureStore.setItemAsync('userUID', user.uid);
      
      // Verify token with backend (if needed)
      try {
        const response = await axiosInstance.post('/verify-token', 
          { idToken }, 
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        
        // If backend verification is successful
        if (response.status === 200) {
          // Store comprehensive user data for app-wide access
          const userData = {
            email: user.email,
            uid: user.uid,
            displayName: user.displayName || '',
            photoURL: user.photoURL || null,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber || null,
            lastLoginAt: new Date().toISOString(),
          };
          
          // Store complete user data as JSON string
          await SecureStore.setItemAsync('userData', JSON.stringify(userData));
          console.log("User data stored:", userData);
          console.log("User UID stored:", user.uid);
          
          // Navigate to home screen
          router.replace('../(tabs)/home');
        } else {
          throw new Error(response.data.error || "Server verification failed");
        }
      } catch (backendError) {
        console.warn("Backend verification error:", backendError);
        // Even if backend verification fails, we can still proceed with Firebase auth
        // since the user is authenticated with Firebase
        router.replace('../(tabs)/home');
      }
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Authentication failed";
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed login attempts. Please try again later";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your connection";
      }
      
      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setIsLoading(false);
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
