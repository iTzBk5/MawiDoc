import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Card } from '../../../shared/components/Card';
import { Header } from '../../../shared/components/Header';
import { ThemeColors } from '../../../shared/theme/colors';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useStyles } from '../../../shared/theme/useStyles';
import { Spacing, BorderRadius } from '../../../shared/theme/spacing';
import { Typography } from '../../../shared/theme/typography';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
  route: RouteProp<AuthStackParamList, 'OTPVerification'>;
};

export function OTPVerificationScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { email } = route.params;
  const { setAuth } = useAuthStore();
  const { t } = useTranslation();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 4) {
      setError(t('auth.enter4DigitCode', 'Please enter a 4-digit code'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.verifyEmail(email, code);
      await setAuth(result.token, result.user);
      
      // Refresh FCM token
      const { getFCMToken } = require('../../../shared/utils/fcm');
      getFCMToken().catch(() => {});
      
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Verification failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('auth.emailVerification', 'Email Verification')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Card style={styles.formCard}>
              <Text style={styles.instructions}>
                {t('auth.verificationInstructions', "We've sent a 4-digit verification code to")} <Text style={styles.emailText}>{email}</Text>. {t('auth.enterBelow', 'Please enter it below.')}
              </Text>
              
              <Input 
                label={t('auth.verificationCode', 'Verification Code')} 
                value={code} 
                onChangeText={setCode} 
                keyboardType="number-pad" 
                maxLength={4}
                error={error} 
              />
              
              <Button title={t('auth.verify', 'Verify')} onPress={handleVerify} loading={loading} style={styles.verifyBtn} />
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
  emailText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  verifyBtn: {
    marginTop: Spacing.lg,
  },
});
