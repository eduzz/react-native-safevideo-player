import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ANIMATION_DURATION } from '..';

interface IProps {
  title: string;
  iconImage?: any;
  color?: string;
  onPress?: () => void;
}

const OptionItem = ({ title, iconImage, color, onPress }: IProps) => {
  const handlePress = () => {
    setTimeout(() => {
      onPress && onPress();
    }, ANIMATION_DURATION + 200);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        <Image style={[styles.iconImage, { tintColor: color }]} source={iconImage || null} />
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
  iconImage: {
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