import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {policies} from '../data/policies';
import {UserProfile, ImmigrationPolicy, StatusType} from '../types';
import {saveProfile} from '../storage/store';

interface Props {
  onComplete: () => void;
}

type Step = 'country' | 'status' | 'date' | 'confirm';

export default function SetupScreen({onComplete}: Props) {
  const [step, setStep] = useState<Step>('country');
  const [selectedCountry, setSelectedCountry] = useState<ImmigrationPolicy | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCountrySelect = (policy: ImmigrationPolicy) => {
    setSelectedCountry(policy);
    setSelectedStatus(null);
    setStep('status');
  };

  const handleStatusSelect = (status: StatusType) => {
    setSelectedStatus(status);
    setStep('date');
  };

  const handleDateConfirm = () => {
    setStep('confirm');
  };

  const handleComplete = async () => {
    if (!selectedCountry || !selectedStatus) return;

    const profile: UserProfile = {
      country: selectedCountry.country,
      statusType: selectedStatus.id,
      startDate: startDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    await saveProfile(profile);
    onComplete();
  };

  const renderCountryStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>选择你的移民国家</Text>
      <Text style={styles.subtitle}>Select your immigration country</Text>
      {policies.map(policy => (
        <TouchableOpacity
          key={policy.country}
          style={styles.optionCard}
          onPress={() => handleCountrySelect(policy)}>
          <Text style={styles.flag}>{policy.flag}</Text>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>{policy.countryNameZh}</Text>
            <Text style={styles.optionSubtitle}>{policy.countryName}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatusStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={() => setStep('country')} style={styles.backButton}>
        <Text style={styles.backText}>‹ 返回</Text>
      </TouchableOpacity>
      <Text style={styles.title}>
        {selectedCountry?.flag} {selectedCountry?.countryNameZh}
      </Text>
      <Text style={styles.subtitle}>选择你的身份类型</Text>
      {selectedCountry?.statusTypes.map(status => (
        <TouchableOpacity
          key={status.id}
          style={styles.optionCard}
          onPress={() => handleStatusSelect(status)}>
          <View style={[styles.optionText, {flex: 1}]}>
            <Text style={styles.optionTitle}>{status.nameZh}</Text>
            <Text style={styles.optionSubtitle}>{status.name}</Text>
            <Text style={styles.optionDesc}>{status.descriptionZh}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDateStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={() => setStep('status')} style={styles.backButton}>
        <Text style={styles.backText}>‹ 返回</Text>
      </TouchableOpacity>
      <Text style={styles.title}>你是哪天开始居住的？</Text>
      <Text style={styles.subtitle}>
        选择你在{selectedCountry?.countryNameZh}开始居住的日期
      </Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          📅 {startDate.toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}
        </Text>
      </TouchableOpacity>

      {(showDatePicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={handleDateConfirm}>
        <Text style={styles.primaryButtonText}>确认日期</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={() => setStep('date')} style={styles.backButton}>
        <Text style={styles.backText}>‹ 返回</Text>
      </TouchableOpacity>
      <Text style={styles.title}>确认信息</Text>

      <View style={styles.confirmCard}>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>国家</Text>
          <Text style={styles.confirmValue}>
            {selectedCountry?.flag} {selectedCountry?.countryNameZh}
          </Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>身份类型</Text>
          <Text style={styles.confirmValue}>{selectedStatus?.nameZh}</Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>开始日期</Text>
          <Text style={styles.confirmValue}>
            {startDate.toLocaleDateString('zh-CN')}
          </Text>
        </View>
        <View style={styles.confirmRow}>
          <Text style={styles.confirmLabel}>要求</Text>
          <Text style={styles.confirmValue}>
            {selectedStatus?.periodYears}年内住满{selectedStatus?.requiredDays}天
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.primaryButtonText}>开始追踪 🚀</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌍</Text>
        <Text style={styles.appName}>Immigration Tracker</Text>
        <Text style={styles.appNameZh}>移民居住天数追踪</Text>
      </View>

      {step === 'country' && renderCountryStep()}
      {step === 'status' && renderStatusStep()}
      {step === 'date' && renderDateStep()}
      {step === 'confirm' && renderConfirmStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f172a'},
  content: {padding: 20, paddingTop: 60},
  header: {alignItems: 'center', marginBottom: 30},
  logo: {fontSize: 48},
  appName: {fontSize: 24, fontWeight: 'bold', color: '#e2e8f0', marginTop: 10},
  appNameZh: {fontSize: 16, color: '#94a3b8', marginTop: 4},
  stepContainer: {},
  title: {fontSize: 22, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 8},
  subtitle: {fontSize: 14, color: '#94a3b8', marginBottom: 20},
  optionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  flag: {fontSize: 32, marginRight: 14},
  optionText: {},
  optionTitle: {fontSize: 17, fontWeight: '600', color: '#f1f5f9'},
  optionSubtitle: {fontSize: 13, color: '#94a3b8', marginTop: 2},
  optionDesc: {fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 18},
  arrow: {fontSize: 24, color: '#475569', marginLeft: 'auto'},
  backButton: {marginBottom: 16},
  backText: {fontSize: 16, color: '#60a5fa'},
  dateButton: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateText: {fontSize: 18, color: '#f1f5f9'},
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {fontSize: 17, fontWeight: '600', color: '#fff'},
  confirmCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  confirmLabel: {fontSize: 15, color: '#94a3b8'},
  confirmValue: {fontSize: 15, color: '#f1f5f9', fontWeight: '500'},
});
