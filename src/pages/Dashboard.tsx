import { useState, useMemo } from 'react';
import { useEntries, useDeleteEntry } from '@/hooks/useEntries';
import { exportToExcel } from '@/services/excelService';
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
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Database,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';

const PAGE_SIZE = 10;

type SortKey = 'name' | 'amount' | 'total' | 'date' | 'created_at';

const Dashboard = () => {
  const { data: entries = [], isLoading } = useEntries();
  const deleteEntry = useDeleteEntry();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.total || e.amount || '').toLowerCase().includes(q) ||
          e.date.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let va: string | undefined;
        let vb: string | undefined;
        if (sortKey === 'total') {
          va = a.total || a.amount;
          vb = b.total || b.amount;
        } else {
          va = a[sortKey] as string | undefined;
          vb = b[sortKey] as string | undefined;
        }
        va = va ?? '';
        vb = vb ?? '';
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortAsc ? cmp : -cmp;
      });
  }, [entries, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error('No entries to export');
      return;
    }
    exportToExcel(filtered);
    toast.success('Excel file downloaded!');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold font-display">Dashboard</h2>
            <p className="text-muted-foreground text-sm">{entries.length} total entries</p>
          </div>
          <Button onClick={handleExport} className="gradient-accent text-accent-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, amount, or date..."
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
              <p className="font-display font-medium">No entries found</p>
              <p className="text-sm">Upload a form to get started</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {(['name', 'total', 'date', 'created_at'] as SortKey[]).map((key) => (
                      <TableHead
                        key={key}
                        className="cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort(key)}
                      >
                        <span className="flex items-center gap-1">
                          {key === 'created_at' ? 'Created' : key.charAt(0).toUpperCase() + key.slice(1)}
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.name || '—'}</TableCell>
                      <TableCell>{(entry.total || entry.amount) || '—'}</TableCell>
                      <TableCell>{entry.date || '—'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.confidence != null ? (
                          <Badge
                            variant="secondary"
                            className={
                              entry.confidence >= 80
                                ? 'bg-success/10 text-success'
                                : entry.confidence >= 50
                                ? 'bg-warning/10 text-warning'
                                : 'bg-destructive/10 text-destructive'
                            }
                          >
                            {Math.round(entry.confidence)}%
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteEntry.mutate(entry.id)}
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

export default Dashboard;
