'use client';

import PageLayout from "@/app/components/PageLayout";
import { useRouter } from 'next/navigation'; // Added for potential refresh
import { useMemo } from 'react';
import { TableToolbar } from '../../components/TableToolbar'; // Adjusted path
import { useTableSearchSort } from '../../hooks/useTableSearchSort'; // Adjusted path
import type { SortConfig } from '../../types/common'; // Adjusted path
import { simpleUUID, useTaskChangeTracking, type TasksPageGridData } from './hooks/useTaskChangeTracking'; // Adjusted path and added type
import { friendlyDateColumnBase, formatFriendlyDate } from '../../components/gridUtils'; // Added import
import { relationalColumn, type ItemWithName } from '../../components/grid/RelationalCell'; // Import relationalColumn and ItemWithName
import { getAllControlsForLinking, linkControlToTask, unlinkControlFromTask } from './actions'; // Import actions
import { toast } from 'sonner'; // Import toast for user feedback

import {
  Column,
  DataSheetGrid,
  keyColumn,
  textColumn,
  type CellProps
} from 'react-datasheet-grid';
import 'react-datasheet-grid/dist/style.css';

import { Button } from "@comp/ui/button";
import type { FrameworkEditorTaskTemplate } from '@prisma/client'; // Keep for initial props type
import type { FrameworkEditorControlTemplate } from '@prisma/client'; // Import ControlTemplate for related data

// Define a type for tasks that includes their related control templates
interface FrameworkEditorTaskTemplateWithRelatedControls extends FrameworkEditorTaskTemplate {
  controlTemplates?: Pick<FrameworkEditorControlTemplate, 'id' | 'name'>[]; // Or FrameworkEditorControlTemplate[] if more fields are needed
}

// Define sortable column options for tasks
const sortableColumnsOptions: { value: keyof TasksPageGridData; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'description', label: 'Description' },
  { value: 'frequency', label: 'Frequency' },
  { value: 'department', label: 'Department' },
  { value: 'controlsLength', label: 'Linked Controls' },
  { value: 'createdAt', label: 'Created At' },
  { value: 'updatedAt', label: 'Updated At' },
];

// Define searchable keys for tasks
const tasksSearchableKeys: (keyof TasksPageGridData)[] = ['name', 'description', 'frequency', 'department'];

// Define sort configuration for tasks
const tasksSortConfig: SortConfig<keyof TasksPageGridData> = {
  name: 'string',
  description: 'string',
  frequency: 'string', // Assuming string for now, adjust if enum/specific type
  department: 'string', // Assuming string for now, adjust if enum/specific type
  controlsLength: 'number',
  createdAt: 'number', // Dates are handled as numbers (timestamps) by useTableSearchSort
  updatedAt: 'number',
};

interface TasksClientPageProps {
  initialTasks: FrameworkEditorTaskTemplateWithRelatedControls[]; // Use the new type
}

