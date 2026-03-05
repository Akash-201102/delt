import { useState, useMemo } from 'react';
import { useCasinoEntries, useDeleteCasinoEntry } from '@/hooks/useCasinoEntries';
import { exportCasinoToExcel } from '@/services/excelService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Download,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Database,
} from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';

const PAGE_SIZE = 10;

const CasinoDashboard = () => {
    const { data: entries = [], isLoading } = useCasinoEntries();
    const deleteEntry = useDeleteCasinoEntry();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return entries.filter(
            (e) =>
                (e.player_name || '').toLowerCase().includes(q) ||
                (e.table_no || '').toLowerCase().includes(q) ||
                (e.rupees || '').toLowerCase().includes(q)
        );
    }, [entries, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleExport = () => {
        if (filtered.length === 0) {
            toast.error('No entries to export');
            return;
        }
        exportCasinoToExcel(filtered);
        toast.success('Casino entries exported to Excel!');
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEntry.mutateAsync(id);
            toast.success('Entry deleted');
        } catch (e) {
            toast.error('Failed to delete entry');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <AppHeader />
            <main className="container py-8 space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold font-display">Casino Entries</h2>
                        <p className="text-muted-foreground text-sm">{entries.length} total records found</p>
                    </div>
                    <Button onClick={handleExport} className="gradient-primary text-primary-foreground">
                        <Download className="h-4 w-4 mr-2" />
                        Export Casino Data
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by player name, table, or amount..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        className="pl-10"
                    />
                </div>

                <div className="glass rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                        </div>
                    ) : paged.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                            <Database className="h-12 w-12" />
                            <p className="font-display font-medium">No casino entries found</p>
                            <p className="text-sm">Upload a casino form to see data here</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Player Name</TableHead>
                                        <TableHead>Time In</TableHead>
                                        <TableHead>Table No.</TableHead>
                                        <TableHead>Rupees</TableHead>
                                        <TableHead>Time Out</TableHead>
                                        <TableHead>Saved On</TableHead>
                                        <TableHead className="w-10" />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paged.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">{entry.player_name || '—'}</TableCell>
                                            <TableCell>{entry.time_in || '—'}</TableCell>
                                            <TableCell>{entry.table_no || '—'}</TableCell>
                                            <TableCell>{entry.rupees || '—'}</TableCell>
                                            <TableCell>{entry.time_out || '—'}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(entry.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        Page {page + 1} of {totalPages}
                                    </p>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={page === 0}
                                            onClick={() => setPage(page - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={page >= totalPages - 1}
                                            onClick={() => setPage(page + 1)}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CasinoDashboard;
