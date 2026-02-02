import { View, Text, Pressable } from 'react-native'
import React from 'react'

interface CancelProps{
  text: string;
  handlePress: () => void
}

const CancelBtn:React.FC<CancelProps> = ({text, handlePress}) => {
  return (
    <Pressable onPress={handlePress} className='justify-center mt-3 items-center w-full py-6 ' > 
      <Text className='text-[#989BA6] font-[700] font-aeonikRegular ' >{text}</Text>
    </Pressable>
  )
}

export default CancelBtn