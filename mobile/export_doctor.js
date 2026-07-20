const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\yassi\\Documents\\mawidoc\\mobile';
const destDir = 'C:\\Users\\yassi\\Desktop\\mawidoc_doctor_app';

const excludeDirs = ['node_modules', '.git', 'build', '.gradle', 'Pods', 'patient', '.idea'];
const excludeFiles = ['patient.service.ts', 'PatientNavigator.tsx', 'PatientHomeScreen.tsx', 'DoctorProfileScreen.tsx', 'SlotSelectionScreen.tsx', 'export_doctor.js'];

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (excludeDirs.includes(entry.name)) continue;
      copyDir(srcPath, destPath);
    } else {
      if (excludeFiles.includes(entry.name)) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying files to Desktop...');
if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
copyDir(sourceDir, destDir);
console.log('Finished copying.');

console.log('Cleaning up Patient references in Navigation...');
const appNavPath = path.join(destDir, 'src', 'navigation', 'AppNavigator.tsx');
if (fs.existsSync(appNavPath)) {
  let content = fs.readFileSync(appNavPath, 'utf8');
  content = content.replace(/import.*?PatientNavigator.*?;\r?\n/g, '');
  content = content.replace(/<Stack\.Screen\s+name="Patient"\s+component=\{PatientNavigator\}\s*\/>/g, '');
  fs.writeFileSync(appNavPath, content, 'utf8');
}

console.log('Cleaning up Role Selection...');
const roleSelPath = path.join(destDir, 'src', 'features', 'auth', 'screens', 'RoleSelectionScreen.tsx');
if (fs.existsSync(roleSelPath)) {
  const newRoleSel = `import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ImageBackground } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { AuthStackParamList } from '../../../navigation/types';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { Colors } from '../../../shared/theme/colors';
import { Typography } from '../../../shared/theme/typography';
import { Spacing, Shadows, BorderRadius } from '../../../shared/theme/spacing';

// @ts-ignore
import LogoImg from '../../../assets/logo.jpg';
// @ts-ignore
import BgImg from '../../../assets/background.png';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'RoleSelection'> };

export function RoleSelectionScreen({ navigation }: Props) {
  return (
    <ImageBackground source={BgImg} style={styles.bgContainer}>
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={Colors.gradientHero} style={styles.hero}>
          <View style={styles.logoCard}>
            <Image source={LogoImg} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.prompt}>Welcome to MawiDOC</Text>
          <Text style={styles.subPrompt}>Doctor Portal</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Card style={styles.roleCard}>
            <View style={[styles.roleIconWrap, { backgroundColor: Colors.tintPrimary }]}>
              <Text style={styles.roleIcon}>{"\\uD83E\\uDE7A"}</Text>
            </View>
            <Text style={styles.roleTitle}>I am a Doctor</Text>
            <Text style={styles.roleDesc}>Manage your clinic and patients</Text>
            <Button
              title="Continue to Login"
              variant="secondary"
              onPress={() => navigation.navigate('Login', { role: 'DOCTOR' })}
              style={styles.button}
            />
          </Card>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: 'transparent' },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Shadows.xl,
  },
  logoCard: {
    width: 108,
    height: 108,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.xl,
  },
  logo: { width: 80, height: 80 },
  prompt: { ...Typography.h2, color: Colors.white, textAlign: 'center', marginBottom: Spacing.xs },
  subPrompt: { ...Typography.body, color: Colors.accentLight, textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: Spacing.xxxl, paddingTop: Spacing.xl, gap: Spacing.lg },
  roleCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  roleIconWrap: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  roleIcon: { fontSize: 40 },
  roleTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.xs },
  roleDesc: { ...Typography.body, color: Colors.textSecondary, marginBottom: Spacing.xl, textAlign: 'center' },
  button: { width: '100%' },
});
`;
  fs.writeFileSync(roleSelPath, newRoleSel, 'utf8');
}

console.log('Export complete! Tell the user it is ready.');
