import { queryClient } from "@/utils/react_query";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  useEffect(() => {
    if (Platform.OS === "android") {
      // Set Android navigation bar color
      SystemUI.setBackgroundColorAsync("#061D3F"); // Your primary color
      // SystemUI.setBackgroundColorAsync("#000");
    }
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          regular: require("../assets/fonts/ClashDisplay-Regular.otf"),
          bold: require("../assets/fonts/ClashDisplay-Bold.otf"),
          semiBold: require("../assets/fonts/ClashDisplay-Semibold.otf"),
          aeonikRegular: require("../assets/fonts/AeonikTRIAL-Regular.otf"),
          aeonikBold: require("../assets/fonts/AeonikTRIAL-Bold.otf"),
          // 'whiteInkBold': ('../assets/fonts/WhyteInktrap-Bold.ttf'),
        });
      } catch (error) {
        console.error("Error loading fonts:", error);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync(); // Hide the splash screen here
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <SafeAreaView> */}
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="signout" options={{ animation: "none" }} />
              <Stack.Screen name="onboarding/createprofile" />
              <Stack.Screen name="onboarding/createpayout" />
              <Stack.Screen name="onboarding/payoutsuccess" />
              <Stack.Screen name="onboarding/complete" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="new/gigname" />
              <Stack.Screen name="new/summary" />
              <Stack.Screen name="personalgigs/personal" />
              <Stack.Screen name="groupgigs/group" />
              <Stack.Screen name="giginfo/personalgiginfo" />
              <Stack.Screen name="giginfo/board" />
              <Stack.Screen name="giginfo/progress" />
              <Stack.Screen name="giginfo/meetingscheduler" />
              <Stack.Screen name="giginfo/addteam" />
              <Stack.Screen name="giginfo/editgig" />
              <Stack.Screen name="giginfo/editteam" />
              <Stack.Screen name="giginfo/giginformation" />
              <Stack.Screen name="userprofile/clients" />
              <Stack.Screen name="userprofile/client/[id]" />
              <Stack.Screen name="userprofile/client/new" />
              <Stack.Screen name="userprofile/client/edit" />
              <Stack.Screen name="userprofile/invoices" />
              <Stack.Screen name="userprofile/invoice/new" />
              <Stack.Screen name="userprofile/invoice/[id]" />
              {/* <Stack.Screen name="userprofile/edit" /> */}
              <Stack.Screen name="userprofile/bank" />
              <Stack.Screen name="userprofile/analytics" />
              <Stack.Screen name="notification/notification" />
              <Stack.Screen name="previewinvoice/preview" />
            </Stack>
          </BottomSheetModalProvider>
        </QueryClientProvider>
        {/* </SafeAreaView> */}
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
