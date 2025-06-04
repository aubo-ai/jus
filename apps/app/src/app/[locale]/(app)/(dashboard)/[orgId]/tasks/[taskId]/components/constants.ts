import { Departments, TaskFrequency, TaskStatus } from "@comp/db/types";

// Define possible statuses based on the Prisma schema
export const taskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

// Define possible frequencies
export const taskFrequencies: TaskFrequency[] = [
	"daily",
	"weekly",
	"monthly",
	"quarterly",
	"yearly",
];

// Define possible departments
export const taskDepartments: Departments[] = [
	"none",
	"admin",
	"gov",
	"hr",
	"it",
	"itsm",
	"qms",
	"legal",
];

// Define MAIN colors for Departments
export const DEPARTMENT_COLORS: Record<Departments, string> = {
	none: "#6b7280", // Gray
	admin: "#14b8a6", // Teal
	gov: "#f97316", // Orange
	hr: "#eab308", // Yellow
	it: "#22c55e", // Green
	itsm: "#3b82f6", // Blue
	qms: "#a855f7", // Purple
	legal: "#ef4444", // Red
};
