import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';
import Products from './pages/(tabs)/products';
import SignIn from './pages/(auth)/SignIn';
import SignUp from './pages/(auth)/SignUp';
import addProducts from './pages/products/addProducts';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Products">
          <Stack.Screen name="Products" component={Products} />
          <Stack.Screen name="addProducts" component={addProducts} />
          <Stack.Screen name="SignIn" component={SignIn} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
