"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@comp/db";
import { AttachmentEntityType } from "@comp/db/types";
import { z } from "zod";
import { s3Client, BUCKET_NAME, extractS3KeyFromUrl } from "@/app/s3";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

const schema = z.object({
	attachmentId: z.string(),
});

export const getRiskAttachmentUrl = async (input: z.infer<typeof schema>) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const { attachmentId } = input;
	const organizationId = session?.session?.activeOrganizationId;

	if (!organizationId) {
		return {
			success: false,
			error: "Not authorized - no organization found",
		} as const;
	}

	if (!s3Client || !BUCKET_NAME) {
		console.error("S3 client not initialized or bucket name missing");
		return {
			success: false,
			error: "File service is not configured",
		} as const;
	}

	try {
		// 1. Find the attachment and verify ownership/type
		const attachment = await db.attachment.findUnique({
			where: {
				id: attachmentId,
				organizationId: organizationId,
				entityType: AttachmentEntityType.risk, // Ensure it's a risk attachment
			},
		});

		if (!attachment) {
			return {
				success: false,
				error: "Attachment not found or access denied",
			} as const;
		}

		// 2. Extract S3 key from the stored URL
		let key: string;
		try {
			key = extractS3KeyFromUrl(attachment.url);
		} catch (extractError) {
			console.error(
				"Error extracting S3 key for attachment:",
				attachmentId,
				extractError,
			);
			return {
				success: false,
				error: "Could not process attachment URL",
			} as const;
		}

		// 3. Generate Signed URL using shared client
		try {
			const command = new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key,
			});

			const signedUrl = await getSignedUrl(s3Client, command, {
				expiresIn: 3600, // URL expires in 1 hour
			});

			if (!signedUrl) {
				console.error("getSignedUrl returned undefined for key:", key);
				return {
					success: false,
					error: "Failed to generate signed URL",
				} as const;
			}

			// 4. Return Success
			return { success: true, data: { signedUrl } };
		} catch (s3Error) {
			console.error("S3 getSignedUrl Error:", s3Error);
			return {
				success: false,
				error: "Could not generate access URL for the file",
			} as const;
		}
	} catch (dbError) {
		console.error("Database Error fetching attachment:", dbError);
		return {
			success: false,
			error: "Failed to retrieve attachment details",
		} as const;
	}
};