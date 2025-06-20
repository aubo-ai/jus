# Development Log

## Hydration Mismatch Error - Grammarly Extension (2025-01-06)

### Issue
When running the application on localhost:3000, the following hydration mismatch error appeared in the Chrome console:

```
layout.tsx:89 A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up.
```

The error showed differences in the `<body>` element attributes:
- Client had: `data-new-gr-c-s-check-loaded="14.1238.0"` and `data-gr-ext-installed=""`
- Server didn't have these attributes

### Root Cause
The Grammarly browser extension was injecting attributes into the DOM after React's initial render, causing a mismatch between server-rendered and client-rendered HTML.

### Solution
Removed the Grammarly Chrome extension, which eliminated the error completely.

### Alternative Solutions for Future Reference
If you need to use Grammarly or similar DOM-modifying extensions while developing:
1. Use a different browser profile for development without extensions
2. Disable extensions in your development browser
3. Add `suppressHydrationWarning` to affected elements (though this suppresses all hydration warnings, potentially hiding legitimate issues)

### Code Reference
The issue occurred in: `/apps/app/src/app/[locale]/layout.tsx:89`

## File Upload Debugging - Comment Attachments (2025-01-06)

### Issue
When uploading files in the policy section, files appeared to upload successfully but disappeared after page refresh. Console showed:
- File uploaded to S3 successfully
- Database attachment record created successfully
- 404 POST error after upload
- Files not visible in the UI after refresh

### Investigation Process
1. **Backend Analysis**: Confirmed upload action worked correctly - files saved to S3 and database
2. **Database Logging**: Added extensive logging to trace attachment creation and retrieval
3. **UI Debugging**: Added temporary attachment display section to verify data fetching

### Root Cause
**User Error**: Files were being uploaded in the **comments section** of the policy page, not as direct policy attachments. In the comments system:
- Uploading files creates "pending attachments" 
- Attachments only become permanent when the comment is submitted
- Without submitting a comment, the attachments remain in pending state and aren't displayed

### Key Learnings
1. **Comment Attachment Workflow**: Files uploaded in comments require comment submission to be finalized
2. **Entity Types**: Different attachment entity types (policy, risk, comment) have different workflows
3. **Pending vs Final State**: Comment attachments have a pending state until comment submission
4. **404 Errors**: POST requests to entity URLs without proper route handlers cause 404s

### Technical Details
- Upload action: `/apps/app/src/actions/files/upload-file.ts`
- Attachment entities: `AttachmentEntityType.comment` vs `AttachmentEntityType.policy`
- Comments component: Handles pending attachment state internally

### Solution
No code changes needed - this is expected behavior. Users must submit comments to finalize uploaded attachments in the comments section.

## Organization Deletion Failure - Foreign Key Constraints (2025-01-06)

### Issue
Attempting to delete an organization failed with a foreign key constraint violation error:
```
Foreign key constraint violated on the constraint: `Onboarding_organizationId_fkey`
```

Console error showed:
```
prisma:error Invalid db.organization.delete() invocation
Foreign key constraint violated on the constraint: `Onboarding_organizationId_fkey`
```

### Root Cause
Several database tables had foreign key references to the `Organization` table but lacked `onDelete: Cascade` configuration:
- `Onboarding` table
- `ContextEntry` table  
- `Attachment` table
- `Task` table

Without cascade delete, these tables prevented organization deletion due to referential integrity constraints.

### Investigation Process
1. **Error Analysis**: Identified specific foreign key constraint causing the failure
2. **Schema Review**: Found multiple tables without `onDelete: Cascade` configuration
3. **Relationship Mapping**: Determined which tables needed manual cleanup before organization deletion

### Solution
Updated the `deleteOrganizationAction` to handle foreign key constraints properly:

```typescript
// Delete records that don't have cascade delete configured first
await db.onboarding.deleteMany({ where: { organizationId: orgId } });
await db.contextEntry.deleteMany({ where: { organizationId: orgId } });
await db.attachment.deleteMany({ where: { organizationId: orgId } });
await db.task.deleteMany({ where: { organizationId: orgId } });

// Then delete the organization (other records cascade automatically)
await db.organization.delete({ where: { id: orgId } });
```

### Key Learnings
1. **Foreign Key Constraints**: Tables without `onDelete: Cascade` block parent record deletion
2. **Manual Cleanup**: Some relationships require explicit cleanup before parent deletion
3. **Transaction Safety**: Wrapping multiple deletes in a transaction ensures data consistency
4. **Schema Design**: Missing cascade configurations can cause runtime failures

### Technical Details
- Action file: `/apps/app/src/actions/organization/delete-organization-action.ts`
- Schema files: `/packages/db/prisma/schema/onboarding.prisma`, etc.
- Tables affected: `Onboarding`, `ContextEntry`, `Attachment`, `Task`

### Prevention
Future schema changes should include `onDelete: Cascade` for organization relationships to avoid this issue.