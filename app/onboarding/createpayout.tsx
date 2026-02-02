import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Shield,
  Zap,
  CreditCard,
  CheckCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react-native";
import Layout from "@/components/Layout/Layout";
import BackBtn from "@/components/BackBtn/BackBtn";

type StripeStatus = "not_started" | "pending" | "connected" | "failed";

export default function PayoutSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("not_started");
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check Stripe status on component mount and when returning from Stripe
  useEffect(() => {
    checkStripeStatus();
  }, [params.returnFromStripe]);

  const checkStripeStatus = async () => {
    setCheckingStatus(true);
    try {
      // Call backend to check current Stripe connection status
      const response = await fetch("/api/stripe/account-status");

      if (response.ok) {
        const { status, account } = await response.json();
        setStripeStatus(status);

        // If just returned from Stripe and account is connected, show success
        if (params.returnFromStripe && status === "connected") {
          router.push("/onboarding/payout/success");
        }
      }
    } catch (error) {
      console.error("Error checking Stripe status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Fast Payouts",
      description: "Get paid within 1-2 business days",
    },
    {
      icon: CreditCard,
      title: "Any Bank Account",
      description: "Supports all major banks and credit unions",
    },
    {
      icon: Shield,
      title: "Fully Secure",
      description: "Bank-level security via Stripe",
    },
    {
      icon: CheckCircle,
      title: "Required Feature",
      description: "Needed for invoices and payment links",
    },
  ];

  const handleStripeConnect = async () => {
    setLoading(true);
    try {
      // Call backend to create Stripe Express account link
      const response = await fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create Stripe account link");
      }

      const { url } = await response.json();

      // Redirect to Stripe onboarding
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        // Set status to pending while user is at Stripe
        setStripeStatus("pending");
      } else {
        throw new Error("Cannot open Stripe URL");
      }
    } catch (error) {
      console.error("Stripe connection error:", error);
      setStripeStatus("failed");
      Alert.alert(
        "Connection Failed",
        "Unable to connect to Stripe. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  //   const handleSkipForNow = () => {
  //     Alert.alert(
  //       "Payout Setup Required",
  //       "You'll need to set up payouts to receive payments. You can do this later in settings.",
  //       [
  //         { text: "Stay Here", style: "cancel" },
  //         {
  //           text: "Skip for Now",
  //           onPress: () => router.push("/onboarding/complete"),
  //           style: "default",
  //         },
  //       ]
  //     );
  //   };

  const handleSkipForNow = () => {
    // Get all params from previous screens
    const allParams = {
      ...params, // from profile screen
      stripeConnected: true,
    };

    router.push({
      pathname: "/onboarding/complete",
      params: allParams,
    });
  };

  const StatusIndicator = () => {
    const statusConfig = {
      not_started: {
        color: "gray",
        bgColor: "gray-100",
        textColor: "gray-600",
        label: "Not Started",
        icon: AlertCircle,
      },
      pending: {
        color: "amber",
        bgColor: "amber-100",
        textColor: "amber-700",
        label: "In Progress",
        icon: AlertCircle,
      },
      connected: {
        color: "green",
        bgColor: "green-100",
        textColor: "green-700",
        label: "Connected",
        icon: CheckCircle,
      },
      failed: {
        color: "red",
        bgColor: "red-100",
        textColor: "red-700",
        label: "Failed",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[stripeStatus];
    const IconComponent = config.icon;

    return (
      <View className="flex-row items-center justify-center mb-6">
        <View
          className={`flex-row items-center px-4 py-2 rounded-full bg-${config.bgColor}`}
        >
          <IconComponent size={16} color={config.color} className="mr-2" />
          <Text className={`text-sm font-semiBold text-${config.textColor}`}>
            {config.label}
          </Text>
        </View>
      </View>
    );
  };

  const getButtonText = () => {
    switch (stripeStatus) {
      case "pending":
        return "Continue Setup with Stripe";
      case "failed":
        return "Try Again with Stripe";
      default:
        return "Connect with Stripe";
    }
  };

  if (checkingStatus) {
    return (
      <Layout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-lg text-gray-600 mt-4 font-regular">
            Checking your account status...
          </Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <View className="flex-1 ">
        {/* Header */}
        <View className="pt-4 pb-4 border-b border-gray-200">
          <BackBtn title="Payout Setup" />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Main Content */}
          <View className="">
            <View className="flex-row justify-between items-center my-4">
              <Text className="text-base font-semiBold text-gray-900">
                Payout Info
              </Text>
              <Text className="text-sm text-gray-500 font-regular">
                Step 2 of 3
              </Text>
            </View>
            {/* Title Section */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-blue-100 rounded-2xl items-center justify-center mb-4">
                <CreditCard size={32} color="#0166F6" />
              </View>
              <Text className="text-2xl font-textBold text-gray-900 text-center mb-3">
                Set Up Your Payout Account
              </Text>
              <Text className="text-base text-gray-600 font-regular text-center leading-6">
                Securely connect your Stripe Express account to receive payments
                directly to your bank account.
              </Text>
            </View>

            {/* Status Indicator */}
            <StatusIndicator />

            {/* Show different content based on status */}
            {stripeStatus === "pending" && (
              <View className="bg-amber-50 rounded-[12px] p-4 mb-6 border border-amber-200">
                <Text className="text-sm text-amber-800 font-regular leading-5">
                  ⚡ <Text className="font-semiBold">Setup in progress:</Text>{" "}
                  You started connecting your Stripe account. Tap the button
                  below to continue where you left off.
                </Text>
              </View>
            )}

            {stripeStatus === "failed" && (
              <View className="bg-red-50 rounded-[12px] p-4 mb-6 border border-red-200">
                <Text className="text-sm text-red-800 font-regular leading-5">
                  ❌ <Text className="font-semiBold">Connection failed:</Text>{" "}
                  There was an issue connecting to Stripe. Please try again.
                </Text>
              </View>
            )}

            {/* Benefits Grid - Only show if not connected */}
            {stripeStatus !== "connected" && (
              <View className="mb-5">
                <Text className="text-lg font-semiBold text-gray-900 mb-4">
                  Why connect Stripe?
                </Text>
                <View className="space-y-5 ">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <View
                        key={index}
                        className="flex-row items-start bg-gray-50 rounded-[12px] p-4"
                      >
                        <View className="w-10 h-10 bg-white rounded-lg items-center justify-center mr-3 shadow-sm">
                          <IconComponent size={20} color="#0166F6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semiBold text-gray-900 mb-1">
                            {benefit.title}
                          </Text>
                          <Text className="text-sm text-gray-600 font-regular">
                            {benefit.description}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Important Note */}
            <View className="bg-blue-50 rounded-[12px] p-4 mb-6 border border-blue-200">
              <Text className="text-sm text-blue-800 font-regular leading-5">
                💡 <Text className="font-semiBold">Important:</Text> This app
                doesn't hold your money. Your client pays directly to your
                connected Stripe account, which then transfers to your bank.
              </Text>
            </View>

            {/* Footer Actions */}
            <View className="pt-4 pb-6 border-t border-gray-200 ">
              {/* Connect Button - Only show if not connected */}
              {stripeStatus !== "connected" && (
                <>
                  <TouchableOpacity
                    className={`rounded-[12px] py-4 items-center mb-3 ${
                      loading ? "bg-primary" : "bg-primary"
                    }`}
                    onPress={handleStripeConnect}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <View className="flex-row items-center">
                        <Text className="text-white font-semiBold text-base mr-2">
                          {getButtonText()}
                        </Text>
                        <ExternalLink size={18} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Redirect Notice */}
                  <Text className="text-xs text-gray-500 text-center font-regular mb-4">
                    You will be redirected to Stripe to complete setup
                  </Text>
                </>
              )}

              {/* Skip Option - Only show if not connected */}
              {stripeStatus !== "connected" && (
                <TouchableOpacity onPress={handleSkipForNow} disabled={loading}>
                  <Text className="text-gray-500 font-regular text-center text-base">
                    Skip for now
                  </Text>
                </TouchableOpacity>
              )}

              {/* Show different message if already connected */}
              {stripeStatus === "connected" && (
                <TouchableOpacity
                  className="bg-green-600 rounded-[12px] py-4 items-center mb-3"
                  onPress={() => router.push("/onboarding/payoutsuccess")}
                >
                  <Text className="text-white font-semiBold text-base">
                    Continue to Dashboard
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}
