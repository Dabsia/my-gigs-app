import { View, Text, Image } from 'react-native'
import React from 'react'

const PhotoCard = () => {
  return (
    <View className='flex-row justify-between' >
        <View className='h-[47px] w-[47px] rounded-[100%] bg-[#F4CE9B] justify-center items-center' >
            <Image className=' h-[42px] w-[42px] ' source={require('../../assets/images/profilePic.png')} />
        </View>
    </View>
  )
}

export default PhotoCard