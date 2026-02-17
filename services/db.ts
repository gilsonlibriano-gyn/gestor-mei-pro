
import { Transaction, Client, Product, Goal, Config, DASPayment } from '../types';

const KEYS = {
  TRANSACTIONS: 'mei_tx_secure',
  CLIENTS: 'mei_cl_secure',
  PRODUCTS: 'mei_pr_secure',
  GOALS: 'mei_gl_secure',
  CONFIG: 'mei_cfg_secure',
  DAS_PAYMENTS: 'mei_das_secure',
  SALT: 'mei_crypto_salt'
};

// Variável em memória para a chave de criptografia ativa durante a sessão
let sessionKey: CryptoKey | null = null;

/**
 * Utilitários para Criptografia Robusta (Web Crypto API)
 */
const CryptoUtils = {
  async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(pin),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encrypt(data: any, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = encoder.encode(JSON.stringify(data));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Formato: IV(hex) + EncryptedData(base64)
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    return `${ivHex}:${encryptedBase64}`;
  },

  async decrypt(cipherText: string, key: CryptoKey): Promise<any> {
    const [ivHex, dataBase64] = cipherText.split(':');
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const encryptedData = new Uint8Array(atob(dataBase64).split('').map(c => c.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  }
};

export const db = {
  // Inicializa a sessão com o PIN do usuário
  async unlock(pin: string): Promise<boolean> {
    try {
      let saltBase64 = localStorage.getItem(KEYS.SALT);
      if (!saltBase64) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        saltBase64 = btoa(String.fromCharCode(...salt));
        localStorage.setItem(KEYS.SALT, saltBase64);
      }
      const salt = new Uint8Array(atob(saltBase64).split('').map(c => c.charCodeAt(0)));
      sessionKey = await CryptoUtils.deriveKey(pin, salt);
      return true;
    } catch (e) {
      console.error("Falha ao derivar chave", e);
      return false;
    }
  },

  lock() {
    sessionKey = null;
  },

  async saveSecure(key: string, data: any) {
    if (sessionKey) {
      const encrypted = await CryptoUtils.encrypt(data, sessionKey);
      localStorage.setItem(key, encrypted);
    } else {
      // Fallback para obfuscação simples se não houver chave (apenas para config inicial)
      const json = JSON.stringify(data);
      localStorage.setItem(key, `obf:${btoa(unescape(encodeURIComponent(json)))}`);
    }
  },

  async getSecure(key: string, defaultValue: string = '[]'): Promise<any> {
    const stored = localStorage.getItem(key);
    if (!stored) return JSON.parse(defaultValue);

    if (stored.startsWith('obf:')) {
      const decoded = decodeURIComponent(escape(atob(stored.replace('obf:', ''))));
      return JSON.parse(decoded);
    }

    if (sessionKey) {
      try {
        return await CryptoUtils.decrypt(stored, sessionKey);
      } catch (e) {
        console.error("Erro na descriptografia. Chave incorreta?");
        return JSON.parse(defaultValue);
      }
    }

    return JSON.parse(defaultValue);
  },

  // Atalhos de Persistência
  getTransactions: () => db.getSecure(KEYS.TRANSACTIONS),
  saveTransactions: (data: Transaction[]) => db.saveSecure(KEYS.TRANSACTIONS, data),
  
  getClients: () => db.getSecure(KEYS.CLIENTS),
  saveClients: (data: Client[]) => db.saveSecure(KEYS.CLIENTS, data),
  
  getProducts: () => db.getSecure(KEYS.PRODUCTS),
  saveProducts: (data: Product[]) => db.saveSecure(KEYS.PRODUCTS, data),
  
  getGoals: () => db.getSecure(KEYS.GOALS),
  saveGoals: (data: Goal[]) => db.saveSecure(KEYS.GOALS, data),
  
  getDASPayments: () => db.getSecure(KEYS.DAS_PAYMENTS),
  saveDASPayments: (data: DASPayment[]) => db.saveSecure(KEYS.DAS_PAYMENTS, data),
  
  getConfig: async (): Promise<Config> => {
    const cfg = await db.getSecure(KEYS.CONFIG, JSON.stringify({
      annualLimit: 81000,
      companyName: '',
      taxId: '',
      security: { useEncryption: false, lockOnEntry: false }
    }));
    return cfg;
  },
  saveConfig: (data: Config) => db.saveSecure(KEYS.CONFIG, data),

  exportAllData: async () => {
    const data = {
      transactions: await db.getTransactions(),
      clients: await db.getClients(),
      products: await db.getProducts(),
      goals: await db.getGoals(),
      config: await db.getConfig(),
      dasPayments: await db.getDASPayments(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }
};
