import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IProps {
  title: string;
  iconElement?: any;
  iconImage?: any;
  color?: string;
  onPress?: () => void;
}

const OptionItem = ({ title, iconImage, iconElement, color, onPress }: IProps) => {
  const handlePress = () => {
    setTimeout(() => {
      onPress && onPress();
    }, 300);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <View style={styles.icon}>
          {iconElement}
        </View>
        {!!iconImage && <Image style={[styles.icon, { tintColor: color }]} source={iconImage || null} />}
        <Text style={[styles.title, { color }]} numberOfLines={1}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18
  },
  icon: {
    flex: 0,
    width: 25,
    height: 25,
    marginRight: 32
  },
  title: {
    flex: 1,
    color: '#000',
    fontSize: 16
  }
});

export default OptionItem;