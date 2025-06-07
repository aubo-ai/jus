"use server";

import { db } from "@comp/db";
import { Attachment, AttachmentEntityType } from "@comp/db/types";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { s3Client, BUCKET_NAME, extractS3KeyFromUrl } from "@/app/s3";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const schema = z.object({
	attachmentId: z.string(),
});

export const deleteRiskAttachment = async (input: z.infer<typeof schema>) => {
	const { attachmentId } = input;
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const organizationId = session?.session?.activeOrganizationId;

	if (!organizationId) {
		return { success: false, error: "Not authorized" } as const;
	}

	let attachmentToDelete: Attachment | null = null;
	try {
		// 1. Find the attachment record and verify ownership/type
		attachmentToDelete = await db.attachment.findUnique({
			where: {
				id: attachmentId,
				organizationId: organizationId,
				entityType: AttachmentEntityType.risk,
			},
		});

		if (!attachmentToDelete) {
			return {
				success: false,
				error: "Attachment not found or access denied",
			} as const;
		}

		// 2. Attempt to delete from S3 using shared client
		if (s3Client && BUCKET_NAME) {
			let key: string;
			try {
				key = extractS3KeyFromUrl(attachmentToDelete.url);
				const deleteCommand = new DeleteObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key,
				});
				await s3Client.send(deleteCommand);
			} catch (s3Error: any) {
				const errorMessage =
					s3Error instanceof Error ? s3Error.message : String(s3Error);
				console.error(
					"S3 Delete Error for attachment:",
					attachmentId,
					errorMessage,
				);
			}
		} else {
			console.warn("S3 client not available, skipping S3 deletion for attachment:", attachmentId);
		}

		// 3. Delete from Database
		await db.attachment.delete({
			where: {
				id: attachmentId,
				organizationId: organizationId,
			},
		});

		// Revalidate the risk path if needed, depends on how attachments are loaded
		revalidatePath(
			`/${organizationId}/risk/${attachmentToDelete.entityId}`,
		);

		return {
			success: true,
			data: { deletedAttachmentId: attachmentId },
		};
	} catch (error: any) {
		const errorMessage =
			error instanceof Error ? error.message : String(error);
		console.error("Error deleting attachment:", attachmentId, errorMessage);
		return {
			success: false,
			error: "Failed to delete attachment.",
		} as const;
	}
};