# 🚀 Data Connect Setup Guide

## Step 1: Install VS Code Extension

### Quick Install
Open VS Code and go to **Extensions** (Ctrl+Shift+X), then search for and install:

**Firebase Data Connect for VS Code**
- **Extension ID:** `Google.firebase-dataconnect-vscode`
- **Link:** https://marketplace.visualstudio.com/items?itemName=Google.firebase-dataconnect-vscode
- **Features:**
  - Query editor with autocomplete
  - Local pgLite exploration
  - Cloud SQL Postgres connection
  - Real-time query validation
  - GraphQL generation

### Verification
After installation, you should see:
- 🔥 Firebase icon in VS Code sidebar
- Data Connect section in command palette (Ctrl+Shift+P)

---

## Step 2: Initialize Data Connect Project

### Option A: Using Firebase CLI
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Data Connect in your project
firebase init dataconnect

# Follow prompts to:
# ✓ Select Google Cloud project
# ✓ Create PostgreSQL instance (or use existing)
# ✓ Generate starter schema
```

### Option B: Using VS Code Extension
1. Open Command Palette: `Ctrl+Shift+P`
2. Search: "Firebase: Initialize Data Connect"
3. Follow the wizard

---

## Step 3: Configure Local pgLite (Development)

### Create `.env.local` for Development

```env
# Local pgLite Development
VITE_DATACONNECT_API_KEY=dev-key
VITE_DATACONNECT_LOCATION=us-central1
VITE_DATACONNECT_INSTANCE=wasel-dev

# For local pgLite emulator
VITE_USE_LOCAL_POSTGRES=true
VITE_LOCAL_POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/wasel_dev
```

### Directory Structure

```
Wasel/
├── dataconnect/
│   ├── schema.gql          # GraphQL schema
│   ├── connector.yaml      # Connection config
│   ├── queries/
│   │   ├── GetUser.gql
│   │   └── ListRides.gql
│   └── mutations/
│       ├── CreateRide.gql
│       └── UpdateRide.gql
├── src/
│   └── dataconnect-generated/
│       ├── index.ts
│       └── types.ts
└── dataconnect.yaml        # Project config
```

---

## Step 4: Connect to pgLite (Local Testing)

### Using Local pgLite Instance

Create `dataconnect/connector.yaml`:

```yaml
kind: connector
metadata:
  name: local-postgres
spec:
  connectorConfig:
    postgresql:
      cloudSql:
        instanceConnectionName: 'wasel-dev:us-central1:wasel-postgres'
  displayName: 'Local PostgreSQL - Development'
  authConfig:
    postgres_auth:
      postgres_credentials:
        secret: secrets/postgres-creds
```

---

## Step 5: Connect to Cloud SQL (Production)

### Prerequisites
1. Create Cloud SQL PostgreSQL instance
2. Generate service account key
3. Store credentials securely

### Create `dataconnect/cloudsql.yaml`:

```yaml
kind: connector
metadata:
  name: cloud-postgres
spec:
  connectorConfig:
    postgresql:
      cloudSql:
        instanceConnectionName: 'wasel-production-proj:us-central1:wasel-postgres-prod'
  displayName: 'Cloud SQL PostgreSQL - Production'
  authConfig:
    postgres_auth:
      postgres_credentials:
        secret: secrets/cloud-sql-creds
```

### Set Connection String

```bash
# Using Firebase CLI
firebase dataconnect:sql:secrets:create \
  --name=cloud-sql-creds \
  --content='postgresql://user:password@10.0.0.3:5432/wasel_prod'

# Or using environment variable
export CLOUDSQL_CONNECTION_NAME="wasel-prod:us-central1:wasel-pg"
```

---

## Step 6: Write Your First Query

### Create `dataconnect/queries/GetUser.gql`:

```graphql
query GetUser($userId: String!) @auth(level: PUBLIC) {
  user(id: $userId) {
    id
    email
    name
    phone
    rating
    createdAt
  }
}
```

### Create `dataconnect/mutations/CreateRide.gql`:

```graphql
mutation CreateRide(
  $passengerId: String!
  $driverId: String
  $pickupLocation: String!
  $dropoffLocation: String!
  $fare: Float!
) @auth(level: USER) {
  ride_insert(
    data: {
      passenger_id: $passengerId
      driver_id: $driverId
      pickup_location: $pickupLocation
      dropoff_location: $dropoffLocation
      fare: $fare
      status: "requested"
      created_at: "now()"
    }
  ) {
    id
    status
    created_at
  }
}
```

---

## Step 7: Test Queries in VS Code

### Using the Query Explorer

1. **Open Query File**: `dataconnect/queries/GetUser.gql`
2. **Press**: `Ctrl+Shift+D` (Run Query)
3. **Or click**: "Run Query" button in editor
4. **View Results**: Bottom panel shows response

### Test Against Local pgLite

```
Query: GetUser with userId="user123"

Expected Response:
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "rating": 4.8
  }
}
```

---

## Step 8: Generate TypeScript Types

### Automatic Generation

```bash
# Watch mode - regenerates on file changes
firebase dataconnect:watch

# Or manual generation
firebase dataconnect:build
```

### Use Generated Types

```typescript
// src/services/dataconnect.ts
import {
  GetUserQuery,
  GetUserQueryVariables,
  CreateRideResponse
} from '../dataconnect-generated';

export async function getUser(userId: string): Promise<GetUserQuery> {
  // Type-safe query
}

