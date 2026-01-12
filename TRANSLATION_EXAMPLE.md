# Translation Example - Step by Step

## Example: Translating the Login Page

### BEFORE (Login.jsx - Original)
```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { login, loading } = useAuthStore();
    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        captcha: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!phone.startsWith('+251')) {
            toast.error('Please enter a valid Ethiopian phone number');
            return;
        }

        const result = await login({
            phone: phone,
            password: formData.password,
        });

        if (result.success) {
            toast.success('Welcome back!');
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">Welcome Back</h2>
                <p className="text-zinc-500">Sign in to manage your portable wealth</p>
            </div>

            <form onSubmit={handleSubmit}>
                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    placeholder="+251912345678"
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <label>Verification</label>
                <input
                    type="text"
                    name="captcha"
                    placeholder="Enter code"
                    required
                />

                <button type="submit">
                    Sign In
                </button>
            </form>

            <p className="text-center">
                Don't have an account?{' '}
                <Link to="/register">
                    Register Now
                </Link>
            </p>
        </div>
    );
}
```

### AFTER (Login.jsx - Translated)
```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // ← ADD THIS
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation(); // ← ADD THIS
    const { login, loading } = useAuthStore();
    const [formData, setFormData] = useState({
        phone: '+251',
        password: '',
        captcha: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!phone.startsWith('+251')) {
            toast.error(t('errors.invalidPhone')); // ← TRANSLATE
            return;
        }

        const result = await login({
            phone: phone,
            password: formData.password,
        });

        if (result.success) {
            toast.success(t('success.welcomeBack')); // ← TRANSLATE
            navigate('/', { replace: true });
        } else {
            toast.error(result.message || t('errors.loginFailed')); // ← TRANSLATE
        }
    };

    return (
        <div className="min-h-screen">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold">{t('auth.welcomeBack')}</h2> {/* ← TRANSLATE */}
                <p className="text-zinc-500">{t('auth.signInSubtitle')}</p> {/* ← TRANSLATE */}
            </div>

            <form onSubmit={handleSubmit}>
                <label>{t('auth.phoneNumber')}</label> {/* ← TRANSLATE */}
                <input
                    type="tel"
                    name="phone"
                    placeholder="+251912345678"
                    required
                />

                <label>{t('auth.password')}</label> {/* ← TRANSLATE */}
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                />

                <label>{t('auth.verification')}</label> {/* ← TRANSLATE */}
                <input
                    type="text"
                    name="captcha"
                    placeholder={t('auth.enterCode')} {/* ← TRANSLATE */}
                    required
                />

                <button type="submit">
                    {t('auth.login')} {/* ← TRANSLATE */}
                </button>
            </form>

            <p className="text-center">
                {t('auth.dontHaveAccount')}{' '} {/* ← TRANSLATE */}
                <Link to="/register">
                    {t('auth.registerNow')} {/* ← TRANSLATE */}
                </Link>
            </p>
        </div>
    );
}
```

## Changes Made

### 1. Import the Hook
```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Use the Hook
```javascript
const { t } = useTranslation();
```

### 3. Replace All Text
| Original | Translated |
|----------|-----------|
| `"Welcome Back"` | `{t('auth.welcomeBack')}` |
| `"Sign in to..."` | `{t('auth.signInSubtitle')}` |
| `"Phone Number"` | `{t('auth.phoneNumber')}` |
| `"Password"` | `{t('auth.password')}` |
| `"Sign In"` | `{t('auth.login')}` |
| `toast.success('Welcome back!')` | `toast.success(t('success.welcomeBack'))` |
| `toast.error('Login failed')` | `toast.error(t('errors.loginFailed'))` |

## Translation Keys Used

These keys are already defined in `client/src/i18n/locales/en.json`:

```json
{
  "auth": {
    "login": "Sign In",
    "welcomeBack": "Welcome Back",
    "signInSubtitle": "Sign in to manage your portable wealth",
    "phoneNumber": "Phone Number",
    "password": "Password",
    "verification": "Verification",
    "enterCode": "Enter code",
    "dontHaveAccount": "Don't have an account?",
    "registerNow": "Register Now"
  },
  "errors": {
    "invalidPhone": "Please enter a valid Ethiopian phone number (+251XXXXXXXXX)",
    "loginFailed": "Login failed"
  },
  "success": {
    "welcomeBack": "Welcome back!"
  }
}
```

## Result

Now when users switch languages:

### English
- "Welcome Back"
- "Sign in to manage your portable wealth"
- "Phone Number"
- "Sign In"

### Amharic (አማርኛ)
- "እንኳን ደህና መጡ"
- "ተንቀሳቃሽ ሀብትዎን ለማስተዳደር ይግቡ"
- "ስልክ ቁጥር"
- "ግባ"

### Chinese (中文)
- "欢迎回来"
- "登录管理您的便携财富"
- "电话号码"
- "登录"

### Arabic (العربية)
- "مرحباً بعودتك"
- "سجل الدخول لإدارة ثروتك المحمولة"
- "رقم الهاتف"
- "تسجيل الدخول"

## Common Patterns

### 1. Simple Text
```javascript
// Before
<h1>Welcome</h1>

