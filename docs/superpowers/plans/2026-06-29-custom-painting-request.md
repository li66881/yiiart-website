# Custom Painting Request Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public custom-painting prototype with a secure, working inquiry form that uploads reference images to R2, stores requests in Sanity, and notifies staff.

**Architecture:** Keep validation in a dependency-free shared TypeScript module. The browser requests short-lived presigned R2 PUT URLs, uploads images directly, then posts a compact JSON inquiry to a server route that writes Sanity and sends a best-effort notification. The existing page layout remains, while the form gains real file selection, progress, retry, and success states.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Node test runner through `tsx`, AWS SDK S3/R2, Sanity, Resend or SendGrid, Vercel.

---

### Task 1: Shared Request Validation

**Files:**
- Create: `src/lib/custom-painting-request.ts`
- Create: `src/lib/custom-painting-request.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add the test runner and presigning package**

Run:

```powershell
npm install @aws-sdk/s3-request-presigner
npm install --save-dev tsx
```

Add:

```json
"test": "tsx --test src/**/*.test.ts"
```

- [ ] **Step 2: Write failing validation tests**

Cover valid fields, invalid email, honeypot rejection, more than five files, unsupported MIME type, files over 10 MB, and R2 keys outside `custom-requests/`.

```ts
test("rejects files outside the custom request namespace", () => {
  const result = validateUploadedAssets([
    { key: "uploads/reviews/file.jpg", url: "https://assets.yiiart.com/uploads/reviews/file.jpg", contentType: "image/jpeg", size: 12 },
  ])
  assert.equal(result.ok, false)
})
```

- [ ] **Step 3: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because `custom-painting-request` does not exist.

- [ ] **Step 4: Implement validation**

Export constants, request and asset types, `validateCustomPaintingRequest`, and `validateUploadedAssets`. Return a discriminated result:

```ts
type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }
```

- [ ] **Step 5: Run the test and verify GREEN**

Run: `npm test`

Expected: all validation tests pass.

### Task 2: R2 Upload Authorization

**Files:**
- Modify: `src/lib/r2.ts`
- Create: `src/app/api/custom-painting/upload/route.ts`
- Create: `scripts/configure-r2-cors.mjs`

- [ ] **Step 1: Add presigned upload helpers**

Expose a helper that creates a randomized `custom-requests/YYYY/MM/` object key and a 10-minute signed `PutObjectCommand`. Include content type and content length in the signed request.

- [ ] **Step 2: Add the upload authorization route**

Accept:

```ts
{ files: Array<{ name: string; type: string; size: number }> }
```

Validate metadata before returning:

```ts
{ uploads: Array<{ key: string; url: string; uploadUrl: string; contentType: string; size: number }> }
```

Return HTTP 400 for customer input errors and HTTP 503 for missing R2 configuration.

- [ ] **Step 3: Add the repeatable R2 CORS script**

Use `PutBucketCorsCommand` with allowed origins for both production domains and localhost, methods `PUT` and `HEAD`, and headers `content-type` and `content-length`.

- [ ] **Step 4: Verify TypeScript and build**

Run: `npm run build`

Expected: route compiles and static generation completes.

### Task 3: Inquiry Persistence And Notification

**Files:**
- Create: `src/app/api/custom-painting/submit/route.ts`
- Create: `src/sanity/schemas/customPaintingRequest.ts`
- Modify: `src/sanity/schemas/index.ts`

- [ ] **Step 1: Write failing document-shape tests**

Add tests that require a public-safe reference such as `YAC-AB12CD34`, `status: "new"`, normalized email, request timestamps, and Cloudflare asset entries.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because the document builder is absent.

- [ ] **Step 3: Implement the document builder and submit route**

Validate JSON, require `SANITY_WRITE_TOKEN`, create the Sanity record, then notify through Resend or SendGrid. If notification fails after the record is saved, patch `notificationStatus: "failed"` and still return success.

- [ ] **Step 4: Add the Sanity schema**

Include request reference, customer fields, project fields, Cloudflare assets, status, source, notification status, submitted timestamp, and internal notes. Configure preview title from reference and customer name.

- [ ] **Step 5: Run tests and build**

Run:

```powershell
npm test
npm run build
```

Expected: all tests pass and build exits 0.

### Task 4: Production Form Experience

**Files:**
- Modify: `src/components/CustomPaintingRequestForm.tsx`
- Modify: `src/app/custom-painting/page.tsx`
- Modify: `scripts/check-public-copy.mjs`

- [ ] **Step 1: Extend the public-copy regression check**

Reject public source containing `TODO`, `not connected yet`, `upload is not connected`, and instructions that rely on opening the customer's email application.

- [ ] **Step 2: Run the copy check and verify RED**

Run: `npm run copy:check`

Expected: FAIL on the current custom-painting page and form.

- [ ] **Step 3: Implement the file and submission UI**

Add a native multi-file input, selected file list with sizes and remove buttons, a five-file/10 MB constraint, progress text, disabled submit state, inline error status, and a success confirmation with the returned reference. Submit text-only requests without requiring images.

- [ ] **Step 4: Replace prototype copy**

Use customer-facing guidance:

```text
Share room photos, wall measurements, or inspiration images. We review every request before confirming the quote and production schedule.
```

Rename `Trust Section` to `What to expect`.

- [ ] **Step 5: Verify GREEN**

Run:

```powershell
npm run copy:check
npm test
npm run build
```

Expected: all commands exit 0.

### Task 5: Configuration And Browser Verification

**Files:**
- Modify only if required: `.env.example`

- [ ] **Step 1: Confirm production capabilities without exposing values**

Run `npx vercel env ls` and verify R2 credentials, `SANITY_WRITE_TOKEN`, contact email, and at least one mail provider are configured.

- [ ] **Step 2: Apply R2 CORS**

Pull production environment variables into an ignored local file, load them, and run `node scripts/configure-r2-cors.mjs`.

- [ ] **Step 3: Start the local site**

Run `npm run dev` on an available local port and keep the process running.

- [ ] **Step 4: Verify desktop and mobile flows in the in-app browser**

Check page rendering, file input, file rejection, selected-file removal, submit loading state, success/error status, keyboard labels, responsive layout, and browser console errors. Do not send a real inquiry during local verification unless the local server is using an isolated test dataset.

### Task 6: Commit, Deploy, And Production Smoke Test

**Files:**
- All changed implementation and test files

- [ ] **Step 1: Run final verification**

Run:

```powershell
npm run copy:check
npm test
npm run build
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 2: Commit and push**

Commit the completed implementation and push the feature branch and `main`.

- [ ] **Step 3: Deploy production**

Run `npx vercel --prod --yes`, wait for READY, and confirm aliases include `www.yiiart.com` and `yiiart.com`.

- [ ] **Step 4: Verify production**

Open `https://www.yiiart.com/custom-painting`, confirm no prototype text, exercise client-side validation and image selection without submitting customer data, inspect browser console, and query Vercel error logs.

