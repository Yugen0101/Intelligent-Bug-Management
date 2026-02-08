# Database Setup Instructions

## Running the Schema

1. **Open Supabase SQL Editor**
   - Go to https://supabase.com/dashboard/project/rviuxwoqrehggecomwwe
   - Navigate to "SQL Editor" in the left sidebar

2. **Execute the Schema**
   - Copy the contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Installation**
   Run this query to check if pgvector is enabled:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

## Database Structure

### Tables Created:
- **profiles** - User profiles with roles (tester, developer, manager)
- **projects** - Project management
- **bugs** - Bug reports with AI embeddings (vector(384))
- **bug_assignments** - Developer assignments
- **comments** - Bug comments
- **ai_predictions** - ML model predictions tracking

### Key Features:
- ✅ **pgvector extension** enabled for similarity search
- ✅ **Row Level Security (RLS)** for role-based access
- ✅ **Vector similarity function** (`match_bugs`) for duplicate detection
- ✅ **Automatic timestamps** with triggers
- ✅ **Indexes** for performance optimization

## Creating Your First User

After running the schema, create a test user:

1. Go to "Authentication" → "Users" in Supabase dashboard
2. Click "Add user" → "Create new user"
3. Enter email and password
4. After creation, note the user's UUID

5. Insert profile for the user:
```sql
INSERT INTO public.profiles (id, full_name, role)
VALUES ('<user-uuid>', 'Test Manager', 'manager');
```

## Testing Vector Search

After creating some bugs with embeddings:

```sql
-- Test the similarity search function
SELECT * FROM match_bugs(
  '<some-embedding-vector>'::vector(384),
  0.85,  -- similarity threshold
  5      -- max results
);
```

## Next Steps

1. ✅ Run the schema in Supabase SQL Editor
2. ✅ Create test users through Supabase Auth
3. ✅ Insert profiles for test users
4. ✅ Create a sample project
5. ✅ Start building the frontend!
