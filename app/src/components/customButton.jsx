import { View, Text } from 'react-native'
import React from 'react'
import { Button } from 'react-native'

const CustomButton = ({buttonTitle,otherStyles,...props}) => {
  return (
    <View className={`py-8 ${otherStyles} `}>
        <Button
        title={buttonTitle}
        color='#e11ffe'
        accessibilityLabel='learn more'
        className='w-full'

        {...props}/>
      
    </View>
  )
}

export default CustomButton