import React, { createContext, useContext, useEffect, useState } from "react";
import EncryptedStorage from "react-native-encrypted-storage";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {

  const [settings, setSettings] = useState({
    useRadarr: false,
    useSonarr: false,
    useTrending: false,
    radarrUrl: "",
    radarrApiKey: "",
    sonarrUrl: "",
    sonarrApiKey: "",
    tmdbApiKey: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const credsString = await EncryptedStorage.getItem("cineTrackarrCreds");

      if (credsString) {
        const parsed = JSON.parse(credsString);
        setSettings(parsed);
      }

    } catch (err) {
      console.log("Settings load error", err);
    }
  };

  // ✅ IMPORTANT: NOT async
  const updateSettings = (newValues) => {

    setSettings(prev => {

      const updated = { ...prev, ...newValues };

      // ✅ Persist WITHOUT blocking UI
      EncryptedStorage.setItem(
        "cineTrackarrCreds",
        JSON.stringify(updated)
      ).catch(err => console.log("Storage error", err));

      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);