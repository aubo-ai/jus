import PageWithBreadcrumb from "@/components/pages/PageWithBreadcrumb";
import { getI18n } from "@/locales/server";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { JSONContent } from "novel";
import { Comments } from "../../../../../../../components/comments/Comments";
import { PolicyOverview } from "./components/PolicyOverview";
import { PolicyPageEditor } from "./editor/components/PolicyDetails";
import {
	getPolicyControlMappingInfo,
	getAssignees,
	getComments,
	getPolicy,
	getLogsForPolicy,
} from "./data";
import { RecentAuditLogs } from "./components/RecentAuditLogs";
import PolicyPage from "./components/PolicyPage";

export default async function PolicyDetails({
	params,
}: {
	params: Promise<{ locale: string; policyId: string; orgId: string }>;
}) {
	const { locale, policyId, orgId } = await params;

	setStaticParamsLocale(locale);
	const policy = await getPolicy(policyId);
	const assignees = await getAssignees();
	const comments = await getComments(policyId);
	const { mappedControls, allControls } =
		await getPolicyControlMappingInfo(policyId);
	const logs = await getLogsForPolicy(policyId);

	const isPendingApproval = !!policy?.approverId;

	return (
		<PageWithBreadcrumb
			breadcrumbs={[
				{ label: "Policies", href: `/${orgId}/policies/all` },
				{ label: policy?.name ?? "Policy", current: true },
			]}
		>
			<PolicyPage
				policy={policy}
				policyId={policyId}
				assignees={assignees}
				mappedControls={mappedControls}
				allControls={allControls}
				isPendingApproval={isPendingApproval}
				logs={logs}
				comments={comments}
			/>
		</PageWithBreadcrumb>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string; policyId: string }>;
}): Promise<Metadata> {
	const { locale } = await params;

	setStaticParamsLocale(locale);
	const t = await getI18n();

	return {
		title: t("policies.overview.title"),
	};
}
