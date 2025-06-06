import { getI18n } from "@/locales/server";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comp/ui/card";
import { Skeleton } from "@comp/ui/skeleton";
import { docusealClient } from "@/lib/docuseal/client";
import { FileText } from "lucide-react";
import { SubmissionsClient } from "./components/SubmissionsClient";

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

		return <SubmissionsClient submissions={submissions} />;
	} catch (error) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<p className="text-destructive">{t("documents.submissions.error.title")}</p>
				<p className="text-sm text-muted-foreground mt-2">{t("documents.submissions.error.description")}</p>
			</div>
		);
	}
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