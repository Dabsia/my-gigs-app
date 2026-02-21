import GoogleAuthButton from "@/components/GoogleBtn/GoogleBtn";
import Layout from "@/components/Layout/Layout";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";

const Index = () => {
  const router = useRouter();
  // const handleSubmit = () => {
  //   router.push("/auth/login");
  // };

  const { isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    // Only send signed-in users to tabs. When coming from logout, isSignedIn becomes false so we stay on this landing page.
    if (isLoaded && isSignedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn]);

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
