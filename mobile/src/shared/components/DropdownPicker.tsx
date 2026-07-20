import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import { Spacing, BorderRadius, Shadows } from '../theme/spacing';

interface DropdownPickerProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function DropdownPicker({ label, value, options, onSelect, error, placeholder }: DropdownPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.input, error && styles.inputError]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {value || placeholder || 'Select...'}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.optionItem, value === item && styles.optionItemActive]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, value === item && styles.optionTextActive]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: { ...Typography.label, color: Colors.textPrimary, marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  inputError: { borderColor: Colors.error },
  valueText: { ...Typography.body, color: Colors.textPrimary },
  placeholderText: { color: Colors.textSecondary },
  errorText: { ...Typography.caption, color: Colors.error, marginTop: Spacing.xs },
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.h3, color: Colors.textPrimary },
  closeBtn: { padding: Spacing.xs },
  closeBtnText: { ...Typography.bodyBold, color: Colors.primary },
  optionItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceMuted,
  },
  optionItemActive: { backgroundColor: Colors.surfaceMuted },
  optionText: { ...Typography.body, color: Colors.textPrimary },
  optionTextActive: { ...Typography.bodyBold, color: Colors.primary },
});
