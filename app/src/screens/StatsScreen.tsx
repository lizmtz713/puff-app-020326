import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Session, Strain, STRAIN_TYPES, METHODS, MOOD_EMOJIS } from '../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export function StatsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Session[];
      setSessions(sessionsData);

      const strainsQuery = query(
        collection(db, 'strains'),
        where('userId', '==', user.id)
      );
      const strainsSnap = await getDocs(strainsQuery);
      const strainsData = strainsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Strain[];
      setStrains(strainsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Calculate stats
  const last7Days = sessions.filter(s => 
    new Date(s.createdAt) > subDays(new Date(), 7)
  );
  const last30Days = sessions.filter(s => 
    new Date(s.createdAt) > subDays(new Date(), 30)
  );

  // Method breakdown
  const methodCounts = sessions.reduce((acc, s) => {
    acc[s.method] = (acc[s.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Type breakdown
  const typeCounts = strains.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Average mood improvement
  const sessionsWithMood = sessions.filter(s => s.moodBefore && s.moodAfter);
  const avgMoodChange = sessionsWithMood.length > 0
    ? sessionsWithMood.reduce((sum, s) => sum + ((s.moodAfter || 0) - s.moodBefore), 0) / sessionsWithMood.length
    : 0;

  // Top effects
  const effectCounts = sessions.reduce((acc, s) => {
    s.effects?.forEach(e => {
      acc[e] = (acc[e] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const topEffects = Object.entries(effectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Favorite strains
  const favoriteStrains = strains.filter(s => s.favorite);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Your Insights 📊</Text>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickNumber}>{last7Days.length}</Text>
            <Text style={styles.quickLabel}>Sessions (7d)</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickNumber}>{last30Days.length}</Text>
            <Text style={styles.quickLabel}>Sessions (30d)</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickNumber}>{strains.length}</Text>
            <Text style={styles.quickLabel}>Total Strains</Text>
          </View>
        </View>

        {/* Mood Impact */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Impact</Text>
          <View style={styles.moodImpact}>
            <Text style={styles.moodChange}>
              {avgMoodChange >= 0 ? '+' : ''}{avgMoodChange.toFixed(1)}
            </Text>
            <Text style={styles.moodLabel}>
              Average mood change after sessions
            </Text>
          </View>
          {avgMoodChange > 0 && (
            <Text style={styles.moodNote}>
              🎉 Cannabis is helping improve your mood!
            </Text>
          )}
        </View>

        {/* Consumption Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How You Consume</Text>
          {Object.entries(methodCounts).length > 0 ? (
            Object.entries(methodCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([method, count]) => (
                <View key={method} style={styles.barRow}>
                  <Text style={styles.barLabel}>
                    {METHODS[method as keyof typeof METHODS]?.emoji} {METHODS[method as keyof typeof METHODS]?.label}
                  </Text>
                  <View style={styles.barBg}>
                    <View 
                      style={[
                        styles.barFill, 
                        { width: `${(count / sessions.length) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              ))
          ) : (
            <Text style={styles.emptyText}>Log some sessions to see your patterns!</Text>
          )}
        </View>

        {/* Strain Types */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Strain Preferences</Text>
          {Object.entries(typeCounts).length > 0 ? (
            <View style={styles.typeGrid}>
              {Object.entries(typeCounts).map(([type, count]) => (
                <View 
                  key={type} 
                  style={[
                    styles.typeCard, 
                    { backgroundColor: STRAIN_TYPES[type as keyof typeof STRAIN_TYPES]?.color + '20' }
                  ]}
                >
                  <Text style={styles.typeEmoji}>
                    {STRAIN_TYPES[type as keyof typeof STRAIN_TYPES]?.emoji}
                  </Text>
                  <Text style={styles.typeCount}>{count}</Text>
                  <Text style={styles.typeLabel}>
                    {STRAIN_TYPES[type as keyof typeof STRAIN_TYPES]?.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Add strains to see your preferences!</Text>
          )}
        </View>

        {/* Top Effects */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Most Common Effects</Text>
          {topEffects.length > 0 ? (
            <View style={styles.effectsList}>
              {topEffects.map(([effect, count], i) => (
                <View key={effect} style={styles.effectRow}>
                  <Text style={styles.effectRank}>#{i + 1}</Text>
                  <Text style={styles.effectName}>{effect}</Text>
                  <Text style={styles.effectCount}>{count}x</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Track effects in your sessions!</Text>
          )}
        </View>

        {/* Favorites */}
        {favoriteStrains.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>❤️ Your Favorites</Text>
            {favoriteStrains.slice(0, 5).map(strain => (
              <View key={strain.id} style={styles.favoriteRow}>
                <Text style={styles.favEmoji}>
                  {STRAIN_TYPES[strain.type]?.emoji}
                </Text>
                <Text style={styles.favName}>{strain.name}</Text>
                <Text style={styles.favRating}>
                  {'⭐'.repeat(strain.rating)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#065F46', marginBottom: 20 },
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  quickStat: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickNumber: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  quickLabel: { fontSize: 12, color: '#A7F3D0', marginTop: 4 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  moodImpact: { alignItems: 'center', marginBottom: 12 },
  moodChange: { fontSize: 48, fontWeight: '700', color: '#059669' },
  moodLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  moodNote: { textAlign: 'center', fontSize: 14, color: '#059669' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { width: 80, fontSize: 13, color: '#374151' },
  barBg: { flex: 1, height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginHorizontal: 12 },
  barFill: { height: 8, backgroundColor: '#059669', borderRadius: 4 },
  barCount: { width: 30, fontSize: 13, color: '#6B7280', textAlign: 'right' },
  typeGrid: { flexDirection: 'row', gap: 12 },
  typeCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  typeEmoji: { fontSize: 28 },
  typeCount: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginTop: 8 },
  typeLabel: { fontSize: 13, color: '#6B7280' },
  effectsList: { gap: 8 },
  effectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  effectRank: { width: 32, fontSize: 14, fontWeight: '600', color: '#059669' },
  effectName: { flex: 1, fontSize: 15, color: '#1F2937' },
  effectCount: { fontSize: 14, color: '#6B7280' },
  favoriteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  favEmoji: { fontSize: 20, marginRight: 12 },
  favName: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1F2937' },
  favRating: { fontSize: 12 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, paddingVertical: 20 },
});
