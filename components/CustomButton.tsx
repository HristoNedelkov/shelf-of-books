import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Colors } from 'react-native-ui-lib';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
  icon?: React.ReactNode;
  style?: any;
}

export function CustomButton({
  label,
  onPress,
  backgroundColor = Colors.blue30,
  icon,
  style,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {icon}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
