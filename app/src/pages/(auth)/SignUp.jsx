import React, { useState } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import CustomButton from '../../components/customButton';
import Form from '../../components/formField';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
// import { create } from 'react-test-renderer';

const SignUp = () => {
  const [Email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    createUserWithEmailAndPassword(auth, Email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('User signed up:', user);
        // You can navigate to another screen or show a success message here
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error signing up:', errorCode, errorMessage);
        // Handle errors here (e.g., show an alert)
      });
    };
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black p-5">
     
      {/* Header Section */}      
      <View className="items-center mb-8">
        <Text className="text-white text-5xl font-fregular mb-4">Sign Up</Text>
        <Text className="text-white font-pextrabold text-xs mb-4">
          Already a member?{' '}
          <Link href="./SignIn" className="text-vansayaPurple underline">
            Log In
          </Link>
        </Text>
      </View>

      {/* Form Section */}
      <View className="w-5/6">
        <Form
          title="Email"
          value={Email}
          placeholder=""
          handleChangeText={setEmail}
          keyboardType="email-address"
        />
        <Form
          title="Password"
          value={password}
          placeholder=""
          handleChangeText={setPassword}
        />
      </View>

      {/* Submit Button */}
      <CustomButton buttonTitle="Sign Up" otherStyles="w-5/6" />
    </SafeAreaView>
  );
};

export default SignUp;
