import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

interface DropdownOption {
  label: string;
  value: string;
}

interface Props {
  label: string;
  options: DropdownOption[];
  value?: string;
  onSelect?: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  multiple?: boolean; // สำหรับเลือกหลายตัวเลือก
  selectedValues?: string[]; // สำหรับ multiple selection
  onSelectMultiple?: (values: string[]) => void;
}

export const Dropdown: React.FC<Props> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = 'เลือก...',
  helperText,
  multiple = false,
  selectedValues = [],
  onSelectMultiple,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);

  const handleOpen = () => {
    if (multiple) {
      setTempSelected([...selectedValues]);
    }
    setIsVisible(true);
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newSelected = tempSelected.includes(optionValue)
        ? tempSelected.filter((v) => v !== optionValue)
        : [...tempSelected, optionValue];
      setTempSelected(newSelected);
    } else {
      onSelect?.(optionValue);
      setIsVisible(false);
    }
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple) {
      onSelectMultiple(tempSelected);
    }
    setIsVisible(false);
  };

  const handleCancelMultiple = () => {
    setTempSelected([...selectedValues]);
    setIsVisible(false);
  };

  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        return options.find((opt) => opt.value === selectedValues[0])?.label || placeholder;
      }
      return `เลือกแล้ว ${selectedValues.length} รายการ`;
    }
    return options.find((opt) => opt.value === value)?.label || placeholder;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={handleOpen}>
        <Text style={[styles.dropdownText, !value && selectedValues.length === 0 && styles.placeholder]}>
          {getDisplayText()}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={() => setIsVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              {multiple && (
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={handleCancelMultiple}>
                    <Text style={styles.modalActionText}>ยกเลิก</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleConfirmMultiple}>
                    <Text style={[styles.modalActionText, styles.modalActionConfirm]}>ยืนยัน</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {options.map((option) => {
              const isSelected = multiple
                ? tempSelected.includes(option.value)
                : value === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.label}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.muted,
  },
  arrow: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: 8,
  },
  helper: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  modalActionText: {
    fontSize: 16,
    color: colors.muted,
  },
  modalActionConfirm: {
    color: colors.primary,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionSelected: {
    backgroundColor: '#f0f9f9',
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary,
    marginLeft: 8,
  },
});

