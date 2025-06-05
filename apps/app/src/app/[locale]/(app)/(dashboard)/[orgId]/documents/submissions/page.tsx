import { getI18n } from "@/locales/server";
import { auth } from "@/utils/auth";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comp/ui/card";
import { Skeleton } from "@comp/ui/skeleton";
import { docusealClient } from "@/lib/docuseal/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@comp/ui/table";
import { Badge } from "@comp/ui/badge";
import { FileText, Mail, Eye, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default async function DocumentSubmissions({
	params,
}: {
	params: Promise<{ locale: string; orgId: string }>;
}) {
	const { locale } = await params;
	setStaticParamsLocale(locale);
	const t = await getI18n();

	return (
		<Suspense fallback={<Loading />}>
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>{t("documents.submissions.title")}</CardTitle>
						<CardDescription>{t("documents.submissions.description")}</CardDescription>
					</CardHeader>
					<CardContent>
						<SubmissionsList />
					</CardContent>
				</Card>
			</div>
		</Suspense>
	);
}

async function SubmissionsList() {
	const t = await getI18n();
	try {
		const submissions = await docusealClient.getSubmissions();

		if (!submissions || submissions.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("documents.submissions.empty")}</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				{submissions.map((submission) => (
					<Card key={submission.id}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-base">{submission.template.name}</CardTitle>
								<span className="text-sm text-muted-foreground">
									{format(new Date(submission.created_at), "MMM d, yyyy")}
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t("documents.submissions.table.submitter")}</TableHead>
										<TableHead>{t("documents.submissions.table.email")}</TableHead>
										<TableHead>{t("documents.submissions.table.status")}</TableHead>
										<TableHead>{t("documents.submissions.table.sent")}</TableHead>
										<TableHead>{t("documents.submissions.table.opened")}</TableHead>
										<TableHead>{t("documents.submissions.table.completed")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{submission.submitters.map((submitter) => (
										<TableRow key={submitter.id}>
											<TableCell>{submitter.name || "—"}</TableCell>
											<TableCell>{submitter.email}</TableCell>
											<TableCell>
												<StatusBadge status={submitter.status} />
											</TableCell>
											<TableCell>
												{submitter.sent_at ? (
													<div className="flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{format(new Date(submitter.sent_at), "MMM d")}
													</div>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell>
												{submitter.opened_at ? (
													<div className="flex items-center gap-1">
														<Eye className="h-3 w-3" />
														{format(new Date(submitter.opened_at), "MMM d")}
													</div>
												) : (
													"—"
												)}
											</TableCell>
											<TableCell>
												{submitter.completed_at ? (
													<div className="flex items-center gap-1">
														<CheckCircle className="h-3 w-3 text-green-600" />
														{format(new Date(submitter.completed_at), "MMM d")}
													</div>
												) : (
													"—"
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				))}
			</div>
		);
	} catch (error) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<p className="text-destructive">{t("documents.submissions.error.title")}</p>
				<p className="text-sm text-muted-foreground mt-2">{t("documents.submissions.error.description")}</p>
			</div>
		);
	}
}

function StatusBadge({ status }: { status: string }) {
	const config = {
		pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
		sent: { label: "Sent", variant: "outline" as const, icon: Mail },
		opened: { label: "Opened", variant: "default" as const, icon: Eye },
		completed: { label: "Completed", variant: "success" as const, icon: CheckCircle },
	};

	const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;

	return (
		<Badge variant={variant} className="gap-1">
			<Icon className="h-3 w-3" />
			{label}
		</Badge>
	);
}

function Loading() {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-48" />
					<Skeleton className="h-4 w-64" />
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<Skeleton className="h-32 w-full" />
						<Skeleton className="h-32 w-full" />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	setStaticParamsLocale(locale);
	const t = await getI18n();

	return {
		title: `${t("sidebar.documents")} - Submissions`,
	};
}