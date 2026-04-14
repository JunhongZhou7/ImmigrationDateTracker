import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {UserProfile} from '../types';
import {loadProfile, clearAll, loadRecords} from '../storage/store';
import {getPolicy, getStatusType} from '../data/policies';
import {useFocusEffect} from '@react-navigation/native';

interface Props {
  onReset: () => void;
}

export default function SettingsScreen({onReset}: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadProfile().then(setProfile);
      loadRecords().then(r => setRecordCount(r.length));
    }, []),
  );

  const handleReset = () => {
    Alert.alert(
      '重置所有数据',
      '这将删除你的所有设置和出入境记录，此操作不可撤销。确定继续吗？',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '确认重置',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            onReset();
          },
        },
      ],
    );
  };

  const policy = profile ? getPolicy(profile.country) : null;
  const status = profile ? getStatusType(profile.country, profile.statusType) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>设置</Text>

      {/* Current Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前配置</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>国家</Text>
            <Text style={styles.value}>
              {policy?.flag} {policy?.countryNameZh}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>身份类型</Text>
            <Text style={styles.value}>{status?.nameZh}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>获得身份日期</Text>
            <Text style={styles.value}>{profile?.statusGrantDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>开始居住日期</Text>
            <Text style={styles.value}>{profile?.startDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>要求</Text>
            <Text style={styles.value}>
              {status?.periodYears}年内住满{status?.requiredDays}天
            </Text>
          </View>
          <View style={[styles.row, {borderBottomWidth: 0}]}>
            <Text style={styles.label}>出入境记录</Text>
            <Text style={styles.value}>{recordCount} 条</Text>
          </View>
        </View>
      </View>

      {/* Policy Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>政策说明</Text>
        <View style={styles.card}>
          <Text style={styles.policyText}>{status?.descriptionZh}</Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            Immigration Tracker 帮助你追踪在移民国家的居住天数。所有数据存储在本地，不会上传到任何服务器。
          </Text>
          <Text style={styles.version}>版本 1.0.0</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, {color: '#ef4444'}]}>危险操作</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
          <Text style={styles.dangerButtonText}>🗑️ 重置所有数据</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f172a'},
  content: {padding: 20, paddingTop: 60, paddingBottom: 40},
  title: {fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 24},
  section: {marginBottom: 24},
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  label: {fontSize: 15, color: '#94a3b8'},
  value: {fontSize: 15, color: '#f1f5f9', fontWeight: '500'},
  policyText: {fontSize: 14, color: '#cbd5e1', lineHeight: 22},
  aboutText: {fontSize: 14, color: '#94a3b8', lineHeight: 22},
  version: {fontSize: 12, color: '#64748b', marginTop: 12},
  dangerButton: {
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  dangerButtonText: {fontSize: 16, fontWeight: '600', color: '#fca5a5'},
});
