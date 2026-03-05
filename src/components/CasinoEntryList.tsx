import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CasinoEntryPreview from './CasinoEntryPreview';
import type { CasinoEntry } from '@/services/casinoParsingService';

interface CasinoEntryListProps {
    entries: CasinoEntry[];
    rawText: string;
    confidence: number;
    onSaveAll: (entries: CasinoEntry[]) => void;
    isSaving: boolean;
}

const CasinoEntryList = ({
    entries: initialEntries,
    rawText,
    confidence,
    onSaveAll,
    isSaving
}: CasinoEntryListProps) => {
    const [entries, setEntries] = useState<CasinoEntry[]>(initialEntries);

    useEffect(() => {
        setEntries(initialEntries);
    }, [initialEntries]);

    const handleUpdateEntry = (index: number, updatedEntry: CasinoEntry) => {
        const newEntries = [...entries];
        newEntries[index] = updatedEntry;
        setEntries(newEntries);
    };

    return (
        <div className="space-y-6 w-full">
            <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b">
                <div>
                    <h3 className="text-xl font-bold">Extracted Entries ({entries.length})</h3>
                    <p className="text-sm text-muted-foreground">Review and edit entries before saving</p>
                </div>
                <Button
                    onClick={() => onSaveAll(entries)}
                    disabled={isSaving || entries.length === 0}
                    className="gradient-primary"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : `Save All ${entries.length} Entries`}
                </Button>
            </div>

            <div className="space-y-8">
                {entries.map((entry, index) => (
                    <div key={index} className="relative">
                        <div className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                            {index + 1}
                        </div>
                        <CasinoEntryPreview
                            parsedData={entry}
                            rawText={rawText}
                            confidence={confidence}
                            onSave={(updated) => handleUpdateEntry(index, updated)}
                            isSaving={false} // Individual save button is hidden or just updates parent state
                            hideSaveButton={true}
                        />
                    </div>
                ))}
            </div>

            {entries.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="py-10 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                        <p>No entries detected. Try a clearer photo.</p>
                    </CardContent>
                </Card>
            )}

            <div className="pt-6">
                <Button
                    onClick={() => onSaveAll(entries)}
                    disabled={isSaving || entries.length === 0}
                    className="w-full h-12 text-lg gradient-primary"
                >
                    <Save className="h-5 w-5 mr-2" />
                    {isSaving ? 'Saving All Entries...' : `Finalize & Save ${entries.length} Entries`}
                </Button>
            </div>
        </div>
    );
};

export default CasinoEntryList;
