import { View, Text, Pressable } from 'react-native'
import React from 'react'
import TagIcon from '@/assets/icons/Tag'

const SavedSuccess = ({closeModal}: {closeModal: ()=> void}) => {
  return (
    <View className='items-center p-3'  >
        <TagIcon/>
      <Text className='my-4 text-black w-[80%] text-center text-[20px] font-textBold ' >Awesome</Text>
        <View className='w-full justify-center my-6 items-center' >
      <Text className='font-aoenikRegular text-center text-[15px] text-[#4B4B4C]  ' >Your gig details for <Text className='font-aeonikBold text-secondary' >Develop Streaming Platform</Text> was saved successfully</Text>
        </View>
      <Pressable onPress={closeModal} ><Text className='text-[15px] font-aeonikBold text-primary ' >DONE</Text></Pressable>
    </View>
  )
}

export default SavedSuccess