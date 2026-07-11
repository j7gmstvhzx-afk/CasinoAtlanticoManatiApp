import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage adapter for the Supabase auth session.
 *
 * Security-audit remediation, step 2: the session holds a long-lived refresh
 * token. On native we keep it in the OS keychain/keystore via expo-secure-store
 * (hardware-backed, per-app encrypted) instead of the unencrypted AsyncStorage
 * SQLite file. On web SecureStore is unavailable, so we fall back to
 * AsyncStorage (localStorage) and rely on the CSP + short token lifetimes
 * configured elsewhere.
 *
 * SecureStore caps a single value at 2048 bytes, and a Supabase session
 * (access + refresh JWT) exceeds that — so values are transparently split into
 * numbered chunks and reassembled on read.
 */

interface SupabaseAuthStorage {
  getItem:    (key: string) => Promise<string | null>;
  setItem:    (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const CHUNK_SIZE  = 2000; // stay under SecureStore's 2048-byte per-value limit
const COUNT_SUFFIX = '__chunks';

// Minimal shape of the expo-secure-store API we depend on. Declared locally so
// this file type-checks whether or not the native module is installed in the
// current environment (it is a real dependency resolved at runtime on device).
interface SecureStoreLike {
  getItemAsync:    (key: string) => Promise<string | null>;
  setItemAsync:    (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

function makeSecureStoreAdapter(): SupabaseAuthStorage {
  // Lazily required so the web bundle never pulls in the native-only module.
  const SecureStore = require('expo-secure-store') as SecureStoreLike;

  const chunkKey = (key: string, i: number) => `${key}__${i}`;

  return {
    async getItem(key) {
      const countRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
      if (countRaw == null) {
        // Either not set, or written by a pre-chunking build — try the plain key.
        return SecureStore.getItemAsync(key);
      }
      const count = parseInt(countRaw, 10);
      if (!Number.isFinite(count) || count <= 0) return null;

      const parts: string[] = [];
      for (let i = 0; i < count; i++) {
        const part = await SecureStore.getItemAsync(chunkKey(key, i));
        if (part == null) return null; // corrupt/partial — treat as absent
        parts.push(part);
      }
      return parts.join('');
    },

    async setItem(key, value) {
      // Clear any previous representation (plain or chunked) first.
      await this.removeItem(key);

      const count = Math.ceil(value.length / CHUNK_SIZE);
      for (let i = 0; i < count; i++) {
        await SecureStore.setItemAsync(
          chunkKey(key, i),
          value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        );
      }
      await SecureStore.setItemAsync(`${key}${COUNT_SUFFIX}`, String(count));
    },

    async removeItem(key) {
      const countRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
      const count = countRaw != null ? parseInt(countRaw, 10) : 0;
      if (Number.isFinite(count) && count > 0) {
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(chunkKey(key, i));
        }
      }
      await SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`);
      await SecureStore.deleteItemAsync(key); // legacy/plain key, if any
    },
  };
}

export const authStorage: SupabaseAuthStorage =
  Platform.OS === 'web' ? AsyncStorage : makeSecureStoreAdapter();
