import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import ImageUploader from "@/components/ImageUploader";
import OcrProgress from "@/components/OcrProgress";
import EditableGrid from "@/components/EditableGrid";
import { tableService, TableData } from "@/services/tableService";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    Wand2,
    Download,
    RefreshCw,
    FileSearch,
    Zap,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const UniversalDigitizer = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tableData, setTableData] = useState<TableData | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showEditor, setShowEditor] = useState(false);

    const handleImageSelected = useCallback((f: File) => {
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setTableData(null);
        setShowEditor(false);
        setProgress(0);
    }, []);

    const handleClear = useCallback(() => {
        setFile(null);
        setPreview(null);
        setTableData(null);
        setShowEditor(false);
        setProgress(0);
    }, []);

    const handleExtract = async () => {
        if (!file) return;
        setIsProcessing(true);
        setProgress(10);

        try {
            // Simulate progress for better UX
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(interval);
                        return 90;
                    }
                    return prev + 5;
                });
            }, 300);

            const data = await tableService.extractTable(file);
            clearInterval(interval);
            setProgress(100);
            setTableData(data);
            setShowEditor(true);

            toast.success("AI has successfully structured your data!", {
                icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
            });

        } catch (error: any) {
            console.error("Extraction error:", error);
            toast.error(error.message || "Extraction failed. AI encountered an issue.");
            // Automatic fallback: structure it into something even if failed
            setTableData({
                headers: ["Data Column"],
                rows: [["AI was unable to extract. Please try a clearer photo."]],
            });
            setShowEditor(true);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleExport = async () => {
        if (!tableData) return;
        setIsExporting(true);
        try {
            await tableService.exportExcel(tableData);
            toast.success("Spreadsheet generated and downloaded!");
        } catch (error: any) {
            toast.error("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-primary/30">
            <AppHeader />

            <main className="container py-12 px-4 max-w-7xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="relative text-center space-y-6 py-8">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -z-10" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                        <Zap className="h-3 w-3" />
                        Next-Gen AI Vision
                    </div>

                    <h2 className="text-5xl md:text-7xl font-black font-display tracking-tight leading-[1.1]">
                        Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Digitizer</span>
                    </h2>

                    <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                        Turn any photo, bill, or messy log into a perfect spreadsheet.
                        Powered by advanced vision intelligence.
                    </p>
                </div>

                <div className={`grid grid-cols-1 ${showEditor ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'} gap-10 transition-all duration-700 ease-in-out`}>

                    {/* Upload Area */}
                    <div className={`${showEditor ? 'lg:col-span-4' : 'w-full'} space-y-6`}>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative glass-dark p-8 rounded-2xl border border-white/10 shadow-2xl">
                                <ImageUploader
                                    onImageSelected={handleImageSelected}
                                    preview={preview}
                                    onClear={handleClear}
                                />

                                {file && !isProcessing && !tableData && (
                                    <Button
                                        onClick={handleExtract}
                                        className="w-full mt-8 gradient-primary hover:scale-[1.02] active:scale-95 transition-all h-14 text-xl font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                    >
                                        <Wand2 className="h-6 w-6 mr-3" />
                                        Extract Everything
                                    </Button>
                                )}

                                <div className="mt-4">
                                    <OcrProgress progress={progress} isProcessing={isProcessing} />
                                </div>

                                {tableData && (
                                    <div className="grid grid-cols-1 gap-3 mt-8 animate-in fade-in zoom-in duration-300">
                                        <Button
                                            variant="ghost"
                                            onClick={handleClear}
                                            className="w-full h-12 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Try Another Image
                                        </Button>
                                        <Button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="w-full h-14 bg-white text-black hover:bg-gray-200 font-black text-lg transition-transform hover:scale-[1.02]"
                                        >
                                            {isExporting ? (
                                                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                                            ) : (
                                                <Download className="h-5 w-5 mr-3" />
                                            )}
                                            Download Excel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        {!showEditor && !isProcessing && (
                            <div className="p-6 rounded-2xl border border-white/5 bg-white/2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    What can I digitize?
                                </h4>
                                <ul className="text-sm text-gray-500 space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-primary rounded-full transition-all group-hover:w-2" />
                                        Excel & Spreadsheet Snapshots
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-primary rounded-full" />
                                        Restaurant & Utility Bills
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1 w-1 bg-primary rounded-full" />
                                        Handwritten Logs & Checklists
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Editor Area */}
                    {showEditor && (
                        <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700 ease-out">
                            <div className="glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="p-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
                                <div className="p-2">
                                    <EditableGrid
                                        data={tableData!}
                                        onChange={setTableData}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Link */}
                {!showEditor && (
                    <div className="text-center pt-8 animate-in fade-in duration-1000">
                        <Button
                            variant="link"
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-500 hover:text-primary transition-colors text-lg"
                        >
                            View your digitization history
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UniversalDigitizer;
