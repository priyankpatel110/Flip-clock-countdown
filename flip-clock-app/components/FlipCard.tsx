import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface FlipCardProps {
  digit: string;
  size?: 'large' | 'small';
}

export function FlipCard({ digit, size = 'large' }: FlipCardProps) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [nextDigit, setNextDigit] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  const topFlapRotation = useSharedValue(0);
  const bottomFlapRotation = useSharedValue(90);

  useEffect(() => {
    if (digit !== currentDigit && !isFlipping) {
      setNextDigit(digit);
      setIsFlipping(true);
      
      topFlapRotation.value = 0;
      bottomFlapRotation.value = 90;

      topFlapRotation.value = withTiming(
        -90,
        { duration: 150, easing: Easing.in(Easing.linear) },
        () => {
          bottomFlapRotation.value = withTiming(
            0,
            { duration: 150, easing: Easing.out(Easing.linear) },
            () => {
              runOnJS(setCurrentDigit)(digit);
              runOnJS(setIsFlipping)(false);
            }
          );
        }
      );
    } else if (digit !== currentDigit && digit !== nextDigit) {
      // If a new digit comes in while flipping, just fast forward
      setCurrentDigit(digit);
      setNextDigit(digit);
      setIsFlipping(false);
      topFlapRotation.value = 0;
      bottomFlapRotation.value = 90;
    }
  }, [digit, currentDigit, isFlipping, nextDigit]);

  const topFlapStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${topFlapRotation.value}deg` }],
  }));

  const bottomFlapStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateX: `${bottomFlapRotation.value}deg` }],
  }));

  const isSmall = size === 'small';
  const cWidth = isSmall ? 90 : 180;
  const cHeight = isSmall ? 120 : 240;
  const tSize = isSmall ? 80 : 160;

  return (
    <View style={[styles.cardContainer, { width: cWidth, height: cHeight }]}>
      {/* Background Top (Next Digit) - always shows the underlying new digit top half */}
      <View style={[styles.flap, styles.topFlap, { width: cWidth, height: cHeight / 2 }]}>
        <Text style={[styles.digit, { fontSize: tSize, top: Platform.OS === 'ios' ? tSize * 0.1 : 0 }]}>{nextDigit}</Text>
      </View>
      
      {/* Background Bottom (Current Digit) - always shows the underlying old digit bottom half */}
      <View style={[styles.flap, styles.bottomFlap, { width: cWidth, height: cHeight / 2, top: cHeight / 2 }]}>
        <Text style={[styles.digit, styles.bottomDigit, { fontSize: tSize, top: -(cHeight / 2) + (Platform.OS === 'ios' ? tSize * 0.1 : 0) }]}>
          {currentDigit}
        </Text>
      </View>

      {/* Animated Top Flap (Current Digit) */}
      {isFlipping && (
        <Animated.View style={[styles.flap, styles.topFlap, styles.animatedTop, topFlapStyle, { width: cWidth, height: cHeight / 2 }]}>
          <Text style={[styles.digit, { fontSize: tSize, top: Platform.OS === 'ios' ? tSize * 0.1 : 0 }]}>{currentDigit}</Text>
        </Animated.View>
      )}

      {/* Animated Bottom Flap (Next Digit) */}
      {isFlipping && (
        <Animated.View style={[styles.flap, styles.bottomFlap, styles.animatedBottom, bottomFlapStyle, { width: cWidth, height: cHeight / 2, top: cHeight / 2 }]}>
          <Text style={[styles.digit, styles.bottomDigit, { fontSize: tSize, top: -(cHeight / 2) + (Platform.OS === 'ios' ? tSize * 0.1 : 0) }]}>
            {nextDigit}
          </Text>
        </Animated.View>
      )}

      {/* Center line separator to make it look like a split flap */}
      <View style={[styles.separator, { top: cHeight / 2 - 1, width: cWidth }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  flap: {
    position: 'absolute',
    left: 0,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
  },
  topFlap: {
    top: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    transformOrigin: 'bottom',
  },
  bottomFlap: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    transformOrigin: 'top',
  },
  animatedTop: {
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  animatedBottom: {
    zIndex: 10,
    borderTopWidth: 1,
    borderColor: '#000',
  },
  digit: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    position: 'absolute',
  },
  bottomDigit: {
    // Aligns the text for the bottom flap so the top half is cut off
  },
  separator: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 20,
  },
});
