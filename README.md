# ezyVet UI Automation Tests

End-to-end testing framework for ezyVet using Playwright and TypeScript.

## 📁 Project Structure

```
tests/ui-automation/
├── playwright.config.ts          # Main Playwright configuration
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment variables template
├── EZYVET_QUICKSTART.md         # Verified login/logout flow documentation
├── PLAYWRIGHT_BEST_PRACTICES.md # Comprehensive testing standards
│
├── tests/                        # Test files
│   ├── auth/
│   │   └── login.spec.ts        # Login with location selection and logout test
│   └── appointments/
│       └── appointment-creation.spec.ts  # Appointment creation tests
│
├── pages/                        # Page Object Models
│   ├── EzyVetLoginPage.ts       # Login page interactions
│   ├── DashboardPage.ts         # Dashboard/main page interactions
│   ├── AnimalsPage.ts           # Animals/patients page interactions
│   └── AppointmentPage.ts       # Appointment form interactions
│
├── helpers/                      # Utility functions
│   ├── ezyvet-auth-helpers.ts   # Authentication helpers
│   └── appointment-helpers.ts   # Appointment creation helpers
│
└── models/                       # TypeScript interfaces/types
    └── User.ts                  # User data models
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Access to ezyVet test environment

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install --with-deps chromium
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials (already populated with test credentials)
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run authentication test
npx playwright test tests/auth/login.spec.ts

# Run appointment tests
npx playwright test tests/appointments/appointment-creation.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run in UI mode (interactive)
npx playwright test --ui

# Run with video recording
npx playwright test --headed --video=on
```

## 📝 Test Credentials

From `EZYVET_QUICKSTART.md` (verified with Chrome DevTools MCP):

- **Email:** `botai@test.com`
- **Password:** `Sunshine1`
- **Location:** `Master branch (Database)`

## ✅ Verified Flows

All flows have been verified using Chrome DevTools MCP against the actual ezyVet application.

### Login Flow

1. Navigate to base URL (auto-redirects to `/login.php`)
2. Fill credentials:
   - Email: `#input-email` or `#login-email`
   - Password: `#input-password` or `#login-password`
3. Click "Login" button
4. Handle location selection: Click "Master branch (Database)"
5. Success: Redirects to `/`

### Logout Flow

1. Click user avatar (shows initials like "BA")
2. Dropdown appears with user info and options
3. Click "Logout"
4. Success: Redirects to `/login.php?sso=0`

### Appointment Creation Flow (✅ Verified October 16, 2025)

1. Login to ezyVet
2. Navigate to "Animals" tab
3. Search for patient (e.g., ID: 201854)
4. Select patient record
5. Click "New Appointment" button
6. Fill mandatory "People/Resources Used" field (e.g., "Dr Smith")
7. Click Save
8. Success: Green toast "Record Saved Successfully!" appears

See [EZYVET_QUICKSTART.md](./EZYVET_QUICKSTART.md) and [appointment_creation_success.md](../../../appointment_creation_success.md) for detailed flow documentation.

## 🏗️ Architecture

### Page Object Model (POM)

We use the Page Object Model pattern for better maintainability:

- **`EzyVetLoginPage`**: Handles all login-related interactions
- **`DashboardPage`**: Handles dashboard and logout interactions

### Best Practices

This project follows comprehensive Playwright best practices:

- ✅ User-centric locators (`getByRole`, `getByText`, `getByLabel`)
- ✅ Auto-waiting (no manual `waitForTimeout` unless necessary)
- ✅ Strong assertions
- ✅ Modular test structure
- ✅ Clear test descriptions
- ✅ Proper test isolation

See [PLAYWRIGHT_BEST_PRACTICES.md](./PLAYWRIGHT_BEST_PRACTICES.md) for detailed guidelines.

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

View test traces (for failed tests):

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## 🐛 Debugging

### Debug Mode

```bash
# Debug specific test
npx playwright test login.spec.ts --debug

# Debug with headed browser
npx playwright test --headed --debug
```

### UI Mode (Recommended)

```bash
npx playwright test --ui
```

Features:
- Watch mode with auto-rerun
- Time travel debugging
- Pick locator tool
- Network inspection

### Trace Viewer

Traces are automatically captured on first retry. To view:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## 📚 Documentation

- **[EZYVET_QUICKSTART.md](./EZYVET_QUICKSTART.md)** - Verified login/logout flows
- **[PLAYWRIGHT_BEST_PRACTICES.md](./PLAYWRIGHT_BEST_PRACTICES.md)** - Comprehensive testing standards
- **[Playwright Official Docs](https://playwright.dev)** - Official documentation

## 🔧 Configuration

Main configuration is in `playwright.config.ts`:

```typescript
{
  baseURL: 'https://master.usw2.trial.ezyvet.com',
  timeout: 60000,
  retries: 0,
  workers: 1,
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Override with environment variables in `.env` file.

## 📦 Dependencies

- **@playwright/test**: End-to-end testing framework
- **dotenv**: Environment variable management
- **typescript**: Type safety and better IDE support

## 🤝 Contributing

When adding new tests:

1. Follow the Page Object Model pattern
2. Use user-centric locators
3. Add strong assertions
4. Document your changes
5. Verify flows with Chrome DevTools MCP when possible
6. Update `EZYVET_QUICKSTART.md` if flows change

## 📄 License

Internal use only - ezyVet QA Team

---

**Last Updated:** October 2025  
**Framework Version:** Playwright 1.x+
