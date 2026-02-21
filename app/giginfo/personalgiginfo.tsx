import DocxIcon from "@/assets/icons/Docx";
import EditIcon from "@/assets/icons/Edit";
import StarIcon from "@/assets/icons/Star";
import BackBtn from "@/components/BackBtn/BackBtn";
import CircularProgress from "@/components/CircularProgress/CircularProgress";
import DeleteProjectModal from "@/components/DeleteProject/DeleteProject";
import Layout from "@/components/Layout/Layout";
import Modal from "@/components/Modal/Modal";
import TeamMemberOptionsModal from "@/components/TeamMemberOptionsModal/TeamMemberOptionsModal";
import WaveGraph from "@/components/WaveGraph/WaveGraph";
import { formatDate } from "@/helpers/formatDate";
import { truncateText } from "@/utils/textLengthFormatter";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { File, Share2, Trash2 } from "lucide-react-native";
import React, { useRef } from "react";
import { Image, Pressable, ScrollView, Share, Text, View } from "react-native";

const personalgiginfo = () => {
  const router = useRouter();

  const { gigInfo } = useLocalSearchParams();
  // Parse and use the client data passed from the previous screen
  const gig = gigInfo ? JSON.parse(gigInfo as string) : null;
  console.log(gig);

  // const teamMembers = [
  //   { id: "1", name: "ME", role: "ME" },
  //   { id: "2", name: "Bob Joel", role: "Designer" },
  //   { id: "3", name: "Charlie", role: "Product Manager" },
  //   { id: "4", name: "Bob Joel", role: "Designer" },
  //   { id: "5", name: "Charlie", role: "Product Manager" },
  // ];

  // Define the ref with the appropriate type
  const optionsRef = useRef<BottomSheetModal>(null);

  //   open loader
  const openModal = () => {
    optionsRef?.current?.present();
  };
  const closeModal = () => {
    optionsRef?.current?.close();
  };

  const deleteRef = useRef<BottomSheetModal>(null);
  const openDeleteModal = () => deleteRef?.current?.present();
  const closeDeleteModal = () => deleteRef?.current?.close();

  // Share functionality
  const handleShareProject = async () => {
    try {
      const shareUrl = `https://yourapp.com/project/${gig?._id}`; // custom url

      const result = await Share.share(
        {
          message: `View project update here: ${gig?.title}\n${shareUrl}`, // Include URL in message
          url: shareUrl, // Still include as URL for apps that support it
          title: gig?.title,
        },
        {
          dialogTitle: "Share Project Link",
          subject: gig?.title + " Project",
        }
      );

      if (result.action === Share.sharedAction) {
        console.log("Project shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing project:", error);
      alert("Failed to share project");
    }
  };

  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-4 pb-14">
          <BackBtn title="Back" />
          <View className="w-full h-[316px] p-4 justify-between bg-white my-10 rounded-[20px] ">
            {/* Graph here */}
            <View className="h-[70%]">
              <View>
                <Text className="font-aeonikRegular text-[#8C91A2] mb-2 ">
                  Gig Amount
                </Text>
                <Text className="font-semiBold text-[#101010] text-[24px]">
                  ${gig?.budget}
                </Text>
              </View>
              <View>
                <WaveGraph />
              </View>
            </View>
            <View className="bg-secondary w-full flex-row justify-between items-center px-4 h-[90px] rounded-[22px]  ">
              <View className="flex-row justify-between items-center">
                <View className="bg-[#E8FBFF] mr-[15px] w-[44px] h-[44px] items-center justify-center rounded-[18px] ">
                  <Image
                    className=" h-[28px] w-[28px] "
                    source={require("../../assets/images/Gumroad.png")}
                  />
                </View>
                <View>
                  <Text className="font-semiBold text-white text-[12px] ">
                    {truncateText(gig?.title, 32)}
                  </Text>
                  <Text className="text-[12px] font-regular text-white ">
                    Deadline: {formatDate(gig.dueDate)}
                  </Text>
                </View>
              </View>
              <View>
                <CircularProgress
                  backgroundColor="bg-secondary"
                  textColor="white"
                  color="white"
                  progress={gig?.progressPercentage}
                />
              </View>
            </View>
          </View>
          <View className="">
            <View className="justify-between items-center flex-row">
              <Text className="font-aeonikRegular text-[13px]  ">
                AMOUNT PAID
              </Text>
              <StarIcon />
            </View>

            <View className="my-4">
              <View className="w-full rounded-[3px] h-[5px] bg-white ">
                <View className="w-[70%] rounded-[3px] h-[5px] bg-primary "></View>
              </View>
            </View>
            {/* <Text className="font-semiBold text-[#050421] text-[12px] ">
              😕 Hurry up, deadline is in 8 days. Abi money no de sweet you?
            </Text> */}
          </View>
          {/* <View className="mt-5">
            <Text className="font-aeonikRegular text-[13px] mb-4  ">
              TEAM MEMBERS
            </Text>

            <FlatList
              data={teamMembers}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              horizontal
              renderItem={({ item }) => (
                <TeamMemberCard
                  openModal={openModal}
                  name={item.name}
                  role={item.role}
                />
              )}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View> */}
          <View className="mt-8">
            <Text className="font-aeonikRegular text-[13px] mb-4  ">
              ACTIONS
            </Text>
            <View className="mt-8">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/giginfo/board",
                    params: {
                      gigInfo: JSON.stringify(gig),
                    },
                  })
                }
                className="flex-row bg-white h-[90px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                {/* Main content container takes full remaining space */}
                <View className="flex-row items-center flex-1">
                  {/* Icon container */}
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center">
                    <DocxIcon />
                  </View>

                  {/* Text container takes the remaining horizontal space */}
                  <View className="flex-1">
                    <Text className="font-semiBold mb-1 text-secondary">
                      Kanban Board
                    </Text>
                    <Text
                      className="font-aeonikRegular text-[12px] text-[#4b6487]"
                      numberOfLines={3} // limits to 2 lines
                      ellipsizeMode="tail" // adds "..." if text overflows
                    >
                      Stay on top of your projects by managing and tracking all
                      your tasks directly on the in-app Kanban board.
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* <Pressable
                onPress={() => router.push("/giginfo/addteam")}
                className="flex-row bg-white h-[70px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center">
                    <AddUserIcon />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semiBold mb-1 text-secondary">
                      Add Team Members
                    </Text>
                    <Text className="font-aeonikRegular text-[12px] text-[#4b6487]">
                      Invite new team members to collaborate on this project.
                    </Text>
                  </View>
                </View>
              </Pressable> */}

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/giginfo/giginformation",
                    params: {
                      gigInfo: JSON.stringify(gig),
                    },
                  })
                }
                className="flex-row bg-white h-[70px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center ">
                    <File fill={"#3B82F6"} size={28} color="#fff" />
                  </View>
                  <View>
                    <Text className="font-semiBold text-secondary mb-2 ">
                      View Project Information
                    </Text>
                    <Text className="font-aeonikRegular text-[12px] text-[#4b6487]">
                      See the details and overview of this project
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/giginfo/progress",
                    params: {
                      gigInfo: JSON.stringify(gig),
                    },
                  })
                }
                className="flex-row bg-white h-[70px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center">
                    <EditIcon />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semiBold text-secondary mb-1">
                      Update Project Progress
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="font-aeonikRegular text-[#4b6487] text-[12px]"
                    >
                      Record and track the latest progress of this project.
                    </Text>
                  </View>
                </View>
              </Pressable>

              {/* <Pressable
                onPress={() => router.push("/giginfo/meetingscheduler")}
                className="flex-row bg-white h-[90px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center ">
                    <Video fill={"#0166F6"} size={22} color="#0166F6" />
                  </View>
                  <View>
                    <Text className="font-semiBold mb-2 text-secondary">
                      Schedule a meeting{" "}
                    </Text>
                    <Text className="font-aeonikRegular text-[12px] w-[60%] text-[#4b6487]">
                      <Text className="text-secondary font-semiBold">
                        Heads up!{" "}
                      </Text>
                      You can set a reminder for meetings or reviews directly
                      via the in-app browser
                    </Text>
                  </View>
                </View>
              </Pressable> */}
              <Pressable
                onPress={handleShareProject}
                className="flex-row bg-white h-[70px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-[#E8FBFF] w-[45px] h-[45px] rounded-[18px] items-center justify-center">
                    <Share2 fill={"#0166F6"} size={22} color="#0166F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semiBold mb-1 text-secondary">
                      Share Project Link
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="font-aeonikRegular text-[12px] text-[#4b6487]"
                    >
                      Share a link with your client so they can view the project
                      progress anytime.
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={openDeleteModal}
                className="flex-row bg-white h-[70px] mb-4 rounded-[22px] p-3 items-center justify-between"
              >
                <View className="flex-row items-center">
                  <View className="mr-4 bg-[#ce1313] w-[45px] h-[45px] rounded-[18px] items-center justify-center">
                    <Trash2 fill="white" size={22} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semiBold mb-1 text-secondary">
                      Delete Project
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className="font-aeonikRegular text-[12px] text-[#4b6487]"
                    >
                      Delete this project to erase all data and content
                      associated with it permanently.
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal loadingRef={optionsRef}>
        <TeamMemberOptionsModal closeModal={closeModal} />
      </Modal>
      <Modal loadingRef={deleteRef}>
        <DeleteProjectModal gig={gig} closeModal={closeDeleteModal} />
      </Modal>
    </Layout>
  );
};

export default personalgiginfo;