export function TasksClientPage({ initialTasks }: TasksClientPageProps) {
    const router = useRouter();

    const initialGridData: TasksPageGridData[] = useMemo(() => {
      return initialTasks.map(task => ({
        id: task.id || simpleUUID(),
        name: task.name ?? null,
        description: task.description ?? null,
        frequency: task.frequency ?? null, 
        department: task.department ?? null, 
        controls: task.controlTemplates?.map(ct => ({ id: ct.id, name: ct.name })) || [], // Corrected: use task.controlTemplates
        controlsLength: task.controlTemplates?.length || 0, // Corrected: use task.controlTemplates
        createdAt: task.createdAt ? new Date(task.createdAt) : null,
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : null,
      }));
    }, [initialTasks]);

    const { 
      dataForGrid, 
      handleGridChange, 
      getRowClassName, 
      handleCommit, 
      handleCancel, 
      isDirty,
      changesSummaryString,
      createdRowIds
    } = useTaskChangeTracking(initialGridData);
    
    // Log isDirty value on every render of TasksClientPage
    // console.log('[TasksClientPage] isDirty value:', isDirty, 'changesSummaryString:', changesSummaryString);

    const {
      searchTerm,
      setSearchTerm,
      sortColumnKey,
      setSortColumnKey,
      sortDirection,
      toggleSortDirection,
      processedData: sortedDataWithPotentialTimestamps,
    } = useTableSearchSort<TasksPageGridData, keyof TasksPageGridData>(
      dataForGrid, // Use dataForGrid from useTaskChangeTracking
      tasksSearchableKeys,
      tasksSortConfig,
      'createdAt', // Default sort column
      'asc'       // Default sort direction
    );

    // Convert timestamps back to Date objects if useTableSearchSort changed them
    const dataForDisplay = useMemo(() => {
      return sortedDataWithPotentialTimestamps.map(row => {
        const newRow = { ...row };
        if (typeof newRow.createdAt === 'number') {
          newRow.createdAt = new Date(newRow.createdAt);
        }
        if (typeof newRow.updatedAt === 'number') {
          newRow.updatedAt = new Date(newRow.updatedAt);
        }
        return newRow;
      });
    }, [sortedDataWithPotentialTimestamps]);

    // Define columns for DataSheetGrid
    const columns: Column<TasksPageGridData>[] = [
      { ...keyColumn('name', textColumn), title: 'Name', minWidth: 250 },
      { ...keyColumn('description', textColumn), title: 'Description', minWidth: 350, grow: 1 },
      { ...keyColumn('frequency', textColumn), title: 'Frequency', minWidth: 150 }, // Adjust if using a select/enum column
      { ...keyColumn('department', textColumn), title: 'Department', minWidth: 150 }, // Adjust if using a select/enum column
      {
        ...(relationalColumn<TasksPageGridData, 'controls'> ({
          itemsKey: 'controls',
          getAllSearchableItems: getAllControlsForLinking,
          linkItemAction: async (taskId, controlId) => {
            try {
              await linkControlToTask(taskId, controlId);
              toast.success("Control linked successfully.");
              // router.refresh(); // Consider if refresh is needed immediately
            } catch (error) {
              toast.error(`Failed to link control: ${error instanceof Error ? error.message : String(error)}`);
            }
          },
          unlinkItemAction: async (taskId, controlId) => {
            try {
              await unlinkControlFromTask(taskId, controlId);
              toast.success("Control unlinked successfully.");
              // router.refresh(); // Consider if refresh is needed immediately
            } catch (error) {
              toast.error(`Failed to unlink control: ${error instanceof Error ? error.message : String(error)}`);
            }
          },
          itemTypeLabel: 'Control',
          createdRowIds: createdRowIds, // Pass createdRowIds from useTaskChangeTracking
        })),
        id: 'controls', // Unique ID for the column
        title: 'Linked Controls', 
        minWidth: 200 
      },
      { ...keyColumn('createdAt', friendlyDateColumnBase), title: 'Created At', minWidth: 220, disabled: true },
      { ...keyColumn('updatedAt', friendlyDateColumnBase), title: 'Updated At', minWidth: 220, disabled: true },
      { ...keyColumn('id', textColumn as Partial<Column<string, any, string>>), title: 'ID', minWidth: 280, disabled: true },
    ];
    

    return (
      <>
        <PageLayout breadcrumbs={[{ label: "Tasks", href: "/tasks" }]}>
          {isDirty && (
            <div className="flex items-center space-x-2 mb-4 p-2 bg-secondary/80 rounded-sm">
              <span className="text-sm text-muted-foreground">{changesSummaryString}</span>
              <Button variant="outline" onClick={async () => {
                  handleCancel();
                  // Potentially add router.refresh() if canceling discards optimistic UI updates from creations via dialog
              }} size="sm" className="rounded-sm">
                Cancel
              </Button>
              <Button onClick={async () => {
                const result = await handleCommit();
                if (result.needsRefresh) {
                   router.refresh(); // Refresh data from server after commit
                }
              }} size="sm" className="rounded-sm">
                Commit Changes
              </Button>
            </div>
          )}
          <TableToolbar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            sortableColumnOptions={sortableColumnsOptions}
            sortColumnKey={sortColumnKey}
            onSortColumnKeyChange={(key) => setSortColumnKey(key as keyof TasksPageGridData | null)}
            sortDirection={sortDirection}
            onSortDirectionChange={toggleSortDirection}
          />
          <div className="mt-4">
            <DataSheetGrid
              value={dataForDisplay} // Use the fully processed data
              height={600} // Adjust as needed
              onChange={handleGridChange}
              columns={columns}
              rowClassName={getRowClassName}
              createRow={() => ({ // Default structure for new rows created directly in grid
                id: simpleUUID(),
                name: 'New Task Name',
                description: 'Task Description',
                frequency: null, // Or a default enum value
                department: null, // Or a default enum value
                controls: [],
                controlsLength: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              })}
              duplicateRow={({rowData}) => ({ 
                ...rowData, 
                id: simpleUUID(),
                name: rowData.name ? `Copy of ${rowData.name}` : 'Copied Task',
                controls: rowData.controls ? [...rowData.controls] : [],
                controlsLength: rowData.controlsLength || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              })}
            />
          </div>
        </PageLayout>
      </>
    );
} 