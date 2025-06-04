import { Control } from "@comp/db/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comp/ui/card";
import { SelectPills } from "@comp/ui/select-pills";
import { toast } from "sonner";
import { mapPolicyToControls } from "../actions/mapPolicyToControls";
import { unmapPolicyFromControl } from "../actions/unmapPolicyFromControl";
import { useParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

export const PolicyControlMappings = ({
	mappedControls,
	allControls,
	isPendingApproval,
}: {
	mappedControls: Control[];
	allControls: Control[];
	isPendingApproval: boolean;
}) => {
	const { policyId } = useParams<{ policyId: string }>();
	const [loading, setLoading] = useState(false);

	const mapControlsAction = useAction(mapPolicyToControls, {
		onSuccess: () => {
			toast.success("Controls mapped successfully");
		},
		onError: (err) => {
			toast.error(err.error.serverError || "Failed to map controls");
			setLoading(false);
		},
	});

	const unmapControlAction = useAction(unmapPolicyFromControl, {
		onSuccess: () => {
			toast.success("Controls unmapped successfully");
			setLoading(false);
		},
		onError: (err) => {
			toast.error(err.error.serverError || "Failed to unmap control");
			setLoading(false);
		},
	});

	const mappedNames = mappedControls.map((c) => c.name);

	const handleValueChange = async (selectedNames: string[]) => {
		if (isPendingApproval || loading) return;
		setLoading(true);
		const prevIds = mappedControls.map((c) => c.id);
		const nextControls = allControls.filter((c) => selectedNames.includes(c.name));
		const nextIds = nextControls.map((c) => c.id);

		const added = nextControls.filter((c) => !prevIds.includes(c.id));
		const removed = mappedControls.filter((c) => !nextIds.includes(c.id));

		try {
			if (added.length > 0) {
				await mapControlsAction.execute({ policyId, controlIds: added.map((c) => c.id) });
			}
			if (removed.length > 0) {
				await unmapControlAction.execute({ policyId, controlId: removed[0].id });
			}
		} catch (err) {
			toast.error("Failed to update controls");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Map Controls
				</CardTitle>
				<CardDescription>
					Map controls that are relevant to this policy.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-2 w-full">
				<SelectPills
					data={allControls.map((c) => ({ id: c.id, name: c.name }))}
					value={mappedNames}
					onValueChange={handleValueChange}
					placeholder="Search controls..."
					disabled={isPendingApproval || loading}
				/>
			</CardContent>
		</Card>
	);
};
