import axios from "axios";
import { getCredentials } from "../utils/storage";

async function getAuthConfig() {
  const creds = await getCredentials();
  if (!creds) throw new Error("No credentials saved");
  return {
    baseURL: `${creds.url}/sonarr/api/v3`, // 👈 if Sonarr is on a different port, adjust
    headers: { "X-Api-Key": creds.apiKey },
  };
}

// Fetch all TV series
export async function getSeries() {
  const config = await getAuthConfig();
  const res = await axios.get("/series", config);
  return res.data;
}

// Search for a new TV show
export async function searchSeries(query) {
  const config = await getAuthConfig();
  const res = await axios.get(`/series/lookup?term=${encodeURIComponent(query)}`, config);
  return res.data;
}

// Add new TV show
export async function addSeries(show, rootFolderPath, qualityProfileId) {
  const config = await getAuthConfig();
  const res = await axios.post("/series", {
    tvdbId: show.tvdbId,
    title: show.title,
    qualityProfileId,
    rootFolderPath,
    seasons: show.seasons.map((s) => ({ seasonNumber: s.seasonNumber, monitored: true })),
    monitored: true,
    addOptions: { searchForMissingEpisodes: true }
  }, config);
  return res.data;
}
