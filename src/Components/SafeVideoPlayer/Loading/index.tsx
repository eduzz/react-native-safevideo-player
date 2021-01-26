import React, { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet } from 'react-native';
import loadingImage from '../../../Assets/loading.png';

const Loading = () => {
  const [spinValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(
        spinValue,
        {
         toValue: 1,
         duration: 1000,
         easing: Easing.linear,
         useNativeDriver: true
        }
      )
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <Animated.Image style={[styles.loadingIcon, {transform: [{rotate: spin}] }]} source={loadingImage} />
  );
};

const styles = StyleSheet.create({
  loadingIcon: {
    width: 30,
    height: 30
  }
});

export default Loading;