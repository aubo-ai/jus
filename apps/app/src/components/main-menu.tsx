"use client";

import { useI18n } from "@/locales/client";
import { authClient } from "@/utils/auth-client";
import { Badge } from "@comp/ui/badge";
import { cn } from "@comp/ui/cn";
import { Icons } from "@comp/ui/icons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@comp/ui/tooltip";
import {
	Blocks,
	FlagIcon,
	FlaskConical,
	Gauge,
	ListCheck,
	NotebookText,
	ShieldEllipsis,
	Store,
	Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define menu item types with icon component
type MenuItem = {
	id: string;
	path: string;
	name: string;
	disabled: boolean;
	icon: React.FC<{ size?: number }>;
	protected: boolean;
	badge?: {
		text: string;
		variant: "default" | "secondary" | "outline" | "new" | "beta";
	};
	hidden?: boolean;
};

interface ItemProps {
	organizationId: string;
	item: MenuItem;
	isActive: boolean;
	disabled: boolean;
	isCollapsed?: boolean;
	onItemClick?: () => void;
}

export function MainMenu({
	//userIsAdmin,
	organizationId,
	isCollapsed = false,
	onItemClick,
}: Props) {
	const t = useI18n();
	const pathname = usePathname();

	const items: MenuItem[] = [
		{
			id: "frameworks",
			path: "/:organizationId/frameworks",
			name: t("sidebar.frameworks"),
			disabled: false,
			icon: Gauge,
			protected: false,
		},
		{
			id: "controls",
			path: "/:organizationId/controls",
			name: t("sidebar.controls"),
			disabled: false,
			icon: ShieldEllipsis,
			protected: false,
		},
		{
			id: "policies",
			path: "/:organizationId/policies",
			name: t("sidebar.policies"),
			disabled: false,
			icon: NotebookText,
			protected: false,
		},
		{
			id: "tasks",
			path: "/:organizationId/tasks",
			name: t("sidebar.tasks"),
			disabled: false,
			icon: ListCheck,
			protected: false,
		},
		{
			id: "people",
			path: "/:organizationId/people/all",
			name: t("sidebar.people"),
			disabled: false,
			icon: Users,
			protected: false,
		},
		{
			id: "risk",
			path: "/:organizationId/risk",
			name: t("sidebar.risk"),
			disabled: false,
			icon: Icons.Risk,
			protected: false,
			// badge: {
			// 	text: "New",
			// 	variant: "new",
			// },
		},
		{
			id: "vendors",
			path: "/:organizationId/vendors",
			name: t("sidebar.vendors"),
			disabled: false,
			icon: Store,
			protected: false,
		},
		{
			id: "tests",
			path: "/:organizationId/tests",
			name: t("sidebar.tests"),
			disabled: false,
			icon: FlaskConical,
			protected: false,
		},
		{
			id: "integrations",
			path: "/:organizationId/integrations",
			name: t("sidebar.integrations"),
			disabled: false,
			icon: Blocks,
			protected: true,
			badge: {
				text: "Beta",
				variant: "beta",
			},
		},
		{
			id: "settings",
			path: "/:organizationId/settings",
			name: t("sidebar.settings"),
			disabled: false,
			icon: Icons.Settings,
			protected: true,
		},
	];

	// Helper function to check if a path is active
	const isPathActive = (itemPath: string) => {
		const normalizedItemPath = itemPath.replace(
			":organizationId",
			organizationId ?? "",
		);

		// Extract the base path from the menu item (first two segments after normalization)
		const itemPathParts = normalizedItemPath.split("/").filter(Boolean);
		const itemBaseSegment =
			itemPathParts.length > 1 ? itemPathParts[1] : "";

		// Extract the current path parts
		const currentPathParts = pathname.split("/").filter(Boolean);
		const currentBaseSegment =
			currentPathParts.length > 1 ? currentPathParts[1] : "";

		// Special case for root organization path
		if (
			normalizedItemPath === `/${organizationId}` ||
			normalizedItemPath === `/${organizationId}/implementation`
		) {
			return (
				pathname === `/${organizationId}` ||
				pathname?.startsWith(`/${organizationId}/implementation`)
			);
		}

		return itemBaseSegment === currentBaseSegment;
	};

	return (
		<div>
			<nav>
				<div className="flex flex-col gap-1.5 py-1">
					{items
						.filter((item) => !item.disabled)
						.filter((item) => !item.hidden)
						.map((item) => {
							const isActive = isPathActive(item.path);
							return (
								<Item
									key={`${item.id}-${Math.random()}`}
									organizationId={organizationId ?? ""}
									item={item}
									isActive={isActive}
									disabled={item.disabled}
									isCollapsed={isCollapsed}
									onItemClick={onItemClick}
								/>
							);
						})}
				</div>
			</nav>
		</div>
	);
}

const Item = ({
	organizationId,
	item,
	isActive,
	disabled,
	isCollapsed = false,
	onItemClick,
}: ItemProps) => {
	const Icon = item.icon;
	const linkDisabled = disabled || item.disabled;
	const t = useI18n();

	// Replace the organizationId placeholder in the path
	const itemPath = item.path.replace(":organizationId", organizationId);

	// Badge variants mapping
	const badgeVariants = {
		default: "bg-primary/80 text-primary-foreground hover:bg-primary/90",
		secondary:
			"bg-secondary text-secondary-foreground hover:bg-secondary/80",
		outline:
			"border-border bg-background hover:bg-accent hover:text-accent-foreground",
		new: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
		beta: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
	};

	return (
		<TooltipProvider delayDuration={70}>
			{linkDisabled ? (
				<div className="w-full md:w-[45px] h-[45px] flex items-center justify-start md:justify-center px-3 md:px-0 text-xs text-muted-foreground">
					Coming Soon
				</div>
			) : (
				<Link prefetch href={itemPath} onClick={onItemClick}>
					<Tooltip>
						<TooltipTrigger className="w-full">
							<div
								className={cn(
									"relative flex items-center",
									isCollapsed
										? "md:w-[45px] md:justify-center rounded-l-sm"
										: "md:px-3 rounded-l-sm",
									"w-full px-3 md:w-auto h-[40px]",
									"hover:bg-accent hover:border-r-2 hover:border-r-primary/40",
									"transition-all duration-300",
									isActive &&
									"bg-accent dark:bg-secondary border-border border-r-2 border-r-primary hover:border-r-primary",
								)}
							>
								<div
									className={cn(
										"flex items-center gap-2",
										"transition-all duration-300",
									)}
								>
									{Icon && (
										<div className="flex-shrink-0">
											<Icon
												size={isCollapsed ? 16 : 14}
											/>
										</div>
									)}
									{!isCollapsed && (
										<div className="flex items-center justify-between w-full">
											<span
												className={cn(
													"text-sm truncate max-w-full",
													isActive && "font-medium",
												)}
											>
												{item.name}
											</span>
											<div className="flex items-center gap-1.5">
												{item.badge && (
													<Badge
														variant="outline"
														className={cn(
															"ml-1.5 text-[9px] px-1 py-0 h-auto",
															badgeVariants[
															item.badge
																.variant
															],
														)}
													>
														{item.badge.text}
													</Badge>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="right"
							className={cn(
								"px-3 py-1.5 text-xs",
								isCollapsed ? "flex" : "hidden",
							)}
							sideOffset={8}
						>
							<div className="flex items-center gap-1.5">
								{item.name}
								{item.badge && (
									<Badge
										variant="outline"
										className={cn(
											"text-[9px] px-1 py-0 h-auto",
											badgeVariants[item.badge.variant],
										)}
									>
										{item.badge.text}
									</Badge>
								)}
							</div>
						</TooltipContent>
					</Tooltip>
				</Link>
			)}
		</TooltipProvider>
	);
};

type Props = {
	organizationId: string;
	//userIsAdmin: boolean;
	isCollapsed?: boolean;
	onItemClick?: () => void;
};
