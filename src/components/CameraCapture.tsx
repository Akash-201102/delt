import { useState, useCallback } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onImageSelected: (file: File) => void;
  onClear: () => void;
}

const CameraCapture = ({ onImageSelected, onClear }: CameraCaptureProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera if available
        audio: false
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('Camera access denied. Please use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    const video = document.getElementById('camera-video') as HTMLVideoElement;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'casino-entry.jpg', { type: 'image/jpeg' });
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            onImageSelected(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, [onImageSelected, stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelected(file);
      const reader = new FileReader();
      reader.onload = (e) => setCapturedImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [onImageSelected]);

  const handleClear = useCallback(() => {
    setCapturedImage(null);
    stopCamera();
    onClear();
  }, [stopCamera, onClear]);

  return (
    <div className="space-y-4">
      {!capturedImage ? (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          {isCameraActive ? (
            <div className="space-y-4">
              <video
                id="camera-video"
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ maxHeight: '400px' }}
              />
              <div className="flex gap-2 justify-center">
                <Button onClick={capturePhoto} className="gradient-primary">
                  <Camera className="h-4 w-4 mr-2" />
                  Capture Photo
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Button onClick={startCamera} className="gradient-primary w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Open Camera
                </Button>
                <div className="text-sm text-muted-foreground">or</div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline" className="w-full">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload from Folder
                    </label>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Capture or upload casino entry forms for digitization
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <img
            src={capturedImage}
            alt="Captured casino entry"
            className="w-full rounded-lg"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
          <Button onClick={handleClear} variant="outline" className="w-full">
            <X className="h-4 w-4 mr-2" />
            Clear & Retake
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
