import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Dimensions, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Strain, ConsumptionMethod, METHODS, EFFECTS, MOOD_EMOJIS } from '../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function LogSessionScreen({ navigation }: any) {
  const { user } = useAuth();
  const [strains, setStrains] = useState<Strain[]>([]);
  const [selectedStrain, setSelectedStrain] = useState<Strain | null>(null);
  const [method, setMethod] = useState<ConsumptionMethod>('smoke');
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1); // Wizard steps for simplicity

  useEffect(() => { fetchStrains(); }, []);

  const fetchStrains = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'strains'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setStrains(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Strain[]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]);
  };

  const handleSave = async () => {
    if (!selectedStrain || !user) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'sessions'), {
        userId: user.id,
        strainId: selectedStrain.id,
        strainName: selectedStrain.name,
        method,
        moodBefore,
        moodAfter,
        effects: selectedEffects,
        notes: notes.trim() || null,
        createdAt: serverTimestamp(),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // STEP 1: Select Strain
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What are you smoking? 🌿</Text>
      <Text style={styles.stepSubtitle}>Select a strain from your stash</Text>
      
      {strains.length === 0 ? (
        <TouchableOpacity 
          style={styles.emptyCard}
          onPress={() => navigation.navigate('AddStrain')}
        >
          <Ionicons name="add-circle-outline" size={48} color="#7C3AED" />
          <Text style={styles.emptyTitle}>Add a strain first</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.strainGrid}>
          {strains.map(strain => (
            <TouchableOpacity
              key={strain.id}
              style={[styles.strainOption, selectedStrain?.id === strain.id && styles.strainOptionSelected]}
              onPress={() => setSelectedStrain(strain)}
            >
              <Text style={styles.strainEmoji}>🌿</Text>
              <Text style={[styles.strainName, selectedStrain?.id === strain.id && styles.strainNameSelected]}>
                {strain.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // STEP 2: Method & Mood
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>How are you consuming? 💨</Text>
      
      <View style={styles.methodGrid}>
        {(Object.keys(METHODS) as ConsumptionMethod[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.methodOption, method === m && styles.methodOptionSelected]}
            onPress={() => setMethod(m)}
          >
            <Text style={styles.methodEmoji}>{METHODS[m].emoji}</Text>
            <Text style={[styles.methodLabel, method === m && styles.methodLabelSelected]}>
              {METHODS[m].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 32 }]}>Mood before? 🧠</Text>
      <View style={styles.moodRow}>
        {[1, 2, 3, 4, 5].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.moodOption, moodBefore === m && styles.moodOptionSelected]}
            onPress={() => setMoodBefore(m)}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // STEP 3: Effects (optional)
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What are you feeling? ✨</Text>
      <Text style={styles.stepSubtitle}>Select all that apply (optional)</Text>
      
      <View style={styles.effectsGrid}>
        {EFFECTS.map((effect) => (
          <TouchableOpacity
            key={effect}
            style={[styles.effectChip, selectedEffects.includes(effect) && styles.effectChipSelected]}
            onPress={() => toggleEffect(effect)}
          >
            <Text style={[styles.effectText, selectedEffects.includes(effect) && styles.effectTextSelected]}>
              {effect}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 32 }]}>Mood after? (optional)</Text>
      <View style={styles.moodRow}>
        {[1, 2, 3, 4, 5].map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.moodOption, moodAfter === m && styles.moodOptionSelected]}
            onPress={() => setMoodAfter(moodAfter === m ? null : m)}
          >
            <Text style={styles.moodEmoji}>{MOOD_EMOJIS[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const canProceed = () => {
    if (step === 1) return selectedStrain !== null;
    return true;
  };

  return (
    <LinearGradient colors={['#7C3AED', '#8B5CF6', '#A78BFA']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Session</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{step}/3</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(s => s - 1)}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={() => step < 3 ? setStep(s => s + 1) : handleSave()}
          disabled={!canProceed() || saving}
        >
          <Text style={styles.nextButtonText}>
            {saving ? 'Saving...' : step < 3 ? 'Next' : 'Log Session 💨'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
  },
  closeButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  stepIndicator: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  stepText: { color: '#FFF', fontWeight: '600' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 20 },
  progressFill: { height: 4, backgroundColor: '#FFF', borderRadius: 2 },
  content: { flex: 1, padding: 20 },
  stepContainer: { paddingTop: 20 },
  stepTitle: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 },
  // Strain Selection
  strainGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  strainOption: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 16, borderWidth: 2, borderColor: 'transparent', alignItems: 'center',
  },
  strainOptionSelected: { backgroundColor: '#FFF', borderColor: '#FFF' },
  strainEmoji: { fontSize: 24, marginBottom: 8 },
  strainName: { fontSize: 14, color: '#FFF', fontWeight: '600', textAlign: 'center' },
  strainNameSelected: { color: '#7C3AED' },
  // Method
  methodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  methodOption: {
    width: (width - 64) / 3, backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  methodOptionSelected: { backgroundColor: '#FFF', borderColor: '#FFF' },
  methodEmoji: { fontSize: 28, marginBottom: 6 },
  methodLabel: { fontSize: 13, color: '#FFF', fontWeight: '500' },
  methodLabelSelected: { color: '#7C3AED' },
  // Mood
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  moodOption: {
    width: (width - 80) / 5, aspectRatio: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  moodOptionSelected: { backgroundColor: '#FFF' },
  moodEmoji: { fontSize: 32 },
  // Effects
  effectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  effectChip: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, borderWidth: 2, borderColor: 'transparent',
  },
  effectChipSelected: { backgroundColor: '#FFF', borderColor: '#FFF' },
  effectText: { fontSize: 14, color: '#FFF', fontWeight: '500' },
  effectTextSelected: { color: '#7C3AED' },
  // Empty
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 40,
    alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 18, color: '#FFF', fontWeight: '600', marginTop: 16 },
  // Bottom Bar
  bottomBar: {
    flexDirection: 'row', padding: 20, paddingBottom: 40, gap: 12,
  },
  backButton: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  nextButton: {
    flex: 1, backgroundColor: '#FFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center',
  },
  nextButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.3)' },
  nextButtonText: { fontSize: 18, fontWeight: '700', color: '#7C3AED' },
});
