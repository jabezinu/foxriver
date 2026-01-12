# SPA 404 Refresh Issue - Fix Guide

## Problem
When you refresh a page in the deployed React app (e.g., `/team`, `/settings`), you get a 404 error. This happens because the server tries to find a physical file at that path, but only `index.html` exists.

## Solution
The server needs to redirect all routes to `index.html` so React Router can handle the routing client-side.

## Files Created

I've created configuration files for multiple hosting platforms in both `client/public/` and `admin/public/`:

### 1. Apache Server (`.htaccess`)
**Location**: `client/public/.htaccess` and `admin/public/.htaccess`

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

**When to use**: cPanel, shared hosting, Apache servers

### 2. Netlify (`_redirects`)
**Location**: `client/public/_redirects` and `admin/public/_redirects`

```
/* /index.html 200
```

**When to use**: Netlify deployments

### 3. Netlify Alternative (`netlify.toml`)
**Location**: `client/public/netlify.toml` and `admin/public/netlify.toml`

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**When to use**: Netlify deployments (alternative to `_redirects`)

### 4. Vercel (`vercel.json`)
**Location**: `client/public/vercel.json` and `admin/public/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**When to use**: Vercel deployments

## Deployment Instructions by Platform

### Apache / cPanel / Shared Hosting

1. Build your app:
   ```bash
   cd client  # or admin
   npm run build
   ```

2. Upload the `dist/` folder contents to your server

3. The `.htaccess` file will automatically be included (it's in `public/` folder)

4. **Important**: Make sure `mod_rewrite` is enabled on your Apache server

5. If it still doesn't work, add this to your `.htaccess`:
   ```apache
   Options -MultiViews
   ```

### Netlify

1. Build your app:
   ```bash
   cd client  # or admin
   npm run build
   ```

2. Deploy the `dist/` folder to Netlify

3. The `_redirects` file will automatically be included

4. **Alternative**: Use Netlify's dashboard to add a redirect rule:
   - From: `/*`
   - To: `/index.html`
   - Status: `200` (Rewrite)

### Vercel

1. Build your app:
   ```bash
   cd client  # or admin
   npm run build
   ```

2. Deploy to Vercel

3. The `vercel.json` file will automatically be included

4. **Alternative**: Vercel usually handles SPAs automatically, but the config ensures it works

### Nginx

If you're using Nginx, add this to your server configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### AWS S3 + CloudFront

1. In S3 bucket settings, set error document to `index.html`
2. In CloudFront, create a custom error response:
   - HTTP Error Code: `403` and `404`
   - Response Page Path: `/index.html`
   - HTTP Response Code: `200`

## Testing

After deployment, test these scenarios:

1. ✅ Navigate to home page
2. ✅ Click links to navigate to other pages
3. ✅ **Refresh the page** (this was failing before)
4. ✅ Directly visit a deep route (e.g., `yoursite.com/team`)
5. ✅ Check that 404 for actual missing files still works

## Rebuild Required

After adding these files, you need to rebuild:

```bash
# For client
cd client
npm run build

# For admin
cd admin
npm run build
```

The files in `public/` folder are automatically copied to `dist/` during build.

## Common Issues

### Issue: Still getting 404
**Solution**: 
- Check if the config file is in the `dist/` folder after build
- Verify your server supports the configuration method you're using
- Check server logs for errors

### Issue: API calls returning 404
**Solution**: 
- This fix only handles frontend routes
- Make sure your API is running and accessible
- Check CORS settings in your backend

### Issue: Works locally but not in production
**Solution**: 
- Local dev server (Vite) handles this automatically
- Production server needs explicit configuration
- Use the appropriate config file for your hosting platform

## Current Status

✅ Configuration files created for all platforms  
✅ Files placed in `public/` folders (auto-copied during build)  
✅ Both client and admin apps configured  

**Next Step**: Rebuild and redeploy your application!
