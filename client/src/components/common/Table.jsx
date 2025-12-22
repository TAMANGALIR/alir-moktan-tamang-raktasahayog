import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import {
    Table as ShadcnTable,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "../ui/table";
import { cn } from "../../lib/utils";

/**
 * Reusable Table Component (Shadcn UI Version)
 * 
 * @param {Array} columns - Array of column definitions
 *   @param {string} columns.key - Unique key for the column
 *   @param {string} columns.header - Header text
 *   @param {function} columns.render - (Optional) Custom render function for the cell (value, row) => ReactNode
 *   @param {boolean} columns.sortable - (Optional) Whether the column is sortable
 *   @param {string} columns.align - (Optional) 'left', 'center', 'right'
 * @param {Array} data - Array of data objects
 * @param {Array} actions - (Optional) Array of action definitions
 *   @param {string} actions.label - Label for the action
 *   @param {function} actions.onClick - Function to call on click (row) => void
 *   @param {string} actions.className - (Optional) Custom class for the action button
 * @param {string} className - (Optional) Custom class for the table container
 */
const Table = ({
    columns,
    data,
    actions,
    className = "",
    isLoading = false,
    emptyMessage = "No data available"
}) => {
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = React.useMemo(() => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    const getAlignmentClass = (align) => {
        switch (align) {
            case 'center': return 'text-center justify-center';
            case 'right': return 'text-right justify-end';
            default: return 'text-left justify-start';
        }
    };

    return (
        <div className={cn("w-full rounded-md border", className)}>
            <ShadcnTable>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col.key}
                                className={cn(
                                    "text-left",
                                    col.sortable && "cursor-pointer hover:bg-muted/50",
                                    col.align === 'center' && "text-center",
                                    col.align === 'right' && "text-right",
                                    col.className
                                )}
                                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                            >
                                <div className={cn("flex items-center space-x-2", getAlignmentClass(col.align))}>
                                    <span>{col.header}</span>
                                    {col.sortable && (
                                        <span className="text-muted-foreground ml-1">
                                            {sortConfig.key === col.key ? (
                                                sortConfig.direction === 'asc' ? <FaSortUp className="h-3 w-3" /> : <FaSortDown className="h-3 w-3" />
                                            ) : (
                                                <FaSort className="h-3 w-3 opacity-50" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                        {actions && (
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs text-muted-foreground">Loading...</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : sortedData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        sortedData.map((row, rowIndex) => (
                            <TableRow key={row.id || rowIndex}>
                                {columns.map((col) => (
                                    <TableCell
                                        key={`${rowIndex}-${col.key}`}
                                        className={cn(
                                            "text-left",
                                            col.align === 'center' && "text-center",
                                            col.align === 'right' && "text-right",
                                            col.className
                                        )}
                                    >
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </TableCell>
                                ))}
                                {actions && (
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            {actions.map((action, actionIndex) => (
                                                <button
                                                    key={actionIndex}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        action.onClick(row);
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                                                        action.className || "bg-primary/10 text-primary hover:bg-primary/20"
                                                    )}
                                                >
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </ShadcnTable>
        </div >
    );
};

export default Table;
