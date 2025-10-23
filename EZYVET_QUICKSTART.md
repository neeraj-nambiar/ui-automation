# ezyVet Login/Logout - Simplified Guide

> **TESTED & VERIFIED** using Chrome DevTools MCP on actual ezyVet application

## 🔍 What Was Learned from Real Testing

The ezyVet login/logout flow is **much simpler** than initially documented. Here's what actually works:

### ✅ **ACTUAL Login Flow**

```
1. Navigate to: https://master.usw2.trial.ezyvet.com
   → Auto-redirects to /login.php

2. Login page has:
   - Email textbox: id="input-email" 
   - Password textbox: id="input-password"
   - "Login" button

3. Fill credentials:
   - Email: botai@test.com
   - Password: Sunshine1

4. Click "Login" button

5. **IMPORTANT:** Location selection appears:
   - Shows "Please select a location" heading
   - Click on "Master branch (Database)" text
   - The text itself is clickable!

6. Success! Redirects to: /
```

### ✅ **ACTUAL Logout Flow**

```
1. Click user avatar (top-right, shows initials like "BA")
   - Located in header, displays user initials

2. Dropdown menu appears with:
   - "BA" (user initials)
   - "BotAI" (user name)
   - "botai@test.com" (email)
   - "Manage Account"
   - "Lock" (Ctrl+Shift+L)
   - "Logout" (Ctrl+Shift+Q) ← Click this

3. Click "Logout" text in the dropdown

4. Success! Redirects to: /login.php?sso=0
```

## 📋 Key Findings from ezyVet Codebase

### Login Backend (`public/core/main/login.php`)
- **Endpoint:** POST to `main/verifyLoginAttempts`
- **Parameters:** `login-email`, `login-password`
- **Success:** Returns JSON with `action` field
- **Department Selection:** May be required based on user's department access
- **Final Redirect:** `/` or `/dashboard`

### Login Frontend (Two Different Pages!)
**Portal Login:** `public/external/portal/application/views/partials/login.php`
- **Email Field:** `id="login-email"`
- **Password Field:** `id="login-password"`
- **Submit Button:** `id="login-button"`

**Main Login:** (Alternative login page)
- **Email Field:** `id="input-email"` ← Use this one!
- **Password Field:** `id="input-password"` ← Use this one!
- **Login Button:** Look for text "Login"

**Form Submission:** AJAX call to verifyLoginAttempts

### Logout (`framework/Controllers/SessionController.php`)
- **Method:** `actionLogout()`
- **Process:** Calls `User::logout()` then `session_destroy()`
- **Endpoint:** `/Session/Logout`

## 🎯 Simplified Page Object Pattern

Based on real testing, here's what your Page Object should look like:

```typescript
// VERIFIED EzyVetLoginPage.ts (tested with Chrome DevTools MCP)
export class EzyVetLoginPage {
  async login(page: Page, email: string, password: string, location?: string) {
    // Navigate (auto-redirects to login if not logged in)
    await page.goto('/');
    
    // Fill form using actual IDs
    await page.locator('#input-email, #login-email').fill(email);
    await page.locator('#input-password, #login-password').fill(password);
    
    // Click login button
    await page.getByText('Login', { exact: true }).first().click();
    
    // Handle location selection (REQUIRED after login!)
    const locationVisible = await page
      .getByText('Please select a location')
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    
    if (locationVisible) {
      const locationName = location || 'Master branch (Database)';
      // Click the location text directly
      await page.getByText(locationName, { exact: false }).click();
    }
    
    // Wait for dashboard
    await page.waitForURL('/');
  }

  async logout(page: Page) {
    // Click user avatar (shows initials like "BA")
    await page.locator('text=/^[A-Z]{2}$/').first().click();
    
    // Click "Logout" from dropdown
    await page.getByText('Logout').click();
    
    // Wait for login page
    await page.waitForURL(/\/login\.php/);
  }
}
```

## 🚨 Common Mistakes to Avoid

### ❌ **DON'T** Over-complicate Selectors
```typescript
// BAD - Too specific, will break
this.emailInput = page.locator('input[name="email"][type="email"]#email.form-control');

// GOOD - Simple and resilient
this.emailInput = page.getByLabel('Email');
// or
this.emailInput = page.locator('#login-email');
```

### ❌ **DON'T** Add Unnecessary Waits
```typescript
// BAD - Manual waiting
await page.waitForTimeout(2000);
await emailInput.fill('test@test.com');

// GOOD - Playwright auto-waits
await page.getByLabel('Email').fill('test@test.com');
```

### ✅ **DO** Handle Location Selection (It's Required!)
```typescript
// VERIFIED - Location selection happens after login
const locationVisible = await page
  .getByText('Please select a location')
  .isVisible({ timeout: 3000 })
  .catch(() => false);

if (locationVisible) {
  // Click the location text directly (it's clickable!)
  await page.getByText('Master branch (Database)').click();
}
```

## 📝 Test Credentials (from .env / quick start doc)

```env
BASE_URL=https://master.usw2.trial.ezyvet.com
TEST_USER_EMAIL=botai@test.com
TEST_USER_PASSWORD=Sunshine1
TEST_DEPARTMENT=Master branch
```

## 🔗 Important URLs

- **Login Page:** `/login.php`
- **Login Endpoint:** `POST /main/verifyLoginAttempts`
- **Dashboard:** `/`
- **Logout:** `/Session/Logout`
- **Login with SSO:** Use "ezyVet Login (SSO)" button

## 📚 Related Codebase Files

For deeper understanding, refer to:
- `/public/core/main/login.php` - Login logic
- `/public/external/portal/application/views/partials/login.php` - Login form HTML
- `/framework/Controllers/SessionController.php` - Logout controller
- `/public/external/portal/application/views/main_login_view.php` - Login JavaScript

## 🎉 Next Steps

1. **Simplify your Page Objects** - Remove unnecessary complexity
2. **Use Playwright's built-in waiting** - Don't add manual waits
3. **Test with Chrome DevTools MCP** - Verify flows before writing tests
4. **Keep it simple** - The simpler your tests, the more maintainable they are

---

**Last Updated:** Verified via Chrome DevTools MCP on actual ezyVet application
