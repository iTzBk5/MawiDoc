import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
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
import { Spacing } from '../../../shared/theme/spacing';
import { authService } from '../../../services/auth.service';
import { useTranslation } from 'react-i18next';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'NewPassword'>;
  route: RouteProp<AuthStackParamList, 'NewPassword'>;
};

export function NewPasswordScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const styles = useStyles(createStyles);
  const { email, code } = route.params;
  const { t } = useTranslation();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const validate = () => {
    const nextErrors: any = {};
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setErrors({});
    
    try {
      await authService.resetPassword({ email, code, newPassword: password });
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('RoleSelection') }
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Failed to reset password';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('auth.newPasswordTitle', 'New Password')} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Card style={styles.formCard}>
              <Input 
                label={t('auth.password', 'Password')} 
                value={password} 
                onChangeText={(val) => {
                  setPassword(val);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                secureTextEntry
                error={errors.password} 
              />
              
              <Input 
                label={t('auth.confirmPassword', 'Confirm Password')} 
                value={confirmPassword} 
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
                secureTextEntry
                error={errors.confirmPassword} 
              />
              
              <Button title={t('auth.resetPasswordBtn', 'Reset Password')} onPress={handleReset} loading={loading} style={styles.actionBtn} />
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
  actionBtn: {
    marginTop: Spacing.lg,
  },
});
