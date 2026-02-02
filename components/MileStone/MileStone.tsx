import CalendarIcon from "@/assets/icons/Calendar"
import { Text, TextInput, View } from "react-native"

interface MileStoneInterface {
    description: string;
    dueDate: string;
    amount: string;
  }

interface MilestoneProps {
    index: number;
    milestone: MileStoneInterface;
    handleChange: (index: number, field: keyof MileStoneInterface, value: string) => void;
  }
  
  const Milestone: React.FC<MilestoneProps> = ({ index, milestone, handleChange }) => {
    return (
      <View>
        <TextInput
          onChangeText={(text) => handleChange(index, 'description', text)}
          value={milestone.description}
          className="border-b-2 font-aeonikRegular border-b-primary mt-6"
          placeholder={`Description ${index + 1}`}
        />
        <View className="mt-8 flex-row justify-between">
          <View className="w-[47%] border-b-2 border-b-primary ">
            <Text>Due Date</Text>
            <View className="flex-row  items-center">
              <CalendarIcon />
              <TextInput
                onChangeText={(text) => handleChange(index, 'dueDate', text)}
                value={milestone.dueDate}
                className=" self-center ml-1 font-aeonikRegular w-full "
                placeholder=""
              />
            </View>
          </View>
          <View className="w-[45%] border-b-2  border-b-primary">
            <Text>Amount</Text>
            <View className="flex-row items-center">
              <Text className='font-[600] text-[15px] ' >₦</Text>
              <TextInput
                onChangeText={(text) => handleChange(index, 'amount', text)}
                value={milestone.amount}
                className="self-center ml-1 font-aeonikRegular w-full "
                placeholder=""
              />
            </View>
          </View>
        </View>
      </View>
    )
}

export default Milestone