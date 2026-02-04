import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Check your email and password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#059669', '#10B981', '#34D399']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.logo}>PUFF</Text>
          <Text style={styles.emoji}>🌿💨</Text>
          <Text style={styles.tagline}>Your Cannabis Companion</Text>
        </Animated.View>

        <Animated.View style={[styles.formCard, { opacity: fadeAnim }]}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          
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
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.9}
          >
            <LinearGradient 
              colors={loading ? ['#A7F3D0', '#A7F3D0'] : ['#059669', '#10B981']} 
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64, fontWeight: '800', color: '#FFF', letterSpacing: 8 },
  emoji: { fontSize: 36, marginTop: 8 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  formCard: {
    backgroundColor: '#FFF', borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  welcomeText: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 24 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 14, padding: 16, fontSize: 16, color: '#1F2937',
  },
  button: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  buttonLoading: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 18, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#6B7280', fontSize: 15 },
  linkText: { color: '#059669', fontSize: 15, fontWeight: '600', marginLeft: 6 },
});
