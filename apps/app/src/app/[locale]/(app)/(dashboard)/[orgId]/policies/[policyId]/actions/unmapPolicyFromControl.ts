"use server";

import { authActionClient } from "@/actions/safe-action";
import { z } from "zod";
import { db } from "@comp/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const unmapPolicyFromControlSchema = z.object({
	policyId: z.string(),
	controlId: z.string(),
});

export const unmapPolicyFromControl = authActionClient
	.schema(unmapPolicyFromControlSchema)
	.metadata({
		name: "unmap-policy-from-control",
		track: {
			event: "unmap-policy-from-control",
			channel: "server",
		},
	})
	.action(async ({ parsedInput, ctx }) => {
		const { policyId, controlId } = parsedInput;
		const { session } = ctx;

		if (!session.activeOrganizationId) {
			return {
				success: false,
				error: "Not authorized",
			};
		}

		try {
			console.log(`Unmapping control ${controlId} from policy ${policyId}`);

			// Update the policy to disconnect it from the specified control
			await db.policy.update({
				where: { id: policyId, organizationId: session.activeOrganizationId },
				data: {
					controls: {
						disconnect: { id: controlId },
					},
				},
			});

			console.log(`Control ${controlId} unmapped from policy ${policyId}`);
			const headersList = await headers();
			let path = headersList.get("x-pathname") || headersList.get("referer") || "";
			path = path.replace(/\/[a-z]{2}\//, "/");
			revalidatePath(path);

			return {
				success: true,
			};
		} catch (error) {
			console.error("Error unmapping control from policy:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to unmap control",
			};
		}
	});
