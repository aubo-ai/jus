"use client";

import { useI18n } from "@/locales/client";
import type { Member, Risk, User } from "@comp/db/types";
import { Alert, AlertDescription, AlertTitle } from "@comp/ui/alert";
import { Button } from "@comp/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comp/ui/card";
import { Icons } from "@comp/ui/icons";
import { PencilIcon } from "lucide-react";
import { useQueryState } from "nuqs";
import { UpdateRiskOverview } from "../forms/risks/risk-overview";
import { RiskOverviewSheet } from "../sheets/risk-overview-sheet";

export function RiskOverview({
	risk,
	assignees,
}: {
	risk: Risk & { assignee: { user: User } | null };
	assignees: (Member & { user: User })[];
}) {
	const t = useI18n();
	const [open, setOpen] = useQueryState("risk-overview-sheet");

	return (


		<Card>
			<CardHeader>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between">
						<CardTitle>
							{risk.title}
						</CardTitle>
						<Button
							size="icon"
							variant="ghost"
							className="p-0 m-0 size-auto hover:bg-transparent"
							onClick={() => setOpen("true")}
						>
							<PencilIcon className="h-3 w-3" />
						</Button>
					</div>
					<CardDescription>
						{risk.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<UpdateRiskOverview risk={risk} assignees={assignees} />
			</CardContent>
			<RiskOverviewSheet risk={risk} />
		</Card>
	);
}
