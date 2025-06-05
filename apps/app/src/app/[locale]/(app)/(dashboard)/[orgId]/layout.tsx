import { AnimatedLayout } from "@/components/animated-layout";
import { Header } from "@/components/header";
import { AssistantSheet } from "@/components/sheets/assistant-sheet";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/context/sidebar-context";
import { getCurrentOrganization } from "@/lib/currentOrganization";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";

const HotKeys = dynamic(
	() => import("@/components/hot-keys").then((mod) => mod.HotKeys),
	{
		ssr: true,
	},
);

export default async function Layout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ orgId: string }>;
}) {
	const { orgId: requestedOrgId } = await params;

	const cookieStore = await cookies();
	const isCollapsed = cookieStore.get("sidebar-collapsed")?.value === "true";

	const currentOrganization = await getCurrentOrganization({
		requestedOrgId,
	});

	return (
		<SidebarProvider initialIsCollapsed={isCollapsed}>
			<AnimatedLayout
				sidebar={<Sidebar organization={currentOrganization} />}
				isCollapsed={isCollapsed}
			>
				<Header />
				<main className="px-4 mx-auto pb-8 min-h-[calc(100vh-15vh)]">
					{children}
				</main>
				<AssistantSheet />
			</AnimatedLayout>
			<HotKeys />
		</SidebarProvider>
	);
}
