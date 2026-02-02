import { View, Text, Pressable, ScrollView, Image } from "react-native";
import React, { useRef } from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
import PrimaryBtn from "@/components/PrimaryBtn/PrimaryBtn";
import CancelBtn from "@/components/CancelBtn/CancelBtn";
import { StatusBar } from "expo-status-bar";
import UploadIcon from "@/assets/icons/Upload";
import Modal from "@/components/Modal/Modal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SavedSuccess from "@/components/SavedSuccess/SavedSuccess";
import CancelGigModal from "@/components/CancelGigModal/CancelGigModal";

const gigsummary = () => {
  const router = useRouter();

  // Define the ref with the appropriate type
  const savedRef = useRef<BottomSheetModal>(null);

  //   open loader
  const openModal = () => {
    savedRef?.current?.present();
  };
  const closeModal = () => {
    savedRef?.current?.close();
  };

  // CANCEL GIG
  const closeRef = useRef<BottomSheetModal>(null);
  const openCancelGigModal = () => {
    closeRef?.current?.present();
  };
  const closeCancelGigModal = () => {
    closeRef?.current?.close();
  };

  // const doSomthing = () => {

  // }

  return (
    <ScrollView
      contentContainerClassName="justify-between"
      showsVerticalScrollIndicator={false}
    >
      <View className=" h-full justify-between ">
        <View className="px-4 pt-7 h-[500px] w-full bg-secondary">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <View className="bg-white mr-2 h-[35px] w-[35px] items-center justify-center rounded-full ">
              <AntDesign name="left" size={22} color="black" />
            </View>
          </Pressable>
          <View className="mt-10">
            <Text className="text-white text-[24px] font-regular font-[600] ">
              Hi, Kathy
            </Text>
            <Text className="text-white mt-3 text-[14px] font-aeonikRegular leading-5 ">
              Preview your details below, we also prepared an invoice for you to
              send your client. Awesome, right? 😎
            </Text>
          </View>
          <View className="mt-10 ">
            <Text className="font-[700] font-aeonikBold text-[12px] text-white">
              GIG AMOUNT
            </Text>
            <Text className="text-[#5CC95A] text-[40px] font-textBold mt-3 ">
              ₦400,000
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/previewinvoice/preview")}
            className="border-y-2 border-white h-[70px] flex-row items-center justify-between py-2 mt-8"
          >
            <Text className="text-white text-[16px] font-aeonikRegular ">
              Preview invoice
            </Text>
            <AntDesign name="right" size={22} color="white" />
          </Pressable>
          {/* <Pressable className=" h-[70px] flex-row items-center justify-between py-2 mt-3">
            <Text className="text-white text-[16px] font-aeonikRegular ">
              Send invoice
            </Text>
            <UploadIcon />
          </Pressable> */}
        </View>
        <View className="bg-[#F6F6F1] pt-10 px-4">
          <Text className="text-[#989BA6]">GIG DETAILS</Text>
          <View className="w-full rounded-[10px] p-5 my-5 bg-white">
            <View className="flex-row items-center pb-3 border-b-2 border-[#d9d9d9]">
              <View className="bg-[#E8FBFF] items-center mr-6 justify-center h-[45px] w-[45px] rounded-[10px] ">
                <Image
                  source={require("../../assets/images/Clearbit.png")}
                  className="w-[30px] h-[30px] "
                />
              </View>
              <View>
                <Text className="font-aeonikRegular text-[15px] font-[500] mb-1 ">
                  Develop Streaming Platform
                </Text>
                <Text className="text-primary font-aeonikRegular text-[14px]">
                  Fashola Gabriel
                </Text>
              </View>
            </View>
            <View className="my-4 flex-row justify-between items-center ">
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Start Date
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  January 20, 2023
                </Text>
              </View>
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Stop Date
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  May 20, 2023
                </Text>
              </View>
            </View>
            <View className="my-4 flex-row justify-between items-center ">
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Gig Type
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  Frontend Development
                </Text>
              </View>
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Gig Category
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  Personal Gig
                </Text>
              </View>
            </View>
          </View>
          <View className="w-full rounded-[10px] p-5 my-5 bg-white">
            <View className="flex-row items-center pb-3 border-b-2 border-[#d9d9d9]">
              <View className="bg-[#E8FBFF] items-center mr-6 justify-center h-[50px] w-[50px] rounded-[10px] ">
                <Text className="text-[30px] font-[600] ">₦</Text>
              </View>
              <View>
                <Text className="font-aeonikRegular text-[15px] font-[500] mb-1 ">
                  Gig Financial Details
                </Text>
                <Text className="text-primary font-aeonikRegular text-[14px]">
                  Amount info
                </Text>
              </View>
            </View>
            <View className="my-4 flex-row justify-between items-center ">
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Total Amount
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  ₦400,000
                </Text>
              </View>
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Starting Amount
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  ₦250,000
                </Text>
              </View>
            </View>
            <View className="my-4 flex-row justify-between items-center ">
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Balance
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  ₦150,000
                </Text>
              </View>
              <View>
                <Text className="text-[#8C8CA9] text-[12px] font-aeonikRegular">
                  Payment Type
                </Text>
                <Text className="text-secondary text-[14px] font-aeonikRegular mt-2 ">
                  Milestone
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full px-4 mt-4">
          <PrimaryBtn text="SAVE GIG DETAILS" handlePress={() => openModal()} />
          <CancelBtn
            handlePress={() => openCancelGigModal()}
            text="CANCEL GIG"
          />
        </View>
        <StatusBar
          backgroundColor="#061D3F"
          translucent={false}
          style="light"
        />
        <Modal loadingRef={savedRef}>
          <SavedSuccess closeModal={closeModal} />
        </Modal>

        <Modal loadingRef={closeRef}>
          <CancelGigModal closeModal={closeCancelGigModal} />
        </Modal>
      </View>
    </ScrollView>
  );
};

export default gigsummary;
