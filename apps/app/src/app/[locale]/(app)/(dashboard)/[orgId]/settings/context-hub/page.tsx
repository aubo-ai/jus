import { getI18n } from "@/locales/server";
import { auth } from "@/utils/auth";
import { db } from "@comp/db";
import type { Metadata } from "next";
import { setStaticParamsLocale } from "next-international/server";
import { headers } from "next/headers";
import { cache } from "react";
import { ContextTable } from "./ContextTable";
import { getContextEntries } from "./data/getContextEntries";

export default async function ContextHubSettings({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; orgId: string }>;
    searchParams: Promise<{
        search: string;
        page: string;
        perPage: string;
    }>;
}) {
    const { locale, orgId } = await params;
    const { search, page, perPage } = await searchParams;
    setStaticParamsLocale(locale);

    const entriesResult = await getContextEntries({
        orgId,
        search,
        page: Number(page) || 1,
        perPage: Number(perPage) || 50,
    });

    return (
        <ContextTable
            entries={entriesResult.data}
            pageCount={entriesResult.pageCount}
            locale={locale}
        />
    );
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    setStaticParamsLocale(locale);

    return {
        title: "Context Hub",
    };
}