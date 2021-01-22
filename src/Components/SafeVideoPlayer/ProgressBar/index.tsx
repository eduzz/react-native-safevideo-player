import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface IProps {
  currentTime: number;
  duration: number;
  onTouchStart?: () => void;
  onSeek?: (seekTo: number) => void;
  progressBarColor?: string;
}

const ProgressBar = ({ currentTime, duration, progressBarColor = '#FEC92D', onTouchStart, onSeek }: IProps) => {
  const [localTime, setLocalTime] = useState(currentTime);

  useEffect(() => setLocalTime(currentTime), [currentTime]);

  const handleValueChange = (value: number) => {
    setLocalTime(value);
  };

  return (
    <Slider
      style={styles.slider}
      value={localTime}
      onTouchStart={onTouchStart}
      onValueChange={handleValueChange}
      onSlidingComplete={onSeek}
      minimumValue={0}
      maximumValue={duration}
      minimumTrackTintColor={progressBarColor}
      thumbTintColor={progressBarColor}
      maximumTrackTintColor='#424242'
    />
  );
};

const styles = StyleSheet.create({
  slider: {
    width: '100%', 
    height: 30
  }
});

export default ProgressBar;