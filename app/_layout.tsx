import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Slot ,Stack} from 'expo-router';
import { Header } from 'react-native/Libraries/NewAppScreen';
import {useFonts} from 'expo-font';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';
// import {AuthProvider} from './src/context/AuthContext';
import "../global.css";

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  
  useEffect(() => {
    if (error) throw error;
  
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded && !error) {
    return null;
  }
  return (

    // <AuthProvider>
        <Stack>
            <Stack.Screen name='index' options={{headerShown:false}}/>
           
        </Stack>
    // </AuthProvider>

  )
}

export default RootLayout

