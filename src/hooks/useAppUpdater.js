import { useState } from "react";
import semver from "semver";
import downloadAndInstallApk, { cancelDownload } from "../utils/downloadAndInstallApk";

const GITHUB_REPO = "rahulsharmahere/CineTrackarr";

// Normalize versions like "0.2" → "0.2.0"
const normalizeVersion = (v) => {
  const clean = v.replace(/^v/, "");
  const parts = clean.split(".");
  if (parts.length === 1) return `${clean}.0.0`;
  if (parts.length === 2) return `${clean}.0`;
  return clean;
};

export default function useAppUpdater(currentVersion = "1.0.0") {

  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [apkUrl, setApkUrl] = useState(null);
  const [progress, setProgress] = useState(0);

  // 🔍 Check for update
  const checkForUpdate = async () => {
    try {
      setIsChecking(true);

      console.log("🚀 Checking for update...");
      console.log("📦 Current version:", currentVersion);

      const res = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`
      );

      const release = await res.json();

      if (!release?.tag_name) {
        throw new Error("No release found");
      }

      const latestRaw = release.tag_name;
      const latestName = normalizeVersion(latestRaw);
      const current = normalizeVersion(currentVersion);

      console.log("📥 Found latest release:", latestRaw);

      const apkAsset = release.assets?.find(a =>
        a.name.endsWith(".apk")
      );

      if (semver.gt(latestName, current)) {

        setUpdateAvailable(true);
        setLatestVersion(latestName);

        if (apkAsset) {
          setApkUrl(apkAsset.browser_download_url);
        }

        return true;   // ✅ update found
      }

      setUpdateAvailable(false);
      console.log("👍 App is up to date.");
      return false;    // ✅ no update

    } catch (err) {
      console.error("❌ Update check failed:", err);
      return null;     // ❌ error
    } finally {
      setIsChecking(false);
    }
  };

  // ⬇️ User clicked Update
  const onUpdateNow = async () => {

    if (!apkUrl) return;

    try {
      setProgress(0);

      const path = await downloadAndInstallApk(
        apkUrl,
        latestVersion,
        setProgress
      );

      if (path === null) return;

    } catch (err) {
      console.error("❌ Update failed:", err?.message);
    }
  };

  // ❌ Cancel download
  const onCancelDownload = () => {
    try {
      cancelDownload();
    } catch {}

    setProgress(0);
  };

  return {
    isChecking,
    updateAvailable,
    latestVersion,
    checkForUpdate,
    onUpdateNow,
    onCancelDownload,
    progress,
    apkUrl,
  };
}