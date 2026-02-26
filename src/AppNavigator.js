import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EncryptedStorage from "react-native-encrypted-storage";

import LoginScreen from "./screens/LoginScreen";
import SearchScreen from "./screens/SearchScreen";
import MoviesListScreen from "./screens/MoviesListScreen";
import TvShowsListScreen from "./screens/TvShowsListScreen";
import DetailsScreen from "./screens/DetailsScreen";

import BottomTabs from "./navigation/BottomTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {

  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("🚀 App Boot Check");

        const creds = await EncryptedStorage.getItem("cineTrackarrCreds");

        if (creds) {
          console.log("✅ Credentials Found → Dashboard");
          setInitialRoute("Dashboard");
        } else {
          console.log("❌ No Credentials → Login");
          setInitialRoute("Login");
        }

      } catch (err) {

        console.log("❌ Boot Error:", err);
        setInitialRoute("Login");

      }
    })();
  }, []);

  // ✅ Prevent flicker
  if (!initialRoute) return null;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={BottomTabs} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MoviesList" component={MoviesListScreen} />
      <Stack.Screen name="TvShowsList" component={TvShowsListScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}