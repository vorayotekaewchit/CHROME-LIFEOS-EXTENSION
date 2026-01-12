# Security Guide for Supabase Integration

## Current Setup

Your Chrome extension currently uses:
- **Client-side**: `chrome.storage.sync` and `localStorage` for data storage
- **Server-side**: Supabase with environment variables (secure ✅)

The `info.tsx` file contains Supabase credentials but is **not currently used** in the codebase.

## Security Best Practices

### 1. Row Level Security (RLS) Configuration

If you plan to use Supabase client-side, you **MUST** enable Row Level Security:

#### Steps to Enable RLS:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/toauhymdxqzvqrgixdls
   - Go to Authentication → Policies

2. **Enable RLS on All Tables**
   ```sql
   -- Enable RLS on your table
   ALTER TABLE kv_store_85c8422a ENABLE ROW LEVEL SECURITY;
   ```

3. **Create Appropriate Policies**

   **Option A: Public Read, Authenticated Write** (Recommended for most cases)
   ```sql
   -- Allow anyone to read
   CREATE POLICY "Allow public read access"
   ON kv_store_85c8422a
   FOR SELECT
   USING (true);

   -- Only allow authenticated users to write
   CREATE POLICY "Allow authenticated write access"
   ON kv_store_85c8422a
   FOR INSERT
   WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Allow authenticated update access"
   ON kv_store_85c8422a
   FOR UPDATE
   USING (auth.role() = 'authenticated');
   ```

   **Option B: User-Scoped Data** (If storing user-specific data)
   ```sql
   -- Only allow users to access their own data
   CREATE POLICY "Users can read own data"
   ON kv_store_85c8422a
   FOR SELECT
   USING (auth.uid()::text = (value->>'userId')::text);

   CREATE POLICY "Users can write own data"
   ON kv_store_85c8422a
   FOR INSERT
   WITH CHECK (auth.uid()::text = (value->>'userId')::text);
   ```

   **Option C: Key-Based Access** (If using key prefixes for isolation)
   ```sql
   -- Allow access only to keys with specific prefix
   CREATE POLICY "Allow access to user keys"
   ON kv_store_85c8422a
   FOR ALL
   USING (key LIKE 'user_' || auth.uid()::text || '_%');
   ```

### 2. Environment Variables

For client-side Supabase usage, use environment variables:

1. **Create `.env.local`** (already in `.gitignore`):
   ```env
   # Supabase Project URL
   VITE_SUPABASE_URL=https://toauhymdxqzvqrgixdls.supabase.co
   
   # Supabase Anonymous Key (Public Key)
   # This is safe to use client-side IF Row Level Security (RLS) is enabled
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. **Server-side environment variables** (for `server/kv_store.tsx`):
   ```env
   # These are used server-side only - NEVER expose in client code
   SUPABASE_URL=https://toauhymdxqzvqrgixdls.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Never commit `.env.local`** - it's already in `.gitignore`

4. **For production builds**, set these in your build environment or CI/CD pipeline

### 3. Chrome Extension Considerations

- **Code is visible**: All client-side code in Chrome extensions is visible to users
- **Use RLS**: Always rely on RLS policies, not code obfuscation
- **Minimize client-side DB access**: Consider using your server (`server/index.tsx`) as a proxy for sensitive operations

### 4. Current Server Setup (Secure ✅)

Your server-side code in `server/kv_store.tsx` correctly uses:
- Environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- Service role key (server-side only - never expose this!)

This is the **recommended approach** for sensitive operations.

## Verification Checklist

Before using Supabase client-side:

- [ ] RLS is enabled on all tables
- [ ] RLS policies are configured and tested
- [ ] Anon key is in environment variables (not hardcoded)
- [ ] Service role key is NEVER in client-side code
- [ ] `.env.local` is in `.gitignore`
- [ ] `info.tsx` is in `.gitignore` (already done ✅)

## Testing RLS Policies

Test your RLS policies by:

1. **Using Supabase SQL Editor**:
   ```sql
   -- Test as anonymous user
   SET ROLE anon;
   SELECT * FROM kv_store_85c8422a;
   
   -- Test as authenticated user
   SET ROLE authenticated;
   SELECT * FROM kv_store_85c8422a;
   ```

2. **Using the Supabase client**:
   ```typescript
   // Test with anon key
   const client = createClient(url, anonKey);
   const { data, error } = await client.from('kv_store_85c8422a').select('*');
   console.log('Anon access:', { data, error });
   ```

## Recommended Architecture

For this Chrome extension:

1. **Keep using `chrome.storage.sync`** for local data (current approach ✅)
2. **Use server-side Supabase** for any cloud sync or shared data
3. **Only add client-side Supabase** if you need real-time features or direct database access

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [Chrome Extension Security](https://developer.chrome.com/docs/extensions/mv3/security/)
