# ⚡ Data Connect Quick Reference

## 1️⃣ Install Extension (5 min)

**Ctrl+Shift+X** → Search `Firebase Data Connect` → **Install**

```
✓ Google Firebase Data Connect for VS Code
✓ Version: Latest
✓ Publisher: Google
```

---

## 2️⃣ Initialize Project (5 min)

```bash
# Method 1: CLI
firebase init dataconnect

# Method 2: Double-click script
SETUP_DATA_CONNECT.bat
```

---

## 3️⃣ File Structure

```
Wasel/
├── dataconnect/
│   ├── dataconnect.yaml      ← Configuration
│   ├── schema.gql             ← Database schema
│   ├── queries/
│   │   └── rides.gql
│   └── mutations/
│       └── rides.gql
├── src/
│   └── dataconnect-generated/ ← Auto-generated types
└── .env                       ← Connection strings
```

---

## 4️⃣ Write First Query

### File: `dataconnect/queries/GetUser.gql`

```graphql
query GetUser($userId: String!) @auth(level: PUBLIC) {
  user(id: $userId) {
    id
    email
    name
    rating
  }
}
```

### Run It
- **Ctrl+Shift+D** or click "Run Query"
- Enter: `{ "userId": "user123" }`
- View results below

---

## 5️⃣ Use Generated Types

### Generated File: `src/dataconnect-generated/index.ts`

```typescript
import { initializeDataConnect } from '@firebase/data-connect';
import { GetUser } from '../dataconnect-generated';

const dc = initializeDataConnect();

// Type-safe query
async function getUser(userId: string) {
  const result = await GetUser(dc, { userId });
  return result.data.user;
}
```

---

## 6️⃣ VS Code Commands

| Command | Shortcut |
|---------|----------|
| Run Query | `Ctrl+Shift+D` |
| Format | `Shift+Alt+F` |
| Open Explorer | `Ctrl+Shift+P` → "Data Connect" |
| Build Types | `Ctrl+Shift+P` → "Firebase: Build" |

---

## 7️⃣ Local Testing (pgLite)

```bash
# Terminal 1: Start emulator
firebase emulators:start --only dataconnect

# Terminal 2: Start dev server
npm run dev
```

**Benefits:**
- ⚡ Instant feedback
- 🆓 No cost
- 📴 Works offline

---

## 8️⃣ Cloud SQL Connection

### 1. Create Instance
```bash
gcloud sql instances create wasel-postgres \
  --database-version=POSTGRES_15 \
  --region=us-central1
```

### 2. Get Connection Name
```
wasel-project:us-central1:wasel-postgres
```

### 3. Update `.env`
```env
VITE_DATACONNECT_CONNECTION=wasel-project:us-central1:wasel-postgres
```

---

## 🔥 Common Tasks

### Run a Query
```
1. Open: dataconnect/queries/GetUser.gql
2. Press: Ctrl+Shift+D
3. Enter variables
4. View output
```

### Create Mutation
```
1. Create: dataconnect/mutations/CreateRide.gql
2. Write GraphQL mutation
3. Save (types auto-generate)
4. Use in React component
```

### Add New Type
```
1. Edit: dataconnect/schema.gql
2. Add GraphQL type definition
3. Save (rebuild automatic)
4. Use in queries/mutations
```

### Check Errors
```
1. Ctrl+Shift+P
2. "Problems" tab shows all issues
3. GraphQL validation errors with line numbers
```

---

## 🎯 Query Examples

### Get User
```graphql
query GetUser($id: String!) {
  user(id: $id) {
    id
    email
    name
    rating
  }
}
```

### List Rides
```graphql
query ListRides($limit: Int) {
  rides(limit: $limit) {
    id
    pickup_location
    fare
    status
  }
}
```

### Create Ride
```graphql
mutation CreateRide($passengerId: String!, $fare: Float!) {
  ride_insert(
    data: {
      passenger_id: $passengerId
      fare: $fare
      status: "requested"
    }
  ) {
    id
    status
  }
}
```

---

## ⚠️ Common Issues

### Query Returns Empty
```
✓ Check schema.gql matches table names
✓ Verify data exists in database
✓ Check WHERE clauses
```

### "Connection Refused"
```
✓ Ensure PostgreSQL running
✓ For Cloud SQL: Cloud SQL Proxy active
✓ Verify connection string
```

### Types Not Generating
```
✓ Run: firebase dataconnect:build
✓ Check: No GraphQL syntax errors
✓ Reload: VS Code
```

### Extension Not Working
```
✓ Reload: Ctrl+Shift+P → "Reload Window"
✓ Check: dataconnect.yaml exists
✓ Verify: dataconnect/ folder structure
```

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `dataconnect.yaml` | Project config |
| `schema.gql` | Database schema |
| `queries/*.gql` | Read operations |
| `mutations/*.gql` | Write operations |
| `.env` | Connection strings |
| `src/dataconnect-generated/` | Generated types |

---

## 🚀 Step by Step to Launch

1. **Install:** `Ctrl+Shift+X` → Search `Firebase Data Connect`
2. **Setup:** `SETUP_DATA_CONNECT.bat`
3. **Start:** `firebase emulators:start --only dataconnect`
4. **Dev:** `npm run dev`
5. **Test:** `Ctrl+Shift+D` on any query file
6. **Deploy:** `firebase deploy --only dataconnect`

---

## 🔗 Resources

- **Docs:** https://firebase.google.com/docs/data-connect
- **Extension:** https://marketplace.visualstudio.com/items?itemName=Google.firebase-dataconnect-vscode
- **GitHub:** https://github.com/firebase/firebase-data-connect-examples
- **GraphQL:** https://graphql.org/learn/

---

**Status:** ✅ Ready to use Data Connect!

*See `DATA_CONNECT_SETUP.md` for detailed guides*
