# Custom Painting Request Design

## Goal

Replace the public custom-painting prototype with a complete customer inquiry flow. Customers can describe their room, upload reference images, submit without opening a local email application, and receive a clear confirmation.

## Existing Constraints

- Keep the current YiiArt visual language, page structure, typography, colors, and spacing.
- Store image files in the existing Cloudflare R2 bucket.
- Store manageable request records in Sanity.
- Use the existing Resend or SendGrid configuration for staff notifications.
- Keep WhatsApp as a secondary contact route.
- Do not expose infrastructure details, TODO notes, or configuration failures to customers.

## Customer Flow

1. The customer enters name, email, artwork size, preferred colors, room type, budget, and project details.
2. The customer may select up to five JPG, PNG, or WebP images, with a 10 MB limit per file.
3. The form shows selected filenames, sizes, and remove controls before submission.
4. On submit, the browser requests short-lived R2 upload authorization and uploads the files directly to R2.
5. The website submits the inquiry fields and uploaded asset references to the server.
6. The server validates the request, creates a Sanity `customPaintingRequest` record, and attempts a staff notification through Resend or SendGrid.
7. The page shows an inline success state with a request reference. It shows actionable errors without clearing the customer's form.
8. WhatsApp remains available as a fallback and includes the entered text fields. Images must be attached inside WhatsApp when that route is used.

## Architecture

### Upload Authorization

Add a server endpoint that accepts file metadata and returns short-lived presigned R2 PUT URLs. The server controls:

- allowed MIME types
- maximum file count
- maximum declared file size
- randomized object keys under `custom-requests/YYYY/MM/`
- short expiration time

The signed upload includes the declared content type and content length. R2 CORS must allow `PUT` from `https://www.yiiart.com`, `https://yiiart.com`, and local development origins.

### Request Submission

Add a JSON submission endpoint. It validates required fields, email format, field lengths, allowed select values, honeypot state, and uploaded R2 asset metadata.

The endpoint creates a Sanity document containing:

- customer and project fields
- uploaded R2 URLs and object keys
- request status, source, and timestamps
- a generated public-safe request reference
- notification delivery status

The request remains accepted when the Sanity write succeeds but email notification fails. That failure is recorded server-side and must not make the customer resubmit.

### Notification

Send a plain, structured staff notification with the request fields, request reference, and links to uploaded images. Use Resend first, then SendGrid when configured. Never attach the uploaded files to the email.

### Sanity Studio

Add a `customPaintingRequest` schema so requests can be reviewed in Sanity. Customer records are operational data and are not queried by public storefront pages.

## Interface

- Replace all development notes with customer-facing guidance.
- Keep the current two-column request section.
- Add a standard file input with a clear upload label, format/size guidance, selected-file rows, and remove buttons.
- Use disabled and progress states while uploading and submitting.
- Use an accessible status region for success and error messages.
- On success, replace the form actions with a confirmation containing the request reference and expected response window.
- Preserve keyboard access, visible focus styles, native labels, and understandable error text.

## Validation And Security

- Required: name and valid email.
- Files: at most five; JPG, PNG, or WebP; at most 10 MB each.
- Reject unknown R2 keys or URLs that are outside the configured custom-request namespace.
- Use randomized keys and short-lived signed URLs.
- Include a hidden honeypot field for basic automated-spam rejection.
- Log detailed server errors without returning secrets or provider responses to the browser.
- Do not expose R2 credentials, Sanity tokens, or mail-provider keys to client code.

## Failure Handling

- Invalid form: show the specific correction near the submission area.
- Upload failure: keep entered fields and selected files so the customer can retry.
- Request save failure: show a retry message and keep all form state.
- Notification failure after save: return success and record the notification failure for staff review.
- Missing production configuration: return a generic unavailable message and log the missing capability server-side.

## Tests

- Extend the public-copy check to reject TODO and disconnected-upload wording in public source.
- Add tests for request field validation, file metadata validation, and R2 asset validation.
- Verify the public page contains a real file input and no development text.
- Verify invalid submission, valid text-only submission, file selection/removal, upload progress, server failure, and success confirmation.
- Run the full production build.
- After deployment, verify the production page, browser console, request API behavior, and Vercel error logs.

## Deployment

1. Add the R2 browser-upload CORS policy if it is not already present.
2. Deploy the updated Sanity schema.
3. Confirm production environment variables are present without printing secret values.
4. Deploy to Vercel production.
5. Perform a non-destructive production smoke test using a clearly marked test inquiry, then remove that test record if practical.

