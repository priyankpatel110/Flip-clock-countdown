import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useTimer } from '../utils/TimerContext';

interface SetupPanelProps {
  onStart: (mode: 'countdown' | 'countup', targetSecs: number, startSecs: number) => void;
}

export function SetupPanel({ onStart }: SetupPanelProps) {
  const [mode, setMode] = useState<'countdown' | 'countup'>('countdown');
  const [hh, setHh] = useState('100');
  const [mm, setMm] = useState('0');
  const [ss, setSs] = useState('0');

  const [startHh, setStartHh] = useState('0');
  const [startMm, setStartMm] = useState('0');
  const [startSs, setStartSs] = useState('0');

  const presets = [1, 5, 10, 25, 50, 75, 100, 200];

  const handleStart = () => {
    const target = (parseInt(hh || '0', 10) * 3600) + (parseInt(mm || '0', 10) * 60) + parseInt(ss || '0', 10);
    const startFrom = (parseInt(startHh || '0', 10) * 3600) + (parseInt(startMm || '0', 10) * 60) + parseInt(startSs || '0', 10);
    onStart(mode, target, startFrom);
  };

  const getMotivationalText = () => {
    const target = (parseInt(hh || '0', 10) * 3600) + (parseInt(mm || '0', 10) * 60) + parseInt(ss || '0', 10);
    if (isNaN(target) || parseInt(hh || '0') < 0 || parseInt(mm || '0') < 0 || parseInt(ss || '0') < 0 || parseInt(mm || '0') > 59 || parseInt(ss || '0') > 59) {
      return '';
    }
    if (mode === 'countdown') {
      if (target <= 0) return '';
      const h = parseInt(hh || '0', 10);
      if (h < 10) return "A solid sprint.";
      if (h < 50) return "A serious commitment.";
      if (h < 100) return "Elite-level grind.";
      return "Legendary. Let's go. 🔥";
    } else {
      const startFrom = (parseInt(startHh || '0', 10) * 3600) + (parseInt(startMm || '0', 10) * 60) + parseInt(startSs || '0', 10);
      if (target > 0 && startFrom >= target) return "Start time must be less than target.";
      if (target > 0) return "Counts up until target time.";
      return "Stopwatch mode (infinite).";
    }
  };

  const isInvalid = () => {
    const target = (parseInt(hh || '0', 10) * 3600) + (parseInt(mm || '0', 10) * 60) + parseInt(ss || '0', 10);
    const startFrom = (parseInt(startHh || '0', 10) * 3600) + (parseInt(startMm || '0', 10) * 60) + parseInt(startSs || '0', 10);
    if (mode === 'countdown' && target <= 0) return true;
    if (mode === 'countup' && target > 0 && startFrom >= target) return true;
    if (parseInt(mm || '0') > 59 || parseInt(ss || '0') > 59 || parseInt(startMm || '0') > 59 || parseInt(startSs || '0') > 59) return true;
    return false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.modeSelector}>
        <Pressable style={[styles.modeBtn, mode === 'countdown' && styles.activeModeBtn]} onPress={() => setMode('countdown')}>
          <Text style={[styles.modeText, mode === 'countdown' && styles.activeModeText]}>COUNTDOWN</Text>
        </Pressable>
        <Pressable style={[styles.modeBtn, mode === 'countup' && styles.activeModeBtn]} onPress={() => setMode('countup')}>
          <Text style={[styles.modeText, mode === 'countup' && styles.activeModeText]}>COUNT UP</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>HH</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={hh} onChangeText={setHh} maxLength={3} />
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>MM</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={mm} onChangeText={setMm} maxLength={2} />
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>SS</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={ss} onChangeText={setSs} maxLength={2} />
        </View>
      </View>

      <Text style={styles.motivational}>{getMotivationalText()}</Text>

      {mode === 'countup' && (
        <View style={styles.startFromContainer}>
          <Text style={styles.startLabel}>START FROM (OPTIONAL)</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <TextInput style={styles.startInput} keyboardType="numeric" value={startHh} onChangeText={setStartHh} maxLength={3} />
            </View>
            <Text style={styles.startSeparator}>:</Text>
            <View style={styles.inputGroup}>
              <TextInput style={styles.startInput} keyboardType="numeric" value={startMm} onChangeText={setStartMm} maxLength={2} />
            </View>
            <Text style={styles.startSeparator}>:</Text>
            <View style={styles.inputGroup}>
              <TextInput style={styles.startInput} keyboardType="numeric" value={startSs} onChangeText={setStartSs} maxLength={2} />
            </View>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presets}>
        {presets.map(p => (
          <Pressable key={p} style={[styles.chip, parseInt(hh) === p && styles.activeChip]} onPress={() => setHh(String(p))}>
            <Text style={[styles.chipText, parseInt(hh) === p && styles.activeChipText]}>{p}h</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={[styles.startBtn, isInvalid() && styles.disabledStart]} disabled={isInvalid()} onPress={handleStart}>
        <Text style={styles.startBtnText}>START</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    padding: 20,
    gap: 20,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 16,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888',
  },
  activeModeBtn: {
    borderColor: '#ff6b35',
  },
  modeText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeModeText: {
    color: '#ff6b35',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: '#888',
    fontSize: 12,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#888',
    color: '#fff',
    fontSize: 40,
    width: 70,
    textAlign: 'center',
  },
  separator: {
    fontSize: 40,
    color: '#888',
    marginHorizontal: 8,
    marginTop: 16,
  },
  motivational: {
    color: '#888',
    fontStyle: 'italic',
    minHeight: 20,
  },
  startFromContainer: {
    alignItems: 'center',
    gap: 8,
  },
  startLabel: {
    color: '#888',
    fontSize: 12,
  },
  startInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#888',
    color: '#888',
    fontSize: 24,
    width: 40,
    textAlign: 'center',
  },
  startSeparator: {
    fontSize: 24,
    color: '#888',
    marginHorizontal: 8,
  },
  presets: {
    flexDirection: 'row',
    gap: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888',
  },
  activeChip: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  chipText: {
    color: '#888',
  },
  activeChipText: {
    color: '#1a1a1a',
  },
  startBtn: {
    marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  disabledStart: {
    opacity: 0.3,
  },
  startBtnText: {
    color: '#0d0d0d',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 2,
  },
});
