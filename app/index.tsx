import GoogleAuthButton from "@/components/GoogleBtn/GoogleBtn";
import Layout from "@/components/Layout/Layout";
import { Image, Text, View } from "react-native";

const Index = () => {
  // const handleSubmit = () => {
  //   router.push("/auth/login");
  // };

  return (
    <Layout>
      <View className="h-full py-12 flex-col justify-between">
        <View>
          <Image source={require("../assets/images/smallLivestorm.png")} />
          <View className="mt-8">
            <Text className="font-regular leading-[60px] text-[48px] ">
              Let's help you
              <Text className="text-primary font-textBold "> manage </Text>your
              freelance projects
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <GoogleAuthButton />
        </View>
      </View>
    </Layout>
  );
};

export default Index;
