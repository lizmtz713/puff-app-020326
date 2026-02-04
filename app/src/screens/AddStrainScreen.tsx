import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { StrainType, STRAIN_TYPES, EFFECTS } from '../types';
import { Ionicons } from '@expo/vector-icons';

export function AddStrainScreen({ navigation }: any) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [type, setType] = useState<StrainType>('hybrid');
  const [thc, setThc] = useState('');
  const [cbd, setCbd] = useState('');
  const [rating, setRating] = useState(3);
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [dispensary, setDispensary] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [wouldBuyAgain, setWouldBuyAgain] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const toggleEffect = (effect: string) => {
    setSelectedEffects(prev => 
      prev.includes(effect) 
        ? prev.filter(e => e !== effect)
        : [...prev, effect]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a strain name');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let photoUrl = null;

      // Upload image if selected
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `strains/${user.id}/${Date.now()}.jpg`);
        await uploadBytes(imageRef, blob);
        photoUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, 'strains'), {
        userId: user.id,
        name: name.trim(),
        type,
        thcPercent: thc ? parseFloat(thc) : null,
        cbdPercent: cbd ? parseFloat(cbd) : null,
        rating,
        effects: selectedEffects,
        notes: notes.trim() || null,
        dispensary: dispensary.trim() || null,
        price: price ? parseFloat(price) : null,
        photoUrl,
        favorite,
        wouldBuyAgain,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Saved! 🌿', `${name} added to your stash.`, [
        { text: 'Nice!', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not save strain. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header with close button */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Add New Strain 🌿</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Photo */}
          <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={32} color="#9CA3AF" />
                <Text style={styles.photoText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name */}
          <Text style={styles.label}>Strain Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Blue Dream"
            value={name}
            onChangeText={setName}
          />

          {/* Type Selector */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {(Object.keys(STRAIN_TYPES) as StrainType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeButton, type === t && { backgroundColor: STRAIN_TYPES[t].color }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeText, type === t && { color: '#FFF' }]}>
                  {STRAIN_TYPES[t].emoji} {STRAIN_TYPES[t].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* THC/CBD */}
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>THC %</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 22"
                value={thc}
                onChangeText={setThc}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>CBD %</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 1"
                value={cbd}
                onChangeText={setCbd}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Rating */}
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((r) => (
              <TouchableOpacity key={r} onPress={() => setRating(r)}>
                <Text style={[styles.star, r <= rating && styles.starActive]}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Effects */}
          <Text style={styles.label}>Effects (select all that apply)</Text>
          <View style={styles.effectsGrid}>
            {EFFECTS.map((effect) => (
              <TouchableOpacity
                key={effect}
                style={[styles.effectChip, selectedEffects.includes(effect) && styles.effectChipActive]}
                onPress={() => toggleEffect(effect)}
              >
                <Text style={[styles.effectText, selectedEffects.includes(effect) && styles.effectTextActive]}>
                  {effect}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Dispensary & Price */}
          <Text style={styles.label}>Dispensary</Text>
          <TextInput
            style={styles.input}
            placeholder="Where'd you get it?"
            value={dispensary}
            onChangeText={setDispensary}
          />

          <Text style={styles.label}>Price ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 45"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your thoughts on this strain..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggle, favorite && styles.toggleActive]}
              onPress={() => setFavorite(!favorite)}
            >
              <Text style={styles.toggleText}>{favorite ? '❤️' : '🤍'} Favorite</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggle, wouldBuyAgain && styles.toggleActive]}
              onPress={() => setWouldBuyAgain(!wouldBuyAgain)}
            >
              <Text style={styles.toggleText}>{wouldBuyAgain ? '✅' : '⬜'} Would Buy Again</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Strain'}</Text>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#065F46' },
  closeButton: { padding: 8 },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16, fontSize: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  photoButton: { alignItems: 'center', marginBottom: 10 },
  photoPlaceholder: {
    width: 120, height: 120, borderRadius: 12, backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  photoPreview: { width: 120, height: 120, borderRadius: 12 },
  photoText: { color: '#9CA3AF', marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeButton: {
    flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center',
  },
  typeText: { fontWeight: '600', color: '#374151' },
  ratingRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 28, opacity: 0.3 },
  starActive: { opacity: 1 },
  effectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  effectChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  effectChipActive: { backgroundColor: '#059669' },
  effectText: { fontSize: 13, color: '#374151' },
  effectTextActive: { color: '#FFF' },
  toggleRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  toggle: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E5E7EB', alignItems: 'center' },
  toggleActive: { backgroundColor: '#D1FAE5' },
  toggleText: { fontWeight: '500' },
  saveButton: {
    backgroundColor: '#059669', padding: 18, borderRadius: 12,
    alignItems: 'center', marginTop: 24,
  },
  saveButtonDisabled: { backgroundColor: '#A7F3D0' },
  saveText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});
