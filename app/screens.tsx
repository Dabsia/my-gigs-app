import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import React from "react";

const Screens = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding/createprofile" />
      <Stack.Screen name="onboarding/createpayout" />
      <Stack.Screen name="onboarding/payoutsuccess" />
      <Stack.Screen name="onboarding/complete" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
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
  );
};

export default Screens;
