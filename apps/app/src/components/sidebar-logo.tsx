import { cn } from "@comp/ui/cn";
import { Icons } from "@comp/ui/icons";
import Link from "next/link";

export function SidebarLogo({
	isCollapsed,
}: {
	isCollapsed: boolean;
}) {
	return (
		<div className={cn("transition-all duration-300 flex items-center")}>
			<Link href="/" suppressHydrationWarning>
				<Icons.Logo
					width={45}
					height={45}
					className={cn("transition-transform duration-300")}
				/>
			</Link>
		</div>
	);
}
