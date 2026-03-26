import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

// We will use Haptics for time up alert until an alarm sound is provided

export type TimerMode = 'countdown' | 'countup';

interface TimerState {
  mode: TimerMode;
  totalSeconds: number; // For countdown it's target, for countup it's also target (if >0)
  remainingSeconds: number;
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  targetEndTime: number | null;
  startTime: number | null;
}

interface TimerContextType {
  state: TimerState;
  startTimer: (mode: TimerMode, totalSeconds: number, startFromSeconds?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  syncState: (newState: Partial<TimerState>) => void; // for convex
  isTimeUp: boolean;
  dismissTimeUp: () => void;
}

const defaultState: TimerState = {
  mode: 'countdown',
  totalSeconds: 0,
  remainingSeconds: 0,
  elapsedSeconds: 0,
  isRunning: false,
  isPaused: false,
  targetEndTime: null,
  startTime: null,
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TimerState>(defaultState);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<any>(null); // For Audio

  // Setup audio
  useEffect(() => {
    // We would load sound here. Since we are using expo-audio:
    // This is a placeholder for audio logic
    // const player = new Audio.Sound('asset_path');
  }, []);

  useKeepAwake(state.isRunning && !state.isPaused ? "timer" : undefined);

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isRunning, state.isPaused, state.mode, state.targetEndTime, state.startTime]);

  const tick = () => {
    const now = Date.now();
    setState(prev => {
      if (prev.mode === 'countdown' && prev.targetEndTime) {
        const rem = Math.max(0, Math.ceil((prev.targetEndTime - now) / 1000));
        if (rem <= 0) {
          triggerTimeUp();
          return { ...prev, remainingSeconds: 0, isRunning: false, isPaused: false };
        }
        return { ...prev, remainingSeconds: rem };
      } else if (prev.mode === 'countup' && prev.startTime) {
        const elap = Math.max(0, Math.floor((now - prev.startTime) / 1000));
        if (prev.totalSeconds > 0 && elap >= prev.totalSeconds) {
          triggerTimeUp();
          return { ...prev, elapsedSeconds: prev.totalSeconds, isRunning: false, isPaused: false };
        }
        return { ...prev, elapsedSeconds: elap };
      }
      return prev;
    });
  };

  const triggerTimeUp = () => {
    setIsTimeUp(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startTimer = (mode: TimerMode, totalSeconds: number, startFromSeconds: number = 0) => {
    const now = Date.now();
    setState({
      mode,
      totalSeconds,
      remainingSeconds: mode === 'countdown' ? totalSeconds : 0,
      elapsedSeconds: mode === 'countup' ? startFromSeconds : 0,
      isRunning: true,
      isPaused: false,
      targetEndTime: mode === 'countdown' ? now + totalSeconds * 1000 : null,
      startTime: mode === 'countup' ? now - startFromSeconds * 1000 : null,
    });
    setIsTimeUp(false);
  };

  const pauseTimer = () => {
    setState(prev => ({ ...prev, isPaused: true }));
  };

  const resumeTimer = () => {
    const now = Date.now();
    setState(prev => {
      if (prev.mode === 'countdown') {
        return { ...prev, isPaused: false, targetEndTime: now + prev.remainingSeconds * 1000 };
      } else {
        return { ...prev, isPaused: false, startTime: now - prev.elapsedSeconds * 1000 };
      }
    });
  };

  const resetTimer = () => {
    setState(defaultState);
    setIsTimeUp(false);
    // stopAlarm();
  };

  const syncState = (newState: Partial<TimerState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  const dismissTimeUp = () => {
    setIsTimeUp(false);
    resetTimer();
  };

  return (
    <TimerContext.Provider value={{ state, startTimer, pauseTimer, resumeTimer, resetTimer, syncState, isTimeUp, dismissTimeUp }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) throw new Error("useTimer must be used within TimerProvider");
  return context;
};
