import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Demo version - no Firebase required
export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌿 PUFF</Text>
          <Text style={styles.headerSubtitle}>Your Weed Diary</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Strains</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.2</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Recent Sessions */}
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          
          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.strainName}>Blue Dream</Text>
              <Text style={styles.sessionRating}>⭐ 4.5</Text>
            </View>
            <Text style={styles.sessionType}>Hybrid • Vape</Text>
            <Text style={styles.sessionNotes}>Great for evening relaxation. Felt creative and calm.</Text>
            <Text style={styles.sessionTime}>Today, 8:30 PM</Text>
          </View>

          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.strainName}>OG Kush</Text>
              <Text style={styles.sessionRating}>⭐ 5.0</Text>
            </View>
            <Text style={styles.sessionType}>Indica • Joint</Text>
            <Text style={styles.sessionNotes}>Perfect for sleep. Knocked out in 30 mins.</Text>
            <Text style={styles.sessionTime}>Yesterday, 10:00 PM</Text>
          </View>

          <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.strainName}>Sour Diesel</Text>
              <Text style={styles.sessionRating}>⭐ 4.0</Text>
            </View>
            <Text style={styles.sessionType}>Sativa • Bong</Text>
            <Text style={styles.sessionNotes}>Energetic high, great for cleaning the house!</Text>
            <Text style={styles.sessionTime}>Feb 1, 3:00 PM</Text>
          </View>

          {/* Your Stash */}
          <Text style={styles.sectionTitle}>Your Stash</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stashScroll}>
            <View style={[styles.stashCard, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.stashEmoji}>💜</Text>
              <Text style={styles.stashName}>Purple Haze</Text>
              <Text style={styles.stashType}>Sativa</Text>
            </View>
            <View style={[styles.stashCard, { backgroundColor: '#059669' }]}>
              <Text style={styles.stashEmoji}>💚</Text>
              <Text style={styles.stashName}>Green Crack</Text>
              <Text style={styles.stashType}>Sativa</Text>
            </View>
            <View style={[styles.stashCard, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.stashEmoji}>🍊</Text>
              <Text style={styles.stashName}>Tangie</Text>
              <Text style={styles.stashType}>Hybrid</Text>
            </View>
            <View style={[styles.stashCard, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.stashEmoji}>💙</Text>
              <Text style={styles.stashName}>Blue Dream</Text>
              <Text style={styles.stashType}>Hybrid</Text>
            </View>
          </ScrollView>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="leaf" size={24} color="#059669" />
            <Text style={[styles.tabLabel, { color: '#059669' }]}>Stash</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="stats-chart-outline" size={24} color="#9CA3AF" />
            <Text style={styles.tabLabel}>Insights</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  strainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sessionRating: {
    fontSize: 14,
    color: '#F59E0B',
  },
  sessionType: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  sessionTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  stashScroll: {
    marginBottom: 20,
  },
  stashCard: {
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
  },
  stashEmoji: {
    fontSize: 32,
  },
  stashName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  stashType: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tab: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#059669',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
