import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Session, STRAIN_TYPES } from '../types';
import { format, subDays } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const SYMPTOMS = [
  { id: 'pain', label: 'Pain', icon: '🤕', color: '#EF4444' },
  { id: 'anxiety', label: 'Anxiety', icon: '😰', color: '#F59E0B' },
  { id: 'sleep', label: 'Sleep Issues', icon: '😴', color: '#6366F1' },
  { id: 'appetite', label: 'Appetite', icon: '🍽️', color: '#10B981' },
  { id: 'nausea', label: 'Nausea', icon: '🤢', color: '#8B5CF6' },
  { id: 'stress', label: 'Stress', icon: '😤', color: '#EC4899' },
  { id: 'depression', label: 'Low Mood', icon: '😔', color: '#6B7280' },
  { id: 'focus', label: 'Focus Issues', icon: '🎯', color: '#14B8A6' },
];

interface SymptomLog {
  id: string;
  symptom: string;
  severityBefore: number;
  severityAfter?: number;
  strainUsed?: string;
  method?: string;
  notes?: string;
  createdAt: Date;
}

export function MedicalScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [severity, setSeverity] = useState(5);
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [insights, setInsights] = useState<Record<string, { bestStrain: string; avgRelief: number }>>({});
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch symptom logs
      const logsQ = query(
        collection(db, 'symptomLogs'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const logsSnap = await getDocs(logsQ);
      const logsData = logsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as SymptomLog[];
      setLogs(logsData);

      // Fetch sessions for correlation
      const sessionsQ = query(
        collection(db, 'sessions'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const sessionsSnap = await getDocs(sessionsQ);
      const sessionsData = sessionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Session[];
      setSessions(sessionsData);

      // Calculate insights
      calculateInsights(logsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateInsights = (logsData: SymptomLog[]) => {
    const insightMap: Record<string, { strains: Record<string, number[]> }> = {};
    
    logsData.forEach(log => {
      if (log.severityAfter !== undefined && log.strainUsed) {
        if (!insightMap[log.symptom]) {
          insightMap[log.symptom] = { strains: {} };
        }
        if (!insightMap[log.symptom].strains[log.strainUsed]) {
          insightMap[log.symptom].strains[log.strainUsed] = [];
        }
        const relief = log.severityBefore - log.severityAfter;
        insightMap[log.symptom].strains[log.strainUsed].push(relief);
      }
    });

    const results: Record<string, { bestStrain: string; avgRelief: number }> = {};
    Object.entries(insightMap).forEach(([symptom, data]) => {
      let bestStrain = '';
      let bestRelief = 0;
      Object.entries(data.strains).forEach(([strain, reliefs]) => {
        const avg = reliefs.reduce((a, b) => a + b, 0) / reliefs.length;
        if (avg > bestRelief) {
          bestRelief = avg;
          bestStrain = strain;
        }
      });
      if (bestStrain) {
        results[symptom] = { bestStrain, avgRelief: bestRelief };
      }
    });
    setInsights(results);
  };

  const logSymptom = async () => {
    if (!selectedSymptom || !user) return;

    try {
      await addDoc(collection(db, 'symptomLogs'), {
        userId: user.id,
        symptom: selectedSymptom,
        severityBefore: severity,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Logged!', 'Track how you feel after medicating to build insights.');
      setSelectedSymptom(null);
      setSeverity(5);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Could not save. Try again.');
    }
  };

  const exportForDoctor = async () => {
    const last30 = logs.filter(l => l.createdAt > subDays(new Date(), 30));
    
    let report = `CANNABIS USE REPORT\n`;
    report += `Generated: ${format(new Date(), 'MMM d, yyyy')}\n`;
    report += `Period: Last 30 days\n\n`;
    
    report += `SYMPTOM SUMMARY:\n`;
    SYMPTOMS.forEach(s => {
      const symptomLogs = last30.filter(l => l.symptom === s.id);
      if (symptomLogs.length > 0) {
        const avgSeverity = symptomLogs.reduce((sum, l) => sum + l.severityBefore, 0) / symptomLogs.length;
        report += `- ${s.label}: ${symptomLogs.length} logs, avg severity ${avgSeverity.toFixed(1)}/10\n`;
        if (insights[s.id]) {
          report += `  Best relief with: ${insights[s.id].bestStrain}\n`;
        }
      }
    });

    report += `\nSESSION SUMMARY:\n`;
    const last30Sessions = sessions.filter(s => s.createdAt > subDays(new Date(), 30));
    report += `- Total sessions: ${last30Sessions.length}\n`;
    
    const methodCounts: Record<string, number> = {};
    last30Sessions.forEach(s => {
      methodCounts[s.method] = (methodCounts[s.method] || 0) + 1;
    });
    report += `- Methods: ${Object.entries(methodCounts).map(([m, c]) => `${m} (${c})`).join(', ')}\n`;

    try {
      await Share.share({ message: report, title: 'Cannabis Use Report' });
    } catch (error) {
      Alert.alert('Error', 'Could not share report.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Tracking</Text>
          <TouchableOpacity onPress={exportForDoctor}>
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>Track symptoms & what helps</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Log New Symptom */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's bothering you?</Text>
          <View style={styles.symptomGrid}>
            {SYMPTOMS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.symptomChip,
                  selectedSymptom === s.id && { backgroundColor: s.color + '20', borderColor: s.color }
                ]}
                onPress={() => setSelectedSymptom(s.id)}
              >
                <Text style={styles.symptomIcon}>{s.icon}</Text>
                <Text style={[styles.symptomLabel, selectedSymptom === s.id && { color: s.color }]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedSymptom && (
            <View style={styles.severitySection}>
              <Text style={styles.severityLabel}>How bad? (1-10)</Text>
              <View style={styles.severityRow}>
                {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.severityDot, severity === n && styles.severityDotActive]}
                    onPress={() => setSeverity(n)}
                  >
                    <Text style={[styles.severityNum, severity === n && styles.severityNumActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.logButton} onPress={logSymptom}>
                <Text style={styles.logButtonText}>Log Symptom</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Insights */}
        {Object.keys(insights).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔬 What Helps You</Text>
            {Object.entries(insights).map(([symptom, data]) => {
              const symptomInfo = SYMPTOMS.find(s => s.id === symptom);
              return (
                <View key={symptom} style={styles.insightRow}>
                  <Text style={styles.insightIcon}>{symptomInfo?.icon}</Text>
                  <View style={styles.insightInfo}>
                    <Text style={styles.insightSymptom}>{symptomInfo?.label}</Text>
                    <Text style={styles.insightText}>
                      Best relief with <Text style={styles.insightStrain}>{data.bestStrain}</Text>
                    </Text>
                  </View>
                  <View style={styles.reliefBadge}>
                    <Text style={styles.reliefText}>-{data.avgRelief.toFixed(1)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Logs */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Logs</Text>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No symptoms logged yet. Start tracking to build insights!</Text>
          ) : (
            logs.slice(0, 5).map((log) => {
              const symptomInfo = SYMPTOMS.find(s => s.id === log.symptom);
              return (
                <View key={log.id} style={styles.logRow}>
                  <Text style={styles.logIcon}>{symptomInfo?.icon}</Text>
                  <View style={styles.logInfo}>
                    <Text style={styles.logSymptom}>{symptomInfo?.label}</Text>
                    <Text style={styles.logDate}>{format(log.createdAt, 'MMM d, h:mm a')}</Text>
                  </View>
                  <Text style={styles.logSeverity}>{log.severityBefore}/10</Text>
                </View>
              );
            })
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} onPress={exportForDoctor}>
          <Ionicons name="document-text-outline" size={22} color="#059669" />
          <Text style={styles.exportText}>Export Report for Doctor</Text>
        </TouchableOpacity>

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
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
    borderWidth: 2, borderColor: 'transparent',
  },
  symptomIcon: { fontSize: 18, marginRight: 8 },
  symptomLabel: { fontSize: 14, color: '#374151', fontWeight: '500' },
  severitySection: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  severityLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 12 },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between' },
  severityDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  severityDotActive: { backgroundColor: '#059669' },
  severityNum: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  severityNumActive: { color: '#FFF' },
  logButton: { backgroundColor: '#059669', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  logButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  insightRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  insightIcon: { fontSize: 24, marginRight: 12 },
  insightInfo: { flex: 1 },
  insightSymptom: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  insightText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  insightStrain: { color: '#059669', fontWeight: '600' },
  reliefBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  reliefText: { fontSize: 14, fontWeight: '700', color: '#059669' },
  logRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  logIcon: { fontSize: 20, marginRight: 12 },
  logInfo: { flex: 1 },
  logSymptom: { fontSize: 15, fontWeight: '500', color: '#1F2937' },
  logDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  logSeverity: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
  exportButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ECFDF5', padding: 16, borderRadius: 12, gap: 10,
  },
  exportText: { fontSize: 16, fontWeight: '600', color: '#059669' },
});
