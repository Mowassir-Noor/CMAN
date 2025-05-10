import { View, Text } from 'react-native'
import React from 'react'
import { Button } from 'react-native'
// import * as Location from 'expo-location'
// import sendLocationToBackend from '../../utils/location/locationFunc'
import getClientLocation from '../../utils/location/locationFunc'
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry'
const home = () => {
  const sendlocation = () => {
    getClientLocation()
      .then((res) => {
        console.log('location', res)
        // sendLocationToBackend(res)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }
  return (
    <View>
      <Text>home</Text>
      <Button title='hello' onPress={sendlocation}></Button>
    </View>
  )
}

export default home