// After
<h1>{t('home.welcome')}</h1>
```

### 2. Button Text
```javascript
// Before
<button>Submit</button>

// After
<button>{t('common.submit')}</button>
```

### 3. Placeholder
```javascript
// Before
<input placeholder="Enter your name" />

// After
<input placeholder={t('common.enterName')} />
```

### 4. Toast Messages
```javascript
// Before
toast.success('Saved successfully');
toast.error('Failed to save');

// After
toast.success(t('success.saved'));
toast.error(t('errors.failedToSave'));
```

### 5. Conditional Text
```javascript
// Before
{status === 'active' ? 'Active' : 'Inactive'}

// After
{status === 'active' ? t('common.active') : t('common.inactive')}
```

### 6. With Variables
```javascript
// Before
`You have ${count} messages`

// After
t('messages.count', { count })

// In translation file:
"messages": {
  "count": "You have {{count}} messages"
}
```

### 7. Pluralization
```javascript
// Before
`${days} day${days !== 1 ? 's' : ''} remaining`

// After
t('time.daysRemaining', { days, plural: days !== 1 ? 's' : '' })

// In translation file:
"time": {
  "daysRemaining": "{{days}} day{{plural}} remaining"
}
```

## Testing Your Translation

1. **Start the app:**
```bash
cd client
npm run dev
```

2. **Open in browser:**
```
http://localhost:5173
```

3. **Test language switching:**
   - Click the globe icon (🌐)
   - Select different languages
   - Verify all text changes

4. **Check for issues:**
   - Missing translations (shows key instead of text)
   - Layout problems (text too long)
   - RTL issues (for Arabic)

## Troubleshooting

### Problem: Text shows as "auth.welcomeBack" instead of "Welcome Back"
**Solution:** The translation key doesn't exist. Check:
1. Key is spelled correctly
2. Key exists in translation file
3. Translation file is properly formatted JSON

### Problem: Language doesn't change
**Solution:** Check:
1. i18n is imported in main.jsx
2. Component uses `useTranslation()` hook
3. Browser console for errors

### Problem: Layout breaks with longer text
**Solution:**
1. Use `truncate` or `line-clamp` classes
2. Adjust container widths
3. Test with all languages

## Quick Reference

### Import
```javascript
import { useTranslation } from 'react-i18next';
```

### Use
```javascript
const { t } = useTranslation();
```

### Translate
```javascript
{t('section.key')}
```

### With Variable
```javascript
{t('section.key', { variable: value })}
```

### Get Current Language
```javascript
const { i18n } = useTranslation();
console.log(i18n.language); // 'en', 'am', 'zh', or 'ar'
```

### Change Language Programmatically
```javascript
const { i18n } = useTranslation();
i18n.changeLanguage('am'); // Switch to Amharic
```

## Next Steps

1. Apply this pattern to all other pages
2. Test each page after translation
3. Fix any layout issues
4. Get professional translation review
5. Deploy!

---

**Remember:** The English translation file (`en.json`) is complete with all keys. Just follow this pattern for every component!
