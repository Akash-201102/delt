import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Edit3, FileText } from 'lucide-react';
import type { ParsedEntry, ParsedItem } from '@/services/parsingService';

interface EditablePreviewProps {
  parsedData: ParsedEntry;
  rawText: string;
  confidence: number;
  onSave: (data: ParsedEntry) => void;
  isSaving: boolean;
}

const EditablePreview = ({ parsedData, rawText, confidence, onSave, isSaving }: EditablePreviewProps) => {
  const [data, setData] = useState<ParsedEntry>(parsedData);
  const [showRaw, setShowRaw] = useState(false);

  const confColor = confidence >= 80 ? 'bg-success text-success-foreground' : confidence >= 50 ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground';

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-display">
            <Edit3 className="h-5 w-5 text-primary" />
            Extracted Data
          </CardTitle>
          <Badge className={confColor}>
            {Math.round(confidence)}% confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              value={data.date}
              onChange={(e) => setData({ ...data, date: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div className="space-y-2">
            <Label>Items</Label>
            <div className="space-y-2">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], description: e.target.value };
                      setData({ ...data, items: newItems });
                    }}
                    placeholder="Description"
                  />
                  <Input
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...data.items];
                      newItems[idx] = { ...newItems[idx], price: e.target.value };
                      setData({ ...data, items: newItems });
                    }}
                    placeholder="Price"
                  />
                  <button
                    type="button"
                    className="text-destructive"
                    onClick={() => {
                      const newItems = data.items.filter((_, i) => i !== idx);
                      setData({ ...data, items: newItems });
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setData({ ...data, items: [...data.items, { description: '', price: '' }] })}
            >
              Add item
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              value={data.total}
              onChange={(e) => setData({ ...data, total: e.target.value })}
              placeholder="Total amount"
            />
          </div>
        </div>

        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="h-3.5 w-3.5" />
          {showRaw ? 'Hide' : 'Show'} raw OCR text
        </button>

        {showRaw && (
          <pre className="bg-muted/50 rounded-lg p-4 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
            {rawText}
          </pre>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onSave(data)}
          disabled={isSaving || (!data.name && !data.total)}
          className="gradient-primary text-primary-foreground w-full"
        >
          <Check className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Confirm & Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EditablePreview;
