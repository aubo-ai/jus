"use client";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { useMemo } from "react";
import { columns as getColumns } from "./components/table/ContextColumns";
import type { Context } from "@prisma/client";
import { Button } from "@comp/ui/button";
import { Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import { CreateContextSheet } from "./components/CreateContextSheet";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

export const ContextTable = ({
    entries,
    pageCount,
    locale,
}: {
    entries: Context[];
    pageCount: number;
    locale: string;
}) => {
    const columns = useMemo(() => getColumns(), []);
    const { table } = useDataTable({
        data: entries,
        columns,
        pageCount,
        getRowId: (row) => row.id,
        initialState: {
            pagination: {
                pageSize: 50,
                pageIndex: 0,
            },
            sorting: [{ id: "createdAt", desc: true }],
        },
        shallow: false,
        clearOnDefault: true,
    });
    const [_, setOpenSheet] = useQueryState("create-context-sheet");
    return (
        <>
            <DataTable table={table}>
                <DataTableToolbar table={table}>
                    <Button
                        className="flex items-center gap-1 rounded-sm"
                        onClick={() => setOpenSheet("true")}
                    >
                        <Plus className="h-4 w-4" />
                        Add Entry
                    </Button>
                </DataTableToolbar>
            </DataTable>
            <CreateContextSheet />
        </>
    );
};