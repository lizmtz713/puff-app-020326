import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalStrains: 0,
    totalSessions: 0,
    favoriteStrains: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      // Fetch strains
      const strainsQuery = query(
        collection(db, 'strains'),
        where('userId', '==', user.id)
      );
      const strainsSnap = await getDocs(strainsQuery);
      const strains = strainsSnap.docs.map(d => d.data());
      
      // Fetch sessions
      const sessionsQuery = query(
        collection(db, 'sessions'),
        where('userId', '==', user.id)
      );
      const sessionsSnap = await getDocs(sessionsQuery);

      const totalRating = strains.reduce((sum, s) => sum + (s.rating || 0), 0);
      
      setStats({
        totalStrains: strains.length,
        totalSessions: sessionsSnap.size,
        favoriteStrains: strains.filter(s => s.favorite).length,
        avgRating: strains.length > 0 ? totalRating / strains.length : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '🌿'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStrains}</Text>
            <Text style={styles.statLabel}>Strains</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.favoriteStrains}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="notifications-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="shield-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="help-circle-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionRow}>
            <Ionicons name="information-circle-outline" size={22} color="#059669" />
            <Text style={styles.actionText}>About PUFF</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PUFF v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0FDF4' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#065F46', marginBottom: 20 },
  userCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: '#FFF', fontWeight: '600' },
  userName: { fontSize: 22, fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: { fontSize: 28, fontWeight: '700', color: '#059669' },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  actions: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: { flex: 1, fontSize: 16, color: '#1F2937', marginLeft: 12 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
  version: { textAlign: 'center', color: '#9CA3AF', marginTop: 24, fontSize: 13 },
});
