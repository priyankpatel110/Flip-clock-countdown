import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTimer } from '../utils/TimerContext';

export function ProgressBar() {
  const { state } = useTimer();
  const widthPct = useSharedValue(0);

  useEffect(() => {
    if (state.totalSeconds === 0) {
      widthPct.value = withTiming(100, { duration: 300 });
      return;
    }

    let pct = 0;
    if (state.mode === 'countdown') {
      const elapsed = state.totalSeconds - state.remainingSeconds;
      pct = (elapsed / state.totalSeconds) * 100;
    } else {
      pct = (state.elapsedSeconds / state.totalSeconds) * 100;
    }

    widthPct.value = withTiming(Math.min(pct, 100), { duration: 1000, easing: Easing.linear });
  }, [state.remainingSeconds, state.elapsedSeconds, state.totalSeconds, state.mode]);

  const animatedStyle = useAnimatedStyle(() => {
    // If it's near the end, change to red
    let ratioRemaining = 0;
    if (state.totalSeconds > 0) {
      if (state.mode === 'countdown') {
        ratioRemaining = state.remainingSeconds / state.totalSeconds;
      } else {
        ratioRemaining = (state.totalSeconds - state.elapsedSeconds) / state.totalSeconds;
      }
    }

    const isCritical = state.totalSeconds > 0 && ratioRemaining <= 0.1 && ratioRemaining > 0;
    const isDone = state.totalSeconds > 0 && ratioRemaining <= 0;

    const bgColor = isDone ? '#4caf50' : isCritical ? '#ff3535' : '#ff6b35';

    return {
      width: `${widthPct.value}%`,
      backgroundColor: bgColor,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 4,
    backgroundColor: '#222',
  },
  fill: {
    height: '100%',
  },
});
