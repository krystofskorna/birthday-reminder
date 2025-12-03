import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  visible: boolean;
  initialTime: string; // HH:mm
  onClose: () => void;
  onSelect: (time: string) => void;
}

const screenHeight = Dimensions.get('window').height;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

function getHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
}

function getMinutes(): string[] {
  return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
}

interface WheelPickerProps {
  items: string[];
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
  const paddingCount = (VISIBLE_ITEMS - 1) / 2;

  // Initial scroll to position when modal becomes visible
  useEffect(() => {
    if (initialScroll && scrollViewRef.current && !hasInitializedRef.current) {
      // Scroll to center the selected item
      const offsetY = selectedIndex * ITEM_HEIGHT;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: offsetY, animated: false });
        hasInitializedRef.current = true;
        lastSelectedIndexRef.current = selectedIndex;
      }, 50);
    } else if (!initialScroll) {
      hasInitializedRef.current = false;
    }
  }, [initialScroll, selectedIndex]);

  // Sync programmatic selection
  useEffect(() => {
    if (!isScrolling && scrollViewRef.current && hasInitializedRef.current) {
      const validIndex = Math.max(0, Math.min(selectedIndex, items.length - 1));
      if (lastSelectedIndexRef.current !== validIndex) {
        const offsetY = validIndex * ITEM_HEIGHT;
        scrollViewRef.current.scrollTo({ y: offsetY, animated: true });
        lastSelectedIndexRef.current = validIndex;
      }
    }
  }, [selectedIndex, isScrolling, items.length]);

  const handleMomentumScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (clampedIndex !== selectedIndex) {
      onSelect(clampedIndex);
    }
    setIsScrolling(false);
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
  };

  const handleScrollEndDrag = (event: any) => {
    setIsScrolling(true);
  };

  const handleItemPress = (actualIndex: number) => {
    if (actualIndex < 0 || actualIndex >= items.length) return;
    
    setIsScrolling(true);
    const offsetY = actualIndex * ITEM_HEIGHT;
    
    scrollViewRef.current?.scrollTo({
      y: offsetY,
      animated: true,
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      if (actualIndex !== selectedIndex) {
        onSelect(actualIndex);
      }
    }, 300);
  };

  return (
    <View style={[styles.wheelContainer, { width }]}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.wheelScroll}
        contentContainerStyle={styles.wheelContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        bounces={false}
      >
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.wheelItem}
              onPress={() => handleItemPress(index)}
              activeOpacity={0.7}
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

export function TimePickerModal({ visible, initialTime, onClose, onSelect }: Props) {
  const colors = useThemeColors();
  const t = useTranslation();
  
  const [initialHour, initialMinute] = initialTime.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(initialHour || 9);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute || 0);
  
  const wasVisibleRef = useRef(false);
  const hours = getHours();
  const minutes = getMinutes();

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      const [h, m] = initialTime.split(':').map(Number);
      setSelectedHour(h || 9);
      setSelectedMinute(m || 0);
      wasVisibleRef.current = true;
    } else if (!visible) {
      wasVisibleRef.current = false;
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const h = selectedHour.toString().padStart(2, '0');
    const m = selectedMinute.toString().padStart(2, '0');
    onSelect(`${h}:${m}`);
    onClose();
  };

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
          <Text style={[styles.title, { color: colors.textPrimary }]}>{t('time') || 'Time'}</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.doneButton}>
            <Text style={[styles.doneText, { color: colors.primaryAccent }]}>{t('done')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <WheelPicker
            items={hours}
            selectedIndex={selectedHour}
            onSelect={setSelectedHour}
            width={80}
            initialScroll={visible}
          />
          <Text style={[styles.separator, { color: colors.textPrimary }]}>:</Text>
          <WheelPicker
            items={minutes}
            selectedIndex={selectedMinute}
            onSelect={setSelectedMinute}
            width={80}
            initialScroll={visible}
          />
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
    maxHeight: screenHeight * 0.5,
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
  separator: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 10,
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
});
