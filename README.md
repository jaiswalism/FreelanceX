# FreelanceX

A decentralized freelance marketplace on **Base Sepolia** powered by smart contract escrow, 2-of-3 multisig arbitration, SIWE (Sign-In with Ethereum) authentication, and an industrial dark-themed React Native mobile app.

---

## 🏛️ Architecture & Monorepo Structure

FreelanceX is structured as an npm workspaces monorepo:

```text
freelanceX/
├── apps/
│   ├── mobile/         # React Native 0.76.6 Android application (Dark Industrial UI, Viem)
│   └── backend/        # Node.js + Express + Prisma + PostgreSQL + SIWE auth backend
├── packages/
│   ├── contracts/      # Solidity contracts (Foundry test suite, USDC Escrow, 2-of-3 Multisig)
│   └── shared/         # Shared TypeScript interfaces, types, and DTO schemas
├── patches/            # patch-package native patches (react-native-gesture-handler on RN 0.76)
├── progress.md         # Comprehensive multi-phase progress tracker
└── package.json        # Workspace orchestrator & scripts
```

---

## ⚙️ Prerequisites

Before you start, make sure you have the following installed on your machine:

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.18.0` (LTS 20.x recommended) | Monorepo runtime & package management |
| **JDK** | `17` (Adoptium Eclipse Temurin recommended) | Android Gradle compilation |
| **Android Studio** | Latest with SDK Platform 34/35 & NDK 26.1 | Android emulation & native build tools |
| **Foundry** | Latest (`forge`, `cast`) | Smart contract compilation & tests |
| **PostgreSQL** | `>= 15` (Local or Docker) | Relational database for backend |

> **Note for Android developers:** Ensure `ANDROID_HOME` (or `ANDROID_SDK_ROOT`) and `JAVA_HOME` environment variables are configured in your system `PATH`.

---

## 🚀 Quickstart Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/jaiswalism/FreelanceX.git
cd FreelanceX

# Install all workspace dependencies
# (runs patch-package automatically via postinstall)
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Review `.env` and configure your credentials:
```env
# Network Configuration (Base Sepolia)
CHAIN_ID=84532
NETWORK_NAME="Base Sepolia"
RPC_URL="https://sepolia.base.org"
BLOCK_EXPLORER_URL="https://sepolia.basescan.org"

# Official Base Sepolia Testnet USDC
USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Backend & Database
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freelancerx?schema=public"
JWT_SECRET="your-development-jwt-secret-key"
```

---

### 3. Setup PostgreSQL Database & Backend

Ensure PostgreSQL is running, then generate the Prisma client and run migrations:

```bash
# Generate Prisma Client and run migrations
cd apps/backend
npm run db:generate
npm run db:migrate

# Start the backend development server (with hot reload)
npm run dev
```

The backend server will start on `http://localhost:4000`.

---

### 4. Smart Contracts (Foundry)

Run the contract test suite from root or inside `packages/contracts`:

```bash
# From workspace root
npm run contracts:test

# Or directly with Forge
cd packages/contracts
forge build
forge test -vvv
```

---

### 5. Running the Android Mobile App

Ensure an Android emulator (or physical device with USB debugging) is running:

```bash
# Check connected devices
adb devices
```

#### Step 5a: Reverse the Metro Port
Enable the Android device to connect to your host's Metro bundler:
```bash
adb reverse tcp:8081 tcp:8081
```

#### Step 5b: Start the Metro Bundler
In a dedicated terminal:
```bash
npm run mobile:start
```

#### Step 5c: Build & Launch the Debug APK
In a second terminal:
```bash
# Option 1: Via root npm script
npm run mobile:android

# Option 2: Direct Gradle assemble & install
cd apps/mobile/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.freelancerx/.MainActivity
```

---

## 🛠️ Monorepo Scripts Reference

All primary workflows can be invoked directly from the project root:

| Command | Action |
| :--- | :--- |
| `npm run mobile:android` | Builds and installs the Android app on connected device |
| `npm run mobile:start` | Launches the React Native Metro bundler |
| `npm run backend:dev` | Runs the Node.js / Express backend with TSX watcher |
| `npm run backend:build` | Compiles the backend TypeScript bundle |
| `npm run contracts:build` | Compiles Solidity contracts via `forge build` |
| `npm run contracts:test` | Executes Foundry smart contract test suite |
| `npm run format` | Runs Prettier across all workspaces |

---

## 💡 Native Build Gotchas & Troubleshooting

This monorepo has been hardened for **React Native 0.76.6**:

1. **`patch-package` Auto-patching**:
   - `react-native-gesture-handler` is patched in `patches/` to ensure full compatibility with RN 0.76's removal of legacy `ViewManagerWithGeneratedInterface` and Kotlin pointer events signature.
   - If you ever run clean installs, `npm run postinstall` will apply the patch automatically.

2. **Merged Native Library Resolution (`OpenSourceMergedSoMapping`)**:
   - In RN 0.76+, native `.so` files are merged into `libreactnative.so`. `MainApplication.kt` is configured with `SoLoader.init(this, OpenSourceMergedSoMapping)` so libraries like `libhermes_executor` resolve properly at runtime.

3. **Web3 & Viem Crypto Polyfill**:
   - `apps/mobile/index.js` includes a global `crypto.getRandomValues` polyfill required by `viem` for ECDSA key generation and message signing on mobile.

4. **Resource Linking (`AAPT`)**:
   - Legacy React Native templates included `@drawable/rn_edit_text_material`, which was deleted upstream in 0.75+. It has been removed from `styles.xml` to avoid resource linking errors.

---

## 🗺️ Project Roadmap

For detailed milestones, progress status, and completed tasks across all phases, see [progress.md](progress.md).
