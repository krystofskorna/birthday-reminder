import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/contexts/SettingsContext';

interface Props {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}

const screenHeight = Dimensions.get('window').height;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function getMonths(language: 'en' | 'cs'): string[] {
  if (language === 'cs') {
    return [
      'Leden',
      'Únor',
      'Březen',
      'Duben',
      'Květen',
      'Červen',
      'Červenec',
      'Srpen',
      'Září',
      'Říjen',
      'Listopad',
      'Prosinec',
    ];
  }
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function generateYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear - 100; i <= currentYear + 100; i++) {
    years.push(i);
  }
  return years;
}

interface WheelPickerProps {
  items: (string | number)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  width: number;
  initialScroll?: boolean;
}

function WheelPicker({ items, selectedIndex, onSelect, width, initialScroll }: WheelPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const colors = useThemeColors();
  const [isScrolling, setIsScrolling] = useState(false);
  const lastSelectedIndexRef = useRef(selectedIndex);
  const hasInitializedRef = useRef(false);

  // Initial scroll to position when modal becomes visible
  useEffect(() => {
    if (initialScroll && scrollViewRef.current && !hasInitializedRef.current) {
      const paddingCount = 3;
      const offsetY = (selectedIndex + paddingCount) * ITEM_HEIGHT;
      // Small delay to ensure ScrollView is fully rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: offsetY, animated: false });
        hasInitializedRef.current = true;
        lastSelectedIndexRef.current = selectedIndex;
      }, 150);
    } else if (!initialScroll) {
      // Reset when modal closes
      hasInitializedRef.current = false;
    }
  }, [initialScroll, selectedIndex]);

  // Update scroll position when selectedIndex changes (but not during user scrolling)
  useEffect(() => {
    if (!isScrolling && scrollViewRef.current && hasInitializedRef.current) {
      // Ensure selectedIndex is within valid range
      const validIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));
      if (lastSelectedIndexRef.current !== validIndex) {
        const paddingCount = 3;
        const offsetY = (validIndex + paddingCount) * ITEM_HEIGHT;
        // Use animated scroll for smoother transitions when programmatically changing
        scrollViewRef.current.scrollTo({ y: offsetY, animated: true });
        lastSelectedIndexRef.current = validIndex;
      }
    }
  }, [selectedIndex, isScrolling, items.length]);

  const handleScroll = (event: any) => {
    const paddingCount = 3;
    const y = event.nativeEvent.contentOffset.y;
    const minScroll = paddingCount * ITEM_HEIGHT;
    const maxScroll = (items.length - 1 + paddingCount) * ITEM_HEIGHT;
    
    // Clamp scroll position to valid range (prevent scrolling into empty padding)
    // Only enforce if significantly beyond bounds to avoid janky behavior
    if (y < minScroll - 5) {
      scrollViewRef.current?.scrollTo({ y: minScroll, animated: false });
    } else if (y > maxScroll + 5) {
      scrollViewRef.current?.scrollTo({ y: maxScroll, animated: false });
    }
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const handleScrollEndDrag = (event: any) => {
    // Don't snap immediately - let momentum continue naturally
    setIsScrolling(true);
  };

  const handleMomentumScrollEnd = (event: any) => {
    const paddingCount = 3;
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT) - paddingCount;
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    // Smoothly snap to the nearest item
    scrollViewRef.current?.scrollTo({
      y: (clampedIndex + paddingCount) * ITEM_HEIGHT,
      animated: true,
    });
    
    // Update selection after animation completes
    setTimeout(() => {
      setIsScrolling(false);
      if (clampedIndex !== selectedIndex) {
        onSelect(clampedIndex);
      }
    }, 200);
  };

  const handleItemPress = (actualIndex: number) => {
    if (actualIndex < 0 || actualIndex >= items.length) return;
    
    setIsScrolling(true);
    const paddingCount = 3;
    const offsetY = (actualIndex + paddingCount) * ITEM_HEIGHT;
    
    scrollViewRef.current?.scrollTo({
      y: offsetY,
      animated: true,
    });
    
    // Update selection after scroll animation
    setTimeout(() => {
      setIsScrolling(false);
      if (actualIndex !== selectedIndex) {
        onSelect(actualIndex);
      }
    }, 300);
  };

  const paddingCount = 3; // Increased padding to ensure all items are accessible
  const paddedItems = [
    ...Array(paddingCount).fill(null),
    ...items,
    ...Array(paddingCount).fill(null),
  ];

  return (
    <View style={[styles.wheelContainer, { width }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.wheelScroll}
        contentContainerStyle={styles.wheelContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="normal"
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
        scrollEnabled={true}
      >
        {paddedItems.map((item, index) => {
          const actualIndex = index - paddingCount;
          const isSelected = actualIndex === selectedIndex && item !== null;
          const isValidItem = actualIndex >= 0 && actualIndex < items.length;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.wheelItem}
              onPress={() => isValidItem && handleItemPress(actualIndex)}
              activeOpacity={0.7}
              disabled={!isValidItem}
            >
              <Text
                style={[
                  styles.wheelItemText,
                  {
                    color: isSelected ? colors.textPrimary : colors.textSecondary,
                    fontSize: isSelected ? 22 : 18,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {item ?? ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.selectionIndicator, { borderColor: `${colors.primaryAccent}33` }]} pointerEvents="none" />
    </View>
  );
}

export function DatePickerModal({ visible, initialDate, onClose, onSelect }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  const { settings } = useSettings();
  
  // Initialize with today's date
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  
  const wasVisibleRef = useRef(false);
  const months = getMonths(settings.language);

  // Reset to today's date when modal opens
  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      // Modal just opened - always start with today's date
      const now = new Date();
      setSelectedDay(now.getDate());
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
      wasVisibleRef.current = true;
    } else if (!visible) {
      // Modal closed - reset flag
      wasVisibleRef.current = false;
    }
  }, [visible]);

  // Adjust day safely when month/year changes
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = generateYears();
  const yearIndex = years.indexOf(selectedYear);
  
  // Force re-initialization of day picker when days array changes
  const [dayPickerKey, setDayPickerKey] = useState(0);
  useEffect(() => {
    // Increment key to force remount when days array changes
    setDayPickerKey(prev => prev + 1);
  }, [daysInMonth]);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    onSelect(date);
    onClose();
  };

  const currentDate = new Date(selectedYear, selectedMonth, selectedDay);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t('cancel')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('selectDate')}</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.doneButton}>
            <Text style={[styles.doneText, { color: colors.primaryAccent }]}>{t('done')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <WheelPicker
            key={`day-${dayPickerKey}`}
            items={days}
            selectedIndex={selectedDay - 1}
            onSelect={(index) => setSelectedDay(index + 1)}
            width={80}
            initialScroll={visible}
          />
          <WheelPicker
            items={months}
            selectedIndex={selectedMonth}
            onSelect={setSelectedMonth}
            width={140}
            initialScroll={visible}
          />
          <WheelPicker
            items={years}
            selectedIndex={yearIndex >= 0 ? yearIndex : Math.floor(years.length / 2)}
            onSelect={(index) => setSelectedYear(years[index])}
            width={100}
            initialScroll={visible}
          />
        </View>

        <View style={styles.previewContainer}>
          <Text style={[styles.previewText, { color: colors.textSecondary }]}>
            {currentDate.toLocaleDateString(settings.language === 'cs' ? 'cs-CZ' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '400',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: WHEEL_HEIGHT,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  wheelContainer: {
    height: WHEEL_HEIGHT,
    position: 'relative',
  },
  wheelScroll: {
    flex: 1,
  },
  wheelContent: {
    paddingTop: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    paddingBottom: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    textAlign: 'center',
  },
  selectionIndicator: {
    position: 'absolute',
    top: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  previewContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 15,
    textAlign: 'center',
  },
});
