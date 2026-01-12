# ⚡ Quick Commands Reference

## 🚀 Getting Started

### Install Dependencies (Already Done)
```bash
cd client
npm install i18next react-i18next
```

### Start Development Server
```bash
cd client
npm run dev
```

### Find Untranslated Strings
```bash
node find-hardcoded-strings.js
```

## 📝 Common Code Snippets

### Add Translation to Component
```javascript
// 1. Import
import { useTranslation } from 'react-i18next';

// 2. Use hook
const { t } = useTranslation();

// 3. Translate text
<h1>{t('section.key')}</h1>
```

### Change Language Programmatically
```javascript
const { i18n } = useTranslation();
i18n.changeLanguage('am'); // Switch to Amharic
```

### Get Current Language
```javascript
const { i18n } = useTranslation();
console.log(i18n.language); // 'en', 'am', 'zh', or 'ar'
```

### Translation with Variables
```javascript
// In component
{t('message.greeting', { name: 'John' })}

// In translation file
"message": {
  "greeting": "Hello {{name}}!"
}
```

## 🔧 File Locations

### Configuration
```
client/src/i18n/config.js
```

### Translation Files
```
client/src/i18n/locales/en.json  ← English (complete)
client/src/i18n/locales/am.json  ← Amharic (needs work)
client/src/i18n/locales/zh.json  ← Chinese (needs work)
client/src/i18n/locales/ar.json  ← Arabic (needs work)
```

### Language Selector
```
client/src/components/LanguageSelector.jsx
```

## 📋 Quick Checklist

### For Each Component:
- [ ] Import `useTranslation`
- [ ] Add `const { t } = useTranslation();`
- [ ] Replace all hardcoded text with `{t('key')}`
- [ ] Test with all languages

### For Each Translation Key:
- [ ] Add to `en.json` first
- [ ] Use descriptive key name
- [ ] Add to other language files
- [ ] Test that it displays correctly

## 🎯 Priority Files to Update

### High Priority (Do First)
```
client/src/pages/Login.jsx
client/src/pages/Register.jsx
client/src/pages/Task.jsx
client/src/pages/Deposit.jsx
client/src/pages/Withdraw.jsx
```

### Medium Priority (Do Next)
```
client/src/pages/Team.jsx
client/src/pages/Mine.jsx
client/src/pages/Settings.jsx
client/src/pages/Wealth.jsx
client/src/pages/TierList.jsx
```

### Low Priority (Do Last)
```
client/src/pages/CompanyNews.jsx
client/src/pages/QnA.jsx
client/src/pages/Courses.jsx
client/src/pages/SpinWheel.jsx
client/src/pages/AppRules.jsx
client/src/pages/Mail.jsx
```

## 🐛 Troubleshooting Commands

### Check for Missing Translations
```bash
# Run the helper script
node find-hardcoded-strings.js
```

### Clear Browser Cache
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### Check Current Language
```javascript
// In browser console
localStorage.getItem('language');
```

### Force Language Change
```javascript
// In browser console
localStorage.setItem('language', 'am');
location.reload();
```

## 📊 Testing Commands

### Test Each Language
```bash
# 1. Start dev server
cd client && npm run dev

# 2. Open browser
# http://localhost:5173

# 3. Click globe icon (🌐)
# 4. Select each language
# 5. Navigate through all pages
# 6. Check for issues
```

### Check Translation Coverage
```bash
# Count keys in each file
cd client/src/i18n/locales

# Linux/Mac
wc -l *.json

# Windows PowerShell
Get-ChildItem *.json | Measure-Object -Line
```

## 🔍 Search Commands

### Find All Hardcoded Strings
```bash
# Search for potential hardcoded text in JSX
grep -r ">[A-Z]" client/src/pages/
grep -r "\"[A-Z]" client/src/pages/
```

### Find All Translation Usage
```bash
# Find all t() calls
grep -r "t('" client/src/
grep -r 't("' client/src/
```

### Find Missing Translations
```bash
# Compare translation files
diff client/src/i18n/locales/en.json client/src/i18n/locales/am.json
```

## 📝 Git Commands

### Commit Translation Changes
```bash
git add client/src/i18n/
git commit -m "Add multi-language support"
```

### Create Translation Branch
```bash
git checkout -b feature/i18n-implementation
```

### Push Changes
```bash
git push origin feature/i18n-implementation
```

## 🎨 CSS for RTL

### Add RTL Styles (if needed)
```css
/* In client/src/index.css */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

[dir="rtl"] .flex {
  flex-direction: row-reverse;
}
```

## 📦 Package Commands

### Update i18next
```bash
cd client
npm update i18next react-i18next
```

### Check Package Versions
```bash
cd client
npm list i18next react-i18next
```

## 🔄 Workflow Commands

### Daily Workflow
```bash
# 1. Pull latest changes
git pull

# 2. Start dev server
cd client && npm run dev

# 3. Make changes
# (edit files)

# 4. Test changes
# (use browser)

# 5. Find remaining hardcoded strings
node find-hardcoded-strings.js

# 6. Commit changes
git add .
git commit -m "Update translations"
git push
```

## 📚 Documentation Commands

### View Documentation
```bash
# Quick start
cat I18N_README.md

# Implementation guide
cat I18N_IMPLEMENTATION_GUIDE.md

# Example
cat TRANSLATION_EXAMPLE.md

# Checklist
cat TRANSLATION_CHECKLIST.md
```

### Search Documentation
```bash
# Find specific topic
grep -r "RTL" *.md
grep -r "Arabic" *.md
grep -r "translation" *.md
```

## 🎯 Quick Fixes

### Fix Missing Translation
```javascript
// 1. Add to en.json
{
  "section": {
    "newKey": "New text"
  }
}

// 2. Use in component
{t('section.newKey')}

// 3. Add to other language files
// (am.json, zh.json, ar.json)
```

### Fix Layout Issue
```css
/* Add to component or index.css */
.text-container {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### Fix RTL Issue
```javascript
// In LanguageSelector.jsx (already done)
document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
```

## 🚨 Emergency Commands

### Revert to English
```javascript
// In browser console
localStorage.setItem('language', 'en');
location.reload();
```

### Reset All i18n Settings
```javascript
// In browser console
localStorage.removeItem('language');
location.reload();
```

### Check for Errors
```javascript
// In browser console
// Look for i18n errors
console.log(window.i18n);
```

## 📞 Help Commands

### Get Help
```bash
# View README
cat I18N_README.md

# View implementation guide
cat I18N_IMPLEMENTATION_GUIDE.md

# View example
cat TRANSLATION_EXAMPLE.md

# View this file
cat QUICK_COMMANDS.md
```

## 🎉 Success Commands

### Verify Implementation
```bash
# 1. Check all files exist
ls client/src/i18n/locales/

# 2. Check language selector exists
ls client/src/components/LanguageSelector.jsx

# 3. Run find script
node find-hardcoded-strings.js

# 4. Start app and test
cd client && npm run dev
```

---

## 💡 Pro Tips

1. **Always test after changes:** `npm run dev`
2. **Use the helper script:** `node find-hardcoded-strings.js`
3. **Check browser console:** Look for i18n errors
4. **Test all languages:** Don't assume it works
5. **Keep files in sync:** Update all language files together

---

**Quick Access:**
- 📖 Full Guide: `I18N_IMPLEMENTATION_GUIDE.md`
- ✅ Checklist: `TRANSLATION_CHECKLIST.md`
- 📝 Example: `TRANSLATION_EXAMPLE.md`
- 🎨 Visual: `VISUAL_TRANSLATION_GUIDE.md`
