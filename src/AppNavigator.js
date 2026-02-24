import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import LoginScreen from "./screens/LoginScreen";
import SearchScreen from "./screens/SearchScreen";
import MoviesListScreen from "./screens/MoviesListScreen";
import TvShowsListScreen from "./screens/TvShowsListScreen";
import DetailsScreen from "./screens/DetailsScreen";

import BottomTabs from "./navigation/BottomTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={BottomTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MoviesList" component={MoviesListScreen} />
      <Stack.Screen name="TvShowsList" component={TvShowsListScreen} />

      {/* ✅ FIXED 😏🔥 */}
      <Stack.Screen name="Details" component={DetailsScreen} />

    </Stack.Navigator>
  );
}