import React, { useState, useRef, useEffect } from "react";
import { tableService, TableData } from "@/services/tableService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, Spade, Dices, RotateCcw, Loader2, AlertCircle, ArrowRight, Camera } from "lucide-react";
import { toast } from "sonner";
import CameraModal from "@/components/CameraModal";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import deltinLogo from "@/images/deltinroyal.jpeg";
import deltinLogoFinal from "@/images/deltinfinal.png";

type GameType = "Poker" | "Gaming" | "Roulette";

interface GameState {
    pokerData: TableData | null;
    gamingData: TableData | null;
    rouletteData: TableData | null;
}

const DeltinCasino = () => {
    const navigate = useNavigate();
    const [selectedGame, setSelectedGame] = useState<GameType>("Poker");
    const [gameStates, setGameStates] = useState<GameState>({
        pokerData: null,
        gamingData: null,
        rouletteData: null,
    });
    const [isExtracting, setIsExtracting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Add debug logging to track state changes
    useEffect(() => {
        console.log("Deltin Casino State Update:", {
            selectedGame,
            hasPoker: !!gameStates.pokerData,
            hasGaming: !!gameStates.gamingData,
            hasRoulette: !!gameStates.rouletteData
        });
    }, [selectedGame, gameStates]);

    const games: { type: GameType; icon: React.ReactNode; color: string }[] = [
        { type: "Poker", icon: <Spade className="w-5 h-5" />, color: "from-amber-400 via-yellow-500 to-amber-600" },
        { type: "Gaming", icon: <Dices className="w-5 h-5" />, color: "from-amber-400 via-yellow-500 to-amber-600" },
        { type: "Roulette", icon: <RotateCcw className="w-5 h-5" />, color: "from-amber-400 via-yellow-500 to-amber-600" },
    ];

    const handleGameClick = (type: GameType) => {
        console.log("Switching to game:", type);
        setSelectedGame(type);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = async (file: File) => {
        console.log("File selected for extraction:", file.name);
        setIsExtracting(true);

        try {
            const rawData = await tableService.extractTable(file) as any;
            console.log("Backend response received:", rawData);

            // Recursive search for headers/rows or handle common nested patterns
            const findData = (obj: any): TableData | null => {
                if (!obj) return null;
                if (obj.headers && obj.rows) return obj;
                if (obj.Headers && obj.Rows) return { headers: obj.Headers, rows: obj.Rows };

                // Check nested properties
                for (const key in obj) {
                    if (typeof obj[key] === 'object') {
                        const nested = findData(obj[key]);
                        if (nested) return nested;
                    }
                }
                return null;
            };

            const structuredData = findData(rawData);

            if (!structuredData || !structuredData.headers || structuredData.headers.length === 0) {
                console.error("Could not find valid table structure in response");
                toast.error("Format mismatch: The AI returned data in an unexpected structure.");
                return;
            }

            const stateKey = `${selectedGame.toLowerCase()}Data` as keyof GameState;
            console.log(`Updating ${stateKey} with:`, structuredData);

            setGameStates((prev) => ({
                ...prev,
                [stateKey]: structuredData
            }));

            toast.success(`${selectedGame} data successfully extracted!`);
        } catch (error) {
            console.error("Extraction error details:", error);
            toast.error("Failed to extract data. Check the console for technical details.");
        } finally {
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                processFile(file);
            } else {
                toast.error("Please drop an image file.");
            }
        }
    };

    const handleExport = async () => {
        const stateKey = `${selectedGame.toLowerCase()}Data` as keyof GameState;
        const data = gameStates[stateKey];
        if (!data) return;

        try {
            await tableService.exportExcel(data);
            toast.success("Excel file download started!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to generate Excel file.");
        }
    };

    const handleCameraCapture = (file: File) => {
        setIsCameraOpen(false);
        processFile(file);
    };

    const currentData = gameStates[`${selectedGame.toLowerCase()}Data` as keyof GameState];

    return (
        <div className="min-h-screen bg-[#050510] text-gray-100 p-4 md:p-8 font-sans selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-12">

                <header className="text-center space-y-4 md:space-y-6 relative overflow-hidden py-4 md:py-8">
                    <div className="absolute inset-0 -top-20 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <img
                            src={deltinLogoFinal}
                            alt="Deltin Royale"
                            className="w-25 h-20 md:w-60 md:h-70 object-contain"
                        />
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent"
                        >

                        </motion.h1>
                    </motion.div>
                    <p className="text-gray-400 text-lg"></p>
                </header>

                {/* Games List */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        {/* <h2 className="text-2xl font-bold tracking-tight text-gray-200">Games List</h2> */}
                        <div className="h-[1px] flex-1 mx-6 bg-gradient-to-r from-gray-800 to-transparent" />
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
                        {games.map((game) => (
                            <motion.button
                                key={game.type}
                                whileHover={{ scale: 1.02, translateY: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleGameClick(game.type)}
                                className={`relative group p-[1px] rounded-xl md:rounded-2xl transition-all duration-500 w-full ${selectedGame === game.type
                                    ? `bg-gradient-to-br ${game.color} shadow-[0_5px_20px_-5px_rgba(251,191,36,0.5)] md:shadow-[0_10px_40px_-10px_rgba(251,191,36,0.5)]`
                                    : "bg-gray-800/40 hover:bg-amber-500/10"
                                    }`}
                            >
                                <div className={`relative h-14 md:h-28 flex flex-col items-center justify-center gap-1 md:gap-3 rounded-[11px] md:rounded-[15px] ${selectedGame === game.type ? "bg-black/40 backdrop-blur-md" : "bg-[#0a0a1a]"
                                    }`}>
                                    <div className={`transition-all duration-300 ${selectedGame === game.type ? "scale-75 md:scale-110 text-white" : "text-gray-500 group-hover:text-gray-300"
                                        }`}>
                                        {game.icon}
                                    </div>
                                    <span className={`font-bold tracking-widest uppercase text-[10px] md:text-xs ${selectedGame === game.type ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                                        }`}>
                                        {game.type}
                                    </span>
                                </div>

                                {selectedGame === game.type && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className={`absolute inset-0 -z-10 blur-2xl opacity-30 bg-gradient-to-br ${game.color}`}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Action and Preview */}
                <Card className="bg-[#0a0a1a]/80 border-gray-800/50 backdrop-blur-2xl overflow-hidden rounded-3xl shadow-2xl">
                    <CardHeader className="border-b border-gray-800/50 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${games.find(g => g.type === selectedGame)?.color}`} />
                                {selectedGame} Data
                            </CardTitle>
                            {/* <p className="text-gray-500 text-xs italic">Records for {selectedGame}</p> */}
                        </div>
                        <div className="flex gap-2 items-center justify-center md:justify-end flex-wrap">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button
                                onClick={handleUploadClick}
                                disabled={isExtracting}
                                className="bg-white text-black hover:bg-gray-200 rounded-xl px-3 md:px-6 h-9 md:h-11 text-xs md:text-sm font-bold transition-all active:scale-95 flex-1 md:flex-none"
                            >
                                {isExtracting ? (
                                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                )}
                                {isExtracting ? "Processing..." : "Extract"}
                            </Button>
                            <Button
                                onClick={() => setIsCameraOpen(true)}
                                disabled={isExtracting}
                                variant="outline"
                                className="rounded-xl px-2 md:px-4 h-9 md:h-11 border-gray-800 hover:bg-gray-800/50 text-gray-300 transition-all active:scale-95"
                                title="Use Camera"
                            >
                                <Camera className="w-4 h-4 md:w-5 md:h-5" />
                            </Button>
                            {currentData && (
                                <Button
                                    onClick={handleExport}
                                    variant="outline"
                                    className="rounded-xl px-3 md:px-6 h-9 md:h-11 border-gray-800 hover:bg-gray-800/50 text-gray-300 text-xs md:text-sm"
                                >
                                    <Download className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                                    Excel
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="min-h-[400px] flex flex-col">
                            <AnimatePresence mode="wait">
                                {currentData ? (
                                    <motion.div
                                        key={`${selectedGame}-content`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="overflow-auto"
                                    >
                                        <Table>
                                            <TableHeader className="bg-gray-900/50 sticky top-0 z-10">
                                                <TableRow className="border-gray-800 hover:bg-transparent">
                                                    {currentData.headers.map((header, i) => (
                                                        <TableHead key={i} className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] p-5">
                                                            {header}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentData.rows.map((row, i) => (
                                                    <TableRow key={i} className="border-gray-800/30 hover:bg-white/[0.02] transition-colors">
                                                        {row.map((cell, j) => (
                                                            <TableCell key={j} className="p-5 text-gray-300 text-sm font-medium border-gray-800/10">
                                                                {cell}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={`${selectedGame}-empty`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`flex-1 flex flex-col items-center justify-center p-12 text-center transition-all duration-300 rounded-2xl border-2 border-dashed ${isDragging ? 'border-purple-500 bg-purple-500/10 scale-[0.98]' : 'border-gray-800/50'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={handleUploadClick}
                                    >
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full" />
                                            <div className={`relative w-10 h-10 rounded-2xl bg-gray-900 border flex items-center justify-center transition-colors ${isDragging ? 'border-purple-500' : 'border-gray-800'
                                                }`}>
                                                <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-purple-400' : 'text-gray-700'}`} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-gray-200 font-bold text-lg">
                                                {isDragging ? 'Drop it here!' : `Drop ${selectedGame} Image`}
                                            </p>
                                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                                Or click to browse to collect the data.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Info */}
                {/* <footer className="pt-12 text-center space-y-6">
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/universal')}
                            className="group text-gray-500 hover:text-purple-400 transition-all gap-2"
                        >
                            Need a custom structure?
                            <span className="font-bold border-b border-gray-700 group-hover:border-purple-400">Switch to Universal Digitizer</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-800 bg-gray-900/50 text-gray-500 text-xs">
                        <AlertCircle className="w-3 h-3 text-purple-500" />
                        AI extracts data directly from images. Accuracy depends on image quality.
                    </div>
                </footer> */}
            </div>

            {isCameraOpen && (
                <CameraModal
                    onCapture={handleCameraCapture}
                    onClose={() => setIsCameraOpen(false)}
                />
            )}
        </div>
    );
};

export default DeltinCasino;
