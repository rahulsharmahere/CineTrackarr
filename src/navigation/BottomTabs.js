import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";

import DashboardScreen from "../screens/DashboardScreen";
import MoviesListScreen from "../screens/MoviesListScreen";
import TvShowsListScreen from "../screens/TvShowsListScreen";
import SettingsScreen from "../screens/SettingsScreen";
import TrendingScreen from "../screens/TrendingScreen";


const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#111",
        },
        tabBarActiveTintColor: "#06dd06",
        tabBarInactiveTintColor: "#777",
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Trending") iconName = "flame";
          else if (route.name === "Movies") iconName = "film";
          else if (route.name === "TV Shows") iconName = "tv";
          else if (route.name === "Settings") iconName = "settings";

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Movies" component={MoviesListScreen} />
      <Tab.Screen name="TV Shows" component={TvShowsListScreen} />
      <Tab.Screen name="Trending" component={TrendingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}