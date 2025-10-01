# ⚡ Quick Fix: Build Errors (2 minutes)

## 🎯 Problem

You ran `npm run dev` and got these errors:
1. ❌ `Cannot find module '@tailwindcss/typography'`
2. ⚠️ `Invalid next.config.js options detected: experimental.serverActions`

## ✅ Solution

### Fix 1: Install Missing Package (1 minute)

**Open:** `a:/TARAVSCODE/package.json`

**Find line 54** (in devDependencies, after `"tailwindcss": "^3.4.3",`):

**Add this line:**
```json
"@tailwindcss/typography": "^0.5.10",
```

**Save the file** (Ctrl+S)

**Run in terminal:**
```bash
npm install
```

**Expected:** Installs `@tailwindcss/typography` package

---

### Fix 2: Remove Deprecated Config (30 seconds)

**Open:** `a:/TARAVSCODE/next.config.js`

**Find lines 5-7:**
```javascript
experimental: {
  serverActions: true
},
```

**Delete those 3 lines** (or comment them out)

**Save the file** (Ctrl+S)

---

### ✅ Verify Fixes

**Run:**
```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in 3s
```

**No errors or warnings!**

---

## 🚀 Next Steps

Once the dev server starts successfully:

1. **Open browser:** http://localhost:3000
2. **See TARA's 3D hero section**
3. **Follow:** `LOCALHOST_DEPLOYMENT.md` for complete setup

---

## 🆘 Still Getting Errors?

**Error: Port 3000 already in use**
```bash
npm run dev -- -p 3001  # Use different port
```

**Error: Module not found (other packages)**
```bash
rm -rf node_modules package-lock.json  # Delete and reinstall
npm install
```

**TypeScript errors**
```bash
npm run type-check  # See all type errors
```

---

## 📋 Complete Fix Checklist

- [ ] Added `@tailwindcss/typography` to `package.json`
- [ ] Ran `npm install`
- [ ] Removed `experimental.serverActions` from `next.config.js`
- [ ] Ran `npm run dev`
- [ ] Server started without errors
- [ ] Opened http://localhost:3000 in browser

**Once all boxes are checked, TARA is running! 🎉**
