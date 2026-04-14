import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  maxDate?: Date;
  minDate?: Date;
}

export default function DateSelector({value, onChange, maxDate, minDate}: Props) {
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth() + 1);
  const [day, setDay] = useState(value.getDate());

  const currentYear = (maxDate || new Date()).getFullYear();
  const startYear = minDate ? minDate.getFullYear() : currentYear - 30;

  const years = Array.from({length: currentYear - startYear + 1}, (_, i) => currentYear - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  useEffect(() => {
    // Clamp day if month changed
    const maxDay = new Date(year, month, 0).getDate();
    const clampedDay = Math.min(day, maxDay);
    const newDate = new Date(year, month - 1, clampedDay);

    // Clamp to maxDate
    if (maxDate && newDate > maxDate) {
      setYear(maxDate.getFullYear());
      setMonth(maxDate.getMonth() + 1);
      setDay(maxDate.getDate());
      onChange(maxDate);
      return;
    }

    if (clampedDay !== day) setDay(clampedDay);
    onChange(newDate);
  }, [year, month, day]);

  const renderColumn = (
    items: number[],
    selected: number,
    onSelect: (v: number) => void,
    label: string,
    format?: (v: number) => string,
  ) => (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <TouchableOpacity
            key={item}
            style={[styles.item, item === selected && styles.itemSelected]}
            onPress={() => onSelect(item)}>
            <Text style={[styles.itemText, item === selected && styles.itemTextSelected]}>
              {format ? format(item) : item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.selectedDisplay}>
        <Text style={styles.selectedText}>
          {year}年{month}月{day}日
        </Text>
      </View>
      <View style={styles.columns}>
        {renderColumn(years, year, setYear, '年')}
        {renderColumn(months, month, setMonth, '月', v => `${v}月`)}
        {renderColumn(days, day, setDay, '日', v => `${v}日`)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  selectedDisplay: {
    backgroundColor: '#334155',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedText: {fontSize: 20, fontWeight: 'bold', color: '#60a5fa'},
  columns: {
    flexDirection: 'row',
    gap: 8,
    height: 200,
  },
  column: {flex: 1},
  columnLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '600',
  },
  scrollView: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  itemSelected: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  itemText: {fontSize: 15, color: '#94a3b8'},
  itemTextSelected: {color: '#fff', fontWeight: '600'},
});
