import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const inbox = () => {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
    <View >
      <Text> inbox </Text>
      <Link href="../products/addProducts"> go to create product</Link>
    </View>
    </SafeAreaView>
  )
}

export default inbox