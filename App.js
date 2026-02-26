import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalProvider } from "@gorhom/portal";
import Toast from "react-native-toast-message";

import { navigationRef } from "./src/navigationRef";
import { trackScreen } from "./src/services/matomo";

import { UpdateProvider } from "./src/context/UpdateContext";
import UpdateModal from "./src/components/UpdateModal";

import AppNavigator from "./src/AppNavigator";
import { SettingsProvider } from "./src/context/SettingsContext";

enableScreens();

export default function App() {
    console.log("trackScreen is:", trackScreen);
  return (
    <PortalProvider>
      <SettingsProvider>
        <UpdateProvider>
          <NavigationContainer
            ref={navigationRef}
            onStateChange={() => {

              const route = navigationRef.current?.getCurrentRoute(); // ✅ FIXED

              if (route?.name) {
                trackScreen(route.name);
                console.log("Tracked Screen:", route.name);
              }
            }}
          >
            <AppNavigator />
          </NavigationContainer>

          <UpdateModal />

          <Toast />
        </UpdateProvider>
      </SettingsProvider>
    </PortalProvider>
  );
}