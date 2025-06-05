"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { StatusIndicator } from "@/components/status-indicator";
import { useDataTable } from "@/hooks/use-data-table";
import { useI18n } from "@/locales/client";
import { Task, Policy } from "@comp/db/types";
import { Card, CardContent, CardHeader, CardTitle } from "@comp/ui/card";
import { Input } from "@comp/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface TasksTableProps {
	tasks: Task[];
	orgId: string;
	controlId: string;
}

export function TasksTable({ tasks, orgId, controlId }: TasksTableProps) {
	const t = useI18n();
	const [searchTerm, setSearchTerm] = useState("");

	// Define columns for tasks table
	const columns = useMemo<ColumnDef<Task>[]>(
		() => [
			{
				accessorKey: "title",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title={"Title"} />
				),
				cell: ({ row }) => {
					const title = row.original.title;
					return <span>{title}</span>;
				},
				enableSorting: true,
				sortingFn: (rowA, rowB, columnId) => {
					const nameA = rowA.original.title || "";
					const nameB = rowB.original.title || "";
					return nameA.localeCompare(nameB);
				},
			},
			{
				accessorKey: "description",
				header: ({ column }) => (
					<DataTableColumnHeader
						column={column}
						title={"Description"}
					/>
				),
				cell: ({ row }) => {
					const description = row.original.description;
					return (
						<span className="capitalize line-clamp-1">
							{description}
						</span>
					);
				},
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title={"Status"} />
				),
				cell: ({ row }) => {
					const rawStatus = row.original.status;

					// Pass the mapped status directly to StatusIndicator
					return <StatusIndicator status={rawStatus} />;
				},
			},
		],
		[t],
	);

	// Filter tasks data based on search term
	const filteredTasks = useMemo(() => {
		if (!searchTerm.trim()) return tasks;

		const searchLower = searchTerm.toLowerCase();
		return tasks.filter(
			(task) =>
				task.id.toLowerCase().includes(searchLower) ||
				task.title.toLowerCase().includes(searchLower) ||
				task.description.toLowerCase().includes(searchLower),
		);
	}, [tasks, searchTerm]);

	// Set up the tasks table
	const table = useDataTable({
		data: filteredTasks,
		columns,
		pageCount: 1,
		shallow: false,
		getRowId: (row) => row.id,
		initialState: {
			sorting: [{ id: "createdAt", desc: true }],
		},
		tableId: "t",
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Tasks ({filteredTasks.length})</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center mb-4">
					<Input
						placeholder={"Search tasks..."}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-sm"
					/>
					{/* <div className="ml-auto">
						<DataTableSortList
							table={table.table}
							align="end"
							tableId="t"
						/>
					</div> */}
				</div>
				<DataTable
					table={table.table}
					rowClickBasePath={`/${orgId}/`}
					getRowId={(row) => `/tasks/${row.id}`}
					tableId={"t"}
				/>
			</CardContent>
		</Card>
	);
}
