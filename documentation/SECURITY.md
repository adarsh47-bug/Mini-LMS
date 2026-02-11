# Security Implementation Guide

> **TL;DR**: Multi-layered security with encrypted storage, input sanitization, JWT auth, and device integrity checks.

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Security Features](#security-features)
  - [Secure Token Storage](#1-secure-token-storage)
  - [Data Encryption](#2-data-encryption)
  - [Input Validation & Sanitization](#3-input-validation--sanitization)
  - [Password Security](#4-password-security)
  - [Environment Variables](#5-environment-variables)
  - [Device Security](#6-device-security)
  - [Network Security](#7-network-security)
- [Implementation Guide](#implementation-guide)
- [Production Checklist](#production-checklist)
- [Security Best Practices](#security-best-practices)
- [Common Vulnerabilities](#common-vulnerabilities)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## 🚀 Quick Start

### Check Security Status

```typescript
import { getDeviceSecurityInfo } from '@/src/utils/security.utils';

const securityInfo = await getDeviceSecurityInfo();
console.log(securityInfo);
// {
//   isCompromised: false,
//   platform: 'ios',
//   osVersion: '17.0',
//   deviceName: 'iPhone',
//   manufacturer: 'Apple',
//   modelName: 'iPhone 14 Pro'
// }
```

### Basic Security Setup

```bash
# 1. Create environment file
cp .env.example .env

# 2. Configure variables
#   EXPO_PUBLIC_ENV=development
#   EXPO_PUBLIC_API_BASE_URL=https://api.example.com

# 3. Run security audit
npm audit

# 4. Run tests
npm run test:coverage
```

---

## 🛡️ Security Features

### 1. Secure Token Storage

Tokens are stored using platform-specific encrypted storage.

#### How It Works

- **iOS**: Keychain Services (hardware-encrypted)
- **Android**: Keystore System (hardware-backed when available)
- **Web**: Encrypted localStorage with AES-256

#### Usage

```typescript
import { setStorageItemAsync, getStorageItemAsync } from '@/src/utils';

// Store token securely
await setStorageItemAsync('accessToken', token);

// Retrieve token
const token = await getStorageItemAsync('accessToken');

// Delete token
await setStorageItemAsync('accessToken', null);
```

#### Implementation

```typescript
// src/utils/storage.utils.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function setStorageItemAsync(
  key: string,
  value: string | null
): Promise<void> {
  if (Platform.OS === 'web') {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      // Encrypt before storing on web
      const encrypted = await encryptData(value);
      localStorage.setItem(key, encrypted);
    }
  } else {
    // Use SecureStore on native platforms
    if (value === null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}
```

---

### 2. Data Encryption

AES-256 encryption for sensitive data.

#### Encrypt Data

```typescript
import { encryptData, decryptData } from '@/src/utils/security.utils';

// Encrypt sensitive data
const encrypted = await encryptData('sensitive-information');
await SecureStore.setItemAsync('secret', encrypted);

// Decrypt when retrieving
const encrypted = await SecureStore.getItemAsync('secret');
const decrypted = await decryptData(encrypted);
```

#### Generate Secure Keys

```typescript
import { generateSecureKey } from '@/src/utils/security.utils';

// Generate cryptographically secure random key
const key = await generateSecureKey(32); // 32 bytes = 256 bits
```

#### Hash Data

```typescript
import Crypto from 'expo-crypto';

// SHA-256 hash
const hash = await Crypto.digestStringAsync(
  Crypto.CryptoDigestAlgorithm.SHA256,
  'data-to-hash'
);
```

---

### 3. Input Validation & Sanitization

Prevent XSS and injection attacks.

#### Sanitize User Input

```typescript
import { sanitizeInput } from '@/src/utils/security.utils';

// Remove harmful HTML/script tags
const userInput = '<script>alert("XSS")</script>Hello, World!';
const clean = sanitizeInput(userInput);
// Result: 'Hello, World!'

// Removes: <script>, <iframe>, <object>, onerror, onclick, etc.
```

#### Email Validation

```typescript
import { isValidEmail } from '@/src/utils/security.utils';

const valid = isValidEmail('user@example.com'); // true
const invalid = isValidEmail('not-an-email'); // false
```

#### Form Validation with Zod

```typescript
import { z } from 'zod';
import { loginSchema } from '@/src/types/auth.types';

// Validation schemas with XSS protection
const result = loginSchema.safeParse({
  username: sanitizeInput(username),
  password: password, // Don't sanitize passwords
});

if (!result.success) {
  console.error(result.error.flatten());
}
```

---

### 4. Password Security

#### Password Strength Checking

```typescript
import { checkPasswordStrength } from '@/src/utils/security.utils';

const result = checkPasswordStrength('MyP@ssw0rd2024');

console.log(result);
// {
//   score: 4,          // 0-5 (5 is strongest)
//   feedback: [
//     'Add more symbols',
//     'Use a mix of upper and lowercase'
//   ],
//   strength: 'strong' // 'weak', 'fair', 'good', 'strong', 'very strong'
// }
```

#### Password Requirements

```typescript
// Enforced in validation schemas
const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character');
```

---

### 5. Environment Variables

Secure configuration management.

#### Setup

```bash
# .env file
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1
EXPO_PUBLIC_API_TIMEOUT=60000
EXPO_PUBLIC_ENV=development
```

#### Usage

```typescript
import { env } from '@/src/config/env';

const apiUrl = env.apiBaseUrl;        // Type-safe
const timeout = env.apiTimeout;       // Validated
const isDev = env.isDevelopment;      // Boolean
```

#### Environment File Structure

```
.env                  # Local development (gitignored)
.env.example          # Template for all environments
.env.development      # Development settings
.env.staging          # Staging environment
.env.production       # Production settings
```

⚠️ **Never commit `.env` files to version control!**

---

### 6. Device Security

#### Jailbreak/Root Detection

```typescript
import { isDeviceCompromised } from '@/src/utils/security.utils';

const compromised = await isDeviceCompromised();

if (compromised) {
  Alert.alert(
    'Security Warning',
    'This device may be compromised. Some features will be disabled.',
    [{ text: 'OK' }]
  );
}
```

#### Device Security Info

```typescript
import { getDeviceSecurityInfo } from '@/src/utils/security.utils';

const info = await getDeviceSecurityInfo();
console.log(info);
// {
//   isCompromised: false,
//   platform: 'ios',
//   osVersion: '17.0',
//   deviceName: 'iPhone 14 Pro',
//   manufacturer: 'Apple',
//   modelName: 'iPhone14,3'
// }
```

#### Production Implementation

For production, install native detection library:

```bash
npm install jail-monkey
```

Then update `security.utils.ts`:

```typescript
import JailMonkey from 'jail-monkey';

export async function isDeviceCompromised(): Promise<boolean> {
  if (__DEV__) return false;
  
  return JailMonkey.isJailBroken();
}
```

---

### 7. Network Security

#### HTTPS-Only Communication

```typescript
// src/services/api.ts
const BASE_URL = env.apiBaseUrl; // Must be https://

// Enforce HTTPS
if (!BASE_URL.startsWith('https://')) {
  throw new Error('API must use HTTPS');
}
```

#### Request Timeout

```typescript
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUTS.API_DEFAULT, // 60000ms (60s)
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### Certificate Pinning (Optional)

```bash
# .env
EXPO_PUBLIC_SSL_PINS=api.example.com:sha256/HASH1,sha256/HASH2
```

**Generate Certificate Hash:**

```bash
openssl s_client -servername api.example.com -connect api.example.com:443 < /dev/null \
  | openssl x509 -pubkey -noout \
  | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary \
  | openssl enc -base64
```

**Production Implementation:**

```bash
npm install react-native-ssl-pinning
```

---

## 🔧 Implementation Guide

### Step 1: Setup Environment

```bash
# Create .env file
cp .env.example .env

# Configure required variables
# EXPO_PUBLIC_API_BASE_URL=https://api.example.com
# EXPO_PUBLIC_ENV=development
```

### Step 2: Initialize Secure Storage

```typescript
// app/_layout.tsx
import { initializeSecureStorage } from '@/src/utils';

export default function RootLayout() {
  useEffect(() => {
    initializeSecureStorage();
  }, []);
  
  // ...
}
```

### Step 3: Implement Auth Token Management

```typescript
// src/services/api.ts
import { getAccessToken } from '@/src/utils';

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Step 4: Add Input Sanitization

```typescript
// Before storing user input
import { sanitizeInput } from '@/src/utils/security.utils';

const cleanInput = sanitizeInput(userInput);
```

### Step 5: Enable Device Security Checks

```typescript
// app/_layout.tsx
import { isDeviceCompromised } from '@/src/utils/security.utils';

useEffect(() => {
  checkDeviceSecurity();
}, []);

async function checkDeviceSecurity() {
  const compromised = await isDeviceCompromised();
  if (compromised) {
    // Handle compromised device
    alert('Device security warning');
  }
}
```

---

## ✅ Production Checklist

### Before Deploying to Production:

#### 1. Environment Configuration
- [ ] Create `.env.production` file
- [ ] Configure production API URLs (HTTPS only)
- [ ] Remove development-only variables
- [ ] Verify all required variables are set

#### 2. Code Security
- [ ] Remove all `console.log` statements
- [ ] Remove `__DEV__` checks in production code
- [ ] Enable code obfuscation (optional)
- [ ] Review and minimize app permissions

#### 3. Certificate Pinning
- [ ] Install native SSL pinning library
- [ ] Generate certificate pins for production API
- [ ] Configure pin rotation strategy
- [ ] Test with production certificates

#### 4. Device Security
- [ ] Install `jail-monkey` for jailbreak/root detection
- [ ] Implement compromise handling
- [ ] Test on jailbroken/rooted devices
- [ ] Add device fingerprinting (optional)

#### 5. Data Protection
- [ ] Verify all sensitive data uses SecureStore
- [ ] Enable encryption for cached data
- [ ] Clear sensitive data on logout
- [ ] Implement data expiration policies

#### 6. API Security
- [ ] Enable request/response encryption
- [ ] Implement rate limiting handling
- [ ] Add retry logic with exponential backoff
- [ ] Configure proper timeout values

#### 7. Testing & Auditing
- [ ] Run security audit: `npm audit`
- [ ] Fix all high/critical vulnerabilities
- [ ] Run penetration testing
- [ ] Test all authentication flows
- [ ] Verify token refresh mechanism

#### 8. Build Configuration
- [ ] Enable ProGuard (Android)
- [ ] Configure code signing certificates
- [ ] Review app.json permissions
- [ ] Test on multiple devices/OS versions

---

## 🎯 Security Best Practices

### Authentication & Authorization

✅ **Do:**
- Store tokens in SecureStore (never AsyncStorage)
- Implement automatic token refresh
- Clear all tokens on logout
- Validate session on app resume
- Use short-lived access tokens (15 min)

❌ **Don't:**
- Store passwords (even hashed)
- Send tokens in URL parameters
- Store sensitive data in AsyncStorage
- Use long-lived tokens without refresh

### Data Management

✅ **Do:**
- Encrypt sensitive data before storage
- Use secure random key generation
- Sanitize all user input
- Validate data on client and server
- Clear sensitive cache on logout

❌ **Don't:**
- Store unencrypted PII (Personal Identifiable Information)
- Trust client-side validation alone
- Log sensitive information
- Cache API responses with tokens

### Network Communication

✅ **Do:**
- Use HTTPS for all API calls
- Implement certificate pinning in production
- Set appropriate request timeouts
- Handle network errors gracefully
- Validate SSL certificates

❌ **Don't:**
- Use HTTP for sensitive data
- Disable SSL verification
- Trust unvalidated certificates
- Expose API keys in client code

### Code Security

✅ **Do:**
- Keep dependencies up to date
- Run regular security audits
- Use environment variables for config
- Implement proper error handling
- Code review all security-related changes

❌ **Don't:**
- Hardcode credentials or API keys
- Commit `.env` files to git
- Use deprecated/vulnerable packages
- Ignore security warnings

---

## 🚨 Common Vulnerabilities

### 1. Token Exposure

**Risk**: Tokens stored in AsyncStorage can be accessed by other apps.

**Solution**:
```typescript
// ❌ Vulnerable
await AsyncStorage.setItem('token', accessToken);

// ✅ Secure
await setStorageItemAsync('accessToken', token); // Uses SecureStore
```

### 2. XSS Attacks

**Risk**: Unescaped user input can execute malicious scripts.

**Solution**:
```typescript
// ❌ Vulnerable
<Text>{userInput}</Text>

// ✅ Secure
<Text>{sanitizeInput(userInput)}</Text>
```

### 3. Man-in-the-Middle Attacks

**Risk**: Network traffic can be intercepted without SSL pinning.

**Solution**:
- Implement certificate pinning in production
- Use HTTPS for all requests
- Validate SSL certificates

### 4. Weak Passwords

**Risk**: Weak passwords are easily cracked.

**Solution**:
```typescript
const strength = checkPasswordStrength(password);
if (strength.score < 3) {
  // Reject weak password
  throw new Error('Password too weak');
}
```

### 5. Compromised Devices

**Risk**: Jailbroken/rooted devices bypass security controls.

**Solution**:
```typescript
const compromised = await isDeviceCompromised();
if (compromised) {
  // Limit functionality or block access
}
```

---

## 🔧 Troubleshooting

### SecureStore Not Working on Web

**Issue**: SecureStore is not available in web browsers.

**Solution**: The app automatically falls back to encrypted localStorage.

```typescript
// Handled automatically by setStorageItemAsync
if (Platform.OS === 'web') {
  // Uses encrypted localStorage
} else {
  // Uses SecureStore
}
```

### Certificate Pinning Failures

**Issue**: App can't connect to API after implementing pinning.

**Solutions**:
1. Verify certificate hash is correct
2. Check certificate hasn't expired/rotated
3. Test with production certificates
4. Implement pin rotation strategy

### Jailbreak Detection False Positives

**Issue**: Development builds flagged as compromised.

**Solution**: Skip detection in development mode.

```typescript
if (__DEV__) return false; // Skip in development
```

---

## 📚 Resources

### Official Documentation
- [Expo Security Best Practices](https://docs.expo.dev/guides/security/)
- [React Native Security](https://reactnative.dev/docs/security)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)

### Libraries
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [expo-crypto](https://docs.expo.dev/versions/latest/sdk/crypto/)
- [jail-monkey](https://github.com/GantMan/jail-monkey)
- [react-native-ssl-pinning](https://github.com/MaxToyberman/react-native-ssl-pinning)

### Security Auditing
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

---

**Last Updated**: February 2026  
**Maintainer**: MLMS Development Team
