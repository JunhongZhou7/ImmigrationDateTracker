import AsyncStorage from '@react-native-async-storage/async-storage';
import {UserProfile, TravelRecord} from '../types';

const KEYS = {
  PROFILE: '@immigration_profile',
  RECORDS: '@immigration_records',
};

// Profile
export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.PROFILE);
}

// Travel Records
export async function saveRecords(records: TravelRecord[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export async function loadRecords(): Promise<TravelRecord[]> {
  const data = await AsyncStorage.getItem(KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
}

export async function addRecord(record: TravelRecord): Promise<TravelRecord[]> {
  const records = await loadRecords();
  records.push(record);
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await saveRecords(records);
  return records;
}

export async function updateRecord(
  id: string,
  updates: Partial<TravelRecord>,
): Promise<TravelRecord[]> {
  const records = await loadRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx !== -1) {
    const old = records[idx];
    records[idx] = {
      ...old,
      ...updates,
      previousDate: old.date,
      modifiedAt: new Date().toISOString(),
    };
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await saveRecords(records);
  }
  return records;
}

export async function deleteRecord(id: string): Promise<TravelRecord[]> {
  let records = await loadRecords();
  records = records.filter(r => r.id !== id);
  await saveRecords(records);
  return records;
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.PROFILE, KEYS.RECORDS]);
}
