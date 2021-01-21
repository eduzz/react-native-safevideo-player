import React, { useEffect, useState } from 'react';
import { Dimensions, GestureResponderEvent, StyleSheet, View } from 'react-native';

interface IProps {
  currentTime: number;
  duration: number;
  onTouchStart?: () => void;
  onSeek?: (seekTo: number) => void;
  progressBarColor?: string;
}

const ProgressBar = ({ currentTime, duration, progressBarColor, onTouchStart, onSeek }: IProps) => {
  const [dragging, setDragging] = useState(false);
  const [localTime, setLocalTime] = useState(currentTime);

  useEffect(() => setLocalTime(currentTime), [currentTime]);

  const progress = ((localTime / duration) || 0) * 100;

  const _onTouchStart = () => {
    setDragging(true);
    onTouchStart && onTouchStart();
  };

  const _onTouchMove = (event: GestureResponderEvent) => {
    setLocalTime(getTimeByTouchPosition(event.nativeEvent.pageX));
  };

  const _onTouchEnd = (event: GestureResponderEvent) => {
    setDragging(false);
    onSeek && onSeek(getTimeByTouchPosition(event.nativeEvent.pageX));
  };

  const getTimeByTouchPosition = (pageX: number) => {
    return (pageX / Dimensions.get('window').width) * duration;
  };

  return (
    <View style={styles.container} onTouchStart={_onTouchStart} onTouchMove={_onTouchMove} onTouchEnd={_onTouchEnd}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { backgroundColor: progressBarColor || '#FEC92D', width: `${progress}%` }]}>
          <View style={[styles.dot, { backgroundColor: progressBarColor || '#FEC92D' }, dragging && styles.dotDragging]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 50
  },
  progressBar: {
    width: '100%',
    height: 5,
    backgroundColor: '#424242',
  },
  progress: {
    position: 'absolute',
    width: '20%',
    height: 5,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  dot: {
    position: 'absolute',
    right: -7,
    width: 14,
    height: 14,
    borderRadius: 7
  },
  dotDragging: {
    width: 20,
    height: 20,
    borderRadius: 10
  }
});

export default ProgressBar;