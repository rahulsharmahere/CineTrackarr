import axios from "axios";
import { getCredentials } from "../utils/storage";

async function getAuthConfig() {
  const creds = await getCredentials();
  if (!creds) throw new Error("No credentials saved");
  return {
    baseURL: `${creds.url}/api/v3`,
    headers: { "X-Api-Key": creds.apiKey },
  };
}

export async function getMovies() {
  const config = await getAuthConfig();
  const res = await axios.get("/movie", config);
  return res.data;
}
