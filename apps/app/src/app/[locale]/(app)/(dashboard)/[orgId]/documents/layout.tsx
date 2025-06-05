import { setStaticParamsLocale } from "next-international/server";
import { Tabs, TabsList, TabsTrigger } from "@comp/ui/tabs";
import Link from "next/link";
import { getI18n } from "@/locales/server";

interface LayoutProps {
	children: React.ReactNode;
	params: Promise<{
		locale: string;
		orgId: string;
	}>;
}

export default async function DocumentsLayout({
	children,
	params,
}: LayoutProps) {
	const { locale, orgId } = await params;
	setStaticParamsLocale(locale);
	const t = await getI18n();

	return (
		<div className="flex h-full flex-col gap-4">
			<Tabs defaultValue="home" className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="home" asChild>
						<Link href={`/${orgId}/documents`}>{t("documents.tabs.home")}</Link>
					</TabsTrigger>
					<TabsTrigger value="templates" asChild>
						<Link href={`/${orgId}/documents/templates`}>{t("documents.tabs.templates")}</Link>
					</TabsTrigger>
					<TabsTrigger value="submissions" asChild>
						<Link href={`/${orgId}/documents/submissions`}>{t("documents.tabs.submissions")}</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<div className="flex-1">{children}</div>
		</div>
	);
}