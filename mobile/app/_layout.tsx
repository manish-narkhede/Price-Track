import {Tabs} from "expo-router";
import React, {useEffect, useState} from "react";
import {AuthProvider} from "../src/context/AuthContext";
import AppSplashScreen from "../src/components/AppSplashScreen";

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <AppSplashScreen />;
  }

  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2563eb",
          tabBarStyle: {paddingBottom: 4},
          headerStyle: {backgroundColor: "#2563eb"},
          headerTintColor: "#fff",
          headerTitleStyle: {fontWeight: "bold"},
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "PriceTrack",
            tabBarLabel: "Search",
            tabBarIcon: ({color}) => <TabIcon symbol="🔍" color={color} />,
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Tracked Products",
            tabBarLabel: "Dashboard",
            tabBarIcon: ({color}) => <TabIcon symbol="📦" color={color} />,
          }}
        />
        <Tabs.Screen
          name="product/[productId]"
          options={{
            title: "Product",
            href: null, // hidden from tab bar
          }}
        />
        <Tabs.Screen
          name="auth"
          options={{
            title: "Sign In",
            tabBarLabel: "Account",
            tabBarIcon: ({color}) => <TabIcon symbol="👤" color={color} />,
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}

function TabIcon({symbol}: {symbol: string; color: string}) {
  const {Text} = require("react-native");
  return <Text style={{fontSize: 18}}>{symbol}</Text>;
}
