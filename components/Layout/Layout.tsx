import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  backgroundColor?: string;
  statusBarColor?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = '',
  statusBarColor = '#061D3F',
  backgroundColor = '#f6f6f1',
}) => {
  return (
    <View style={{ flex: 1, backgroundColor }}>
      <StatusBar style="light" backgroundColor={statusBarColor} />
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }} className={className}>
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Layout;