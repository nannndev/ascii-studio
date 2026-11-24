import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaCaptureState } from '../types/studio';

export function useMediaCapture(showToast: (msg: string) => void) {
  const [captureState, setCaptureState] = useState<MediaCaptureState>({
    camActive: false,
    screenActive: false,
    frozen: false,
    mirror: true,
  });

  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureRef = useRef<MediaCaptureState>(captureState);
  captureRef.current = captureState;

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
    setCaptureState((prev) => ({
      ...prev,
      camActive: false,
      screenActive: false,
      frozen: false,
    }));
  }, []);

  const toggleCamera = useCallback(async () => {
    if (captureRef.current.camActive && !captureRef.current.screenActive) {
      stopCapture();
      return;
    }
    stopCapture();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        await webcamVideoRef.current.play();
      }
      setCaptureState((prev) => ({
        ...prev,
        camActive: true,
        screenActive: false,
        frozen: false,
      }));
      showToast('Webcam active');
    } catch {
      showToast('Camera permission denied or unavailable');
    }
  }, [showToast, stopCapture]);

  const toggleScreen = useCallback(async () => {
    if (captureRef.current.screenActive) {
      stopCapture();
      return;
    }
    stopCapture();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 24 },
        audio: false,
      });
      streamRef.current = stream;
      if (webcamVideoRef.current) {
        webcamVideoRef.current.srcObject = stream;
        await webcamVideoRef.current.play();
      }
      const track = stream.getVideoTracks()[0];
      if (track) {
        track.onended = () => stopCapture();
      }
      setCaptureState({
        camActive: true,
        screenActive: true,
        frozen: false,
        mirror: false,
      });
      showToast('Live Screen-to-ASCII active');
    } catch {
      showToast('Screen capture canceled or unavailable');
    }
  }, [showToast, stopCapture]);

  const toggleFreeze = useCallback(() => {
    if (!captureRef.current.camActive) return;
    setCaptureState((prev) => ({ ...prev, frozen: !prev.frozen }));
  }, []);

  const setMirror = useCallback((mirror: boolean) => {
    setCaptureState((prev) => ({ ...prev, mirror }));
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    captureState,
    captureRef,
    webcamVideoRef,
    stopCapture,
    toggleCamera,
    toggleScreen,
    toggleFreeze,
    setMirror,
  };
}
