import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform ,TextInput} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';

import { signInWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { auth } from '../../../firebaseConfig';
// import { axiosInstance } from '../../../src/utils/axiosInstance';
import axiosInstance from '../../../src/api/axiosInstance';
// import { useRouter } from 'expo-router';

const Inbox = () => {
  const router = useRouter();
   const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleLogin = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
   
    const idToken = await user.getIdToken();
    console.log("ID Token:", idToken);

    const response = await axiosInstance.post('/verify-token', { idToken }, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (response.status === 200) {
      Alert.alert("Login Success", `Welcome ${response.data.email}`);
      router.push('/(tabs)/home');
    } else {
      Alert.alert("Error", response.data.error || "Unexpected error");
    }
  } catch (error) {
    console.error("Login error:", error);
    Alert.alert("Login Failed", error.message || "Something went wrong");
  }
};


  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-4">Login</Text>

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-5"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />

      <TouchableOpacity
        className={`${loading ? 'bg-blue-400' : 'bg-blue-600'} w-full py-3 rounded-xl flex-row justify-center items-center`}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text className="text-white text-center font-semibold ml-2">Signing In...</Text>
          </>
        ) : (
          <Text className="text-white text-center font-semibold">Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
export default Inbox;