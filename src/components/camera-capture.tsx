"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type CameraCaptureProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoTaken: (imageDataUri: string) => void;
};

export default function CameraCapture({ open, onOpenChange, onPhotoTaken }: CameraCaptureProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings.',
      });
    }
  }, [toast]);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (open) {
      getCameraPermission();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, getCameraPermission, stopCamera]);


  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUri = canvas.toDataURL('image/jpeg');
      onPhotoTaken(imageDataUri);
    }
    setIsCapturing(false);
  };
  
  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      stopCamera();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Take a Photo</DialogTitle>
        </DialogHeader>
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {hasCameraPermission === null && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span>Requesting camera...</span>
                </div>
            )}
            {hasCameraPermission === false && (
                <Alert variant="destructive" className="m-4">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser to use this feature. You might need to refresh the page after granting permission.
                    </AlertDescription>
                </Alert>
            )}
             <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission ? 'block' : 'hidden')} autoPlay playsInline muted />
             <canvas ref={canvasRef} className="hidden" />
        </div>
        <DialogFooter className="gap-2 sm:justify-center">
          <Button onClick={handleCapture} disabled={!hasCameraPermission || isCapturing} className="w-full sm:w-auto">
            {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
