import EncryptedStorage from 'react-native-encrypted-storage';

export async function saveCredentials({ url, apiKey }) {
  try {
    await EncryptedStorage.setItem(
      "serverCredentials",
      JSON.stringify({ url, apiKey })
    );
  } catch (error) {
    console.error("Failed to save credentials", error);
  }
}

export async function getCredentials() {
  try {
    const creds = await EncryptedStorage.getItem("serverCredentials");
    return creds ? JSON.parse(creds) : null;
  } catch (error) {
    console.error("Failed to load credentials", error);
    return null;
  }
}

export async function clearCredentials() {
  try {
    await EncryptedStorage.removeItem("serverCredentials");
  } catch (error) {
    console.error("Failed to clear credentials", error);
  }
}
