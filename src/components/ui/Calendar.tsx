import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import dayjs from 'dayjs';

type CalendarProps = {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  style?: ViewStyle | ViewStyle[];
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function Calendar({ selectedDate, onDateChange, style }: CalendarProps) {
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const startOfMonth = currentMonth.startOf('month');
  const startDay = startOfMonth.day();
  const daysInMonth = currentMonth.daysInMonth();

  const getCalendarDays = () => {
    const days: { date: dayjs.Dayjs; isOutside: boolean }[] = [];
    const prevMonth = currentMonth.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = 0; i < startDay; i++) {
      const day = prevMonthDays - startDay + i + 1;
      const date = prevMonth.date(day);
      days.push({
        date,
        isOutside: true,
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.date(day);
      days.push({
        date,
        isOutside: false,
      });
    }
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const day = i - days.length + 1;
      const date = currentMonth.add(1, 'month').date(day);
      days.push({
        date,
        isOutside: true,
      });
    }
    return days;
  };

  const calendarDays = getCalendarDays();

  const handlePrev = () => setCurrentMonth(prev => prev.subtract(1, 'month'));
  const handleNext = () => setCurrentMonth(prev => prev.add(1, 'month'));

  const getDayButtonStyle = (
    isToday: boolean,
    isSelected: boolean,
    isOutside: boolean
  ): ViewStyle[] => {
    let base: ViewStyle[] = [styles.dayButton];
    if (isToday) base.push(styles.bgAccent);
    if (isSelected) base.push(styles.bgPrimary);
    if (isOutside) base.push(styles.outsideDay);
    if (!isToday && !isSelected && !isOutside) base.push(styles.fgDefault);
    return base;
  };

  const getDayTextStyle = (
    isToday: boolean,
    isSelected: boolean,
    isOutside: boolean
  ): TextStyle[] => {
    let base: TextStyle[] = [styles.dayText];
    if (isToday) base.push(styles.accentText);
    if (isSelected) base.push(styles.primaryText);
    if (isOutside) base.push(styles.outsideDayText);
    if (!isToday && !isSelected && !isOutside) base.push(styles.fgDefaultText);
    return base;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={handlePrev}
        >
          <ChevronLeft size={16} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentMonth.format('MMMM YYYY')}
        </Text>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={handleNext}
        >
          <ChevronRight size={16} color="#64748b" />
        </TouchableOpacity>
      </View>
      {/* Day headers */}
      <View style={styles.dayHeadersRow}>
        {DAYS.map((day, idx) => (
          <Text
            key={idx}
            style={styles.dayHeader}
          >
            {day}
          </Text>
        ))}
      </View>
      {/* Days */}
      <View style={styles.daysGrid}>
        {calendarDays.map(({ date, isOutside }, idx) => {
          const isToday = date.isSame(today, 'day');
          const isSelected = selectedDate && dayjs(selectedDate).isSame(date, 'day');
          return (
            <TouchableOpacity
              key={date.format('YYYY-MM-DD')}
              disabled={isOutside}
              onPress={() => !isOutside && onDateChange?.(date.toDate())}
              style={getDayButtonStyle(!!isToday, !!isSelected, !!isOutside)}
              activeOpacity={isOutside ? 1 : 0.83}
            >
              <Text style={getDayTextStyle(!!isToday, !!isSelected, !!isOutside)}>
                {date.date()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#18181b',
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#f3f4f6', // muted
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  dayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b', // muted-foreground
    fontWeight: '600',
    paddingVertical: 2,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    // default background: transparent
  },
  bgAccent: {
    backgroundColor: '#facc15', // accent
  },
  accentText: {
    color: '#1e293b', // accent-foreground
    fontWeight: '700',
  },
  bgPrimary: {
    backgroundColor: '#0d9488', // primary
  },
  primaryText: {
    color: '#fff', // primary-foreground
    fontWeight: '700',
  },
  outsideDay: {
    opacity: 0.5,
    backgroundColor: 'transparent',
  },
  outsideDayText: {
    color: '#64748b', // muted-foreground
  },
  fgDefault: {
    backgroundColor: 'transparent',
  },
  fgDefaultText: {
    color: '#18181b', // text-foreground
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
