import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableData } from "@/services/tableService";
import { Plus, Trash2, X, RefreshCw } from "lucide-react";

interface EditableGridProps {
    data: TableData;
    onChange: (data: TableData) => void;
}

const EditableGrid: React.FC<EditableGridProps> = ({ data, onChange }) => {
    const handleHeaderChange = (index: number, value: string) => {
        const newHeaders = [...data.headers];
        newHeaders[index] = value;
        onChange({ ...data, headers: newHeaders });
    };

    const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = data.rows.map((row, rIdx) =>
            rIdx === rowIndex
                ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
                : row
        );
        onChange({ ...data, rows: newRows });
    };

    const addRow = () => {
        const newRow = new Array(data.headers.length).fill("");
        onChange({ ...data, rows: [...data.rows, newRow] });
    };

    const deleteRow = (index: number) => {
        const newRows = data.rows.filter((_, i) => i !== index);
        onChange({ ...data, rows: newRows });
    };

    const addColumn = () => {
        const newHeaders = [...data.headers, `New Column`];
        const newRows = data.rows.map((row) => [...row, ""]);
        onChange({ headers: newHeaders, rows: newRows });
    };

    const deleteColumn = (index: number) => {
        if (data.headers.length <= 1) return;
        const newHeaders = data.headers.filter((_, i) => i !== index);
        const newRows = data.rows.map((row) => row.filter((_, i) => i !== index));
        onChange({ headers: newHeaders, rows: newRows });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div>
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        Data Editor
                    </h3>
                    <p className="text-sm text-gray-500">Refine your extracted data before export</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={addColumn} className="border-white/10 hover:bg-white/5">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                    </Button>
                    <Button variant="outline" size="sm" onClick={addRow} className="border-white/10 hover:bg-white/5">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                    </Button>
                </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 backdrop-blur-md shadow-2xl">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-white/10 hover:bg-transparent">
                                {data.headers.map((header, i) => (
                                    <TableHead key={i} className="p-4 min-w-[180px] bg-white/[0.02]">
                                        <div className="flex items-center gap-2 group">
                                            <Input
                                                value={header}
                                                onChange={(e) => handleHeaderChange(i, e.target.value)}
                                                className="h-9 font-bold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/50 text-gray-300 transition-colors group-hover:text-white"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-gray-600 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                                onClick={() => deleteColumn(i)}
                                                disabled={data.headers.length <= 1}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="w-[60px] bg-white/[0.02]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.rows.map((row, rIdx) => (
                                <TableRow key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors">
                                    {row.map((cell, cIdx) => (
                                        <TableCell key={cIdx} className="p-1">
                                            <Input
                                                value={cell}
                                                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                                className="h-11 bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/30 text-gray-400 focus:text-white transition-all rounded-none"
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell className="p-2 text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-700 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            onClick={() => deleteRow(rIdx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {data.rows.length === 0 && (
                <div className="text-center py-20 text-gray-600 border-2 border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                    <div className="mb-4 flex justify-center">
                        <RefreshCw className="h-8 w-8 opacity-20 animate-spin" />
                    </div>
                    Analyzing document... Please wait.
                </div>
            )}
        </div>
    );
};

export default EditableGrid;
