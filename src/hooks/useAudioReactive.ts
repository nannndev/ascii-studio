import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioFxTarget, AudioState } from '../types/studio';

export interface AudioEnergyRef {
  active: boolean;
  bass: number;
  level: number;
  fxTarget: AudioFxTarget;
  sensitivity: number;
}

export function useAudioReactive(showToast: (msg: string) => void) {
  const [audioState, setAudioState] = useState<AudioState>({
    active: false,
    mode: 'none',
    playing: false,
    fxTarget: 'pulse',
    sensitivity: 1.2,
    fileName: null,
  });

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const meterBarRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const elSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const energyRef = useRef<AudioEnergyRef>({
    active: false,
    bass: 0,
    level: 0,
    fxTarget: 'pulse',
    sensitivity: 1.2,
  });

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      audioDataRef.current = new Uint8Array(
        new ArrayBuffer(analyser.frequencyBinCount)
      );
    }
    if (audioCtxRef.current.state === 'suspended') {
      void audioCtxRef.current.resume();
    }
  }, []);

  const stopMic = useCallback(() => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (micSourceRef.current) {
      try {
        micSourceRef.current.disconnect();
      } catch {
        // ignore disconnect errors
      }
      micSourceRef.current = null;
    }
    setAudioState((prev) => {
      if (prev.mode !== 'mic') return prev;
      energyRef.current.active = false;
      if (meterBarRef.current) meterBarRef.current.style.width = '0%';
      return { ...prev, active: false, mode: 'none', playing: false };
    });
  }, []);

  const handleAudioFile = useCallback(
    (file: File) => {
      const el = audioElRef.current;
      if (!el) return;

      stopMic();
      ensureAudioContext();

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      el.src = url;

      if (!elSourceRef.current && audioCtxRef.current && analyserRef.current) {
        elSourceRef.current = audioCtxRef.current.createMediaElementSource(el);
        elSourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioCtxRef.current.destination);
      }

      void el.play();
      energyRef.current.active = true;
      setAudioState((prev) => ({
        ...prev,
        active: true,
        mode: 'file',
        playing: true,
        fileName: file.name,
      }));
      showToast(`Audio reactive: ${file.name}`);
    },
    [ensureAudioContext, showToast, stopMic]
  );

  const toggleAudioPlayPause = useCallback(() => {
    const el = audioElRef.current;
    if (!el || audioState.mode !== 'file') return;

    if (el.paused) {
      ensureAudioContext();
      void el.play();
      energyRef.current.active = true;
      setAudioState((prev) => ({ ...prev, active: true, playing: true }));
    } else {
      el.pause();
      energyRef.current.active = false;
      if (meterBarRef.current) meterBarRef.current.style.width = '0%';
      setAudioState((prev) => ({ ...prev, active: false, playing: false }));
    }
  }, [audioState.mode, ensureAudioContext]);

  const toggleMic = useCallback(async () => {
    if (audioState.mode === 'mic') {
      stopMic();
      showToast('Microphone stopped');
      return;
    }

    try {
      audioElRef.current?.pause();
      ensureAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      if (audioCtxRef.current && analyserRef.current) {
        micSourceRef.current =
          audioCtxRef.current.createMediaStreamSource(stream);
        micSourceRef.current.connect(analyserRef.current);
      }
      energyRef.current.active = true;
      setAudioState((prev) => ({
        ...prev,
        active: true,
        mode: 'mic',
        playing: true,
      }));
      showToast('Live Microphone Audio Reactive active');
    } catch {
      showToast('Microphone permission denied or unavailable');
    }
  }, [audioState.mode, ensureAudioContext, showToast, stopMic]);

  const setFxTarget = useCallback((fxTarget: AudioFxTarget) => {
    energyRef.current.fxTarget = fxTarget;
    setAudioState((prev) => ({ ...prev, fxTarget }));
  }, []);

  const setSensitivity = useCallback((sensitivity: number) => {
    energyRef.current.sensitivity = sensitivity;
    setAudioState((prev) => ({ ...prev, sensitivity }));
  }, []);

  const sampleAudioEnergy = useCallback(() => {
    const analyser = analyserRef.current;
    const data = audioDataRef.current;
    if (!energyRef.current.active || !analyser || !data) {
      energyRef.current.level = 0;
      energyRef.current.bass = 0;
      return;
    }

    analyser.getByteFrequencyData(data);
    let bassSum = 0;
    for (let i = 0; i < 12; i++) bassSum += data[i];
    let totalSum = 0;
    for (let i = 0; i < data.length; i++) totalSum += data[i];

    const sens = energyRef.current.sensitivity;
    energyRef.current.bass = Math.min(1.5, (bassSum / (12 * 255)) * sens);
    energyRef.current.level = Math.min(
      1.5,
      (totalSum / (data.length * 255)) * sens
    );

    if (meterBarRef.current) {
      meterBarRef.current.style.width = `${Math.min(
        100,
        Math.round(energyRef.current.bass * 100)
      )}%`;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    audioState,
    audioElRef,
    meterBarRef,
    energyRef,
    handleAudioFile,
    toggleAudioPlayPause,
    toggleMic,
    setFxTarget,
    setSensitivity,
    sampleAudioEnergy,
  };
}
