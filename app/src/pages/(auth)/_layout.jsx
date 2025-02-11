import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'

const AuthLayout = () => {
  return (
  <>
  <Stack screenOptions={{statusBarHidden:false , headerShown:false }} >
    <Stack.Screen name='SignUp' options={{ statusBarHidden:false,headerShown:false, }} />
    <Stack.Screen name='SignIn' options={{statusBarHidden:true,headerShown:false,}}/>
  </Stack>
  </>
  )
}

export default AuthLayout