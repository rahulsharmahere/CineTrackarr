import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";

export default function StartupScreen({ navigation }) {

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const creds = await EncryptedStorage.getItem("cineTrackarrCreds");

      if (creds) {
        console.log("✅ Credentials Found → Dashboard");
        navigation.replace("Dashboard");
      } else {
        console.log("❌ No Credentials → Login");
        navigation.replace("Login");
      }

    } catch (err) {
      console.log("Startup Error:", err);
      navigation.replace("Login");
    }
  };

  return (
    <View style={{ flex:1, justifyContent:"center", backgroundColor:"#000" }}>
      <ActivityIndicator size="large" color="#e50914" />
    </View>
  );
}