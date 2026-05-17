import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const SLIDES = [
  {
    icon: 'color-wand-outline' as const,
    title: 'Edit Like a Pro',
    subtitle: 'Brightness, contrast, hue, blur, vignette — every tool you need in one place.',
    color: '#6366f1',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'AI-Powered',
    subtitle: 'Claude AI generates captions, smart enhancements, and object recognition instantly.',
    color: '#a855f7',
  },
  {
    icon: 'cloud-upload-outline' as const,
    title: 'Export Anywhere',
    subtitle: 'Save in JPEG, PNG, or WebP. Share to any app or back up to the cloud.',
    color: '#0ea5e9',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);

  function goToSignIn() {
    router.push('/(auth)/sign-in');
  }

  function handleNext() {
    if (pageIndex < SLIDES.length - 1) {
      const next = pageIndex + 1;
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
      setPageIndex(next);
    } else {
      goToSignIn();
    }
  }

  function handleScroll(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(idx);
  }

  const isLast = pageIndex === SLIDES.length - 1;

  return (
    <LinearGradient colors={['#0f0f0f', '#1a0a2e']} style={{ flex: 1 }}>
      <StatusBar style="light" />

      {/* Skip */}
      <TouchableOpacity
        onPress={goToSignIn}
        style={{ position: 'absolute', top: 56, right: 24, zIndex: 10 }}
      >
        <Text style={{ color: '#a3a3a3', fontSize: 15 }}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View
            key={i}
            style={{ width, flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
          >
            <View
              style={{
                width: 100, height: 100, borderRadius: 50,
                backgroundColor: slide.color + '22',
                alignItems: 'center', justifyContent: 'center', marginBottom: 32,
              }}
            >
              <Ionicons name={slide.icon} size={48} color={slide.color} />
            </View>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>
              {slide.title}
            </Text>
            <Text style={{ color: '#a3a3a3', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
              {slide.subtitle}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Page dots */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === pageIndex ? 20 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === pageIndex ? '#6366f1' : '#444',
            }}
          />
        ))}
      </View>

      {/* CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 48, gap: 12 }}>
        <TouchableOpacity
          onPress={handleNext}
          style={{ backgroundColor: '#6366f1', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
            {isLast ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
        {isLast && (
          <TouchableOpacity
            onPress={goToSignIn}
            style={{ alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ color: '#a3a3a3', fontSize: 14 }}>Sign in to existing account</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}
