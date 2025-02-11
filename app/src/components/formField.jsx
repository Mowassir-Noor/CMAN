import { View, Text, TextInput, TouchableOpacity ,Image} from 'react-native';
import React, { useState } from 'react';

import { icons } from '@/constants'; 

const Form = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  keyboardType,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className='font-psemibold color-white'>{title}</Text>
      
      <TextInput
        className={`h-12  rounded px-3 mb-4 text-white  w-full ${
         isFocused ? 'border-b-2 border-vansayaPurple shadow-[0_0_15px_rgba(225,31,254,0.6)]' : 'border-b-2 border-white'
        }`}

        value={value}
        placeholder={placeholder}
        placeholderTextColor="#ccc"
        onChangeText={handleChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={title === 'Password' && !showPassword} 
        keyboardType={keyboardType}
        {...props}
      />

   
      {title === 'Password' && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-5 top-9"
        >
          
        <Image source={showPassword ? icons.OpenEye : icons.ClosedEye} className='w-8 h-8 ' resizeMode='contain' tintColor={"#e11ffe"}/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Form;
