# Insurance Broker CRM

A comprehensive CRM system designed specifically for insurance brokers, featuring client management, policy tracking, and communication tools.

## Project Structure

```
InsuranceBrokerCRM_Development/
├── css/
│   ├── styles.css
│   └── components/
│       ├── clientProfile.css
│       └── clientList.css
├── js/
│   ├── clientManager.js
│   └── components/
│       ├── clientProfile.js
│       └── clientList.js
├── __tests__/
│   ├── clientManager.test.js
│   ├── clientProfile.test.js
│   └── clientList.test.js
└── index.html
```

## Features

### Core Features (Implemented)
- Client Management System
  - Comprehensive client profiles
  - Client list with grid/table views
  - Search and filtering capabilities
  - Status tracking
  - Contact management

### Testing Coverage
The project includes comprehensive test coverage for all core components:

1. ClientManager Tests
   - Client data management
   - Search and filtering
   - Timeline tracking
   - Renewal management

2. ClientProfile Tests
   - Profile rendering
   - Data display
   - Edit functionality
   - Interaction tracking
   - Document management

3. ClientList Tests
   - List rendering
   - View toggling
   - Filtering and searching
   - Action handling
   - Pagination

## Running Tests

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

### Running Tests
- Run all tests:
  ```bash
  npm test
  ```

- Run tests in watch mode (for development):
  ```bash
  npm run test:watch
  ```

- Generate coverage report:
  ```bash
  npm run test:coverage
  ```

### Test Commands
- `npm test`: Run all tests once
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate coverage report
- `npm run test:ci`: Run tests in CI mode

## Development Guidelines

### Adding New Tests
1. Create test files in the `__tests__` directory
2. Follow the existing test structure
3. Include both unit and integration tests
4. Ensure proper mocking of dependencies

### Test Structure
- Use descriptive test names
- Group related tests using `describe` blocks
- Use `beforeEach` for common setup
- Clean up after tests using `afterEach`

### Code Coverage Goals
- Maintain minimum 80% coverage for all components
- Focus on critical business logic
- Include edge cases and error scenarios

## Version Control
- Development work is done in `InsuranceBrokerCRM_Development`
- Stable versions are backed up with version numbers
- Each major version includes full test coverage

## Running the Application
1. Open `index.html` in a web browser
2. Use the desktop shortcuts for different versions:
   - "Insurance Broker CRM (Development).lnk" - Latest development version
   - "Insurance Broker CRM v2.0 (Backup).lnk" - Stable v2.0 backup
   - "Insurance Broker CRM.lnk" - Original version
