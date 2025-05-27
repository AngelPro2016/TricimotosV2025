import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

import { icons } from "@/constants";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`items-center justify-center ${focused ? "bg-white rounded-full p-[0px]" : ""}`}
    style={{
      elevation: focused ? 6 : 0,
      shadowColor: focused ? "#000" : "transparent",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    }}
  >
    <View
      className={`rounded-full items-center justify-center ${
        focused ? "bg-green-500 w-14 h-14" : "w-10 h-10"
      }`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className={focused ? "w-7 h-7" : "w-5 h-5"}
      />
    </View>
  </View>
);


export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
  backgroundColor: "#2e2e2ecc",
  borderRadius: 40,
  paddingBottom: 10,
  paddingTop: 10,
  marginHorizontal: 20,
  marginBottom: 20,
  height: 63,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 10,
  position: "absolute",
  borderWidth: 1,
  borderColor: "#4caf50",
},

      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="EsperandoResScreen"
        options={{
          title: "EsperandoResScreen",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.map} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="RidesScreen"
        options={{
          title: "RidesScreen",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.pin} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
