import React from "react";
import { Image, Text, View } from "react-native";

const Loader = () => {
  return (
    <View className="pt-3">
      <Text className="font-regular text-center text-[20px] font-800 text-black ">
        Loading Preview
      </Text>
      <Image
        source={{
          uri: "https://s3-alpha-sig.figma.com/img/e032/af25/170c30e2eae31e7f15d6547143247f5b?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=PSp1sEIWz9SZxCppxqO-RCYolPE5~fLZl39sTl0zDbETS15GJXf-oPC1i5c0JNx1CoEHhA~EqkmXt9WS3WmqpwC1VPmKV4PScH8kN4PcMYgZRrMTvOnYsGH4XODFuH0KbcX2~8dYTRXQXrpwu7Z8chZrjTsg437CBABesOy39~eE52~TSfShC5jDiMbB70~TsQZmgQ-0-Okm8Yh4CPtu-v3n9KrYo6muhHiOmTX83W-R2~YVc4fBkFOjY3icEKC0HG-Nt9Zlwhx5Q7eYWb1u6nymWJNEBt1Xm-D0ylZ~j1ItVVXSYpeEYQyGFKQqsTaYtB3FuN1nL6FQkkT53Okepw__",
        }}
        style={{ width: 175, height: 175 }}
      />
      <Text className="text-center font-aeonikRegular text-[14px] font-[500] ">
        Please wait
      </Text>
    </View>
  );
};

export default Loader;
