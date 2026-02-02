import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import EyeIcon from "@/assets/icons/Eye";
import UnionIcon from "@/assets/icons/Union";
import RightArrowIcon from "@/assets/icons/RightArrow";
import UserIcon from "@/assets/icons/User";
import { useRouter } from "expo-router";
import Layout from "@/components/Layout/Layout";

const Gigs = () => {
  const router = useRouter();

  const [isTrue, setIsTrue] = useState(false);

  const toggleBal = () => {
    setIsTrue(!isTrue);
  };

  return (
    <Layout>
      <View className="pt-4">
        <Text className="font-semiBold  text-[#989BA6] text-[24px] ">
          Create Gig
        </Text>
        <View className="mt-10">
          <Text className="text-[#989BA6] font-semiBold ">
            {" "}
            Choose Project Type
          </Text>
        </View>
        <View className="mt-6">
          <Pressable
            onPress={() => router.push("/personalgigs/personal")}
            className="bg-white w-full flex-row px-4 items-center justify-between h-[103px] rounded-[22px]  "
          >
            <View className="flex-row items-center">
              <View className="bg-[#E8FBFF] mr-[25px] w-[44px] h-[44px] items-center justify-center rounded-[18px] ">
                <UserIcon color="#0166F6" />
              </View>
              <View>
                <Text className="text-black font-textBold text-[16px] ">
                  Personal Project
                </Text>
                <Text className="text-black font-regular text-[12px]">
                  Work on a project alone
                </Text>
              </View>
            </View>
            <RightArrowIcon color="#000" />
          </Pressable>
          {/* <Pressable
            onPress={() => router.push("/groupgigs/group")}
            className="bg-secondary w-full mt-6 flex-row px-4 items-center justify-between h-[103px] rounded-[22px]  "
          >
            <View className="flex-row items-center">
              <View className="bg-[#E8FBFF] mr-[25px] w-[44px] h-[44px] items-center justify-center rounded-[18px] ">
                <UnionIcon />
              </View>
              <View>
                <Text className="text-white font-textBold text-[16px] ">
                  Group Project
                </Text>
                <Text className="text-white font-regular text-[12px]">
                  Collaborate with a team
                </Text>
              </View>
            </View>
            <RightArrowIcon color="#F2F2F2" />
          </Pressable> */}
        </View>
      </View>
    </Layout>
  );
};

export default Gigs;
