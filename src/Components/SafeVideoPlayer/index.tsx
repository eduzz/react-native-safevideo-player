import React, { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Video, { OnLoadData, OnProgressData, VideoProperties } from 'react-native-video';
import playImage from '../../Assets/play.png';
import pauseImage from '../../Assets/pause.png';
import enterFullscreenImage from '../../Assets/enter-fullscreen.png';
import exitFullscreenImage from '../../Assets/exit-fullscreen.png';
import qualityImage from '../../Assets/quality.png';
import videoSpeedImage from '../../Assets/video-speed.png';
import optionsImage from '../../Assets/options.png';
import checkImage from '../../Assets/check.png';
import ProgressBar from './ProgressBar';
import OptionsModal from './OptionsModal';
import OptionItem from './OptionsModal/OptionItem';

export interface SafeVideoPlayerProps {
  title?: string;
  progressBarColor?: string;
  textColor?: string;
  backgroundColor?: string;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
}

const CONTROLS_DISPLAY_TIME = 4000;

const SafeVideoPlayer = (props: VideoProperties & SafeVideoPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [timeoutId, setTimeoutId] = useState<any>();
  const [videoInfo, setVideoInfo] = useState({ currentTime: 0, duration: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showingSettings, setShowingSettings] = useState(false);
  const [showingSpeedOptions, setShowingSpeedOptions] = useState(false);

  const videoRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { title, progressBarColor, textColor, backgroundColor, onEnterFullscreen, onExitFullscreen, ...videoProps } = props;

  const play = () => {
    setPlaying(true);
  };

  const pause = () => {
    setPlaying(false);
  };

  const setVideoRate = (_rate: number) => () => {
    setRate(_rate);
  };

  const enterFullscreen = () => {
    setFullscreen(true);
    onEnterFullscreen && onEnterFullscreen();
  };

  const exitFullscreen = () => {
    setFullscreen(false);
    onExitFullscreen && onExitFullscreen();
  };

  const onTouchStart = () => {
    clearTimeout(timeoutId);

    fadeControls(true);
  };

  const onTouchEnd = () => {
    setTimeoutId(
      setTimeout(() => {
        fadeControls(false);
      }, CONTROLS_DISPLAY_TIME)
    );
  };

  const fadeControls = (fadeIn: boolean) => {
    Animated.timing(
      fadeAnim,
      {
        toValue: fadeIn ? 1 : 0,
        duration: 200,
        useNativeDriver: true
      }
    ).start();

    setControlsEnabled(fadeIn);
  };

  const onLoad = (event: OnLoadData) => {
    setVideoInfo({
      currentTime: event.currentTime,
      duration: event.duration
    });
  };
  
  const onProgress = (data: OnProgressData) => {
    setVideoInfo({
      ...videoInfo,
      currentTime: data.currentTime,
    });
  };

  const onProgressTouchStart = () => {
    clearTimeout(timeoutId);
    setPlaying(false);
  };

  const onSeek = (seekTo: number) => {
    videoRef.current.seek(seekTo);
    setPlaying(true);
  };

  const showOptions = () => {
    setShowingSettings(true);
  };

  const hideOptions = () => {
    setShowingSettings(false);
  };

  const showSpeedOptions = () => {
    hideOptions();
    setShowingSpeedOptions(true);
  };

  const hideSpeedOptions = () => {
    setShowingSpeedOptions(false);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(0);

    date.setSeconds(seconds);
    let timeString = date.toISOString().substr(11, 8);

    if(seconds < 3600) {
      timeString = timeString.replace('00:', '');
    }

    return timeString;
  };

  return (
    <View onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Video
        ref={videoRef}
        paused={!playing}
        rate={rate}
        onLoad={onLoad}
        onProgress={onProgress}
        {...videoProps}
      />
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]} pointerEvents={controlsEnabled ? 'auto' : 'none'}>
        <View style={styles.backdrop} />
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.videoTitle}>{title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={showOptions}>
              <Image style={styles.optionsIcon} source={optionsImage} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.body}>
          <TouchableOpacity onPress={playing ? pause : play}>
            <Image style={styles.playPauseIcon} source={playing ? pauseImage : playImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <View style={styles.footerActions}>
            <Text style={styles.timer}>{formatTime(videoInfo.currentTime)} / {formatTime(videoInfo.duration)}</Text>
            <TouchableOpacity onPress={fullscreen ? exitFullscreen : enterFullscreen}>
              <Image style={styles.fullscreenIcon} source={fullscreen ? exitFullscreenImage : enterFullscreenImage} />
            </TouchableOpacity>
          </View>
          <ProgressBar 
            currentTime={videoInfo.currentTime} 
            duration={videoInfo.duration} 
            progressBarColor={progressBarColor}
            onTouchStart={onProgressTouchStart}
            onSeek={onSeek}
          />
        </View>
      </Animated.View>
      <OptionsModal visible={showingSettings} textColor={textColor} backgroundColor={backgroundColor} onRequestClose={hideOptions}>
        <OptionItem title='Qualidade' iconImage={qualityImage} color={textColor} />
        <OptionItem title='Velocidade' iconImage={videoSpeedImage} color={textColor} onPress={showSpeedOptions} />
      </OptionsModal>
      <OptionsModal visible={showingSpeedOptions} textColor={textColor} backgroundColor={backgroundColor} onRequestClose={hideSpeedOptions}>
        <OptionItem title='0.25x' onPress={setVideoRate(0.25)} iconImage={rate === 0.25 && checkImage} color={textColor} />
        <OptionItem title='0.5x' onPress={setVideoRate(0.5)} iconImage={rate === 0.5 && checkImage} color={textColor} />
        <OptionItem title='0.75x' onPress={setVideoRate(0.75)} iconImage={rate === 0.75 && checkImage} color={textColor} />
        <OptionItem title='Normal' onPress={setVideoRate(1)} iconImage={rate === 1 && checkImage} color={textColor} />
        <OptionItem title='1.25x' onPress={setVideoRate(1.25)} iconImage={rate === 1.25 && checkImage} color={textColor} />
        <OptionItem title='1.5x' onPress={setVideoRate(1.5)} iconImage={rate === 1.5 && checkImage} color={textColor} />
        <OptionItem title='1.75x' onPress={setVideoRate(1.75)} iconImage={rate === 1.75 && checkImage} color={textColor} />
        <OptionItem title='2x' onPress={setVideoRate(2)} iconImage={rate === 2 && checkImage} color={textColor} />
      </OptionsModal>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%'
  },
  backdrop: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    opacity: .7
  },
  header: {
    flex: 0,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  videoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16
  },
  headerActions: {
    flex: 0,
    paddingLeft: 8
  },
  optionsIcon: {
    width: 20,
    height: 20
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  playPauseIcon: {
    width: 50,
    height: 50
  },
  footer: {
    padding: 8,
    paddingBottom: 16,
    flex: 0,
    width: '100%'
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  timer: {
    color: '#fff',
    fontSize: 12
  },
  fullscreenIcon: {
    width: 15,
    height: 15
  }
});

export default SafeVideoPlayer;