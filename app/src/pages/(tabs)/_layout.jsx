import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { icons } from "../../constants";
import { AuthProvider } from "../../context/AuthContext";

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="flex-1 items-center justify-center w-14">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6 mt-3"
      />
      <Text
        className={`${focused ? "font-pregular mb-2 " : "font-pregular"} text-xs text-center`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  return (
    <AuthProvider>
      <>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "purple",
            tabBarInactiveTintColor: "#CDCDE0",
            tabBarHideOnKeyboard: true,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: "black",
              borderTopWidth: 2,
              borderTopColor: "black",
              height: 60,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.home}
                  color={color}
                  name="Home"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="inbox"
            options={{
              title: "Inbox",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.inboxIcon}
                  color={color}
                  name="Inbox"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: "Orders",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.orderIcon}
                  color={color}
                  name="Orders"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="products"
            options={{
              title: "Products",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.productIcon}
                  color={color}
                  name="Products"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Analytics",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.analyticsIcon}
                  color={color}
                  name="Analytics"
                  focused={focused}
                />
              ),
            }}
          />
        </Tabs>
        <StatusBar backgroundColor="#161622" style="light" />
      </>
    </AuthProvider>
  );
};

export default TabLayout;