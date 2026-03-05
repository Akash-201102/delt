import { useState } from 'react';
import { Save, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CasinoEntry } from '@/services/casinoParsingService';

interface CasinoEntryPreviewProps {
  parsedData: CasinoEntry;
  rawText: string;
  confidence: number;
  onSave: (data: CasinoEntry) => void;
  isSaving: boolean;
  hideSaveButton?: boolean;
}

const CasinoEntryPreview = ({
  parsedData,
  rawText,
  confidence,
  onSave,
  isSaving,
  hideSaveButton = false
}: CasinoEntryPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<CasinoEntry>(parsedData);

  const handleFieldChange = (field: keyof CasinoEntry, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(parsedData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(parsedData);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return 'bg-green-100 text-green-800';
    if (conf >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Casino Entry Data</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getConfidenceColor(confidence)}>
              {confidence}% confidence
            </Badge>
            {isEditing ? (
              <div className="flex gap-1">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={handleEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Player Name</label>
            {isEditing ? (
              <Input
                value={editedData.playerName}
                onChange={(e) => handleFieldChange('playerName', e.target.value)}
                placeholder="Enter player name"
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {editedData.playerName || 'Not detected'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time In</label>
            {isEditing ? (
              <Input
                value={editedData.timeIn}
                onChange={(e) => handleFieldChange('timeIn', e.target.value)}
                placeholder="e.g., 09:15 AM"
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {editedData.timeIn || 'Not detected'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Table No.</label>
            {isEditing ? (
              <Input
                value={editedData.tableNo}
                onChange={(e) => handleFieldChange('tableNo', e.target.value)}
                placeholder="e.g., 5"
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {editedData.tableNo || 'Not detected'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rupees</label>
            {isEditing ? (
              <Input
                value={editedData.rupees}
                onChange={(e) => handleFieldChange('rupees', e.target.value)}
                placeholder="e.g., 5000"
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {editedData.rupees || 'Not detected'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Out</label>
            {isEditing ? (
              <Input
                value={editedData.timeOut}
                onChange={(e) => handleFieldChange('timeOut', e.target.value)}
                placeholder="e.g., 11:45 AM"
              />
            ) : (
              <div className="p-2 bg-muted rounded">
                {editedData.timeOut || 'Not detected'}
              </div>
            )}
          </div>
        </div>

        {!isEditing && !hideSaveButton && (
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full gradient-primary" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Casino Entry'}
            </Button>
          </div>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded">
          <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
            {rawText.substring(0, 300)}
            {rawText.length > 300 && '...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CasinoEntryPreview;
