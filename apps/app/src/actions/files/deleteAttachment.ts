"use server";

import { AttachmentEntityType } from "@comp/db/types";
import { z } from "zod";
import { deleteTaskAttachment } from "@/app/[locale]/(app)/(dashboard)/[orgId]/tasks/actions/deleteTaskAttachment";
import { deletePolicyAttachment } from "@/app/[locale]/(app)/(dashboard)/[orgId]/policies/[policyId]/actions/deletePolicyAttachment";
import { deleteRiskAttachment } from "@/app/[locale]/(app)/(dashboard)/[orgId]/risk/[riskId]/actions/deleteRiskAttachment";
import { deleteCommentAttachment } from "@/actions/comments/deleteCommentAttachment";
import { db } from "@comp/db";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

const schema = z.object({
	attachmentId: z.string(),
});

export const deleteAttachment = async (input: z.infer<typeof schema>) => {
	const { attachmentId } = input;
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const organizationId = session?.session?.activeOrganizationId;

	if (!organizationId) {
		return {
			success: false,
			error: "Not authorized - no organization found",
		} as const;
	}

	try {
		// First, find the attachment to determine its entity type
		const attachment = await db.attachment.findUnique({
			where: {
				id: attachmentId,
				organizationId: organizationId,
			},
		});

		if (!attachment) {
			return {
				success: false,
				error: "Attachment not found or access denied",
			} as const;
		}

		// Route to the appropriate handler based on entity type
		switch (attachment.entityType) {
			case AttachmentEntityType.task:
				return await deleteTaskAttachment({ attachmentId });
			
			case AttachmentEntityType.policy:
				return await deletePolicyAttachment({ attachmentId });
			
			case AttachmentEntityType.risk:
				return await deleteRiskAttachment({ attachmentId });
			
			case AttachmentEntityType.comment:
				return await deleteCommentAttachment({ attachmentId });
			
			default:
				return {
					success: false,
					error: `Unsupported attachment entity type: ${attachment.entityType}`,
				} as const;
		}
	} catch (error) {
		console.error("Error routing attachment delete request:", error);
		return {
			success: false,
			error: "Failed to process attachment delete request",
		} as const;
	}
};