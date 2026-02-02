import { View, Text, Image, Pressable } from 'react-native'
import React, {useState} from 'react'
import EyeIcon from '@/assets/icons/Eye'

const GigBalanceContainer = () => {

  const [isTrue, setIsTrue] = useState(false)

  const toggleBal = () => {
    setIsTrue(!isTrue)
  }

  return (
    <View className='mt-[18px] justify-center items-center w-full h-[170px] bg-primary rounded-[20px] ' >
      <View className='mt-12 w-[80%]' >
        <View className='flex-row w-full mb-5 justify-between items-center' >
            <Text className='text-[16px] font-textBold text-white ' >Gig Balance</Text>
            <Image className=' h-[42px] w-[42px] ' source={require('../../assets/images/66.png')} />
        </View>
        <View className='w-full bg-white flex-row items-center justify-center rounded-t-[20px] h-[70px]' > 
            <View className='flex-row mr-4 items-center' >
              <Text className='mr-2 font-semiBold text-[#989BA6] text-[16px] ' >Amount |</Text>
              {isTrue ? <Text className='font-textBold text-[18px]' >₦ -----</Text> :
              <Text className='font-textBold text-[18px]' >₦3,250,000</Text>}
            </View>
            <Pressable onPress={toggleBal} >
              <EyeIcon/>
            </Pressable>
        </View>
      </View>
    </View>
  )
}

export default GigBalanceContainer