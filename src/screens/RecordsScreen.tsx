import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {v4 as uuidv4} from 'uuid';
import {TravelRecord} from '../types';
import {loadRecords, addRecord, updateRecord, deleteRecord} from '../storage/store';
import {useFocusEffect} from '@react-navigation/native';

export default function RecordsScreen() {
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TravelRecord | null>(null);
  const [newType, setNewType] = useState<'departure' | 'arrival'>('departure');
  const [newDate, setNewDate] = useState(new Date());
  const [newNote, setNewNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadRecords().then(setRecords);
    }, []),
  );

  const handleAdd = async () => {
    const record: TravelRecord = {
      id: uuidv4(),
      type: newType,
      date: newDate.toISOString().split('T')[0],
      source: 'manual',
      note: newNote || undefined,
      createdAt: new Date().toISOString(),
    };
    const updated = await addRecord(record);
    setRecords(updated);
    setShowAddModal(false);
    setNewNote('');
  };

  const handleEdit = async () => {
    if (!editingRecord) return;
    const updated = await updateRecord(editingRecord.id, {
      type: newType,
      date: newDate.toISOString().split('T')[0],
      note: newNote || undefined,
    });
    setRecords(updated);
    setShowEditModal(false);
    setEditingRecord(null);
    setNewNote('');
  };

  const handleDelete = (record: TravelRecord) => {
    Alert.alert(
      '删除记录',
      `确定要删除 ${record.date} 的${record.type === 'departure' ? '出境' : '入境'}记录吗？`,
      [
        {text: '取消', style: 'cancel'},
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteRecord(record.id);
            setRecords(updated);
          },
        },
      ],
    );
  };

  const openEdit = (record: TravelRecord) => {
    setEditingRecord(record);
    setNewType(record.type);
    setNewDate(new Date(record.date + 'T00:00:00'));
    setNewNote(record.note || '');
    setShowEditModal(true);
  };

  const openAdd = (type: 'departure' | 'arrival') => {
    setNewType(type);
    setNewDate(new Date());
    setNewNote('');
    setShowAddModal(true);
  };

  const renderModal = (isEdit: boolean) => (
    <Modal
      visible={isEdit ? showEditModal : showAddModal}
      animationType="slide"
      transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEdit ? '编辑记录' : '添加记录'}
          </Text>

          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newType === 'departure' && styles.typeButtonActive,
              ]}
              onPress={() => setNewType('departure')}>
              <Text
                style={[
                  styles.typeButtonText,
                  newType === 'departure' && styles.typeButtonTextActive,
                ]}>
                🛫 出境
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                newType === 'arrival' && styles.typeButtonActive,
              ]}
              onPress={() => setNewType('arrival')}>
              <Text
                style={[
                  styles.typeButtonText,
                  newType === 'arrival' && styles.typeButtonTextActive,
                ]}>
                🛬 入境
              </Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.datePickerText}>
              📅 {newDate.toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}
            </Text>
          </TouchableOpacity>

          {(showDatePicker || Platform.OS === 'ios') && (
            <DateTimePicker
              value={newDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setNewDate(date);
              }}
            />
          )}

          {/* Note */}
          <TextInput
            style={styles.noteInput}
            placeholder="备注（可选）"
            placeholderTextColor="#64748b"
            value={newNote}
            onChangeText={setNewNote}
          />

          {/* Edit history */}
          {isEdit && editingRecord?.previousDate && (
            <Text style={styles.editHistory}>
              修改前日期: {editingRecord.previousDate}
            </Text>
          )}

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                isEdit ? setShowEditModal(false) : setShowAddModal(false);
                setEditingRecord(null);
              }}>
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={isEdit ? handleEdit : handleAdd}>
              <Text style={styles.saveButtonText}>
                {isEdit ? '保存修改' : '添加'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>出入境日志</Text>

        {/* Quick Add Buttons */}
        <View style={styles.quickAdd}>
          <TouchableOpacity
            style={[styles.quickButton, styles.departureButton]}
            onPress={() => openAdd('departure')}>
            <Text style={styles.quickButtonText}>🛫 记录出境</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickButton, styles.arrivalButton]}
            onPress={() => openAdd('arrival')}>
            <Text style={styles.quickButtonText}>🛬 记录入境</Text>
          </TouchableOpacity>
        </View>

        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyText}>暂无出入境记录</Text>
            <Text style={styles.emptySubtext}>
              点击上方按钮添加你的出入境记录
            </Text>
          </View>
        ) : (
          records.map(record => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              onPress={() => openEdit(record)}
              onLongPress={() => handleDelete(record)}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordEmoji}>
                  {record.type === 'departure' ? '🛫' : '🛬'}
                </Text>
                <View>
                  <Text style={styles.recordType}>
                    {record.type === 'departure' ? '出境' : '入境'}
                  </Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                  {record.note && (
                    <Text style={styles.recordNote}>{record.note}</Text>
                  )}
                </View>
              </View>
              <View style={styles.recordRight}>
                <Text style={styles.recordSource}>
                  {record.source === 'gps' ? '📍 自动' : '✏️ 手动'}
                </Text>
                {record.modifiedAt && (
                  <Text style={styles.recordModified}>已修改</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {renderModal(false)}
      {renderModal(true)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0f172a'},
  content: {padding: 20, paddingTop: 60},
  title: {fontSize: 24, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 20},
  quickAdd: {flexDirection: 'row', gap: 12, marginBottom: 20},
  quickButton: {flex: 1, padding: 14, borderRadius: 12, alignItems: 'center'},
  departureButton: {backgroundColor: '#7c2d12'},
  arrivalButton: {backgroundColor: '#14532d'},
  quickButtonText: {fontSize: 15, fontWeight: '600', color: '#f1f5f9'},
  emptyState: {alignItems: 'center', marginTop: 60},
  emptyEmoji: {fontSize: 48, marginBottom: 16},
  emptyText: {fontSize: 18, color: '#94a3b8', fontWeight: '600'},
  emptySubtext: {fontSize: 14, color: '#64748b', marginTop: 8},
  recordCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  recordLeft: {flexDirection: 'row', alignItems: 'center'},
  recordEmoji: {fontSize: 28, marginRight: 12},
  recordType: {fontSize: 16, fontWeight: '600', color: '#f1f5f9'},
  recordDate: {fontSize: 13, color: '#94a3b8', marginTop: 2},
  recordNote: {fontSize: 12, color: '#64748b', marginTop: 4},
  recordRight: {alignItems: 'flex-end'},
  recordSource: {fontSize: 12, color: '#94a3b8'},
  recordModified: {fontSize: 11, color: '#f59e0b', marginTop: 4},
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {fontSize: 20, fontWeight: 'bold', color: '#f1f5f9', marginBottom: 20},
  typeSelector: {flexDirection: 'row', gap: 12, marginBottom: 16},
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  typeButtonActive: {backgroundColor: '#3b82f6'},
  typeButtonText: {fontSize: 15, color: '#94a3b8', fontWeight: '500'},
  typeButtonTextActive: {color: '#fff'},
  datePickerButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerText: {fontSize: 16, color: '#f1f5f9'},
  noteInput: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#f1f5f9',
    marginBottom: 16,
  },
  editHistory: {fontSize: 12, color: '#f59e0b', marginBottom: 16},
  modalButtons: {flexDirection: 'row', gap: 12},
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  cancelButtonText: {fontSize: 15, color: '#94a3b8', fontWeight: '500'},
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#3b82f6',
  },
  saveButtonText: {fontSize: 15, color: '#fff', fontWeight: '600'},
});
