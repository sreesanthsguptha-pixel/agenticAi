const crypto = require('crypto');
const Integration = require('../models/Integration');
const dbConfig = require('../config/db');
const inMemoryStore = require('../config/inMemoryStore');
const env = require('../config/env');

const ALGORITHM = 'aes-256-cbc';

// Ensure 32-byte key
const getKey = () => {
  const secret = env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  return crypto.createHash('sha256').update(secret).digest();
};

const encryptData = (data) => {
  if (!data) return null;
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

const decryptData = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const [ivHex, encryptedText] = encryptedData.split(':');
    if (!ivHex || !encryptedText) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('[IntegrationService] Decryption error:', error.message);
    return null;
  }
};

const getUserIntegrations = async (userId) => {
  const { isInMemory } = dbConfig.getDBState();
  const providers = ['gmail', 'slack', 'discord', 'google-sheets'];

  let existing = [];
  if (isInMemory) {
    existing = inMemoryStore.find('integrations', { owner: userId.toString() });
  } else {
    existing = await Integration.find({ owner: userId });
  }

  // Ensure default cards for all supported providers
  const resultMap = {};
  providers.forEach(p => {
    resultMap[p] = {
      provider: p,
      isConnected: false,
      scopes: [],
      expiresAt: null
    };
  });

  existing.forEach(item => {
    resultMap[item.provider] = {
      _id: item._id,
      provider: item.provider,
      isConnected: item.isConnected,
      scopes: item.scopes || [],
      expiresAt: item.expiresAt
    };
  });

  return Object.values(resultMap);
};

const setIntegrationCredential = async (userId, provider, credentials, isConnected = true) => {
  const { isInMemory } = dbConfig.getDBState();
  const encrypted = encryptData(credentials);

  if (isInMemory) {
    const existing = inMemoryStore.findOne('integrations', { owner: userId.toString(), provider });
    if (existing) {
      return inMemoryStore.updateById('integrations', existing._id, {
        isConnected,
        encryptedData: encrypted,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } else {
      return inMemoryStore.insert('integrations', {
        owner: userId.toString(),
        provider,
        isConnected,
        scopes: ['read', 'write'],
        encryptedData: encrypted,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
  } else {
    return await Integration.findOneAndUpdate(
      { owner: userId, provider },
      {
        owner: userId,
        provider,
        isConnected,
        scopes: ['read', 'write'],
        encryptedData: encrypted,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      { upsert: true, new: true }
    );
  }
};

const getIntegrationCredential = async (userId, provider) => {
  const { isInMemory } = dbConfig.getDBState();
  let item = null;

  if (isInMemory) {
    item = inMemoryStore.findOne('integrations', { owner: userId ? userId.toString() : null, provider });
    if (!item) {
      item = inMemoryStore.findOne('integrations', { provider });
    }
  } else {
    item = await Integration.findOne({ owner: userId, provider });
    if (!item) {
      item = await Integration.findOne({ provider });
    }
  }

  if (!item || !item.isConnected || !item.encryptedData) {
    return null;
  }

  return decryptData(item.encryptedData);
};

module.exports = {
  encryptData,
  decryptData,
  getUserIntegrations,
  setIntegrationCredential,
  getIntegrationCredential
};
