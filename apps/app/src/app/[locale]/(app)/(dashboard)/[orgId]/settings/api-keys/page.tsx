import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { cache } from "react";

import { ApiKeysTable } from "./components/table/ApiKeysTable";
import { getI18n } from "@/locales/server";
import { db } from "@comp/db";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";

export default async function ApiKeysPage({
	params,
}: {
	params: Promise<{ locale: string; orgId: string }>;
}) {
	const { locale } = await params;
	setStaticParamsLocale(locale);
	const apiKeys = await getApiKeys();

	return (
		<ApiKeysTable apiKeys={apiKeys} />
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
		title: t("settings.api_keys.title"),
	};
}

const getApiKeys = cache(async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.session.activeOrganizationId) {
		return [];
	}

	const apiKeys = await db.apiKey.findMany({
		where: {
			organizationId: session.session.activeOrganizationId,
			isActive: true,
		},
		select: {
			id: true,
			name: true,
			createdAt: true,
			expiresAt: true,
			lastUsedAt: true,
			isActive: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return apiKeys.map((key) => ({
		...key,
		createdAt: key.createdAt.toISOString(),
		expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
		lastUsedAt: key.lastUsedAt ? key.lastUsedAt.toISOString() : null,
	}));
});
