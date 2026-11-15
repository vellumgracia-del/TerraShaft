'use client';

const STORAGE_KEY = 'terrashaft_ai_key_vault_v1';
const LEGACY_STORAGE_KEY = 'terrashaft_gemini_key';
const APP_SALT = 'terrashaft-client-vault-2026';

export type KeyProvider = 'deepseek' | 'gemini' | 'unknown';

export interface StoredKeyStatus {
  hasKey: boolean;
  provider: KeyProvider;
  maskedHint: string;
}

interface VaultPayload {
  v: 1;
  iv: string;
  ct: string;
  provider: KeyProvider;
  hint: string;
}

export function detectKeyProvider(rawKey: string): KeyProvider {
  const trimmed = rawKey.trim();
  if (trimmed.startsWith('sk-')) return 'deepseek';
  if (trimmed.startsWith('AIza')) return 'gemini';
  return trimmed.length > 0 ? 'unknown' : 'unknown';
}

export function maskApiKey(rawKey: string): string {
  const trimmed = rawKey.trim();
  if (trimmed.length <= 10) return '••••••••';
  return `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveVaultKey(): Promise<CryptoKey> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'localhost';
  const seed = new TextEncoder().encode(`${origin}:${APP_SALT}`);
  const hash = await window.crypto.subtle.digest('SHA-256', seed);
  return window.crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function saveApiKey(rawKey: string): Promise<StoredKeyStatus> {
  const trimmed = rawKey.trim();
  if (!trimmed) {
    clearApiKey();
    return { hasKey: false, provider: 'unknown', maskedHint: '' };
  }

  const provider = detectKeyProvider(trimmed);
  const hint = maskApiKey(trimmed);

  // Remove any legacy plaintext key
  localStorage.removeItem(LEGACY_STORAGE_KEY);

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const key = await deriveVaultKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(trimmed);
    const cipherBuf = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    const payload: VaultPayload = {
      v: 1,
      iv: toBase64(iv),
      ct: toBase64(new Uint8Array(cipherBuf)),
      provider,
      hint
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } else {
    // Fallback encoding when Web Crypto is unavailable (e.g. non-secure context)
    const payload: VaultPayload = {
      v: 1,
      iv: '',
      ct: toBase64(new TextEncoder().encode(trimmed)),
      provider,
      hint
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  return { hasKey: true, provider, maskedHint: hint };
}

export function getApiKeyStatus(): StoredKeyStatus {
  try {
    const rawVault = localStorage.getItem(STORAGE_KEY);
    if (rawVault) {
      const parsed = JSON.parse(rawVault) as Partial<VaultPayload>;
      if (parsed.ct && parsed.hint) {
        return {
          hasKey: true,
          provider: parsed.provider ?? 'unknown',
          maskedHint: parsed.hint
        };
      }
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)?.trim();
    if (legacy) {
      return {
        hasKey: true,
        provider: detectKeyProvider(legacy),
        maskedHint: maskApiKey(legacy)
      };
    }
  } catch {
    // ignore malformed storage
  }
  return { hasKey: false, provider: 'unknown', maskedHint: '' };
}

export async function loadApiKey(): Promise<string | null> {
  try {
    const rawVault = localStorage.getItem(STORAGE_KEY);
    if (rawVault) {
      const parsed = JSON.parse(rawVault) as Partial<VaultPayload>;
      if (parsed.ct) {
        if (parsed.iv && typeof window !== 'undefined' && window.crypto?.subtle) {
          const key = await deriveVaultKey();
          const iv = fromBase64(parsed.iv);
          const ct = fromBase64(parsed.ct);
          const plainBuf = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            key,
            new Uint8Array(ct)
          );
          return new TextDecoder().decode(plainBuf);
        }
        if (!parsed.iv) {
          return new TextDecoder().decode(fromBase64(parsed.ct));
        }
      }
    }

    // Migrate legacy plaintext key if present
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)?.trim();
    if (legacy) {
      await saveApiKey(legacy);
      return legacy;
    }
  } catch {
    return null;
  }
  return null;
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }
}
