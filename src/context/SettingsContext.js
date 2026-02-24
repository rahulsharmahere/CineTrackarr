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
        setSettings(JSON.parse(credsString));
      }
    } catch (err) {
      console.log("Settings load error", err);
    }
  };

  const updateSettings = async (newValues) => {
    try {
      setSettings(prev => {
        const updated = { ...prev, ...newValues };

        EncryptedStorage.setItem(
          "cineTrackarrCreds",
          JSON.stringify(updated)
        );

        return updated;
      });
    } catch (err) {
      console.log("Settings update error", err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);