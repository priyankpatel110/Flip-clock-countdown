import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTimer } from '../utils/TimerContext';
// import { useMutation } from "convex/react"; // Will add convex later if needed in this component

interface ControlAreaProps {
  roomId: string | null;
  onShare: () => void;
}

export function ControlArea({ roomId, onShare }: ControlAreaProps) {
  const { state, startTimer, pauseTimer, resumeTimer, resetTimer } = useTimer();

  const handleStart = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startTimer(state.mode, state.totalSeconds, state.elapsedSeconds);
  };

  const handlePauseResume = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (state.isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleReset = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetTimer();
  };

  const shareLink = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare();
  };

  return (
    <View style={styles.container}>
      {!state.isRunning && (
        <Pressable style={styles.btn} onPress={handleStart}>
          <Text style={styles.btnText}>START</Text>
        </Pressable>
      )}

      {state.isRunning && (
        <Pressable style={styles.btn} onPress={handlePauseResume}>
          <Text style={styles.btnText}>{state.isPaused ? 'RESUME' : 'PAUSE'}</Text>
        </Pressable>
      )}

      <Pressable style={styles.btn} onPress={handleReset}>
        <Text style={styles.btnText}>RESET</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.shareBtn]} onPress={shareLink}>
        <Text style={[styles.btnText, styles.shareBtnText]}>{roomId ? 'SHARE LINK' : 'SHARE LINK'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
  },
  btn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  btnText: {
    color: '#888',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  shareBtn: {
    borderColor: '#ff6b35',
  },
  shareBtnText: {
    color: '#ff6b35',
  },
});
