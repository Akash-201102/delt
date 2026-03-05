import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import ImageUploader from '@/components/ImageUploader';
import OcrProgress from '@/components/OcrProgress';
import EditablePreview from '@/components/EditablePreview';
import { preprocessImage, runOcr, type OcrResult } from '@/services/ocrService';
import { parseOcrText, type ParsedEntry } from '@/services/parsingService';
import { extractWithAi } from '@/services/aiService';
import { useSaveEntry } from '@/hooks/useEntries';
import { Button } from '@/components/ui/button';
import { ScanLine, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const saveEntry = useSaveEntry();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [parsedData, setParsedData] = useState<ParsedEntry | null>(null);

  const handleImageSelected = useCallback((f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setOcrResult(null);
    setParsedData(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setOcrResult(null);
    setParsedData(null);
    setProgress(0);
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(5);

    try {
      // Preprocess
      setProgress(10);
      const processedImage = await preprocessImage(file);
      setProgress(20);

      // OCR
      const result = await runOcr(processedImage, (p) => setProgress(20 + Math.round(p * 0.7)));
      setOcrResult(result);
      setProgress(90);

      // Parse with AI if possible, otherwise fallback
      let parsed: ParsedEntry;
      try {
        const aiResult = await extractWithAi(result.text);
        if (aiResult) {
          parsed = aiResult;
          toast.success('AI extraction successful! High accuracy applied.');
        } else {
          parsed = parseOcrText(result.text);
          toast.warning('AI extraction failed. Falling back to simple logic.');
        }
      } catch (e) {
        console.error("AI Error in Index:", e);
        parsed = parseOcrText(result.text);
        toast.error('AI error. Using fallback logic.');
      }

      setParsedData(parsed);
      setProgress(100);
    } catch (error) {
      console.error('OCR failed:', error);
      toast.error('OCR processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (data: ParsedEntry) => {
    await saveEntry.mutateAsync({
      name: data.name,
      date: data.date,
      total: data.total,
      items: data.items,
      raw_ocr_text: ocrResult?.text,
      confidence: ocrResult?.confidence,
    });
    handleClear();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8 max-w-2xl space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2 pb-4">
          <h2 className="text-3xl font-bold font-display">Digitize Your Forms</h2>
          <p className="text-muted-foreground">
            Upload a handwritten or printed form and let AI extract structured data instantly.
          </p>
        </div>

        {/* Upload */}
        <ImageUploader
          onImageSelected={handleImageSelected}
          preview={preview}
          onClear={handleClear}
        />

        {/* Process button */}
        {file && !isProcessing && !parsedData && (
          <Button onClick={handleProcess} className="w-full gradient-primary text-primary-foreground h-12 text-base">
            <ScanLine className="h-5 w-5 mr-2" />
            Extract Data with OCR
          </Button>
        )}

        {/* Progress */}
        <OcrProgress progress={progress} isProcessing={isProcessing} />

        {/* Editable preview */}
        {parsedData && ocrResult && (
          <EditablePreview
            parsedData={parsedData}
            rawText={ocrResult.text}
            confidence={ocrResult.confidence}
            onSave={handleSave}
            isSaving={saveEntry.isPending}
          />
        )}

        {/* Go to dashboard */}
        {!file && (
          <div className="text-center pt-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-muted-foreground">
              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
