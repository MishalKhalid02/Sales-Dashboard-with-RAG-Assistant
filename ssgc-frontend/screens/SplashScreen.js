import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../constants/colors';

export default function SplashScreen({ navigation }) {
  const iconTranslateY = useRef(new Animated.Value(-80)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const titleTranslateX = useRef(new Animated.Value(-60)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Icon drops from above and settles with a bounce, spinning a
    // quarter turn on the way down — a different feel from a plain fade.
    Animated.parallel([
      Animated.spring(iconTranslateY, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Title slides in from the left once the icon has landed
      Animated.timing(titleTranslateX, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }, 200);
    });

    // Three dots pulsing in sequence, looped — gives a "loading" feel
    // instead of a static pause before transitioning away.
    const pulseDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 350, useNativeDriver: true }),
        ])
      ).start();

    pulseDot(dot1, 0);
    pulseDot(dot2, 200);
    pulseDot(dot3, 400);

    const timer = setTimeout(async () => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(async () => {
        const token = await SecureStore.getItemAsync('authToken');
        navigation.replace(token ? 'SelectionPane' : 'Login');
      });
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '0deg'],
  });

  return (
    <Animated.View style={[styles.flex, { opacity: screenOpacity }]}>
      <LinearGradient
        colors={[colors.navyDeep, colors.ocean]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.iconCircle,
            { transform: [{ translateY: iconTranslateY }, { rotate: spin }] },
          ]}
        >
          <Ionicons name="bar-chart" size={44} color={colors.navyDeep} />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateX: titleTranslateX }] },
          ]}
        >
          SSGCL Sales Dashboard
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          AI Assistant
        </Animated.Text>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.arctic,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: { color: colors.arctic, fontSize: 22, fontWeight: '700' },
  subtitle: { color: colors.dusk, fontSize: 13, marginTop: 6 },
  dotsRow: { flexDirection: 'row', gap: 6, marginTop: 28 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.arctic },
});