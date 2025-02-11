import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';

const CustomTextInput = ({ label, multiline = false, value, onChangeText,keyboardType }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      label={label}
      mode="flat"
      textColor="white"
      outlineColor="purple"
      keyboardType={keyboardType}
      style={{
        marginBottom: 10,
        backgroundColor: 'black',
        borderBottomColor: isFocused ? 'purple' : 'white',
        borderBottomWidth: 1,
        shadowColor: isFocused ? 'purple' : 'white',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10
      }}
      theme={{ colors: { primary: 'purple', text: 'white', placeholder: 'white', label: 'white' } }}
      multiline={multiline}
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

export default CustomTextInput;
