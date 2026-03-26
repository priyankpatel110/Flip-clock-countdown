import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated as RNAnimated, Easing, Pressable, Platform, Share, useWindowDimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery } from 'convex/react';

// Components
import { SetupPanel } from '../components/SetupPanel';
import { FlipCard } from '../components/FlipCard';
import { ProgressBar } from '../components/ProgressBar';
import { ControlArea } from '../components/ControlArea';

// Context
import { TimerProvider, useTimer } from '../utils/TimerContext';

function padZero(num: number, len: number = 2) {
  return String(num).padStart(len, '0');
}

export function MainScreen() {
  const { state, startTimer, syncState, resetTimer, isTimeUp, dismissTimeUp } = useTimer();
  const { room } = useLocalSearchParams<{ room: string }>();
  const router = useRouter();

  const [roomId, setRoomId] = useState<string | null>(room || null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const isSynced = !!roomId;

  // We use string casts because we don't have the locally generated schema
  const getRoom = useQuery('timers:getRoom' as any, roomId ? { roomId } : 'skip');
  const createRoom = useMutation('timers:createRoom' as any);
  const updateStatus = useMutation('timers:updateStatus' as any);
  const updateSettings = useMutation('timers:updateSettings' as any);

  const { width, height } = useWindowDimensions();
  // We can dynamically shrink the clock if it's very narrow or in portrait
  const isLandscape = width > height;
  const isSmall = isLandscape ? width < 1200 : width < 768;
  const scaleRatio = isSmall 
    ? (isLandscape ? Math.min(width / 650, 1) : Math.min(width / 340, 1))
    : 1;

  // Sync state from convex
  useEffect(() => {
    if (getRoom && isSynced) {
      if (getRoom.status === 'idle') {
        if (state.isRunning) {
          syncState({ isRunning: false, isPaused: false });
        }
      } else if (getRoom.status === 'running') {
        const _mode = getRoom.mode || 'countdown';
        const _total = getRoom.targetSeconds;
        let tEndTime = null;
        let tStartTime = null;
        let remMs = 0;
        let elapMs = 0;
        if (_mode === 'countdown') {
           tEndTime = getRoom.startTimestamp + (getRoom.savedRemainingSeconds * 1000);
           remMs = Math.max(0, tEndTime - Date.now());
        } else {
           tStartTime = getRoom.startTimestamp - (getRoom.savedRemainingSeconds * 1000);
           elapMs = Math.max(0, Date.now() - tStartTime);
        }

        syncState({
          mode: _mode,
          totalSeconds: _total,
          isRunning: true,
          isPaused: false,
          targetEndTime: tEndTime,
          startTime: tStartTime,
          remainingSeconds: Math.ceil(remMs / 1000),
          elapsedSeconds: Math.floor(elapMs / 1000),
        });
      } else if (getRoom.status === 'paused') {
        syncState({
          isRunning: true,
          isPaused: true,
          mode: getRoom.mode,
          remainingSeconds: getRoom.mode === 'countdown' ? getRoom.savedRemainingSeconds : 0,
          elapsedSeconds: getRoom.mode === 'countup' ? getRoom.savedRemainingSeconds : 0,
        });
      }
    }
  }, [getRoom, isSynced]);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    if (state.isRunning && !state.isPaused) {
      hideTimeout.current = setTimeout(() => {
        setControlsVisible(false);
      }, 4000);
    }
  };

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [state.isRunning, state.isPaused]);

  const handleStart = (mode: 'countdown' | 'countup', targetSecs: number, startSecs: number) => {
    if (isSynced) {
      updateStatus({
        roomId,
        status: "running",
        savedRemainingSeconds: mode === 'countdown' ? targetSecs : startSecs
      }).catch(console.error);
      return;
    }
    startTimer(mode, targetSecs, startSecs);
  };

  const shareLink = async () => {
    if (isSynced) {
      // Already synced, just share the link
      Share.share({ message: `https://your-domain.com/?room=${roomId}` });
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 9);
    setRoomId(newRoomId);

    // Save to server
    const savedSecs = state.mode === 'countdown' ? state.totalSeconds : state.elapsedSeconds;
    try {
      await createRoom({
        roomId: newRoomId,
        mode: state.mode,
        targetSeconds: state.totalSeconds,
        savedRemainingSeconds: savedSecs,
      });

      router.setParams({ room: newRoomId });
      Share.share({ message: `https://your-domain.com/?room=${newRoomId}` });
    } catch (e) {
      console.error(e);
      setRoomId(null);
    }
  };

  const getDisplayTime = () => {
    let t = 0;
    if (state.mode === 'countdown') {
      t = state.remainingSeconds;
    } else {
      t = state.elapsedSeconds;
    }
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return { h, m, s };
  };

  const { h, m, s } = getDisplayTime();
  const showHoursHundreds = h > 99;
  const hStr = showHoursHundreds ? padZero(h, 3) : padZero(h, 2);
  const mStr = padZero(m, 2);
  const sStr = padZero(s, 2);

  return (
    <Pressable style={styles.container} onPress={showControls}>
      <Stack.Screen options={{ headerShown: false, contentStyle: { backgroundColor: '#0d0d0d' } }} />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        contentInsetAdjustmentBehavior="automatic"
      >
        {!state.isRunning && !state.isPaused && (
          <SetupPanel onStart={handleStart} />
        )}

        {/* Flip Clock Grid */}
        <View style={[{ transform: [{ scale: Math.min(scaleRatio, 1) }] }]}>
          <View style={[styles.clockGrid, isSmall && styles.clockGridSmall, !isLandscape && isSmall && styles.clockGridVertical]}>
            {/* HOURS */}
            <View style={styles.timeGroup}>
              <View style={styles.cardsRow}>
                {showHoursHundreds && <FlipCard size={isSmall ? "small" : "large"} digit={hStr[0]} />}
                <FlipCard size={isSmall ? "small" : "large"} digit={showHoursHundreds ? hStr[1] : hStr[0]} />
                <FlipCard size={isSmall ? "small" : "large"} digit={showHoursHundreds ? hStr[2] : hStr[1]} />
              </View>
              <Text style={styles.timeLabel}>HOURS</Text>
            </View>

            {(!isSmall || isLandscape) && (
              <View style={styles.separatorDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            )}

            {/* MINUTES */}
            <View style={styles.timeGroup}>
              <View style={styles.cardsRow}>
                <FlipCard size={isSmall ? "small" : "large"} digit={mStr[0]} />
                <FlipCard size={isSmall ? "small" : "large"} digit={mStr[1]} />
              </View>
              <Text style={styles.timeLabel}>MINUTES</Text>
            </View>

            {(!isSmall || isLandscape) && (
              <View style={styles.separatorDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            )}

            {/* SECONDS */}
            <View style={styles.timeGroup}>
              <View style={styles.cardsRow}>
                <FlipCard size={isSmall ? "small" : "large"} digit={sStr[0]} />
                <FlipCard size={isSmall ? "small" : "large"} digit={sStr[1]} />
              </View>
              <Text style={styles.timeLabel}>SECONDS</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { opacity: controlsVisible || !state.isRunning ? 1 : 0 }]} pointerEvents={controlsVisible || !state.isRunning ? 'auto' : 'none'}>
        <ProgressBar />
        <ControlArea roomId={roomId} onShare={shareLink} />
      </View>

      {/* Completion Overlay */}
      {isTimeUp && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>🎉 CHALLENGE COMPLETE</Text>
          <Text style={styles.overlaySub}>You did it.</Text>
          <Pressable style={styles.btnPrimary} onPress={dismissTimeUp}>
            <Text style={styles.btnPrimaryText}>START NEW</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

export default MainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  clockGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginTop: 20,
  },
  clockGridSmall: {
    gap: 16,
  },
  clockGridVertical: {
    flexDirection: 'column',
    gap: 32,
  },
  timeGroup: {
    alignItems: 'center',
    gap: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  separatorDots: {
    gap: 32,
    transform: [{ translateY: -15 }],
  },
  dot: {
    width: 24,
    height: 24,
    backgroundColor: '#ff6b35',
    borderRadius: 12,
  },
  timeLabel: {
    color: '#888',
    fontSize: 14,
    letterSpacing: 2,
    marginTop: 8,
  },
  footer: {
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  overlayTitle: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
  },
  overlaySub: {
    fontSize: 18,
    color: '#888',
  },
  btnPrimary: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  btnPrimaryText: {
    color: '#0d0d0d',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
