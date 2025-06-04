import { type Table as TanstackTable, flexRender } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import type * as React from "react";

import { getCommonPinningStyles } from "@/lib/data-table";
import { cn } from "@comp/ui/cn";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@comp/ui/table";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
	table: TanstackTable<TData>;
	actionBar?: React.ReactNode;
	getRowId?: (row: TData) => string;
	rowClickBasePath?: string;
	tableId?: string;
}

export function DataTable<TData>({
	table,
	actionBar,
	children,
	className,
	getRowId,
	rowClickBasePath,
	tableId,
	...props
}: DataTableProps<TData>) {
	const router = useRouter();

	const handleRowClick = (row: TData) => {
		if (getRowId) {
			const id = getRowId(row);
			router.push(`${rowClickBasePath}/${id}`);
		}
	};

	// Apply client-side filtering
	const filteredRows = table.getFilteredRowModel().rows;

	return (
		<div
			className={cn("flex w-full flex-col gap-2.5", className)}
			{...props}
		>
			{children}
			<div>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header, index) => (
									<TableHead
										key={header.id}
										colSpan={header.colSpan}
										className={cn(
											"px-4",
											index !== 0 &&
											"hidden md:table-cell",
											index === 0 &&
											"max-w-[200px] md:max-w-none",
										)}
										style={{
											...getCommonPinningStyles({
												column: header.column,
											}),
										}}
									>
										{header.isPlaceholder
											? null
											: flexRender(
												header.column.columnDef
													.header,
												header.getContext(),
											)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className={cn(getRowId && "hover:[&_tr]:cursor-pointer", "select-none")}>
						{filteredRows.length ? (
							filteredRows.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
									className={cn(getRowId)}
									onClick={() => handleRowClick(row.original)}
								>
									{row
										.getVisibleCells()
										.map((cell, index) => (
											<TableCell
												key={cell.id}
												className={cn(
													"px-4",
													index !== 0 &&
													"hidden md:table-cell",
													index === 0 &&
													"max-w-[200px] truncate md:max-w-none md:whitespace-normal [&_td]:hover:bg-accent/50",
												)}
												style={{
													...getCommonPinningStyles({
														column: cell.column,
													}),
												}}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getAllColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-col gap-2.5">
				<DataTablePagination table={table} tableId={tableId} />
				{actionBar &&
					table.getFilteredSelectedRowModel().rows.length > 0 &&
					actionBar}
			</div>
		</div>
	);
}
