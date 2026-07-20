import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Spacing } from '../../../shared/theme/spacing';
import { Typography } from '../../../shared/theme/typography';
import { authService } from '../../../services/auth.service';
import { useTranslation } from 'react-i18next';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'> };

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await authService.forgotPassword(email);
      navigation.navigate('OTPReset', { email });
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to send reset code';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('auth.forgotPasswordTitle', 'Forgot Password')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Card style={styles.formCard}>
              <Text style={styles.instructions}>
                {t('auth.forgotPasswordInstructions', 'Enter the email address associated with your account. We will send you a 4-digit verification code to reset your password.')}
              </Text>
              
              <Input 
                label={t('auth.email', 'Email')} 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none"
                error={error} 
              />
              
              <Button title={t('auth.sendCode', 'Send Code')} onPress={handleSendCode} loading={loading} style={styles.actionBtn} />
            </Card>
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
  instructions: {
    ...Typography.body,
    color: colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionBtn: {
    marginTop: Spacing.lg,
  },
});
