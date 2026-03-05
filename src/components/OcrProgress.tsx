import { Progress } from '@/components/ui/progress';
import { ScanLine, Loader2 } from 'lucide-react';

interface OcrProgressProps {
  progress: number;
  isProcessing: boolean;
}

const OcrProgress = ({ progress, isProcessing }: OcrProgressProps) => {
  if (!isProcessing) return null;

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="gradient-primary rounded-lg p-2">
          {progress < 100 ? (
            <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
          ) : (
            <ScanLine className="h-5 w-5 text-primary-foreground" />
          )}
        </div>
        <div>
          <p className="font-display font-semibold">
            {progress < 30
              ? 'Preprocessing image...'
              : progress < 100
              ? 'Running OCR...'
              : 'Parsing results...'}
          </p>
          <p className="text-sm text-muted-foreground">
            {progress}% complete
          </p>
        </div>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default OcrProgress;
