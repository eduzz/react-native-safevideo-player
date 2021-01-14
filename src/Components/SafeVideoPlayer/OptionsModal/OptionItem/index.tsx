import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface IProps {
  iconImage: any;
  title: string;
  color?: string;
  onPress?: () => void;
}

const OptionItem = ({ iconImage, color,  title, onPress }: IProps) => {
  return (
    <TouchableOpacity onPress={onPress && onPress}>
      <View style={styles.container}>
        <Image style={[styles.iconImage, { tintColor: color }]} source={iconImage} />
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