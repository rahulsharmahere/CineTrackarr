import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { enableScreens } from "react-native-screens";
import { PortalProvider } from "@gorhom/portal";

import { UpdateProvider } from "./src/context/UpdateContext";  
import UpdateModal from "./src/components/UpdateModal";        

import AppNavigator from "./src/AppNavigator";
import { SettingsProvider } from "./src/context/SettingsContext";

enableScreens();

export default function App() {
  return (
    <PortalProvider>
      <SettingsProvider>
        <UpdateProvider>   
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>

          <UpdateModal />  

        </UpdateProvider>
      </SettingsProvider>
    </PortalProvider>
  );
}