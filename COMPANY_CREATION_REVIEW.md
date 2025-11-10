# Company Creation Code Review

## Issues Found

### 1. **Hardcoded User IDs** ❌
**Location:** `src/components/ui/CompanyForm.tsx`

**Problems:**
- Line 210: `created_by: 'user-id'` - Hardcoded string instead of actual user ID
- Line 235: `prepared_by: 'user-id'` - Hardcoded for financial documents
- Line 263: `prepared_by: 'user-id'` - Hardcoded for contact documents

**Impact:**
- All companies will be created with the same fake user ID
- Cannot track who actually created the company
- Database foreign key constraints may fail
- RLS policies won't work correctly

**Fix Required:**
- Import `useAuth()` from `@/auth/AuthProvider`
- Use `const { user } = useAuth()` to get authenticated user
- Replace all `'user-id'` with `user?.id` (with proper null checks)

---

### 2. **Ownership Percentage Validation** ❌
**Location:** 
- Schema: `supabase/schema.sql` line 86
- Form: `src/components/ui/CompanyForm.tsx` line 446-453

**Problems:**
- Schema: `DECIMAL(5,2)` allows values up to 999.99, but ownership should be 0-100%
- Form input has no `min` or `max` attributes
- No client-side validation to ensure 0-100 range
- No error message if user enters invalid value

**Current Schema:**
```sql
ownership_percentage DECIMAL(5,2),  -- Allows 0.00 to 999.99
```

**Should Be:**
```sql
ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
```

**Form Input (Line 446-453):**
```tsx
<Input
  id="ownership_percentage"
  type="number"
  step="0.01"
  value={formData.ownership_percentage}
  onChange={(e) => handleInputChange('ownership_percentage', parseFloat(e.target.value) || 0)}
/>
```

**Missing:**
- `min="0"` attribute
- `max="100"` attribute
- Validation logic in `handleInputChange`

---

### 3. **File Upload - Supabase Storage Bucket** ⚠️
**Location:** `src/lib/supabase.ts` line 268-305

**Current Implementation:**
```typescript
async uploadDocument(file: File, metadata: ...) {
  const filePath = `documents/${metadata.portfolio_company_id}/${fileName}`
  
  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')  // ← Bucket name
    .upload(filePath, file)
  
  if (uploadError) throw uploadError
  // ...
}
```

**Issues:**
1. **Bucket Not Set Up:** Code assumes `documents` bucket exists, but you mentioned it's not configured
2. **No Error Handling:** If bucket doesn't exist, upload will fail with unclear error
3. **No Bucket Creation Check:** Code doesn't verify bucket exists before upload
4. **File Path Structure:** Uses `documents/{company_id}/{filename}` - this is good, but needs bucket setup

**File Path Structure:**
```
documents/
  └── {portfolio_company_id}/
      ├── 1234567890-abc123.xlsx
      ├── 1234567891-def456.xlsx
      └── ...
```

**What's Needed:**
1. Create `documents` bucket in Supabase Storage
2. Set bucket to **public** or **private** (recommend private for documents)
3. Configure RLS policies for bucket access
4. Add error handling for missing bucket
5. Optionally add bucket existence check before upload

**Setup Script Available:**
- `scripts/setup-storage.js` - Can create the bucket programmatically
- `scripts/setup-supabase.js` - Also has bucket creation logic

---

### 4. **Missing Error Handling** ⚠️
**Location:** `src/components/ui/CompanyForm.tsx` line 200-280

**Problems:**
- Line 214: `createCompany()` - No try-catch around individual operations
- Line 220-242: File upload loop - Errors are logged but not shown to user
- Line 249-270: Contact document upload - Same issue
- Line 274: Generic `alert()` for errors - Not user-friendly
- No validation before submission

**Current Error Handling:**
```typescript
try {
  const company = await portfolioService.createCompany(companyData);
  // ... file uploads with try-catch inside loop
} catch (error) {
  console.error('Error creating company:', error);
  alert('Error creating company. Please try again.');  // ← Not ideal
}
```

**Issues:**
- No specific error messages (network, validation, auth, etc.)
- No loading states during file uploads
- No progress indication for multiple file uploads
- User doesn't know which file failed

---

### 5. **Missing Form Validation** ⚠️
**Location:** `src/components/ui/CompanyForm.tsx`

**Problems:**
- Only `company_name` is marked as required (line 347)
- No validation for:
  - Ownership percentage (0-100 range)
  - Email format for contacts
  - Date ranges (initial_investment_date < latest_valuation_date)
  - Financial values (should be >= 0)
  - File sizes (no max size check)

---

## Summary of Required Fixes

### High Priority:
1. ✅ Replace hardcoded `'user-id'` with `useAuth()` hook
2. ✅ Fix ownership percentage schema constraint (0-100)
3. ✅ Add min/max validation to ownership input
4. ✅ Set up Supabase Storage bucket `documents`
5. ✅ Add proper error handling and user feedback

### Medium Priority:
6. Add form validation before submission
7. Add loading states for file uploads
8. Add progress indicators for multiple file uploads
9. Improve error messages (specific, actionable)

### Low Priority:
10. Add file size validation
11. Add file type validation beyond Excel
12. Add date range validation

---

## File Upload Setup Instructions

### Option 1: Supabase Dashboard (Recommended)
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `documents`
4. Public: **No** (private for security)
5. File size limit: 100MB (or as needed)
6. Click "Create bucket"

### Option 2: SQL Command
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents',
  'documents',
  false,  -- Private bucket
  104857600  -- 100MB in bytes
);
```

### Option 3: Run Setup Script
```bash
node scripts/setup-storage.js
```

### Storage Policies (RLS)
After creating bucket, set up RLS policies:
```sql
-- Allow authenticated users to upload to their company folders
CREATE POLICY "Users can upload documents to their companies"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);

-- Allow users to read documents from their companies
CREATE POLICY "Users can read documents from their companies"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM portfolio_companies 
    WHERE created_by = auth.uid()
  )
);
```

---

## Recommended File Path Structure

```
documents/
  └── {portfolio_company_id}/
      ├── financials/
      │   ├── 2024-Q1-report.xlsx
      │   └── 2024-Q2-report.xlsx
      ├── contacts/
      │   └── contact-list-2024.xlsx
      └── board-materials/
          └── board-pack-2024-10.pdf
```

This structure:
- ✅ Organizes files by company
- ✅ Allows subfolders by document type
- ✅ Easy to query and manage
- ✅ Supports RLS policies

