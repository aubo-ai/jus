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
import { FileText } from "lucide-react";
import { formatDate } from "@/utils/format";

export default async function DocumentTemplates({
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
						<CardTitle>{t("documents.templates.title")}</CardTitle>
						<CardDescription>{t("documents.templates.description")}</CardDescription>
					</CardHeader>
					<CardContent>
						<TemplatesList />
					</CardContent>
				</Card>
			</div>
		</Suspense>
	);
}

async function TemplatesList() {
	const t = await getI18n();
	try {
		const templates = await docusealClient.getTemplates();

		if (!templates || templates.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText className="h-12 w-12 text-muted-foreground mb-4" />
					<p className="text-muted-foreground">{t("documents.templates.empty")}</p>
				</div>
			);
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t("documents.templates.table.name")}</TableHead>
						<TableHead>{t("documents.templates.table.folder")}</TableHead>
						<TableHead>{t("documents.templates.table.created")}</TableHead>
						<TableHead>{t("documents.templates.table.updated")}</TableHead>
						<TableHead>{t("documents.templates.table.status")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{templates.map((template) => (
						<TableRow key={template.id}>
							<TableCell className="font-medium">{template.name}</TableCell>
							<TableCell>{template.folder_name || "-"}</TableCell>
							<TableCell>{formatDate(template.created_at)}</TableCell>
							<TableCell>{formatDate(template.updated_at)}</TableCell>
							<TableCell>
								{template.archived_at ? (
									<span className="text-muted-foreground">{t("documents.templates.table.archived")}</span>
								) : (
									<span className="text-green-600">{t("documents.templates.table.active")}</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	} catch (error) {
		return (
			<div className="flex flex-col items-center justify-center py-8 text-center">
				<p className="text-destructive">{t("documents.templates.error.title")}</p>
				<p className="text-sm text-muted-foreground mt-2">{t("documents.templates.error.description")}</p>
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
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
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
		title: `${t("sidebar.documents")} - Templates`,
	};
}