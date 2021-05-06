import React, { cloneElement, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import Video, { OnLoadData, OnProgressData, VideoProperties } from 'react-native-video';
import playImage from '../../Assets/play.png';
import pauseImage from '../../Assets/pause.png';
import enterFullscreenImage from '../../Assets/enter-fullscreen.png';
import safevideoLogoImage from '../../Assets/safevideo-logo.png';
import exitFullscreenImage from '../../Assets/exit-fullscreen.png';
import qualityImage from '../../Assets/quality.png';
import videoSpeedImage from '../../Assets/video-speed.png';
import optionsImage from '../../Assets/options.png';
import closeImage from '../../Assets/close.png';
import checkImage from '../../Assets/check.png';
import ProgressBar from './ProgressBar';
import OptionsModal from './OptionsModal';
import OptionItem from './OptionsModal/OptionItem';
import Loading from './Loading';
import { CastButton, CastState, useMediaStatus, useCastState, useRemoteMediaClient, MediaPlayerState, useStreamPosition  } from 'react-native-google-cast';

interface ISource {
  uri: string;
  quality: number | 'auto';
}

type IOption = 'quality' | 'rate';

interface SafeVideoPlayerProps {
  title?: string;
  castId?: string;
  progressBarColor?: string;
  textColor?: string;
  backgroundColor?: string;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  controlsStyle?: StyleProp<ViewStyle>;
  onSeekStart?: () => void;
  onSeekEnd?: () => void;
  source?: any;
  startAt?: number;
  menuOption?: any | any[];
  disableFullscreen?: boolean;
  disableCloseButton?: boolean;
  disableCast?: boolean;
  onRequestClose?: () => void;
  disableOptions?: boolean | IOption[];
  playOnStart?: boolean;
}

const CONTROLS_DISPLAY_TIME = 4000;

const SafeVideoPlayer = ({ title, castId, progressBarColor, textColor, backgroundColor, onEnterFullscreen, onExitFullscreen, containerStyle, controlsStyle, onSeekStart, onSeekEnd, onProgress, source, startAt = 0, menuOption, playOnStart, disableFullscreen, disableOptions, disableCloseButton, disableCast, onRequestClose, ...videoProps }: VideoProperties & SafeVideoPlayerProps) => {
  const [playing, setPlaying] = useState(playOnStart || false);
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [timeoutId, setTimeoutId] = useState<any>();
  const [videoInfo, setVideoInfo] = useState({ currentTime: 0, duration: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [showingSettings, setShowingSettings] = useState(false);
  const [showingSpeedOptions, setShowingSpeedOptions] = useState(false);
  const [showingQualityOptions, setShowingQualityOptions] = useState(false);
  const [qualitySources, setQualitySources] = useState<ISource[]>([]);
  const [_disableOptions] = useState(Array.isArray(disableOptions) ? disableOptions.reduce((previousValue, currentValue) => ({ ...previousValue, [currentValue]: true }), {} as any) : disableOptions);

  const castState = useCastState();
  const remoteMediaClient = useRemoteMediaClient();
  const streamPosition = useStreamPosition();
  const mediaStatus = useMediaStatus();

  const videoRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [_source, setSource] = useState<ISource>({
    uri: source.uri,
    quality: 'auto'
  });

  if(!disableCast) {
    useEffect(() => {
      if(remoteMediaClient) {
        switch(castState) {
          case CastState.CONNECTED:
            remoteMediaClient.getMediaStatus().then(
              _mediaStatus => {
                if(!castId || _mediaStatus?.mediaInfo.contentId !== castId) {
                  remoteMediaClient.loadMedia({
                    autoplay: true,
                    startTime: videoInfo.currentTime,
                    playbackRate: rate,
                    mediaInfo: {
                      contentId: castId,
                      contentUrl: source.uri,
                      contentType: 'application/x-mpegURL'
                    }
                  });
                }
              }
            );
            break;
          case CastState.NOT_CONNECTED:
            videoRef.current.seek(videoInfo.currentTime);
            break;
          default:
            break;
        }
      }
    }, [castState, remoteMediaClient]);
  
    useEffect(() => {
      if(streamPosition) {
        setVideoInfo({
          duration: videoInfo.duration,
          currentTime: streamPosition
        })
      }
    }, [streamPosition]);
  
    useEffect(() => {
      if(mediaStatus) { 
        setPlaying(mediaStatus?.playerState === MediaPlayerState.PLAYING);
        setLoading(mediaStatus?.playerState === MediaPlayerState.LOADING || mediaStatus?.playerState === MediaPlayerState.BUFFERING);
        setRate(mediaStatus.playbackRate);
      }
    }, [mediaStatus]);
  }

  useEffect(() => {
    fetch(source.uri).then(
      response => response.text()
    ).then(
      playList => {
        const lines = playList.split('\n').slice(2);
        const resolutions = lines.filter((line, index) => index % 2 == 0 && line).map(quality => quality.slice(quality.indexOf('RESOLUTION=') + 11));
        const uris = lines.filter((_, index) => index % 2 != 0);

        setQualitySources([
          {
            uri: source.uri,
            quality: 'auto'
          },
          ...resolutions.map((resolution, index) => ({
            uri: uris[index],
            quality: parseInt(resolution.slice(resolution.indexOf('x') + 1))
          })).sort((a, b) => b.quality - a.quality)
        ]);
      }
    );
  }, []);

  const play = () => {
    if(remoteMediaClient && !disableCast) {
      remoteMediaClient.play();
    }
    setPlaying(true);
  };

  const pause = () => {
    if(remoteMediaClient && !disableCast) {
      remoteMediaClient.pause();
    }
    setPlaying(false);
  };

  const setVideoRate = (_rate: number) => () => {
    if(remoteMediaClient && !disableCast) {
      remoteMediaClient.setPlaybackRate(_rate);
    }
    setRate(_rate);
  };

  const setVideoQuality = (quality: number | 'auto') => () => {
    const qualitySource = qualitySources.find(qualitySource => qualitySource.quality === quality);

    if(qualitySource) {
      setSource(qualitySource);
      videoRef.current.seek(videoInfo.currentTime);
    }
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

  const onLoadStart = () => {
    setLoading(true);
  };

  const onLoad = (event: OnLoadData) => {
    setVideoInfo({
      currentTime: startAt,
      duration: event.duration
    });
    videoRef.current.seek(startAt);
    setLoading(false);
  };

  const onVideoProgress = (data: OnProgressData) => {
    setVideoInfo({
      ...videoInfo,
      currentTime: data.currentTime,
    });

    onProgress && onProgress(data);
  };

  const onProgressTouchStart = () => {
    clearTimeout(timeoutId);
    setPlaying(false);
    onSeekStart && onSeekStart();
  };

  const onSeek = (seekTo: number) => {
    if(remoteMediaClient && !disableCast) {
      remoteMediaClient.seek({ position: seekTo });
    }
    videoRef.current.seek(seekTo);
    setPlaying(true);
    onSeekEnd && onSeekEnd();
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

  const showQualityOptions = () => {
    hideOptions();
    setShowingQualityOptions(true);
  };

  const hideQualityOptions = () => {
    setShowingQualityOptions(false);
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
    <View style={[containerStyle, { backgroundColor }]} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <Video
        ref={videoRef}
        source={{
          type: 'm3u8',
          ...source,
          uri: _source.uri
        } as any}
        resizeMode='contain'
        paused={disableCast ? !playing : (!playing || castState === CastState.CONNECTED || castState === CastState.CONNECTING)}
        rate={rate}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onProgress={onVideoProgress}
        style={styles.player}
        ignoreSilentSwitch='ignore'
        {...videoProps}
      />
      <Animated.View style={[styles.controls, { opacity: fadeAnim }]} pointerEvents={controlsEnabled ? 'auto' : 'none'}>
        <View style={styles.backdrop} />
        <View style={[{ flex: 1 }, controlsStyle]}>
          <View style={styles.header}>
            {!disableCloseButton &&
              <TouchableOpacity onPress={onRequestClose}>
                <Image style={styles.closeIcon} source={closeImage} />
              </TouchableOpacity>
            }
            <Text numberOfLines={1} style={styles.videoTitle}>{title}</Text>
            <View style={styles.headerActions}>
              {!disableCast && <CastButton style={styles.castButton} />}
              {(!disableOptions || typeof _disableOptions !== 'boolean') &&
                <TouchableOpacity onPress={showOptions}>
                  <Image style={styles.optionsIcon} source={optionsImage} />
                </TouchableOpacity>
              }
            </View>
          </View>
          <View style={styles.body}>
            {(disableCast ? loading : (loading || castState === CastState.CONNECTING)) ?
              <Loading />
              :
              <TouchableOpacity onPress={playing ? pause : play}>
                <Image style={styles.playPauseIcon} source={playing ? pauseImage : playImage} />
              </TouchableOpacity>
            }
          </View>
          <View style={styles.footer}>
            <ProgressBar
              currentTime={videoInfo.currentTime}
              duration={videoInfo.duration}
              progressBarColor={progressBarColor}
              onTouchStart={onProgressTouchStart}
              onSeek={onSeek}
            />
            <View style={styles.footerActions}>
              <Text style={styles.timer}>{formatTime(videoInfo.currentTime)} / {formatTime(videoInfo.duration)}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Image  style={styles.safevideoLogo} source={safevideoLogoImage} />
                {!disableFullscreen &&
                  <TouchableOpacity onPress={fullscreen ? exitFullscreen : enterFullscreen}>
                    <Image style={styles.fullscreenIcon} source={fullscreen ? exitFullscreenImage : enterFullscreenImage} />
                  </TouchableOpacity>
                }
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      {(!disableOptions || typeof _disableOptions !== 'boolean') &&
        <>
          <OptionsModal visible={showingSettings} textColor={textColor} backgroundColor={backgroundColor} onRequestClose={hideOptions}>
            {!!menuOption &&
              ([...(menuOption?.length ? menuOption : [menuOption])]).map((option, index) => cloneElement(option, { key: index }))
            }
            {!_disableOptions?.quality && castState !== CastState.CONNECTED && <OptionItem title='Qualidade' iconImage={qualityImage} color={textColor} onPress={showQualityOptions} />}
            {!_disableOptions?.rate && <OptionItem title='Velocidade' iconImage={videoSpeedImage} color={textColor} onPress={showSpeedOptions} />}
          </OptionsModal>
          {!_disableOptions?.quality && castState !== CastState.CONNECTED &&
            <OptionsModal visible={showingQualityOptions} textColor={textColor} backgroundColor={backgroundColor} onRequestClose={hideQualityOptions}>
              {qualitySources.map((qualitySource, index) =>
                <OptionItem
                  key={index}
                  title={qualitySource.quality === 'auto' ? qualitySource.quality : qualitySource.quality + 'p'}
                  onPress={setVideoQuality(qualitySource.quality)}
                  iconImage={_source.quality === qualitySource.quality && checkImage}
                  color={textColor}
                />
              )}
            </OptionsModal>
          }
          {!_disableOptions?.rate &&
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
          }
        </>
      }
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
    padding: 16,
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
    paddingLeft: 8,
    flexDirection: 'row'
  },
  closeIcon: {
    width: 15,
    height: 15,
    marginRight: 16
  },
  castButton: { 
    width: 24, 
    height: 24,
    tintColor: '#fff',
    marginRight: 16
  },
  optionsIcon: {
    width: 20,
    height: 20
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16
  },
  player: {
    flex: 1
  },
  playPauseIcon: {
    width: 50,
    height: 50
  },
  footer: {
    padding: 16,
    flex: 0,
    width: '100%'
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  timer: {
    color: '#fff',
    fontSize: 12
  },
  fullscreenIcon: {
    width: 15,
    height: 15,
    marginLeft: 15
  },
  safevideoLogo: {
    width: 76,
    height: 16
  }
});

export default SafeVideoPlayer;
