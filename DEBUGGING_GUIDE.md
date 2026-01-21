# Chrome Extension Debugging Guide

## 🚀 Quick Start - Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Navigate to `chrome://extensions/`
   - Or: Menu → Extensions → Manage Extensions

2. **Enable Developer Mode:**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension:**
   - Click "Load unpacked"
   - Navigate to: `/Users/vorayotekaewchit/Desktop/LifeOS/LifeOS Extension/dist`
   - **IMPORTANT:** Select the `dist` folder, NOT the root folder
   - Click "Select Folder"

4. **Verify Extension Loaded:**
   - You should see "LifeOS Extension" in the extensions list
   - The extension icon should appear in your Chrome toolbar

## 🐛 Debug the Popup

### Open Popup DevTools:

1. **Click the extension icon** in your Chrome toolbar
2. **Right-click anywhere in the popup window**
3. **Select "Inspect"** from the context menu
4. This opens Chrome DevTools for the popup

### Check Console for Errors:

In the DevTools Console, look for:
- ✅ **Success:** No errors, React app mounted
- ❌ **Errors:** Red error messages - check below for common issues

### Common Issues & Solutions:

#### 1. **"Failed to load resource" errors**
   - **Problem:** Assets not loading (404 errors)
   - **Solution:** 
     - Verify you're loading from `dist/` folder
     - Rebuild: `npm run build`
     - Reload extension in Chrome

#### 2. **"Refused to execute inline script" (CSP Error)**
   - **Problem:** Content Security Policy blocking scripts
   - **Solution:** Check `manifest.json` CSP settings (already configured)

#### 3. **"React is not defined" or blank popup**
   - **Problem:** React not loading or mounting
   - **Solution:**
     - Check Console for specific errors
     - Verify `popup.js` and `popup.css` exist in `dist/assets/`
     - Check Network tab - are assets loading?

#### 4. **Popup opens but is blank**
   - **Problem:** React app not rendering
   - **Debug Steps:**
     - Check Console for React errors
     - Verify `#root` element exists in DOM (Elements tab)
     - Check if `ChromeExtensionPopup` component is importing correctly

#### 5. **Storage API errors**
   - **Problem:** Chrome storage not accessible
   - **Solution:** 
     - Verify `storage` permission in `manifest.json` ✓
     - Check Chrome Extensions page for permission warnings

#### 6. **Styles not loading**
   - **Problem:** CSS not applied
   - **Solution:**
     - Check Network tab - is `popup.css` loading?
     - Verify Tailwind CSS is compiled in the CSS file
     - Check for CSP style-src errors

## 🔍 Debugging Checklist

### Before Debugging:
- [ ] Extension is loaded from `dist/` folder
- [ ] Developer mode is enabled
- [ ] Extension shows no errors in Extensions page

### Popup Issues:
- [ ] Right-click popup → Inspect opens DevTools
- [ ] Console shows no errors (or specific error message)
- [ ] Network tab shows all assets loading (200 status)
- [ ] Elements tab shows `<div id="root">` with React content

### Common Console Checks:
- [ ] No 404 errors for assets
- [ ] No CSP violations
- [ ] React DevTools shows component tree (if installed)
- [ ] Storage API accessible (check Application → Storage)

## 📋 Quick Debugging Commands

### In Popup DevTools Console:

```javascript
// Check if React is loaded
window.React

// Check if root element exists
document.getElementById('root')

// Check Chrome storage (should work)
chrome.storage.sync.get(['lifeOS'], (result) => {
  console.log('Storage:', result);
});

// Check extension context
chrome.runtime.id
```

## 🔄 Reload Extension After Changes

After making code changes:

1. **Rebuild:** `npm run build`
2. **Reload Extension:** 
   - Go to `chrome://extensions/`
   - Click the reload icon (🔄) on the LifeOS Extension card
   - Or remove and re-add the extension

3. **Clear Popup Cache:**
   - Close the popup
   - Right-click extension icon → Inspect popup
   - Right-click refresh button in DevTools → "Empty Cache and Hard Reload"

## 🛠️ Advanced Debugging

### Enable React DevTools:
1. Install React Developer Tools extension
2. Open popup DevTools
3. You should see "⚛️ Components" and "⚛️ Profiler" tabs

### Check Background Service Worker:
- Go to `chrome://extensions/`
- Find LifeOS Extension
- Click "service worker" link (if available)
- This opens background.js DevTools

### Network Tab Inspection:
- Open popup DevTools
- Go to Network tab
- Click extension icon to open popup
- Check all requests:
  - `popup.js` - should load (200)
  - `popup.css` - should load (200)
  - Any API calls should succeed

### Storage Inspection:
- Open popup DevTools
- Go to Application tab (Chrome) or Storage tab (other browsers)
- Check "Chrome Storage → Sync Storage"
- Look for `lifeOS` key

## 📝 Current Build Info

- **Build Date:** Just rebuilt with relative paths
- **Popup HTML:** `dist/popup.html`
- **Assets:** `dist/assets/popup.js` (318KB), `dist/assets/popup.css` (82KB)
- **Manifest:** Manifest V3 ✓
- **Paths:** Using relative paths (`./assets/`) ✓

## ⚠️ Known Issues & Workarounds

1. **First load might be slow** - This is normal for extension popups
2. **If popup doesn't open** - Check extension permissions in Chrome settings
3. **If styles look broken** - Hard refresh the popup (Cmd+Shift+R / Ctrl+Shift+R)

## 🆘 Still Having Issues?

1. **Check the Console** for specific error messages
2. **Check the Network tab** for failed requests
3. **Check manifest.json** for permission issues
4. **Rebuild and reload** the extension
5. **Try in an incognito window** (extensions usually work there too)

---

**Quick Reference:**
- Extension path: `/Users/vorayotekaewchit/Desktop/LifeOS/LifeOS Extension/dist`
- Popup entry: `popup.html` → `popup.tsx` → `ChromeExtensionPopup`
- Main component: `components/ChromeExtensionPopup.tsx`
