import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import CameraCapture from '@/components/CameraCapture';
import OcrProgress from '@/components/OcrProgress';
import CasinoEntryList from '@/components/CasinoEntryList';
import { preprocessImage, runOcr, getCompressedBase64, type OcrResult } from '@/services/ocrService';
import { extractCasinoDataWithAi, parseCasinoOcrText, type CasinoEntry } from '@/services/casinoParsingService';
import { extractWithVision } from '@/services/visionService';
import { useSaveCasinoEntry } from '@/hooks/useCasinoEntries';
import { Button } from '@/components/ui/button';
import { ScanLine, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const CasinoDigitizer = () => {
  const navigate = useNavigate();
  const saveEntry = useSaveCasinoEntry();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [parsedData, setParsedData] = useState<CasinoEntry[] | null>(null);

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
      // PRE-STEP: Prepare image for Vision AI (high accuracy)
      setProgress(10);
      console.log("Extraction: Compressing and converting file...");
      const base64 = await getCompressedBase64(file);
      setProgress(20);

      // Vision AI Extraction (Primary)
      let parsedRows: CasinoEntry[] | null = null;
      let rawText = "";
      let confidence = 0;

      try {
        console.log("Extraction: Attempting Vision AI...");
        const visionResult = await extractWithVision(base64);
        if (visionResult && visionResult.length > 0) {
          parsedRows = visionResult;
          rawText = `[Extracted via Vision AI - ${parsedRows.length} rows]`;
          confidence = 0.99;
          console.log(`Extraction: Vision AI successful with ${parsedRows.length} rows.`);
          toast.success(`Vision AI extracted ${parsedRows.length} entries!`);
        } else {
          console.log("Extraction: Vision AI returned no results.");
        }
      } catch (visionError) {
        console.error("Extraction: Vision AI encountered an error:", visionError);
      }

      // FALLBACK: Tesseract + Groq (if vision failed)
      if (!parsedRows) {
        console.log("Extraction: Falling back to Tesseract + Groq...");
        setProgress(30);
        const processedImage = await preprocessImage(file);
        setProgress(40);

        const result = await runOcr(processedImage, (p) => setProgress(40 + Math.round(p * 0.5)));
        setOcrResult(result);
        rawText = result.text;
        confidence = result.confidence;

        try {
          console.log("Extraction: Parsing Tesseract text with Groq...");
          const aiResult = await extractCasinoDataWithAi(result.text);
          if (aiResult) {
            parsedRows = [aiResult];
            console.log("Extraction: Fallback AI successful.");
            toast.success('Fallback AI extraction successful!');
          } else {
            parsedRows = [parseCasinoOcrText(result.text)];
            console.log("Extraction: Fallback AI gave no result, used local parsing.");
            toast.warning('Vision AI failed. Using basic parsing.');
          }
        } catch (e) {
          console.error("Extraction: Fallback AI Error:", e);
          parsedRows = [parseCasinoOcrText(result.text)];
          toast.error('AI error. Using local parsing.');
        }
      }

      console.log("Extraction: Setting parsed data to state:", parsedRows);
      setOcrResult({ text: rawText, confidence, lines: [] });
      setParsedData(parsedRows);
      setProgress(100);
    } catch (error) {
      console.error('Extraction failed:', error);
      toast.error('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = async (entries: CasinoEntry[]) => {
    try {
      for (const data of entries) {
        await saveEntry.mutateAsync({
          player_name: data.playerName,
          time_in: data.timeIn,
          table_no: data.tableNo,
          rupees: data.rupees,
          time_out: data.timeOut,
          raw_ocr_text: ocrResult?.text,
          confidence: ocrResult?.confidence,
        });
      }
      toast.success(`Successfully saved ${entries.length} entries!`);
      handleClear();
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving batch:", error);
      toast.error("Failed to save some entries.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container py-8 max-w-4xl space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2 pb-4">
          <h2 className="text-3xl font-bold font-display">Casino Entry Digitizer</h2>
          <p className="text-muted-foreground">
            Capture or upload casino entry forms or Excel sheets and let AI extract all data instantly.
          </p>
        </div>

        {/* Camera/File Upload */}
        <div className="max-w-2xl mx-auto">
          <CameraCapture
            onImageSelected={handleImageSelected}
            onClear={handleClear}
          />
        </div>

        {/* Process button */}
        {file && !isProcessing && !parsedData && (
          <div className="max-w-2xl mx-auto">
            <Button onClick={handleProcess} className="w-full gradient-primary text-primary-foreground h-12 text-base">
              <ScanLine className="h-5 w-5 mr-2" />
              Extract Casino Entry Data
            </Button>
          </div>
        )}

        {/* Progress */}
        <div className="max-w-2xl mx-auto">
          <OcrProgress progress={progress} isProcessing={isProcessing} />
        </div>

        {/* Editable preview list */}
        {parsedData && ocrResult && (
          <CasinoEntryList
            entries={parsedData}
            rawText={ocrResult.text}
            confidence={ocrResult.confidence}
            onSaveAll={handleSaveAll}
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

export default CasinoDigitizer;
