import { useCallback, useRef, useState } from 'react';
import { Upload, Camera, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CameraModal from './CameraModal';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  preview: string | null;
  onClear: () => void;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUploader = ({ onImageSelected, preview, onClear }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  // keep a camera input ref around for legacy builds or unexpected references
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Only JPG and PNG files are supported');
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error('File size must be under 10MB');
        return;
      }
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-border bg-card">
        <img src={preview} alt="Preview" className="w-full max-h-[400px] object-contain bg-muted/50" />
        <button
          onClick={onClear}
          className="absolute top-3 right-3 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-4 p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="gradient-primary rounded-2xl p-4 animate-float">
        <Image className="h-8 w-8 text-primary-foreground" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-lg">Drop your form image here</p>
        <p className="text-sm text-muted-foreground mt-1">or click to browse • JPG, PNG up to 10MB</p>
      </div>
      <div className="flex gap-3 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Browse Files
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowCameraModal(true);
          }}
        >
          <Camera className="h-4 w-4 mr-2" />
          Camera
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {/* legacy camera input for older builds; kept hidden */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {showCameraModal && (
        <CameraModal
          onCapture={(file) => {
            setShowCameraModal(false);
            handleFile(file);
          }}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};

export default ImageUploader;
