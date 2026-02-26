import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

const MATOMO_URL = 'https://analytics.9rs.us/matomo.php';
const SITE_ID = '2';

const VISITOR_KEY = 'matomo_visitor_id';

/* ---------------- VISITOR ID ---------------- */

const generateVisitorId = () => {
  return 'xxxxxxxxyxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getVisitorId = async () => {
  try {
    let id = await AsyncStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = generateVisitorId();
      await AsyncStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  } catch {
    return generateVisitorId(); // fallback (never crash tracking)
  }
};

/* ---------------- EVENT TRACKING ---------------- */

export const trackEvent = async (category, action, name = '') => {
  try {
    const visitorId = await getVisitorId();

    const appVersion = DeviceInfo.getVersion();
    const osVersion = DeviceInfo.getSystemVersion();
    const deviceModel = DeviceInfo.getModel();
    const apiLevel = await DeviceInfo.getApiLevel();

    console.log("Matomo Event →", category, action, name);

    const body = new URLSearchParams({
      idsite: SITE_ID,
      rec: '1',
      apiv: '1',
      rand: Date.now().toString(),

      _id: visitorId,

      url: 'app://cinetrackarr',
      action_name: `${category}:${action}`,

      e_c: category,
      e_a: action,
      e_n: name,

      useragent: `CineTrackarr/${appVersion} (${Platform.OS})`,

      /* ---- Custom Dimensions ---- */
      dimension1: osVersion,
      dimension2: deviceModel,
      dimension3: apiLevel.toString(),
      dimension4: appVersion,
      dimension5: Platform.OS,
    }).toString();

    fetch(MATOMO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).catch(() => {});

  } catch (err) {
    console.log("Matomo trackEvent error:", err);
  }
};

/* ---------------- SCREEN TRACKING ---------------- */

export const trackScreen = async (screenName) => {
  try {
    const visitorId = await getVisitorId();
    const appVersion = DeviceInfo.getVersion();

    console.log("Matomo Screen →", screenName);

    const body = new URLSearchParams({
      idsite: SITE_ID,
      rec: '1',
      apiv: '1',
      rand: Date.now().toString(),

      _id: visitorId,

      url: `app://${screenName}`,
      action_name: screenName,

      useragent: `CineTrackarr/${appVersion} (${Platform.OS})`,
    }).toString();

    fetch(MATOMO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }).catch(() => {});

  } catch (err) {
    console.log("Matomo trackScreen error:", err);
  }
};