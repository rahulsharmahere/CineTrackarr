import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Linking,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import axios from "axios";
import Toast from "react-native-toast-message";
import Clipboard from "@react-native-clipboard/clipboard";

import { useSettings } from "../context/SettingsContext";
import { useUpdate } from "../context/UpdateContext";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ✅ PasteButton Component
const PasteButton = ({ onPaste }) => {
  const handlePress = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        onPaste(text);
        Toast.show({ type: "success", text1: "Pasted from clipboard" });
      } else {
        Toast.show({ type: "error", text1: "Clipboard is empty" });
      }
    } catch (error) {
      console.error("Clipboard error:", error);
      Toast.show({ type: "error", text1: "Failed to read clipboard" });
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.pasteButton}>
      <Text style={styles.pasteButtonText}>📋 Paste</Text>
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {

  const { settings, updateSettings } = useSettings();
  const { manualCheckForUpdate, isChecking } = useUpdate();

  // Local state for temporary changes
  const [localSettings, setLocalSettings] = useState({
    useRadarr: settings.useRadarr,
    useSonarr: settings.useSonarr,
    useTrending: settings.useTrending,
    radarrUrl: settings.radarrUrl,
    radarrApiKey: settings.radarrApiKey,
    sonarrUrl: settings.sonarrUrl,
    sonarrApiKey: settings.sonarrApiKey,
    tmdbApiKey: settings.tmdbApiKey,
  });

  // Reset local settings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset to saved settings when screen gains focus
      setLocalSettings({
        useRadarr: settings.useRadarr,
        useSonarr: settings.useSonarr,
        useTrending: settings.useTrending,
        radarrUrl: settings.radarrUrl,
        radarrApiKey: settings.radarrApiKey,
        sonarrUrl: settings.sonarrUrl,
        sonarrApiKey: settings.sonarrApiKey,
        tmdbApiKey: settings.tmdbApiKey,
      });
    }, [settings])
  );

  // Also update when settings change (in case they're saved from another screen)
  useEffect(() => {
    setLocalSettings({
      useRadarr: settings.useRadarr,
      useSonarr: settings.useSonarr,
      useTrending: settings.useTrending,
      radarrUrl: settings.radarrUrl,
      radarrApiKey: settings.radarrApiKey,
      sonarrUrl: settings.sonarrUrl,
      sonarrApiKey: settings.sonarrApiKey,
      tmdbApiKey: settings.tmdbApiKey,
    });
  }, [settings]);

  const toggleRadarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalSettings({ ...localSettings, useRadarr: !localSettings.useRadarr });
  };

  const toggleSonarr = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalSettings({ ...localSettings, useSonarr: !localSettings.useSonarr });
  };

  const toggleTrending = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLocalSettings({ ...localSettings, useTrending: !localSettings.useTrending });
  };

  const updateLocalField = (field, value) => {
    setLocalSettings({ ...localSettings, [field]: value });
  };

  const testConnection = async (url, apiKey, serviceName) => {
    if (!url || !apiKey) {
      Toast.show({ type: "error", text1: `${serviceName} URL/API Key missing` });
      return;
    }

    try {
      const fullUrl = `${url.replace(/\/$/, "")}/api/v3/system/status`;

      const res = await axios.get(fullUrl, {
        headers: { "X-Api-Key": apiKey },
      });

      if (!res.data?.appName || res.data.appName.toLowerCase() !== serviceName.toLowerCase()) {
        Toast.show({ type: "error", text1: `Invalid ${serviceName} instance` });
        return;
      }

      Toast.show({ type: "success", text1: `${serviceName} connection successful` });

    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: `Failed to connect to ${serviceName}` });
    }
  };

  const handleSave = () => {
    // Validate using local settings
    if ((localSettings.useRadarr && (!localSettings.radarrUrl || !localSettings.radarrApiKey)) ||
        (localSettings.useSonarr && (!localSettings.sonarrUrl || !localSettings.sonarrApiKey))) {
      Toast.show({ type: "error", text1: "Fill all enabled service fields" });
      return;
    }

    if (localSettings.useTrending && !localSettings.tmdbApiKey) {
      Toast.show({ type: "error", text1: "TMDB API Key required" });
      return;
    }

    // Save all settings at once
    updateSettings(localSettings);
    Toast.show({ type: "success", text1: "Settings Updated" });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Settings</Text>

        {/* RADARR */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Radarr</Text>
          <Switch value={localSettings.useRadarr} onValueChange={toggleRadarr} />
        </View>

        {localSettings.useRadarr && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Radarr URL</Text>
              <PasteButton onPaste={(text) => updateLocalField("radarrUrl", text)} />
            </View>
            <TextInput
              style={styles.input}
              value={localSettings.radarrUrl}
              onChangeText={(text) => updateLocalField("radarrUrl", text)}
              placeholder="http://localhost:7878"
              placeholderTextColor="#666"
            />

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Radarr API Key</Text>
              <PasteButton onPaste={(text) => updateLocalField("radarrApiKey", text)} />
            </View>
            <TextInput
              style={styles.input}
              value={localSettings.radarrApiKey}
              onChangeText={(text) => updateLocalField("radarrApiKey", text)}
              secureTextEntry={true}
              placeholder="Enter API Key"
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.testButton}
              onPress={() =>
                testConnection(localSettings.radarrUrl, localSettings.radarrApiKey, "radarr")
              }
            >
              <Text style={styles.testButtonText}>Test Radarr Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SONARR */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Sonarr</Text>
          <Switch value={localSettings.useSonarr} onValueChange={toggleSonarr} />
        </View>

        {localSettings.useSonarr && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Sonarr URL</Text>
              <PasteButton onPaste={(text) => updateLocalField("sonarrUrl", text)} />
            </View>
            <TextInput
              style={styles.input}
              value={localSettings.sonarrUrl}
              onChangeText={(text) => updateLocalField("sonarrUrl", text)}
              placeholder="http://localhost:8989"
              placeholderTextColor="#666"
            />

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Sonarr API Key</Text>
              <PasteButton onPaste={(text) => updateLocalField("sonarrApiKey", text)} />
            </View>
            <TextInput
              style={styles.input}
              value={localSettings.sonarrApiKey}
              onChangeText={(text) => updateLocalField("sonarrApiKey", text)}
              secureTextEntry={true}
              placeholder="Enter API Key"
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.testButton}
              onPress={() =>
                testConnection(localSettings.sonarrUrl, localSettings.sonarrApiKey, "sonarr")
              }
            >
              <Text style={styles.testButtonText}>Test Sonarr Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* TRENDING */}
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Trending Content</Text>
          <Switch value={localSettings.useTrending} onValueChange={toggleTrending} />
        </View>

        {localSettings.useTrending && (
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>TMDB API Key</Text>
              <PasteButton onPaste={(text) => updateLocalField("tmdbApiKey", text)} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter TMDB API Key"
              placeholderTextColor="#666"
              value={localSettings.tmdbApiKey}
              onChangeText={(text) => updateLocalField("tmdbApiKey", text)}
              secureTextEntry={true}
            />
          </View>
        )}

        {/* SAVE BUTTON - Moved above Update */}
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>

        {/* UPDATE BUTTON - Moved below Save */}
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={manualCheckForUpdate}
        >
          <Text style={styles.buttonText}>
            {isChecking ? "Checking..." : "Check for Updates"}
          </Text>
        </TouchableOpacity>

        {/* ABOUT SECTION */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutTitle}>About</Text>
          <Text style={styles.aboutText}>
            This project is a work of Rahul Sharma
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://rahulsharmahere.com")}>
            <Text style={styles.linkText}>rahulsharmahere.com</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL("https://github.com/rahulsharmahere")}>
            <Text style={styles.linkText}>GitHub</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Toast position="bottom" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#000",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#e50914",
    textAlign: "center",
    marginBottom: 30,
  },

  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    marginTop: 10,
  },

  label: {
    color: "#fff",
    fontSize: 16,
  },

  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  section: {
    marginTop: 10,
  },

  button: {
    backgroundColor: "#e50914",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },

  updateButton: {
    backgroundColor: "#333",
    marginTop: 10, // Reduced margin to be closer to Save button
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  testButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },

  pasteButton: {
    backgroundColor: "#444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },

  pasteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  aboutBox: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#111",
    borderRadius: 10,
  },

  aboutTitle: {
    color: "#e50914",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  aboutText: {
    color: "#ccc",
    fontSize: 13,
    marginBottom: 6,
  },

  linkText: {
    color: "#4DA6FF",
    fontSize: 13,
    marginTop: 4,
  },
});