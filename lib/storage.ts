import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  apiKey: 'lta_api_key',
  favourites: 'favourite_stops',
  customNames: 'custom_stop_names',
};

export async function getApiKey(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.apiKey)) ?? '';
}

export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.apiKey, key.trim());
}

export async function getFavourites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.favourites);
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavourite(stopCode: string): Promise<string[]> {
  const current = await getFavourites();
  const next = current.includes(stopCode)
    ? current.filter((c) => c !== stopCode)
    : [...current, stopCode];
  await AsyncStorage.setItem(KEYS.favourites, JSON.stringify(next));
  return next;
}

export async function getCustomNames(): Promise<Record<string, string>> {
  const raw = await AsyncStorage.getItem(KEYS.customNames);
  return raw ? JSON.parse(raw) : {};
}

export async function setCustomName(stopCode: string, name: string): Promise<void> {
  const current = await getCustomNames();
  if (name.trim()) {
    current[stopCode] = name.trim();
  } else {
    delete current[stopCode];
  }
  await AsyncStorage.setItem(KEYS.customNames, JSON.stringify(current));
}
