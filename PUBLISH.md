# Publishing Information

## NPM Package

**Package Name:** `rn-modal-bottom-sheet`
**Current Version:** 1.0.1
**Registry:** https://www.npmjs.com/package/rn-modal-bottom-sheet

### Installation

```bash
npm install rn-modal-bottom-sheet
# or
yarn add rn-modal-bottom-sheet
```

### Usage

```tsx
import ModalSheet, { ModalSheetRef } from 'rn-modal-bottom-sheet';
```

## GitHub Repository

**Repository URL:** https://github.com/christi10/ModalSheet
**Clone URL:** `git clone https://github.com/christi10/ModalSheet.git`

## Publishing Workflow

### 1. Update Version

Edit `react-native-modal-sheet/package.json`:
```bash
cd react-native-modal-sheet
npm version patch  # or minor, or major
```

### 2. Build Package

```bash
npm run build
```

### 3. Test Locally (Optional)

```bash
npm pack
# Test the generated .tgz file
```

### 4. Publish to NPM

```bash
npm publish
```

### 5. Commit and Push Changes

```bash
git add .
git commit -m "chore: release v1.0.x"
git tag v1.0.x
git push origin main --tags
```

## Repository Structure

```
ModalSheet/
├── app/                          # Demo Expo app
│   ├── (tabs)/
│   │   └── examples.tsx         # Example implementations
│   └── _layout.tsx              # Root layout with GestureHandlerRootView
├── react-native-modal-sheet/    # NPM package source
│   ├── src/
│   │   ├── ModalSheet.tsx       # Main component
│   │   └── index.ts             # Exports
│   ├── lib/                     # Compiled output (git-ignored)
│   ├── package.json             # Package metadata
│   ├── tsconfig.json            # TypeScript config
│   └── README.md                # Package documentation
├── CHANGELOG.md                 # Version history
├── PUBLISH.md                   # This file
└── README.md                    # Project README
```

## Links

- **NPM Package:** https://www.npmjs.com/package/rn-modal-bottom-sheet
- **GitHub Repository:** https://github.com/christi10/ModalSheet
- **Issues:** https://github.com/christi10/ModalSheet/issues
- **Author:** Christi10

## Notes

- The demo app is in the root directory
- The publishable package is in `react-native-modal-sheet/`
- Only files listed in `package.json` "files" array are published to npm
- Remember to build before publishing: `npm run build`
- Always test locally before publishing to npm
