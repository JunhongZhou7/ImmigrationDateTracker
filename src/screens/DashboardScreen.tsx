import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {UserProfile, TravelRecord, DayCalculation} from '../types';
import {getPolicy, getStatusType} from '../data/policies';
import {loadProfile, loadRecords} from '../storage/store';
import {calculateResidency, isCurrentlyAbroad, getCurrentTripDays} from '../utils/calculator';
import {useFocusEffect} from '@react-navigation/native';

export default function DashboardScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [calc, setCalc] = useState<DayCalculation | null>(null);
  const [abroad, setAbroad] = useState(false);
  const [tripDays, setTripDays] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const p = await loadProfile();
    const r = await loadRecords();
    setProfile(p);
    setRecords(r);

    if (p) {
      const status = getStatusType(p.country, p.statusType);
      if (status) {
        const result = calculateResidency(p.startDate, status, r, p.statusGrantDate);
        setCalc(result);
        setAbroad(isCurrentlyAbroad(r));
        setTripDays(getCurrentTripDays(r));
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (!profile || !calc) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const policy = getPolicy(profile.country);
  const status = getStatusType(profile.country, profile.statusType);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60a5fa" />
      }>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.flag}>{policy?.flag}</Text>
        <View>
          <Text style={styles.countryName}>{policy?.countryNameZh}</Text>
          <Text style={styles.statusName}>{status?.nameZh}</Text>
        </View>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusBadge, abroad ? styles.abroadBadge : styles.homeBadge]}>
        <Text style={styles.statusEmoji}>{abroad ? '✈️' : '🏠'}</Text>
        <Text style={styles.statusText}>
          {abroad ? `在国外 · 已离开 ${tripDays} 天` : '在国内'}
        </Text>
      </View>

      {/* Main Progress Card */}
      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>已居住天数</Text>
        <Text style={styles.mainNumber}>{calc.daysResided}</Text>
        <Text style={styles.mainTarget}>/ {calc.daysRequired} 天</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${calc.progressPercent}%`,
                backgroundColor: calc.isOnTrack ? '#22c55e' : '#ef4444',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{calc.progressPercent}%</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📅</Text>
          <Text style={styles.statNumber}>{calc.daysRemaining}</Text>
          <Text style={styles.statLabel}>还需居住</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🛫</Text>
          <Text style={styles.statNumber}>{calc.daysAbsent}</Text>
          <Text style={styles.statLabel}>出境天数</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏰</Text>
          <Text style={styles.statNumber}>{calc.totalDaysInPeriod}</Text>
          <Text style={styles.statLabel}>总经过天数</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>{calc.isOnTrack ? '✅' : '⚠️'}</Text>
          <Text style={[styles.statNumber, {color: calc.isOnTrack ? '#22c55e' : '#ef4444'}]}>
            {calc.isOnTrack ? '正常' : '注意'}
          </Text>
          <Text style={styles.statLabel}>进度状态</Text>
        </View>
      </View>

      {/* Dates Info */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>获得身份日期</Text>
          <Text style={styles.infoValue}>{profile.statusGrantDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>开始居住日期</Text>
          <Text style={styles.infoValue}>{profile.startDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>考察期开始</Text>
          <Text style={styles.infoValue}>{calc.periodStartDate}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>考察期截止</Text>
          <Text style={styles.infoValue}>{calc.periodEndDate}</Text>
        </View>
        {calc.estimatedCompletionDate && (
          <View style={[styles.infoRow, {borderBottomWidth: 0}]}>
            <Text style={styles.infoLabel}>预计达标日</Text>
            <Text style={[styles.infoValue, {color: '#60a5fa'}]}>
              {calc.estimatedCompletionDate}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f172a'},
  content: {padding: 20, paddingTop: 60},
  loadingText: {color: '#94a3b8', textAlign: 'center', marginTop: 100, fontSize: 16},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  flag: {fontSize: 40, marginRight: 14},
  countryName: {fontSize: 22, fontWeight: 'bold', color: '#f1f5f9'},
  statusName: {fontSize: 14, color: '#94a3b8', marginTop: 2},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  homeBadge: {backgroundColor: '#14532d'},
  abroadBadge: {backgroundColor: '#7c2d12'},
  statusEmoji: {fontSize: 20, marginRight: 10},
  statusText: {fontSize: 15, color: '#f1f5f9', fontWeight: '500'},
  mainCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainLabel: {fontSize: 14, color: '#94a3b8', marginBottom: 4},
  mainNumber: {fontSize: 56, fontWeight: 'bold', color: '#f1f5f9'},
  mainTarget: {fontSize: 18, color: '#64748b', marginBottom: 16},
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {height: '100%', borderRadius: 4},
  progressText: {fontSize: 13, color: '#94a3b8', marginTop: 8},
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statEmoji: {fontSize: 24, marginBottom: 6},
  statNumber: {fontSize: 24, fontWeight: 'bold', color: '#f1f5f9'},
  statLabel: {fontSize: 12, color: '#94a3b8', marginTop: 4},
  infoCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {fontSize: 14, color: '#94a3b8'},
  infoValue: {fontSize: 14, color: '#f1f5f9', fontWeight: '500'},
});
