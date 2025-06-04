import { AuditLog, AuditLogEntityType } from "@comp/db/types";
import { AuditLogWithRelations } from "../data";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@comp/ui/card";
import { Badge } from "@comp/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@comp/ui/avatar";
import {
	CalendarIcon,
	ClockIcon,
	UserIcon,
	ActivityIcon,
	FileIcon,
	FileTextIcon,
	ShieldIcon,
} from "lucide-react";
import { cn } from "@comp/ui/cn";
import { format } from "date-fns";
import { ScrollArea } from "@comp/ui/scroll-area";

type LogActionType =
	| "create"
	| "update"
	| "delete"
	| "approve"
	| "reject"
	| "review";

// Using the imported AuditLogWithRelations type from data/index.ts

interface LogData {
	action?: LogActionType;
	details?: Record<string, any>;
	changes?: Record<string, { previous: any; current: any }>;
}

const getActionColor = (action: LogActionType | string) => {
	switch (action) {
		case "create":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "update":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case "delete":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		case "approve":
			return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
		case "reject":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
		case "review":
			return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
	}
};

const getInitials = (name = "") => {
	if (!name) return "U";
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
};

const getEntityTypeIcon = (
	entityType: AuditLogEntityType | null | undefined,
) => {
	switch (entityType) {
		case AuditLogEntityType.policy:
			return <FileTextIcon className="h-3 w-3" />;
		case AuditLogEntityType.control:
			return <ShieldIcon className="h-3 w-3" />;
		default:
			return <FileIcon className="h-3 w-3" />;
	}
};

// Parse the data field to extract relevant information
const parseLogData = (log: AuditLog): LogData => {
	try {
		if (typeof log.data === "object" && log.data !== null) {
			const data = log.data as Record<string, any>;
			return {
				action: data.action as LogActionType,
				details: data.details,
				changes: data.changes,
			};
		}
	} catch (e) {
		console.error("Error parsing audit log data", e);
	}

	return {};
};

const getUserInfo = (log: AuditLogWithRelations) => {
	// We only have the direct user relation in our updated type
	if (log.user) {
		return {
			name: log.user.name,
			email: log.user.email,
			avatarUrl: log.user.image || undefined,
		};
	}

	// Default fallback
	return {
		name: undefined,
		email: undefined,
		avatarUrl: undefined,
	};
};

const LogItem = ({ log }: { log: AuditLogWithRelations }) => {
	const logData = parseLogData(log);
	const userInfo = getUserInfo(log);
	const actionType = logData.action || "update";

	return (
		<Card className="border-0 border-none">
			<CardContent>
				<div className="flex items-start gap-4">
					<Avatar className="h-10 w-10">
						<AvatarImage
							src={userInfo.avatarUrl || ""}
							alt={userInfo.name || "User"}
						/>
						<AvatarFallback>
							{getInitials(userInfo.name)}
						</AvatarFallback>
					</Avatar>

					<div className="flex-1 space-y-2">
						<div className="flex items-center justify-between">
							<div className="font-medium">
								{userInfo.name ||
									`User ${log.userId.substring(0, 6)}`}
							</div>
							<Badge
								variant="outline"
								className={cn(
									"text-xs font-medium",
									getActionColor(actionType),
								)}
							>
								{actionType.charAt(0).toUpperCase() +
									actionType.slice(1)}
							</Badge>
						</div>

						<CardDescription className="text-sm">
							{log.description || "No description available"}
						</CardDescription>

						{logData.changes &&
							Object.keys(logData.changes).length > 0 && (
								<div className="rounded-md bg-muted/40 p-2 text-xs">
									<div className="font-medium mb-1">
										Changes:
									</div>
									<ul className="space-y-1">
										{Object.entries(logData.changes).map(
											([
												field,
												{ previous, current },
											]) => (
												<li key={field}>
													<span className="font-medium">
														{field}:
													</span>{" "}
													<span className="line-through text-muted-foreground">
														{previous?.toString() ||
															"(empty)"}
													</span>{" "}
													<span className="text-foreground">
														→{" "}
														{current?.toString() ||
															"(empty)"}
													</span>
												</li>
											),
										)}
									</ul>
								</div>
							)}

						<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
							<div className="flex items-center gap-1">
								<CalendarIcon className="h-3 w-3" />
								{format(log.timestamp, "MMM d, yyyy")}
							</div>
							<div className="flex items-center gap-1">
								<ClockIcon className="h-3 w-3" />
								{format(log.timestamp, "h:mm a")}
							</div>
							{log.entityType && (
								<div className="flex items-center gap-1">
									{getEntityTypeIcon(log.entityType)}
									{log.entityType}
								</div>
							)}
							{log.entityId && (
								<div className="flex items-center gap-1">
									<ActivityIcon className="h-3 w-3" />
									ID: {log.entityId.substring(0, 8)}
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};
export const RecentAuditLogs = ({
	logs,
}: { logs: AuditLogWithRelations[] }) => {
	return (
		<Card className="overflow-hidden">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-md">
						Recent Activity
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<ScrollArea>
					{logs.length > 0 ? (
						<div className="max-h-[300px]">
							<div className="divide-y space-y-4">
								{logs.map((log) => (
									<LogItem key={log.id} log={log} />
								))}
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center p-6 text-center">
							<ActivityIcon className="mb-2 h-8 w-8 text-muted-foreground" />
							<p className="text-sm font-medium">
								No recent activity
							</p>
							<p className="text-xs text-muted-foreground">
								Activity will appear here when changes are made to
								this policy
							</p>
						</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card >
	);
};
