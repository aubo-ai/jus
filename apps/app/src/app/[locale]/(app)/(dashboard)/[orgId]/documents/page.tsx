import { getI18n } from "@/locales/server";
import { auth } from "@/utils/auth";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@comp/ui/card";
import { Skeleton } from "@comp/ui/skeleton";

export default async function DocumentsHome({
	params,
}: {
	params: Promise<{ locale: string; orgId: string }>;
}) {
	const { locale } = await params;
	setStaticParamsLocale(locale);
	const t = await getI18n();

	return (
		<Suspense fallback={<Loading />}>
			<div className="space-y-4 sm:space-y-8">
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>{t("documents.home.statusCard.title")}</CardTitle>
							<CardDescription>{t("documents.home.statusCard.description")}</CardDescription>
						</CardHeader>
						<CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
							{t("documents.home.statusCard.comingSoon")}
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>{t("documents.home.activityCard.title")}</CardTitle>
							<CardDescription>{t("documents.home.activityCard.description")}</CardDescription>
						</CardHeader>
						<CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
							{t("documents.home.activityCard.comingSoon")}
						</CardContent>
					</Card>
				</div>
			</div>
		</Suspense>
	);
}

function Loading() {
	return (
		<div className="space-y-4 sm:space-y-8">
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48" />
					</CardHeader>
					<CardContent className="h-[300px]">
						<Skeleton className="h-full w-full" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48" />
					</CardHeader>
					<CardContent className="h-[300px]">
						<Skeleton className="h-full w-full" />
					</CardContent>
				</Card>
			</div>
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
		title: t("sidebar.documents"),
	};
}