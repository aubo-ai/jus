import { getI18n } from "@/locales/server";
import { auth } from "@/utils/auth";
import { SecondaryMenu } from "@comp/ui/secondary-menu";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	const t = await getI18n();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const user = session?.user;
	const orgId = session?.session.activeOrganizationId;

	if (!session) {
		return redirect("/");
	}

	return (
		<div className="max-w-[1200px] m-auto">
			<Suspense fallback={<div>Loading...</div>}>
				<SecondaryMenu
					items={[
						{
							path: `/${orgId}/settings`,
							label: t("settings.general.title"),
						},
						{
							path: `/${orgId}/settings/trust-portal`,
							label: "Trust Portal",
						},
						{
							path: `/${orgId}/settings/context-hub`,
							label: "Context Hub",
						},
						{
							path: `/${orgId}/settings/api-keys`,
							label: t("settings.api_keys.title"),
						},
						{
							path: `/${orgId}/settings/billing`,
							label: t("settings.billing.title"),
							enabled: false,
						},
					]}
				/>
			</Suspense>

			<main className="mt-8">{children}</main>
		</div>
	);
}
