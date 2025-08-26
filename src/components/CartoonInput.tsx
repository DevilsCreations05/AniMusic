import React, {useState} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';

interface CartoonInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const CartoonInput: React.FC<CartoonInputProps> = ({
  label,
  error,
  onFocus,
  onBlur,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.labelUnderline} />
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedContainer,
          error && styles.errorContainer,
        ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#808080"
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {isFocused && <View style={styles.focusAccent} />}
      </View>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>! {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelUnderline: {
    flex: 1,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginLeft: 10,
    opacity: 0.3,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#000000',
    position: 'relative',
  },
  focusedContainer: {
    borderColor: '#333333',
    backgroundColor: '#F0F0F0',
  },
  errorContainer: {
    borderColor: '#FF0000',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  focusAccent: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 15,
    height: 15,
    backgroundColor: '#000000',
    borderRadius: 7.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  errorBox: {
    backgroundColor: '#FF0000',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});