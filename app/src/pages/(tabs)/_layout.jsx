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
        className="w-6 h-6 mt-7"
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
      < >
        <Tabs

       
          screenOptions={{
            tabBarActiveTintColor: "#F9A826",
            tabBarInactiveTintColor: "#CDCDE0",
            tabBarHideOnKeyboard: true,
            tabBarShowLabel: false,
            tabBarStyle: {
              justifyContent: "space-between",
              // alignItems: "center",
              alignContent: "center",
              // backgroundColor: "#111827",
              backgroundColor: "black",
              
              borderTopWidth: 2,
              borderColor:"white",
              
              height: 60,
              
            },
          
          } }
       
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
            name="location"
            options={{
              title: "location",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.mapIcon}
                  color={color}
                  name="Location"
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
                  name="devices"
                  focused={focused}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="analytics"
            options={{
              title: "Weather",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  icon={icons.weatherIcon}
                  color={color}
                name="Weather"
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