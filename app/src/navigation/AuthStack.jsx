import { View, Text } from 'react-native'
import React from 'react'
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import{SignIn} from '../pages/(auth)/SignIn';
import{SignUp} from '../pages/(auth)/SignIn';


const Stack=createNativeStackNavigator();


const AuthStack = () => {
  return (
   <Stack.Navigator>
    <Stack.Screen name='OnboardingScreen' component={SignIn}/>
    <Stack.Screen name='Login' component={SignIn}/>
    <Stack.Screen name='Register' component={SignUp}/>
   </Stack.Navigator>
  )
}

export default AuthStack