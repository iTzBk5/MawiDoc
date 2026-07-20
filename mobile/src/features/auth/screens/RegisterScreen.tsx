import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';
import { DropdownPicker } from '../../../shared/components/DropdownPicker';

const ALGERIAN_WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
  'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
  'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa'
];

const AGES = Array.from({ length: 83 }, (_, i) => (i + 18).toString());

import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Typography } from '../../../shared/theme/typography';
import { BorderRadius, Spacing, Shadows } from '../../../shared/theme/spacing';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../store/auth.store';
import { authService, RegisterData } from '../../../services/auth.service';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '', password: '', age: '', gender: 'MALE' as 'MALE' | 'FEMALE', city: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full Name is required';
    
    if (!form.username.trim()) nextErrors.username = 'Username is required';
    else if (form.username.length < 3) nextErrors.username = 'Username must be at least 3 characters';
    
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    
    if (!form.password) nextErrors.password = 'Password is required';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    
    if (!form.age.trim()) nextErrors.age = 'Age is required';
    else if (isNaN(Number(form.age)) || Number(form.age) <= 0) nextErrors.age = 'Enter a valid age';
    
    if (!form.city.trim()) nextErrors.city = 'City is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data: RegisterData = { ...form, age: parseInt(form.age, 10) };
      const result = await authService.register(data);
      navigation.navigate('OTPVerification', { email: form.email });
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Registration failed';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('auth.registerTitle')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Card style={styles.formCard}>
              <Input label={t('auth.fullName')} value={form.fullName} onChangeText={(v) => update('fullName', v)} autoCapitalize="words" error={errors.fullName} />
              <Input label={t('auth.username')} value={form.username} onChangeText={(v) => update('username', v)} autoCapitalize="none" error={errors.username} />
              <Input label={t('auth.email')} value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <Input label={t('auth.phone')} value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" error={errors.phone} />
              <Input label={t('auth.password')} value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry error={errors.password} />
              <DropdownPicker 
                label={t('auth.age')} 
                value={form.age} 
                options={AGES} 
                onSelect={(v) => update('age', v)} 
                error={errors.age} 
                placeholder={t('auth.selectAge', 'Select age')}
              />

              <Text style={styles.label}>{t('auth.gender')}</Text>
              <View style={styles.segmented}>
                <TouchableOpacity
                  style={[styles.segment, form.gender === 'MALE' && styles.segmentActive]}
                  onPress={() => update('gender', 'MALE')}
                  activeOpacity={0.8}>
                  <Text style={[styles.segmentText, form.gender === 'MALE' && styles.segmentTextActive]}>{t('auth.male')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segment, form.gender === 'FEMALE' && styles.segmentActive]}
                  onPress={() => update('gender', 'FEMALE')}
                  activeOpacity={0.8}>
                  <Text style={[styles.segmentText, form.gender === 'FEMALE' && styles.segmentTextActive]}>{t('auth.female')}</Text>
                </TouchableOpacity>
              </View>

              <DropdownPicker 
                label={t('auth.city')} 
                value={form.city} 
                options={ALGERIAN_WILAYAS} 
                onSelect={(v) => update('city', v)} 
                error={errors.city} 
                placeholder={t('auth.selectWilaya', 'Select wilaya')}
              />
              <Button title={t('auth.registerButton')} onPress={handleRegister} loading={loading} style={styles.registerBtn} />
            </Card>

            <View style={styles.linkRow}>
              <Text style={styles.linkText}>{t('auth.hasAccount')} </Text>
              <Text style={styles.link} onPress={() => navigation.goBack()}>{t('auth.login')}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl },
  formCard: { padding: Spacing.xl },
  label: {
    ...Typography.label,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BorderRadius.md - 4,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    ...Shadows.sm,
  },
  segmentText: {
    ...Typography.label,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  registerBtn: {
    marginTop: Spacing.sm,
  },
  linkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  linkText: { ...Typography.body, color: colors.textSecondary },
  link: { ...Typography.bodyBold, color: colors.accent },
});