export async function createRide(data: CreateRideRequest): Promise<CreateRideResponse> {
  // Type-safe mutation
}
```

---

## Step 9: Set Up Development Server

### Create `dataconnect/dataconnect.yaml`:

```yaml
specVersion: v1
connectorConfig:
  - connector: local-postgres
    connectorId: local-postgres
  - connector: cloud-postgres
    connectorId: cloud-postgres
    production: true
authConfig:
  authProviders:
    - id: 'authProvider/custom'
      displayName: 'Custom Auth'
```

### Start Local Development

```bash
# Terminal 1: Start Data Connect emulator
firebase emulators:start --only dataconnect

# Terminal 2: Start your app
npm run dev
```

---

## Step 10: Query from Frontend

### TypeScript Client

```typescript
// src/services/rides.ts
import { initializeDataConnect } from '@firebase/data-connect';
import { getRides, getRidesVariables } from '../dataconnect-generated';

const dc = initializeDataConnect();

export async function fetchUserRides(userId: string) {
  try {
    const result = await getRides(dc, { userId });
    return result.data.rides;
  } catch (error) {
    console.error('Failed to fetch rides:', error);
    throw error;
  }
}
```

### React Component

```typescript
// src/components/RidesList.tsx
import { useEffect, useState } from 'react';
import { fetchUserRides } from '../services/rides';
import { Ride } from '../types';

export function RidesList({ userId }: { userId: string }) {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRides(userId).then(data => {
      setRides(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading rides...</div>;

  return (
    <div>
      {rides.map(ride => (
        <div key={ride.id}>
          <h3>{ride.pickupLocation} → {ride.dropoffLocation}</h3>
          <p>Status: {ride.status}</p>
          <p>Fare: ${ride.fare}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Command Reference

### Firebase CLI Commands

```bash
# Initialize
firebase init dataconnect

# Local testing
firebase emulators:start --only dataconnect

# Build and generate types
firebase dataconnect:build
firebase dataconnect:watch              # Auto-rebuild on changes

# Deploy to production
firebase deploy --only dataconnect

# Manage secrets
firebase dataconnect:sql:secrets:create
firebase dataconnect:sql:secrets:list
firebase dataconnect:sql:secrets:delete
```

### VS Code Commands

| Command | Keyboard | Action |
|---------|----------|--------|
| Run Query | Ctrl+Shift+D | Execute query in editor |
| Format | Shift+Alt+F | Format GraphQL |
| Validation | Ctrl+K | Show validation errors |
| Generate Types | - | Auto-run on save |

---

## VS Code Extension Features

### 1. Query Editor
- ✓ Syntax highlighting
- ✓ Autocomplete for fields
- ✓ Real-time validation
- ✓ Variable type hints

### 2. Explorer View
- ✓ Browse schema
- ✓ View all queries/mutations
- ✓ Test endpoints
- ✓ View execution time

### 3. Results Panel
- ✓ Formatted JSON output
- ✓ Error messages with line numbers
- ✓ Performance metrics
- ✓ Request/response inspector

### 4. Local Emulator
- ✓ pgLite database (in-memory)
- ✓ Full PostgreSQL compatibility
- ✓ No setup required
- ✓ Fast development cycle

---

## Local vs Cloud Setup Comparison

| Feature | Local pgLite | Cloud SQL |
|---------|-------------|-----------|
| **Setup Time** | 2 minutes | 10 minutes |
| **Cost** | Free | $0.36-2.00/day |
| **Performance** | ⚡ Instant | ⚡ Fast |
| **Data Persistence** | In-memory only | Persistent |
| **Scale** | Development only | Production-ready |
| **Best For** | Testing queries | Live data |

---

## Troubleshooting

### Issue: Query returns empty results
```
✓ Solution: Check schema.gql matches your table names
✓ Run: firebase dataconnect:sql:inspect
✓ Verify: Data exists in database
```

### Issue: "Connection refused" error
```
✓ Solution: Ensure PostgreSQL is running
✓ For Cloud SQL: Check Cloud SQL Proxy is active
✓ Test: psql -c "SELECT 1" at connection string
```

### Issue: TypeScript types not generated
```
✓ Solution: Run: firebase dataconnect:build
✓ Check: dataconnect-generated/ folder exists
✓ Verify: .gitignore doesn't exclude src/dataconnect-generated/
```

### Issue: VS Code extension not recognizing dataconnect folder
```
✓ Solution: Create dataconnect/dataconnect.yaml
✓ Reload: Command Palette > Developer: Reload Window
✓ Check: Folder structure matches requirements
```

---

## Next Steps

1. ✅ Install VS Code extension (5 min)
2. ✅ Initialize project with Firebase CLI (5 min)
3. ✅ Create first query (5 min)
4. ✅ Test with local pgLite (5 min)
5. ✅ Connect to Cloud SQL (10 min)
6. ✅ Generate TypeScript types (2 min)
7. ✅ Use in React components (10 min)

**Total Setup Time:** ~40 minutes

---

## Resources

- **Official Docs:** https://firebase.google.com/docs/data-connect
- **GitHub Examples:** https://github.com/firebase/firebase-data-connect-examples
- **VS Code Extension:** https://marketplace.visualstudio.com/items?itemName=Google.firebase-dataconnect-vscode
- **GraphQL Reference:** https://graphql.org/learn/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

**Status:** Ready to set up! Choose local pgLite for quick testing, then add Cloud SQL later.
