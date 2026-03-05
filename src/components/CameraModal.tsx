import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, ZapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraModalProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

const CameraModal = ({ onCapture, onClose }: CameraModalProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [facing, setFacing] = useState<'user' | 'environment'>('environment');
    const [isCapturing, setIsCapturing] = useState(false);

    const startCamera = useCallback(async (facingMode: 'user' | 'environment') => {
        // Stop existing stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setIsReady(true);
            }
        } catch (err: any) {
            toast.error('Cannot access camera: ' + (err.message ?? 'Permission denied'));
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        startCamera(facing);
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const flipCamera = async () => {
        const next = facing === 'environment' ? 'user' : 'environment';
        setFacing(next);
        setIsReady(false);
        await startCamera(next);
    };

    const capture = useCallback(() => {
        // Prevent multiple captures
        if (isCapturing || !videoRef.current || !canvasRef.current) return;
        
        setIsCapturing(true);
        
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Ensure canvas dimensions match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                toast.error('Failed to access canvas context');
                setIsCapturing(false);
                return;
            }
            
            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0);
            
            // Convert canvas to blob and create file
            canvas.toBlob(
                (blob) => {
                    try {
                        if (!blob) {
                            toast.error('Failed to capture image');
                            setIsCapturing(false);
                            return;
                        }

                        // Stop stream before processing file
                        if (streamRef.current) {
                            streamRef.current.getTracks().forEach(t => t.stop());
                            streamRef.current = null;
                        }

                        // Create File from blob
                        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                        
                        // Pass file to parent component
                        onCapture(file);
                    } catch (error) {
                        console.error('Error processing capture:', error);
                        toast.error('Error processing capture');
                        setIsCapturing(false);
                    }
                },
                'image/jpeg',
                0.95
            );
        } catch (error) {
            console.error('Error during capture:', error);
            toast.error('Capture failed');
            setIsCapturing(false);
        }
    }, [isCapturing, onCapture]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden bg-black shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/60 absolute top-0 left-0 right-0 z-10">
                    <span className="text-white font-semibold text-sm">📷 Capture Bill / Invoice</span>
                    <button
                        onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); onClose(); }}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Video */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-[65vh] object-cover"
                />

                {/* Overlay guide */}
                {isReady && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="border-2 border-white/40 rounded-lg w-4/5 h-3/5 flex items-center justify-center">
                            <span className="text-white/50 text-xs">Align bill within frame</span>
                        </div>
                    </div>
                )}

                {/* Canvas (hidden, for capture) */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 px-6 py-5 bg-black absolute bottom-0 left-0 right-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={flipCamera}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                        🔄 Flip
                    </Button>
                    <button
                        onClick={capture}
                        disabled={!isReady || isCapturing}
                        className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center 
                       hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 shadow-xl"
                        title="Capture"
                    >
                        <ZapIcon className="h-6 w-6 text-black" />
                    </button>
                    <div className="w-16" />
                </div>
            </div>
        </div>
    );
};

export default CameraModal;
