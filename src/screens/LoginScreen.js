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
  UIManager
} from "react-native";
import EncryptedStorage from "react-native-encrypted-storage";
import axios from "axios";
import Footer from "../components/Footer"; // import your footer

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  const [useRadarr, setUseRadarr] = useState(false);
  const [useSonarr, setUseSonarr] = useState(false);

  const [radarrUrl, setRadarrUrl] = useState("");
  const [radarrApiKey, setRadarrApiKey] = useState("");
  const [sonarrUrl, setSonarrUrl] = useState("");
  const [sonarrApiKey, setSonarrApiKey] = useState("");

  const [radarrError, setRadarrError] = useState("");
  const [sonarrError, setSonarrError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const creds = await EncryptedStorage.getItem("cineTrackarrCreds");
        if (creds) navigation.replace("Dashboard");
      } catch (err) {
        console.log("No saved credentials", err);
      }
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

  const validateService = async (url, apiKey, serviceName, setError) => {
    if (!url || !apiKey) {
      setError("");
      return false;
    }
    try {
      const fullUrl = `${url.replace(/\/$/, "")}/api/v3/system/status`;
      const res = await axios.get(fullUrl, { headers: { "X-Api-Key": apiKey } });

      if (!res.data?.appName || res.data.appName.toLowerCase() !== serviceName.toLowerCase()) {
        setError(`This does not appear to be a valid ${serviceName} instance`);
        return false;
      }

      setError("");
      return true;
    } catch {
      setError(`Unable to connect to ${serviceName}`);
      return false;
    }
  };

  const handleConnect = async () => {
    if (!useRadarr && !useSonarr) {
      Alert.alert("Error", "Enable at least one service");
      return;
    }

    if ((useRadarr && (!radarrUrl || !radarrApiKey)) ||
        (useSonarr && (!sonarrUrl || !sonarrApiKey))) {
      Alert.alert("Error", "Please fill all enabled service fields");
      return;
    }

    setLoading(true);

    try {
      let radarrValid = true;
      let sonarrValid = true;

      if (useRadarr) {
        radarrValid = await validateService(radarrUrl, radarrApiKey, "Radarr", setRadarrError);
      }
      if (useSonarr) {
        sonarrValid = await validateService(sonarrUrl, sonarrApiKey, "Sonarr", setSonarrError);
      }

      if ((useRadarr && !radarrValid) || (useSonarr && !sonarrValid)) {
        Alert.alert("Error", "Please fix the highlighted errors before connecting");
        setLoading(false);
        return;
      }

      await EncryptedStorage.setItem(
        "cineTrackarrCreds",
        JSON.stringify({
          useRadarr,
          radarrUrl,
          radarrApiKey,
          useSonarr,
          sonarrUrl,
          sonarrApiKey
        })
      );

      navigation.replace("Dashboard");
    } catch (err) {
      console.error(err);
      Alert.alert("Connection Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#000" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>CineTrackarr</Text>

            {/* Radarr Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable Radarr</Text>
              <Switch value={useRadarr} onValueChange={toggleRadarr} />
            </View>

            {useRadarr && (
              <View style={styles.animatedContainer}>
                <Text style={styles.label}>Radarr URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="http://192.168.x.x:7878"
                  value={radarrUrl}
                  onChangeText={setRadarrUrl}
                  onBlur={() => validateService(radarrUrl, radarrApiKey, "Radarr", setRadarrError)}
                  autoCapitalize="none"
                />
                {radarrError ? <Text style={styles.errorText}>{radarrError}</Text> : null}

                <Text style={styles.label}>Radarr API Key</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Radarr API Key"
                  value={radarrApiKey}
                  onChangeText={setRadarrApiKey}
                  onBlur={() => validateService(radarrUrl, radarrApiKey, "Radarr", setRadarrError)}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>
            )}

            {/* Sonarr Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.label}>Enable Sonarr</Text>
              <Switch value={useSonarr} onValueChange={toggleSonarr} />
            </View>

            {useSonarr && (
              <View style={styles.animatedContainer}>
                <Text style={styles.label}>Sonarr URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="http://192.168.x.x:8989"
                  value={sonarrUrl}
                  onChangeText={setSonarrUrl}
                  onBlur={() => validateService(sonarrUrl, sonarrApiKey, "Sonarr", setSonarrError)}
                  autoCapitalize="none"
                />
                {sonarrError ? <Text style={styles.errorText}>{sonarrError}</Text> : null}

                <Text style={styles.label}>Sonarr API Key</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sonarr API Key"
                  value={sonarrApiKey}
                  onChangeText={setSonarrApiKey}
                  onBlur={() => validateService(sonarrUrl, sonarrApiKey, "Sonarr", setSonarrError)}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#e50914" style={{ marginTop: 20 }} />
            ) : (
              <Button title="Connect" onPress={handleConnect} color="#e50914" />
            )}
          </ScrollView>

          {/* Footer at the bottom */}
          <Footer />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e50914",
    textAlign: "center",
    marginBottom: 40
  },
  label: {
    color: "#fff",
    marginBottom: 5,
    marginTop: 15
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 10,
    borderRadius: 8
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  animatedContainer: {
    marginBottom: 10
  },
  errorText: {
    color: "#ff4d4d",
    marginTop: 5
  }
});
