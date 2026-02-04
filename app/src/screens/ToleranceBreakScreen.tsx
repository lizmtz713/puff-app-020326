import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { differenceInDays, differenceInHours, format, addDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface TBreak {
  startDate: Date;
  targetDays: number;
  reason?: string;
}

const BENEFITS_TIMELINE = [
  { day: 1, title: 'Withdrawal peaks', description: 'Irritability, sleep issues, cravings are normal. Stay strong!' },
  { day: 2, title: 'Sleep improving', description: 'REM sleep starts returning. Dreams may be vivid.' },
  { day: 3, title: 'Appetite normalizing', description: 'Eating without being high might feel weird at first.' },
  { day: 7, title: 'Mental clarity', description: 'Brain fog lifting. Short-term memory improving.' },
  { day: 14, title: 'Mood stabilizing', description: 'Natural dopamine regulation kicking in.' },
  { day: 21, title: 'Tolerance dropping', description: 'CB1 receptors resetting. You\'ll feel more when you return.' },
  { day: 30, title: 'Full reset', description: 'Significant tolerance reduction. Next session will hit different.' },
];

const COPING_TIPS = [
  '💧 Stay hydrated — helps flush your system',
  '🏃 Exercise releases natural endorphins',
  '😴 Melatonin can help with sleep first few nights',
  '🍵 CBD can ease withdrawal without getting high',
  '📱 Delete dealer contacts temporarily',
  '🧘 Meditation helps with cravings',
  '📝 Journal how you feel — it passes faster than you think',
  '🎮 Keep busy with hobbies',
];

export function ToleranceBreakScreen({ navigation }: any) {
  const { user } = useAuth();
  const [activeBreak, setActiveBreak] = useState<TBreak | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreak();
  }, [user]);

  const loadBreak = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'toleranceBreaks', user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveBreak({
          startDate: data.startDate.toDate(),
          targetDays: data.targetDays,
          reason: data.reason,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startBreak = async () => {
    if (!user) return;
    try {
      const breakData = {
        startDate: new Date(),
        targetDays: selectedDuration,
        userId: user.id,
      };
      await setDoc(doc(db, 'toleranceBreaks', user.id), breakData);
      setActiveBreak({ ...breakData });
      Alert.alert('T-Break Started! 💪', `${selectedDuration} day break begins now. You got this!`);
    } catch (error) {
      Alert.alert('Error', 'Could not start break. Try again.');
    }
  };

  const endBreak = async () => {
    Alert.alert(
      'End T-Break?',
      'Are you sure you want to end your tolerance break early?',
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'End It',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteDoc(doc(db, 'toleranceBreaks', user.id));
              setActiveBreak(null);
            } catch (error) {
              Alert.alert('Error', 'Could not end break.');
            }
          },
        },
      ]
    );
  };

  const getDaysCompleted = () => {
    if (!activeBreak) return 0;
    return differenceInDays(new Date(), activeBreak.startDate);
  };

  const getHoursCompleted = () => {
    if (!activeBreak) return 0;
    return differenceInHours(new Date(), activeBreak.startDate);
  };

  const getProgress = () => {
    if (!activeBreak) return 0;
    const days = getDaysCompleted();
    return Math.min((days / activeBreak.targetDays) * 100, 100);
  };

  const getCurrentBenefit = () => {
    const days = getDaysCompleted();
    for (let i = BENEFITS_TIMELINE.length - 1; i >= 0; i--) {
      if (days >= BENEFITS_TIMELINE[i].day) {
        return BENEFITS_TIMELINE[i];
      }
    }
    return BENEFITS_TIMELINE[0];
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tolerance Break</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSub}>Reset your receptors, save money, feel more</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeBreak ? (
          <>
            {/* Active Break */}
            <View style={styles.activeCard}>
              <Text style={styles.activeLabel}>🌱 T-BREAK IN PROGRESS</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBig}>{getDaysCompleted()}</Text>
                  <Text style={styles.statLabel}>days</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBig}>{getHoursCompleted() % 24}</Text>
                  <Text style={styles.statLabel}>hours</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBig}>{activeBreak.targetDays - getDaysCompleted()}</Text>
                  <Text style={styles.statLabel}>to go</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
                </View>
                <Text style={styles.progressText}>{Math.round(getProgress())}% complete</Text>
              </View>

              <Text style={styles.endDate}>
                🎯 Target: {format(addDays(activeBreak.startDate, activeBreak.targetDays), 'MMM d, yyyy')}
              </Text>
            </View>

            {/* Current Milestone */}
            <View style={styles.milestoneCard}>
              <Text style={styles.milestoneDay}>Day {getDaysCompleted()}</Text>
              <Text style={styles.milestoneTitle}>{getCurrentBenefit().title}</Text>
              <Text style={styles.milestoneDesc}>{getCurrentBenefit().description}</Text>
            </View>

            {/* Timeline */}
            <Text style={styles.sectionTitle}>What's Happening</Text>
            {BENEFITS_TIMELINE.map((benefit, i) => {
              const completed = getDaysCompleted() >= benefit.day;
              return (
                <View key={i} style={styles.timelineRow}>
                  <View style={[styles.timelineDot, completed && styles.timelineDotComplete]}>
                    {completed && <Ionicons name="checkmark" size={12} color="#FFF" />}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineDay, completed && styles.timelineDayComplete]}>
                      Day {benefit.day}
                    </Text>
                    <Text style={styles.timelineTitle}>{benefit.title}</Text>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.endButton} onPress={endBreak}>
              <Text style={styles.endButtonText}>End Break Early</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Start New Break */}
            <View style={styles.startCard}>
              <Text style={styles.startIcon}>🌿</Text>
              <Text style={styles.startTitle}>Ready for a Reset?</Text>
              <Text style={styles.startDesc}>
                A tolerance break helps you feel more from less, saves money, and proves you're in control.
              </Text>

              <Text style={styles.durationLabel}>How long?</Text>
              <View style={styles.durationOptions}>
                {[3, 7, 14, 21, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[styles.durationChip, selectedDuration === days && styles.durationChipSelected]}
                    onPress={() => setSelectedDuration(days)}
                  >
                    <Text style={[styles.durationText, selectedDuration === days && styles.durationTextSelected]}>
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.startButton} onPress={startBreak}>
                <Text style={styles.startButtonText}>Start {selectedDuration}-Day Break</Text>
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <Text style={styles.sectionTitle}>Survival Tips</Text>
            <View style={styles.tipsCard}>
              {COPING_TIPS.map((tip, i) => (
                <Text key={i} style={styles.tipText}>{tip}</Text>
              ))}
            </View>

            {/* Benefits Preview */}
            <Text style={styles.sectionTitle}>What to Expect</Text>
            {BENEFITS_TIMELINE.slice(0, 4).map((benefit, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitDay}>
                  <Text style={styles.benefitDayText}>Day {benefit.day}</Text>
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  headerGradient: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 16 },
  // Active Break
  activeCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 16,
    borderWidth: 2, borderColor: '#10B981',
  },
  activeLabel: { fontSize: 12, fontWeight: '700', color: '#059669', textAlign: 'center', letterSpacing: 1, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statBox: { alignItems: 'center' },
  statBig: { fontSize: 36, fontWeight: '800', color: '#059669' },
  statLabel: { fontSize: 13, color: '#6B7280' },
  progressContainer: { marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: '#10B981', borderRadius: 4 },
  progressText: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  endDate: { fontSize: 14, color: '#374151', textAlign: 'center' },
  // Milestone
  milestoneCard: {
    backgroundColor: '#ECFDF5', borderRadius: 16, padding: 20, marginBottom: 20,
    borderLeftWidth: 4, borderLeftColor: '#10B981',
  },
  milestoneDay: { fontSize: 12, fontWeight: '600', color: '#059669', marginBottom: 4 },
  milestoneTitle: { fontSize: 18, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  milestoneDesc: { fontSize: 14, color: '#047857', lineHeight: 20 },
  // Timeline
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 12, marginTop: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
  },
  timelineDotComplete: { backgroundColor: '#10B981' },
  timelineContent: { flex: 1 },
  timelineDay: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  timelineDayComplete: { color: '#059669' },
  timelineTitle: { fontSize: 15, color: '#374151', fontWeight: '500' },
  endButton: {
    backgroundColor: '#FEE2E2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20,
  },
  endButtonText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
  // Start
  startCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
  },
  startIcon: { fontSize: 48, marginBottom: 12 },
  startTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  startDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  durationLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 },
  durationOptions: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  durationChip: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: 'transparent',
  },
  durationChipSelected: { backgroundColor: '#D1FAE5', borderColor: '#059669' },
  durationText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  durationTextSelected: { color: '#059669' },
  startButton: { backgroundColor: '#059669', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  startButtonText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  // Tips
  tipsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 20 },
  tipText: { fontSize: 14, color: '#374151', marginBottom: 10, lineHeight: 20 },
  // Benefits
  benefitRow: { flexDirection: 'row', marginBottom: 12 },
  benefitDay: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  benefitDayText: { fontSize: 11, fontWeight: '700', color: '#059669' },
  benefitContent: { flex: 1, justifyContent: 'center' },
  benefitTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  benefitDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
