import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Strain, Session, STRAIN_TYPES } from '../types';
import { Ionicons } from '@expo/vector-icons';

const VIBES = [
  { id: 'chill', label: 'chill & relax', icon: '😌', keywords: ['Relaxed', 'Sleepy', 'Stress Relief'], strainTypes: ['indica', 'hybrid'] },
  { id: 'creative', label: 'creative flow', icon: '🎨', keywords: ['Creative', 'Euphoric', 'Focused'], strainTypes: ['sativa', 'hybrid'] },
  { id: 'social', label: 'social vibes', icon: '🎉', keywords: ['Talkative', 'Giggly', 'Happy', 'Uplifted'], strainTypes: ['sativa', 'hybrid'] },
  { id: 'focus', label: 'lock in & focus', icon: '🎯', keywords: ['Focused', 'Energetic', 'Creative'], strainTypes: ['sativa'] },
  { id: 'sleep', label: 'knock out', icon: '😴', keywords: ['Sleepy', 'Relaxed'], strainTypes: ['indica'] },
  { id: 'pain', label: 'pain relief', icon: '💆', keywords: ['Pain Relief', 'Relaxed', 'Tingly'], strainTypes: ['indica', 'hybrid'] },
  { id: 'energy', label: 'energize', icon: '⚡', keywords: ['Energetic', 'Uplifted', 'Happy'], strainTypes: ['sativa'] },
  { id: 'munchies', label: 'appetite boost', icon: '🍕', keywords: ['Hungry', 'Happy', 'Relaxed'], strainTypes: ['indica', 'hybrid'] },
];

