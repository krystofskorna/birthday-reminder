import { memo, useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettings } from '@/contexts/SettingsContext';
import * as Localization from 'expo-localization';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onComplete: () => void;
}

interface Step {
  icon: keyof typeof Feather.glyphMap;
  titleEn: string;
  titleCs: string;
  descriptionEn: string;
  descriptionCs: string;
  gradient: string[];
}

const steps: Step[] = [
  {
    icon: 'gift',
    titleEn: 'Welcome to Birthday Reminder!',
    titleCs: 'Vítejte v Birthday Reminder!',
    descriptionEn: 'Never forget a birthday again. Track birthdays, namedays, and special celebrations all in one place.',
    descriptionCs: 'Už nikdy nezapomeňte na narozeniny. Sledujte narozeniny, svátky a speciální oslavy na jednom místě.',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    icon: 'plus-circle',
    titleEn: 'Add Celebrations',
    titleCs: 'Přidejte oslavy',
    descriptionEn: 'Tap the + button to add birthdays, namedays, or custom events. Import from contacts or add manually.',
    descriptionCs: 'Klepněte na tlačítko + pro přidání narozenin, svátků nebo vlastních událostí. Importujte z kontaktů nebo přidejte ručně.',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    icon: 'bell',
    titleEn: 'Smart Reminders',
    titleCs: 'Chytrá připomenutí',
    descriptionEn: 'Get notified before important dates. Customize reminder timing for each celebration.',
    descriptionCs: 'Nechte si připomenout důležitá data. Přizpůsobte si čas připomenutí pro každou oslavu.',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    icon: 'check-square',
    titleEn: 'Checklists & Planning',
    titleCs: 'Checklisty a plánování',
    descriptionEn: 'Create checklists for each celebration. Plan gifts, organize parties, and never miss a detail.',
    descriptionCs: 'Vytvářejte checklisty pro každou oslavu. Plánujte dárky, organizujte oslavy a nezapomeňte na žádný detail.',
    gradient: ['#43e97b', '#38f9d7'],
  },
  {
    icon: 'star',
    titleEn: 'Ready to Start!',
    titleCs: 'Připraveni začít!',
    descriptionEn: 'Add your first celebration and start celebrating the people who matter most.',
    descriptionCs: 'Přidejte svou první oslavu a začněte oslavovat lidi, na kterých vám záleží.',
    gradient: ['#fa709a', '#fee140'],
  },
];

export const OnboardingTutorial = memo(function OnboardingTutorial({ visible, onComplete }: Props) {
  const colors = useThemeColors();
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];
  
  // Auto-detect language from device locale or use settings
  const deviceLocale = Localization.locale || Localization.locales[0]?.languageCode || 'en';
  const isDeviceCzech = deviceLocale.startsWith('cs');
  const lang = settings.language || (isDeviceCzech ? 'cs' : 'en');
  
  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      slideAnim.setValue(50);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      // Fade out before completing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    } else {
      // Animate out current step
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -30,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
      });
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" transparent={false}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <LinearGradient
          colors={step.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Skip Button */}
          {!isLastStep && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>{lang === 'cs' ? 'Přeskočit' : 'Skip'}</Text>
            </TouchableOpacity>
          )}

          {/* Content */}
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
              },
            ]}
          >
            {/* Icon */}
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Feather name={step.icon} size={72} color="#FFFFFF" />
            </Animated.View>

            {/* Title */}
            <Animated.Text 
              style={[
                styles.title,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {lang === 'cs' ? step.titleCs : step.titleEn}
            </Animated.Text>

            {/* Description */}
            <Animated.Text 
              style={[
                styles.description,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              {lang === 'cs' ? step.descriptionCs : step.descriptionEn}
            </Animated.Text>

            {/* Progress Dots */}
            <View style={styles.dotsContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                  ]}
                />
              ))}
            </View>

            {/* Next Button */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.9}>
                <Text style={styles.nextButtonText}>
                  {isLastStep
                    ? lang === 'cs'
                      ? 'Začít'
                      : 'Get Started'
                    : lang === 'cs'
                    ? 'Další'
                    : 'Next'}
                </Text>
                <Feather
                  name={isLastStep ? 'check' : 'arrow-right'}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontSize: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 60,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 30,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

