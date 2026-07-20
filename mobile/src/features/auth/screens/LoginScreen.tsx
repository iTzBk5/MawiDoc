import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Stethoscope, User } from 'lucide-react-native';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, BorderRadius, Shadows } from '../../../shared/theme/spacing';
import { useAuthStore } from '../../../store/auth.store';
import { authService } from '../../../services/auth.service';

// @ts-ignore
import LogoImg from '../../../assets/logo-removebg-preview.png';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
  route: RouteProp<AuthStackParamList, 'Login'>;
};

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

// Icon + copy per role. Add a row here if a third role ever shows up.
const ROLE_CONFIG: Record<'DOCTOR' | 'PATIENT', { label: string; Icon: IconComponent }> = {
  DOCTOR: { label: 'Doctor Login', Icon: Stethoscope },
  PATIENT: { label: 'Patient Login', Icon: User },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { role } = route.params;
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const roleConfig = ROLE_CONFIG[role];
  const RoleIcon = roleConfig.Icon;

  // Quiet entrance for the form card — short and small so it's felt, not watched.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      nextErrors.password = 'Password is required';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      
      if (role === 'DOCTOR' && result.user.role !== 'DOCTOR' && result.user.role !== 'CLINIC') {
        Alert.alert('Error', `This account is not a doctor or clinic`);
        setLoading(false);
        return;
      } else if (role === 'PATIENT' && result.user.role !== 'PATIENT') {
        Alert.alert('Error', `This account is not a patient`);
        setLoading(false);
        return;
      }
      
      await setAuth(result.token, result.user);
      
      // After successful login, refresh FCM token
      const { getFCMToken } = require('../../../shared/utils/fcm');
      getFCMToken().catch(() => {});
      
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Login failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <LinearGradient colors={colors.gradientHero} style={styles.header}>
            <View style={styles.decorCircleLarge} pointerEvents="none" />
            <View style={styles.decorCircleSmall} pointerEvents="none" />

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={colors.white} strokeWidth={2.5} />
            </TouchableOpacity>

            <View style={styles.logoCard}>
              <Image source={LogoImg} style={styles.logo} resizeMode="contain" />
            </View>

            <Text style={styles.title}>{t('auth.loginTitle')}</Text>
            <Text style={styles.subtitle}>
              {role === 'PATIENT' ? t('patient.bookAppointment') : t('doctor.dashboard')}
            </Text>

            <View style={styles.rolePill}>
              <RoleIcon size={14} color={colors.white} strokeWidth={2.5} />
              <Text style={styles.rolePillText}>{role === 'PATIENT' ? t('auth.patient') : t('auth.doctor')}</Text>
            </View>
          </LinearGradient>

          <Animated.View
            style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            <Card style={styles.card}>
              <Input
                label={t('auth.email')}
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
                error={errors.email}
              />

              <Input
                label={t('auth.password')}
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
                rightIcon={
                  showPassword ? (
                    <EyeOff size={18} color={colors.textLight} />
                  ) : (
                    <Eye size={18} color={colors.textLight} />
                  )
                }
                onRightIconPress={() => setShowPassword((prev) => !prev)}
                error={errors.password}
              />

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotBtn}
                activeOpacity={0.7}
                accessibilityRole="button"
              >
                <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              <Button title={t('auth.loginButton')} onPress={handleLogin} loading={loading} style={styles.loginBtn} />

              {role === 'PATIENT' && (
                <View style={styles.linkRow}>
                  <Text style={styles.linkText}>{t('auth.noAccount')} </Text>
                  <Text style={styles.link} onPress={() => navigation.navigate('Register')} accessibilityRole="link">
                    {t('auth.register')}
                  </Text>
                </View>
              )}
            </Card>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    overflow: 'hidden',
  },
  // No matching theme tokens for these two — they're intentionally raw,
  // low-opacity white so they read as ambient texture, not decoration.
  decorCircleLarge: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircleSmall: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.overlayWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoCard: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: { ...Typography.h1, color: colors.white, marginBottom: 4 },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.sm,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayWhite,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  rolePillText: {
    ...Typography.captionBold,
    color: colors.white,
    marginLeft: 6,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    marginTop: -32,
    ...Shadows.xl,
  },
  card: {
    padding: Spacing.xl,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  forgotText: {
    ...Typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  linkText: { ...Typography.body, color: colors.textSecondary },
  link: { ...Typography.bodyBold, color: colors.primary },
});