export function RecommendScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [strains, setStrains] = useState<Strain[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [recommendations, setRecommendations] = useState<Strain[]>([]);
  const [showResults, setShowResults] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const strainsQ = query(collection(db, 'strains'), where('userId', '==', user.id));
      const strainsSnap = await getDocs(strainsQ);
      const strainsData = strainsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Strain[];
      setStrains(strainsData);

      const sessionsQ = query(collection(db, 'sessions'), where('userId', '==', user.id));
      const sessionsSnap = await getDocs(sessionsQ);
      const sessionsData = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Session[];
      setSessions(sessionsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getRecommendations = (vibeId: string) => {
    const vibe = VIBES.find(v => v.id === vibeId);
    if (!vibe) return;

    setSelectedVibe(vibeId);

    // Score each strain
    const scored = strains.map(strain => {
      let score = 0;

      // Strain type match
      if (vibe.strainTypes.includes(strain.type)) score += 3;

      // Effects match
      const matchingEffects = strain.effects.filter(e => vibe.keywords.includes(e));
      score += matchingEffects.length * 2;

      // Higher rating = better
      score += strain.rating;

      // Favorite bonus
      if (strain.favorite) score += 2;

      // Would buy again bonus
      if (strain.wouldBuyAgain) score += 1;

      // Session history - check if this strain gave desired effects
      const strainSessions = sessions.filter(s => s.strainId === strain.id);
      strainSessions.forEach(session => {
        const sessionEffectMatch = session.effects?.filter(e => vibe.keywords.includes(e)).length || 0;
        score += sessionEffectMatch;
        // Mood improvement bonus
        if (session.moodAfter && session.moodBefore && session.moodAfter > session.moodBefore) {
          score += 1;
        }
      });

      return { strain, score };
    });

    // Sort by score and take top 3
    const sorted = scored.sort((a, b) => b.score - a.score);
    setRecommendations(sorted.slice(0, 3).map(s => s.strain));
    
    setShowResults(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  };

  const resetSelection = () => {
    setShowResults(false);
    setSelectedVibe(null);
    fadeAnim.setValue(0);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#8B5CF6', '#A78BFA']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>What Should I Smoke?</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.headerSub}>Based on your stash & history</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showResults ? (
          <>
            <Text style={styles.questionTitle}>What vibe are you going for?</Text>
            
            <View style={styles.vibeGrid}>
              {VIBES.map((vibe) => (
                <TouchableOpacity
                  key={vibe.id}
                  style={styles.vibeCard}
                  onPress={() => getRecommendations(vibe.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.vibeIcon}>{vibe.icon}</Text>
                  <Text style={styles.vibeLabel}>{vibe.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {strains.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🌿</Text>
                <Text style={styles.emptyTitle}>Add strains first!</Text>
                <Text style={styles.emptyText}>Log some strains so I can recommend the best one for your vibe.</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddStrain')}
                >
                  <Text style={styles.addButtonText}>Add Strain</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultIcon}>{VIBES.find(v => v.id === selectedVibe)?.icon}</Text>
              <Text style={styles.resultTitle}>For {VIBES.find(v => v.id === selectedVibe)?.label}...</Text>
            </View>

            {recommendations.length > 0 ? (
              <>
                <Text style={styles.topPickLabel}>🏆 TOP PICK</Text>
                <View style={styles.topPickCard}>
                  <View style={[styles.strainTypeBadge, { backgroundColor: STRAIN_TYPES[recommendations[0].type].color + '20' }]}>
                    <Text style={styles.strainTypeEmoji}>{STRAIN_TYPES[recommendations[0].type].emoji}</Text>
                  </View>
                  <Text style={styles.topPickName}>{recommendations[0].name}</Text>
                  <Text style={styles.topPickType}>{STRAIN_TYPES[recommendations[0].type].label}</Text>
                  <View style={styles.topPickEffects}>
                    {recommendations[0].effects.slice(0, 3).map((e, i) => (
                      <View key={i} style={styles.effectPill}>
                        <Text style={styles.effectText}>{e}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.topPickRating}>{'⭐'.repeat(recommendations[0].rating)}</Text>
                </View>

                {recommendations.length > 1 && (
                  <>
                    <Text style={styles.alsoGoodLabel}>Also good options:</Text>
                    {recommendations.slice(1).map((strain) => (
                      <View key={strain.id} style={styles.altCard}>
                        <Text style={styles.altEmoji}>{STRAIN_TYPES[strain.type].emoji}</Text>
                        <View style={styles.altInfo}>
                          <Text style={styles.altName}>{strain.name}</Text>
                          <Text style={styles.altType}>{STRAIN_TYPES[strain.type].label}</Text>
                        </View>
                        <Text style={styles.altRating}>{'⭐'.repeat(strain.rating)}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            ) : (
              <View style={styles.noMatchCard}>
                <Text style={styles.noMatchIcon}>🤔</Text>
                <Text style={styles.noMatchText}>
                  No perfect match in your stash for this vibe. Try adding more strains with different effects!
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
              <Text style={styles.resetText}>Try Different Vibe</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5FF' },
  headerGradient: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { flex: 1, padding: 20 },
  questionTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 20, textAlign: 'center' },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vibeCard: {
    width: '47%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  vibeIcon: { fontSize: 36, marginBottom: 8 },
  vibeLabel: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', marginTop: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  addButton: { backgroundColor: '#7C3AED', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  // Results
  resultHeader: { alignItems: 'center', marginBottom: 24 },
  resultIcon: { fontSize: 48, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  topPickLabel: { fontSize: 12, fontWeight: '700', color: '#7C3AED', marginBottom: 8, letterSpacing: 1 },
  topPickCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: '#7C3AED',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  strainTypeBadge: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  strainTypeEmoji: { fontSize: 28 },
  topPickName: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  topPickType: { fontSize: 14, color: '#7C3AED', fontWeight: '600', marginBottom: 12 },
  topPickEffects: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  effectPill: { backgroundColor: '#F3E8FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  effectText: { fontSize: 12, color: '#7C3AED', fontWeight: '500' },
  topPickRating: { fontSize: 16 },
  alsoGoodLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12 },
  altCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 16, borderRadius: 12, marginBottom: 10,
  },
  altEmoji: { fontSize: 24, marginRight: 12 },
  altInfo: { flex: 1 },
  altName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  altType: { fontSize: 13, color: '#6B7280' },
  altRating: { fontSize: 12 },
  noMatchCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, alignItems: 'center' },
  noMatchIcon: { fontSize: 40, marginBottom: 12 },
  noMatchText: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  resetButton: { backgroundColor: '#7C3AED', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  resetText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
