import { StyleSheet, Text, View, Image, SafeAreaView } from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CustomButton from './src/components/customButton';
import { useRouter } from 'expo-router';
import images from './src/constants/images';
import { AuthProvider } from './src/context/AuthContext';

export default function App() {
  const router = useRouter();

  // const handleLoginPress = () => {
  //   router.push('./src/pages/(auth)/SignIn');
  // };

  
  const handleLoginPress = () => {
    router.push('./src/pages/(tabs)/home');
  }
  return (
   
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      {/* Background Image */}
      <AuthProvider>
      <View className="flex-1  items-center  w-full h-full">
    
        <Image 
          source={images.cmanLogo}
        className='max-w-[500px] w-full h-[500px]'
          resizeMode='contain' 
        />
      </View>

      {/* Overlay Content */}
      <View className="flex-1 justify-start items-center px-8 z-10">
        <Text className="text-white text-3xl font-bold mb-4">Welcome to CMAN</Text>
        <CustomButton buttonTitle="Log In" otherStyles="w-5/6" onPress={handleLoginPress} />
      </View>

      <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaView>
   
  );
}
