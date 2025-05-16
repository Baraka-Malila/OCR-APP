import React, { FC } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

// List of commonly used Ionicons that can be referenced:
/*
  Common Ionicons names you can use:
  - "camera" - for camera/scanning functions
  - "image" - for image/photo functions
  - "document-text" - for document functions
  - "time-outline" - for history functions
  - "settings-outline" - for settings
  - "save-outline" - for save functions
  - "share-outline" - for sharing
  - "trash-outline" - for delete functions
  - "search" - for search functions
  - "copy-outline" - for copy functions
  - "folder-outline" - for folder/directory functions
  - "download-outline" - for download functions
  - "cloud-upload-outline" - for upload functions
*/

const CustomButton: FC<CustomButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style,
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && <Ionicons name={icon} size={24} color="white" style={styles.icon} />}
      <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#3498db',
    width: '100%',
    maxWidth: 280,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  disabledText: {
    color: '#888888',
  },
});

export default CustomButton;