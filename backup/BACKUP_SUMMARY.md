# Backup Summary

This directory contains files that were not actively used in the current test suite and have been moved here for potential future use or deletion.

## Moved to Backup (Unused Files)

### Components
- `components/Footer.ts`
- `components/Modal.ts`
- `components/NavBar.ts`
- `components/README.md`

### Data
- `data/appointment-test-data.json`
- `data/ezyvet-test-data.json`
- `data/test-products.json`
- `data/test-users.json`
- `data/README.md`

### Fixtures
- `fixtures/authenticated-user.ts`
- `fixtures/ezyvet-authenticated.ts`
- `fixtures/test-fixtures.ts`
- `fixtures/README.md`

### Helpers (Unused)
- `helpers/animal-creation.ts`
- `helpers/appointment-helpers.ts`
- `helpers/auth-helpers.ts`
- `helpers/contact-creation.ts`
- `helpers/data-helpers.ts`
- `helpers/dropdown-helpers.ts`
- `helpers/navigation.ts`
- `helpers/wait-helpers.ts`

### Models
- `models/Order.ts`
- `models/Product.ts`
- `models/User.ts`
- `models/index.ts`
- `models/README.md`

### Pages (Unused)
- `pages/AnimalsPage.ts`
- `pages/AppointmentPage.ts`
- `pages/ProductPage.ts`

### Utils
- `utils/api-client.ts`
- `utils/database.ts`
- `utils/logger.ts`
- `utils/README.md`

## Currently Active Files

### Tests
- `tests/appointments/appointment-creation.spec.ts` ✓
- `tests/appointments/patient-creation.spec.ts` ✓
- `tests/auth/login.spec.ts` ✓
- `tests/wellness-plans/wellness-plan-creation.spec.ts` ✓

### Helpers (Active)
- `helpers/contact-helpers.ts` ✓
- `helpers/ezyvet-auth-helpers.ts` ✓
- `helpers/patient-helpers.ts` ✓
- `helpers/search-helpers.ts` ✓
- `helpers/tab-helpers.ts` ✓

### Pages (Active)
- `pages/DashboardPage.ts` ✓
- `pages/EzyVetLoginPage.ts` ✓

### Config Files
- `playwright.config.ts` ✓
- `tsconfig.json` ✓
- `package.json` ✓
- `package-lock.json` ✓

## Next Steps

1. **Review**: Review the backup files to ensure they're not needed
2. **Delete**: Once confirmed, delete the entire `backup/` directory
3. **Document**: This backup was created during code cleanup to ensure proper test suite organization

**Date**: Created during test suite reorganization
**Reason**: Cleanup unused files while maintaining test functionality

