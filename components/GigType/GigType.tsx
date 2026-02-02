import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

interface GigTypeInterface {
    gigtype:string,
    bgColor:string,
    img:any
}

const GigType = ({ item }: { item: GigTypeInterface }) => {
  const router = useRouter()
    const {gigtype, img, bgColor} = item

    const navigate = () => {
      router.push('/new/gigname')
      console.log(gigtype)
    }
    
  return (
    <TouchableOpacity
    onPress={navigate}
     className='bg-white w-[48%] h-[100px] mb-4 rounded-[18px] p-5' >
        <View
        style = {{backgroundColor: bgColor}}
         className='bg-[#EE9F350D] h-[31px] w-[31px] items-center mb-4 justify-center rounded-[12.33px] ' >
            <Image resizeMode='contain' source={img} />
        </View>
      <Text className='font-[500] text-[12px]' >{gigtype}</Text>
    </TouchableOpacity>
  )
}

export default GigType