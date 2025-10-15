

'use client';

// This file uses the Web Crypto API, which is only available in the browser.

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16; // bytes
const HASH_ALGORITHM = 'SHA-256';
const KEY_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;


// --- Password Hashing ---

// Create a secure hash of a password for storage
export async function hashPassword(password: string): Promise<string> {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const key = await deriveKeyFromPassword(password, salt);
    const hash = await window.crypto.subtle.digest(HASH_ALGORITHM, key);
    
    // Return salt + hash, encoded as hex strings
    return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

// Verify a password against a stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(':');
    if (!saltHex || !hashHex) return false;

    const salt = fromHex(saltHex);
    const hash = fromHex(hashHex);

    const key = await deriveKeyFromPassword(password, salt);
    const newHash = await window.crypto.subtle.digest(HASH_ALGORITHM, key);

    return compareArrayBuffers(hash, newHash);
}

// --- Session Key Management ---

// Create a temporary key for the current session to avoid re-typing password
export async function createSessionKey(password: string): Promise<CryptoKey> {
    // For session key, salt can be static as it's not stored long-term
    const salt = new TextEncoder().encode("playgate-session-salt");
    const keyMaterial = await deriveKeyFromPassword(password, salt, 50000); // Fewer iterations for session key

    return window.crypto.subtle.importKey(
        'raw',
        keyMaterial.slice(0, 32), // AES-256 needs 32 bytes
        { name: KEY_ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

export function exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return window.crypto.subtle.exportKey('jwk', key);
}

export function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return window.crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: KEY_ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    );
}

// --- Encryption / Decryption ---

export async function encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await window.crypto.subtle.encrypt(
        { name: KEY_ALGORITHM, iv },
        key,
        encodedData
    );

    // Return iv + encrypted data as hex strings
    return `${toHex(iv)}:${toHex(new Uint8Array(encrypted))}`;
}

export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const [ivHex, dataHex] = encryptedData.split(':');
    if (!ivHex || !dataHex) throw new Error("Invalid encrypted data format");

    const iv = fromHex(ivHex);
    const data = fromHex(dataHex);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: KEY_ALGORITHM, iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
}

// --- Password Reset Challenge ---

export async function generateSupportCode(): Promise<string> {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(16));
    return toHex(randomBytes);
}

export async function verifyUnlockKey(supportCode: string, unlockKey: string): Promise<boolean> {
    try {
        const masterSecret = "SECRET_MASTER_KEY_WAIZDEV_786"; // This is a placeholder
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(masterSecret),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        const derivedKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode(supportCode), // Use support code as salt
                iterations: 1000,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: 'HMAC', hash: 'SHA-256', length: 256 },
            true,
            ['sign', 'verify']
        );

        const signature = await window.crypto.subtle.sign(
            'HMAC',
            derivedKey,
            encoder.encode(supportCode + "_unlock")
        );
        
        const expectedKey = toHex(new Uint8Array(signature)).substring(0, 12).toUpperCase();
        return unlockKey.toUpperCase() === expectedKey;
    } catch {
        return false;
    }
}


// --- Helper Functions ---

async function deriveKeyFromPassword(password: string, salt: Uint8Array, iterations: number = PBKDF2_ITERATIONS): Promise<ArrayBuffer> {
    const masterKey = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: iterations,
            hash: HASH_ALGORITHM,
        },
        masterKey,
        KEY_LENGTH
    );
}


function toHex(buffer: Uint8Array): string {
    return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hexString: string): Uint8Array {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return bytes;
}

function compareArrayBuffers(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean {
    if (buf1.byteLength !== buf2.byteLength) return false;
    const view1 = new Uint8Array(buf1);
    const view2 = new Uint8Array(buf2);
    for (let i = 0; i < view1.length; i++) {
        if (view1[i] !== view2[i]) return false;
    }
    return true;
}
