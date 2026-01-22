# 🎯 VS Code Extensions for Data Connect

## Quick Installation

### Method 1: Search & Install (Recommended)
1. **Open VS Code**
2. Press **Ctrl+Shift+X** (Extensions)
3. Search: `Firebase Data Connect`
4. Click **Install** on the official Google extension

### Method 2: Direct Link
- **Extension:** [Firebase Data Connect for VS Code](https://marketplace.visualstudio.com/items?itemName=Google.firebase-dataconnect-vscode)
- **Publisher:** Google
- **Version:** Latest
- **Link:** `vscode:extension/Google.firebase-dataconnect-vscode`

---

## Verify Installation

After installation, you should see:

✅ 🔥 **Firebase** icon in activity bar (left sidebar)  
✅ **Data Connect** option in Command Palette (Ctrl+Shift+P)  
✅ **dataconnect/** folder recognized by extension  

### Test It

1. Open Command Palette: **Ctrl+Shift+P**
2. Type: `Firebase: Open Data Connect Explorer`
3. You should see the explorer panel open

---

## Extension Features

### 1. Query Editor
- **Path:** `dataconnect/queries/*.gql`
- **Features:**
  - GraphQL syntax highlighting
  - Autocomplete for fields and variables
  - Real-time validation
  - Variable type hints
  - Run query button

### 2. Data Connect Explorer
- Browse entire schema
- View all queries and mutations
- Test endpoints directly
- See execution metrics

### 3. Local Emulator
- Run PostgreSQL locally
- No setup required
- Use pgLite for in-memory database
- Full SQL compatibility

### 4. Code Generation
- Automatic TypeScript type generation
- Watch mode for file changes
- Generated types in `src/dataconnect-generated/`

---

## Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| Run Query | `Ctrl+Shift+D` | Execute current query |
| Format | `Shift+Alt+F` | Format GraphQL code |
| Open Explorer | `Ctrl+Shift+P` → Data Connect | Open explorer panel |
| Validate | Auto | Real-time validation |

---

## Extension Configuration

### Add to `settings.json` (Optional)

```json
{
  "[graphql]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "GraphQL.vscode-graphql"
  },
  "firebase.dataConnect.emulator": {
    "enabled": true,
    "port": 5432
  }
}
```

---

## Related Extensions (Optional)

For better GraphQL development, also install:

1. **GraphQL: Language Feature Support**
   - ID: `GraphQL.vscode-graphql`
   - Features: Better syntax highlighting

2. **PostgreSQL**
   - ID: `ckolkman.vscode-postgres`
   - Features: PostgreSQL database browser

3. **REST Client**
   - ID: `humao.rest-client`
   - Features: Test APIs from VS Code

---

## Troubleshooting

### Extension Not Showing Up

```
❌ Issue: Extension not in sidebar
✓ Solution: Reload VS Code
  - Command: Ctrl+Shift+P → Developer: Reload Window
  
❌ Issue: Not recognizing dataconnect folder
✓ Solution: Create dataconnect.yaml
  - Ensure: c:\...\Wasel\dataconnect\dataconnect.yaml exists
  - Reload: Reload VS Code
```

### Query Won't Run

```
❌ Issue: "Cannot find database connection"
✓ Solution: Start emulator first
  - Run: firebase emulators:start --only dataconnect
  - Then: Ctrl+Shift+D to run query

❌ Issue: "Schema not found"
✓ Solution: Check schema.gql
  - Verify: dataconnect/schema.gql exists
  - Check: GraphQL syntax is valid
  - Run: firebase dataconnect:build
```

### TypeScript Types Not Generating

```
❌ Issue: src/dataconnect-generated/ is empty
✓ Solution: Rebuild types
  - Run: firebase dataconnect:build
  - Or: firebase dataconnect:watch (auto-rebuild)
  - Check: No syntax errors in .gql files
```

---

## Complete Workflow

### 1. Write Query
Open `dataconnect/queries/rides.gql`:
```graphql
query GetUser($userId: String!) {
  user(id: $userId) {
    id
    email
    name
  }
}
```

### 2. Run Query
- Press **Ctrl+Shift+D**
- Enter variables if prompted
- View results in output panel

### 3. Check Types
- Open `src/dataconnect-generated/index.ts`
- Find generated `GetUserQuery` type
- Use in TypeScript code

### 4. Use in React
```typescript
import { GetUserQuery } from '../dataconnect-generated';

async function loadUser(userId: string): Promise<GetUserQuery> {
  // Type-safe query execution
}
```

---

## Extension Settings

Access via: **Code > Preferences > Settings > Firebase**

```json
{
  "firebase.dataConnect.project": "wasel-dev",
  "firebase.dataConnect.location": "us-central1",
  "firebase.dataConnect.emulator.enabled": true,
  "firebase.dataConnect.typeScriptGeneration": true,
  "firebase.dataConnect.outputDirectory": "src/dataconnect-generated"
}
```

---

## Performance Tips

1. **Use Watch Mode**
   ```bash
   firebase dataconnect:watch
   ```
   - Auto-rebuilds on file changes
   - Faster development

2. **Local Emulator for Testing**
   - Instant query execution
   - No cloud latency
   - Free and offline

3. **Schema Caching**
   - Extension caches schema
   - Improves autocomplete speed
   - Reload if changed externally

---

## Additional Resources

- **Official Docs:** https://firebase.google.com/docs/data-connect
- **GraphQL Guide:** https://graphql.org/learn/
- **Extension Help:** Open extension & click "Help" button
- **Firebase CLI Docs:** https://firebase.google.com/docs/cli

---

## Next Steps

1. ✅ Install extension
2. ✅ Reload VS Code
3. ✅ Open Data Connect Explorer
4. ✅ Try running a query
5. ✅ Check generated types

**Status:** Ready to code! 🚀
