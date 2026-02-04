import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl,
  Dimensions, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Strain, Session, STRAIN_TYPES, MOOD_EMOJIS } from '../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [recentStrains, setRecentStrains] = useState<Strain[]>([]);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState({ totalStrains: 0, totalSessions: 0, avgRating: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      // Strains
      const strainsQ = query(collection(db, 'strains'), where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(5));
      const strainsSnap = await getDocs(strainsQ);
      const strains = strainsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() || new Date() })) as Strain[];
      setRecentStrains(strains);

      // Sessions
      const sessionsQ = query(collection(db, 'sessions'), where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(5));
      const sessionsSnap = await getDocs(sessionsQ);
      const sessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() || new Date() })) as Session[];
      setRecentSessions(sessions);

      // Stats
      const allStrainsQ = query(collection(db, 'strains'), where('userId', '==', user.id));
      const allStrainsSnap = await getDocs(allStrainsQ);
      const allStrains = allStrainsSnap.docs.map(d => d.data()) as Strain[];
      const allSessionsQ = query(collection(db, 'sessions'), where('userId', '==', user.id));
      const allSessionsSnap = await getDocs(allSessionsQ);
      
      const avgRating = allStrains.length > 0 
        ? allStrains.reduce((sum, s) => sum + s.rating, 0) / allStrains.length 
        : 0;
      setStats({ totalStrains: allStrains.length, totalSessions: allSessionsSnap.size, avgRating });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981', '#34D399']} style={styles.headerGradient}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0]} 🌿</Text>
          <Text style={styles.title}>Your Stash</Text>
        </View>

        {/* Quick Actions - Big & Easy */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddStrain')}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']} style={styles.actionGradient}>
              <Ionicons name="leaf" size={28} color="#FFF" />
              <Text style={styles.actionText}>New Strain</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('LogSession')}
            activeOpacity={0.9}
          >
            <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)']} style={styles.actionGradient}>
              <Ionicons name="flame" size={28} color="#FFF" />
              <Text style={styles.actionText}>Log Sesh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Feature Links */}
        <View style={styles.featureLinks}>
          <TouchableOpacity style={styles.featureChip} onPress={() => navigation.navigate('Recommend')}>
            <Text style={styles.featureEmoji}>🎯</Text>
            <Text style={styles.featureText}>What to smoke?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureChip} onPress={() => navigation.navigate('Medical')}>
            <Text style={styles.featureEmoji}>💊</Text>
            <Text style={styles.featureText}>Medical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureChip} onPress={() => navigation.navigate('ToleranceBreak')}>
            <Text style={styles.featureEmoji}>🌱</Text>
            <Text style={styles.featureText}>T-Break</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#059669" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStrains}</Text>
            <Text style={styles.statLabel}>Strains</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg ⭐</Text>
          </View>
        </View>

        {/* Recent Strains */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Strains</Text>
          {recentStrains.length === 0 ? (
            <TouchableOpacity 
              style={styles.emptyCard}
              onPress={() => navigation.navigate('AddStrain')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={40} color="#059669" />
              <Text style={styles.emptyTitle}>Add your first strain</Text>
              <Text style={styles.emptySubtitle}>Track what you love</Text>
            </TouchableOpacity>
          ) : (
            recentStrains.map((strain) => (
              <TouchableOpacity 
                key={strain.id} 
                style={styles.strainCard}
                activeOpacity={0.7}
              >
                <View style={[styles.strainType, { backgroundColor: STRAIN_TYPES[strain.type].color + '20' }]}>
                  <Text style={styles.strainTypeEmoji}>{STRAIN_TYPES[strain.type].emoji}</Text>
                </View>
                <View style={styles.strainInfo}>
                  <Text style={styles.strainName}>{strain.name}</Text>
                  <View style={styles.strainMeta}>
                    <Text style={[styles.strainTypeLabel, { color: STRAIN_TYPES[strain.type].color }]}>
                      {STRAIN_TYPES[strain.type].label}
                    </Text>
                    {strain.thcPercent && (
                      <Text style={styles.thcLabel}>{strain.thcPercent}% THC</Text>
                    )}
                  </View>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{'⭐'.repeat(strain.rating)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.length === 0 ? (
            <View style={styles.emptySmall}>
              <Text style={styles.emptySmallText}>No sessions yet — log your first!</Text>
            </View>
          ) : (
            recentSessions.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionStrain}>{session.strainName}</Text>
                  <Text style={styles.sessionTime}>{format(new Date(session.createdAt), 'MMM d')}</Text>
                </View>
                <View style={styles.sessionMoods}>
                  <Text style={styles.moodLabel}>Mood:</Text>
                  <Text style={styles.moodEmojis}>
                    {MOOD_EMOJIS[session.moodBefore]} → {MOOD_EMOJIS[session.moodAfter || session.moodBefore]}
                  </Text>
                </View>
                {session.effects && session.effects.length > 0 && (
                  <View style={styles.effectsRow}>
                    {session.effects.slice(0, 3).map((e, i) => (
                      <View key={i} style={styles.effectPill}>
                        <Text style={styles.effectText}>{e}</Text>
                      </View>
                    ))}
                    {session.effects.length > 3 && (
                      <Text style={styles.moreEffects}>+{session.effects.length - 3}</Text>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  headerGradient: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  title: { fontSize: 32, fontWeight: '700', color: '#FFF', marginTop: 4 },
  // Quick Actions
  quickActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1 },
  actionGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  actionText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  // Feature Links
  featureLinks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  featureChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, borderRadius: 12, marginHorizontal: 4,
  },
  featureEmoji: { fontSize: 16, marginRight: 6 },
  featureText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  // Content
  content: { flex: 1, marginTop: -10 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#059669' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  // Section
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  // Strain Cards
  strainCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 16, borderRadius: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  strainType: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  strainTypeEmoji: { fontSize: 24 },
  strainInfo: { flex: 1, marginLeft: 14 },
  strainName: { fontSize: 17, fontWeight: '600', color: '#1F2937' },
  strainMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 },
  strainTypeLabel: { fontSize: 13, fontWeight: '600' },
  thcLabel: { fontSize: 13, color: '#6B7280' },
  ratingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 11 },
  // Empty States
  emptyCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 40, alignItems: 'center',
    borderWidth: 2, borderColor: '#D1FAE5', borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#059669', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  emptySmall: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, alignItems: 'center' },
  emptySmallText: { fontSize: 14, color: '#9CA3AF' },
  // Sessions
  sessionCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionStrain: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  sessionTime: { fontSize: 13, color: '#9CA3AF' },
  sessionMoods: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  moodLabel: { fontSize: 13, color: '#6B7280', marginRight: 8 },
  moodEmojis: { fontSize: 20 },
  effectsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  effectPill: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  effectText: { fontSize: 12, color: '#059669', fontWeight: '500' },
  moreEffects: { fontSize: 12, color: '#9CA3AF', alignSelf: 'center' },
});
