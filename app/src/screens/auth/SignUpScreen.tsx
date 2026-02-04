import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export function SignUpScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#059669', '#10B981']} style={styles.headerGradient}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start tracking your sessions 🌿</Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="How should we call you?"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonLoading]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              <LinearGradient 
                colors={loading ? ['#A7F3D0', '#A7F3D0'] : ['#059669', '#10B981']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating...' : 'Create Account'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>What you'll get</Text>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}><Text>📊</Text></View>
              <Text style={styles.featureText}>Track strains & sessions</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}><Text>🌿</Text></View>
              <Text style={styles.featureText}>Log effects & moods</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}><Text>⭐</Text></View>
              <Text style={styles.featureText}>Rate & favorite strains</Text>
            </View>
            <View style={styles.featureRow}>
              <View style={styles.featureIcon}><Text>📈</Text></View>
              <Text style={styles.featureText}>See your patterns</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  backButton: { marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  content: { flex: 1, padding: 24, marginTop: -20 },
  form: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, fontSize: 16, color: '#1F2937',
  },
  button: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  buttonLoading: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  features: {
    marginTop: 24, backgroundColor: '#ECFDF5', borderRadius: 20, padding: 20,
  },
  featuresTitle: { fontSize: 16, fontWeight: '600', color: '#065F46', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  featureText: { fontSize: 15, color: '#047857' },
});
