import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  LayoutAnimation,
  UIManager,
  TouchableOpacity
} from "react-native";

import Clipboard from "@react-native-clipboard/clipboard";
import EncryptedStorage from "react-native-encrypted-storage";
import axios from "axios";
import Footer from "../components/Footer";
import { useSettings } from "../context/SettingsContext";

const InputWithPaste = ({ value, onChangeText, placeholder, onPaste, secure }) => (
  <View style={styles.inputRow}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#666"
      value={value}
      onChangeText={onChangeText}
      autoCapitalize="none"
      secureTextEntry={secure}
    />
    <TouchableOpacity style={styles.pasteButton} onPress={onPaste}>
      <Text style={styles.pasteText}>Paste</Text>
    </TouchableOpacity>
  </View>
);

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {

  const { updateSettings } = useSettings();

  const [useRadarr, setUseRadarr] = useState(false);
  const [useSonarr, setUseSonarr] = useState(false);

  const [radarrUrl, setRadarrUrl] = useState("");
  const [radarrApiKey, setRadarrApiKey] = useState("");
  const [sonarrUrl, setSonarrUrl] = useState("");
  const [sonarrApiKey, setSonarrApiKey] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const creds = await EncryptedStorage.getItem("cineTrackarrCreds");

        if (creds) {
          navigation.replace("Dashboard");
        }
      } catch {}
    })();
  }, []);

  const toggleRadarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUseRadarr(prev => !prev);
  };

  const toggleSonarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setUseSonarr(prev => !prev);
  };

  const pasteFromClipboard = async (setter) => {
    const text = await Clipboard.getString();
    if (text) setter(text.trim());
  };

  const validateService = async (url, apiKey, serviceName) => {

    console.log(`🚀 Testing ${serviceName}`);

    try {
      const fullUrl = `${url.replace(/\/$/, "")}/api/v3/system/status`;

      console.log("➡ URL:", fullUrl);

      const res = await axios.get(fullUrl, {
        headers: { "X-Api-Key": apiKey },
        timeout: 5000
      });

      console.log("✅ SUCCESS", res.data);

      Alert.alert(`${serviceName} Success`);

    } catch (err) {

      console.log("❌ ERROR", err.message);

      Alert.alert(`${serviceName} Failed`, err.message);
    }
  };

  const handleConnect = async () => {

    if (!useRadarr && !useSonarr) {
      Alert.alert("Enable at least one service");
      return;
    }

    setLoading(true);

    try {

      const newSettings = {
        useRadarr,
        radarrUrl,
        radarrApiKey,
        useSonarr,
        sonarrUrl,
        sonarrApiKey
      };

      await EncryptedStorage.setItem(
        "cineTrackarrCreds",
        JSON.stringify(newSettings)
      );

      // ✅ CRITICAL FIX — Update Context
      await updateSettings(newSettings);

      navigation.replace("Dashboard");

    } catch (err) {
      Alert.alert("Save Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>

            <Text style={styles.title}>CineTrackarr</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable Radarr</Text>
              <Switch value={useRadarr} onValueChange={toggleRadarr} />
            </View>

            {useRadarr && (
              <>
                <Text style={styles.label}>Radarr URL</Text>
                <InputWithPaste
                  value={radarrUrl}
                  onChangeText={setRadarrUrl}
                  placeholder="http://192.168.x.x:7878"
                  onPaste={() => pasteFromClipboard(setRadarrUrl)}
                />

                <Text style={styles.label}>Radarr API Key</Text>
                <InputWithPaste
                  value={radarrApiKey}
                  onChangeText={setRadarrApiKey}
                  placeholder="Radarr API Key"
                  secure
                  onPaste={() => pasteFromClipboard(setRadarrApiKey)}
                />

                <View style={styles.buttonSpacing}>
                  <Button
                    title="Test Radarr"
                    onPress={() => validateService(radarrUrl, radarrApiKey, "Radarr")}
                  />
                </View>
              </>
            )}

            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable Sonarr</Text>
              <Switch value={useSonarr} onValueChange={toggleSonarr} />
            </View>

            {useSonarr && (
              <>
                <Text style={styles.label}>Sonarr URL</Text>
                <InputWithPaste
                  value={sonarrUrl}
                  onChangeText={setSonarrUrl}
                  placeholder="http://192.168.x.x:8989"
                  onPaste={() => pasteFromClipboard(setSonarrUrl)}
                />

                <Text style={styles.label}>Sonarr API Key</Text>
                <InputWithPaste
                  value={sonarrApiKey}
                  onChangeText={setSonarrApiKey}
                  placeholder="Sonarr API Key"
                  secure
                  onPaste={() => pasteFromClipboard(setSonarrApiKey)}
                />

                <View style={styles.buttonSpacing}>
                  <Button
                    title="Test Sonarr"
                    onPress={() => validateService(sonarrUrl, sonarrApiKey, "Sonarr")}
                  />
                </View>
              </>
            )}

            {/* ✅ EXTRA MARGIN HERE */}
            <View style={styles.connectSpacing}>
              {loading
                ? <ActivityIndicator size="large" color="#e50914" />
                : <Button title="Connect" onPress={handleConnect} color="#e50914" />
              }
            </View>

          </ScrollView>

          <Footer />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", backgroundColor: "#000" },
  scrollContent: { flexGrow: 1, padding: 20 },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e50914",
    textAlign: "center",
    marginBottom: 40
  },

  label: { color: "#fff", marginBottom: 6, marginTop: 15 },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  inputRow: { flexDirection: "row", alignItems: "center" },

  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8
  },

  pasteButton: {
    marginLeft: 10,
    backgroundColor: "#333",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8
  },

  pasteText: { color: "#fff" },

  buttonSpacing: {
    marginTop: 15,
    marginBottom: 25
  },

  connectSpacing: {
    marginTop: 10
  }
});