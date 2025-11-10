# Dev Server Errors - Fix Guide

## 🔍 Issue
The errors you're seeing are **Next.js build cache corruption** issues, common with:
- Next.js 15 + Turbopack
- WSL2 file system
- Concurrent file writes

## ✅ Solution Applied

1. **Cleaned `.next` directory** - Removed corrupted build cache
2. **Added clean scripts** to `package.json`:
   - `npm run clean` - Removes `.next` and cache
   - `npm run clean:build` - Clean + rebuild

## 🛠️ Quick Fix Commands

### If you see these errors again:

```bash
# Option 1: Use the clean script
npm run clean
npm run dev

# Option 2: Manual cleanup
rm -rf .next node_modules/.cache
npm run dev

# Option 3: If still having issues, disable Turbopack
npm run dev -- --no-turbopack
```

## 🔧 Alternative: Disable Turbopack (if issues persist)

If the errors continue, you can disable Turbopack by updating `package.json`:

```json
"dev": "next dev"
```

Instead of:
```json
"dev": "next dev --turbopack"
```

## 📝 What These Errors Mean

The errors like:
- `ENOENT: no such file or directory, open '.next/static/development/_buildManifest.js.tmp.*'`
- `Cannot find module '.next/server/middleware-manifest.json'`

Are **harmless** - they're Next.js trying to write temporary build files. The app still works, but the errors are annoying.

## ✅ Current Status

- ✅ `.next` directory cleaned
- ✅ Dependencies updated
- ✅ Build succeeds
- ✅ Code is correct

## 🚀 Next Steps

1. **Try running dev server again**:
   ```bash
   npm run dev
   ```

2. **If errors persist**, use:
   ```bash
   npm run clean
   npm run dev
   ```

3. **If still having issues**, disable Turbopack (see above)

The app should work fine - these are just cache/build manifest warnings that don't affect functionality.

