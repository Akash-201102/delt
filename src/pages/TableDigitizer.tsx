import { useState, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import ImageUploader from "@/components/ImageUploader";
import OcrProgress from "@/components/OcrProgress";
import EditableGrid from "@/components/EditableGrid";
import { tableService, TableData } from "@/services/tableService";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Wand2, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const TableDigitizer = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleImageSelected = useCallback((f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setTableData(null);
        setProgress(0);
    }, []);

    const handleClear = useCallback(() => {
        setFile(null);
        setPreview(null);
        setTableData(null);
        setProgress(0);
    }, []);

    const handleExtract = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress(20);

        try {
            setProgress(40);
            const data = await tableService.extractTable(file);
            setProgress(100);
            setTableData(data);
            toast.success("Table extracted successfully!");
        } catch (error: any) {
            console.error("Extraction error:", error);
            toast.error(error.message || "Failed to extract table");
            // Fallback: empty grid
            setTableData({
                headers: ["Column 1", "Column 2", "Column 3"],
                rows: [["", "", ""]],
            });
            toast.info("Showing empty grid for manual entry.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        if (!tableData) return;
        setIsExporting(true);
        try {
            await tableService.exportExcel(tableData);
            toast.success("Excel file downloaded!");
        } catch (error: any) {
            toast.error(error.message || "Failed to export Excel");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />

            <main className="container py-8 space-y-8 max-w-6xl">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold font-display gradient-primary bg-clip-text text-transparent">
                        Excel Image Digitizer
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Upload any image containing a table. We'll extract it into a spreadsheet-like grid that you can edit and export to Excel.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Upload & Actions */}
                    <div className="lg:col-span-4 space-y-6 sticky top-24">
                        <div className="glass p-6 rounded-2xl border-primary/10">
                            <ImageUploader
                                onImageSelected={handleImageSelected}
                                preview={preview}
                                onClear={handleClear}
                            />

                            {file && !isProcessing && !tableData && (
                                <Button
                                    onClick={handleExtract}
                                    className="w-full mt-6 gradient-primary text-primary-foreground h-12 text-lg shadow-lg hover:shadow-primary/20 transition-all font-semibold"
                                >
                                    <Wand2 className="h-5 w-5 mr-3 animate-pulse" />
                                    Extract Table Data
                                </Button>
                            )}

                            <OcrProgress progress={progress} isProcessing={isProcessing} />

                            {tableData && (
                                <div className="space-y-3 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={handleClear}
                                        className="w-full h-11"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Upload New Image
                                    </Button>
                                    <Button
                                        onClick={handleExport}
                                        disabled={isExporting}
                                        className="w-full h-12 gradient-accent text-accent-foreground font-bold shadow-md hover:shadow-accent/20 transition-all"
                                    >
                                        {isExporting ? (
                                            <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                                        ) : (
                                            <Download className="h-5 w-5 mr-3" />
                                        )}
                                        Export to Excel (.xlsx)
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Editable Grid */}
                    <div className="lg:col-span-8">
                        {tableData ? (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <EditableGrid
                                    data={tableData}
                                    onChange={setTableData}
                                />
                            </div>
                        ) : (
                            <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/20 text-muted-foreground gap-4">
                                <FileSpreadsheet className="h-16 w-16 opacity-20" />
                                <div className="text-center">
                                    <p className="font-medium">No Data Extracted Yet</p>
                                    <p className="text-sm">Upload an image to see the interactive grid here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TableDigitizer;
