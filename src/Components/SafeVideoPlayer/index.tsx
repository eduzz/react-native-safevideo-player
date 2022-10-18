import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  GestureResponderEvent,
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Video, {
  OnLoadData,
  OnProgressData,
  VideoProperties,
} from 'react-native-video';
import forward from '../../Assets/forward.png';
import backward from '../../Assets/backward.png';
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
import subtitleImage from '../../Assets/subtitle.png';
import ProgressBar from './ProgressBar';
import OptionsModal from './OptionsModal';
import OptionItem from './OptionsModal/OptionItem';
import Loading from './Loading';
import {
  CastButton,
  CastState,
  useMediaStatus,
  useCastState,
  useRemoteMediaClient,
  MediaPlayerState,
  useStreamPosition,
} from 'react-native-google-cast';
import MusicControl, { Command } from 'react-native-music-control';

interface ISource {
  uri: string;
  quality: number | 'auto';
}

type IOption = 'quality' | 'rate' | 'subtitle';

interface SafeVideoPlayerProps {
  title?: string;
  artwork?: string;
  artist?: string;
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
  playInBackground?: boolean;
  defaultQuality?: number | 'auto';
  onQualityChange?: (quality: number | 'auto') => void;
}

const CONTROLS_DISPLAY_TIME = 4000;

const SafeVideoPlayer = ({
  title,
  artwork,
  artist,
  castId,
  progressBarColor,
  textColor,
  backgroundColor,
  onEnterFullscreen,
  onExitFullscreen,
  playInBackground,
  containerStyle,
  controlsStyle,
  onSeekStart,
  onSeekEnd,
  onProgress,
  source,
  startAt = 0,
  menuOption,
  playOnStart,
  disableFullscreen,
  disableOptions,
  disableCloseButton,
  disableCast,
  onRequestClose,
  defaultQuality = 'auto',
  onQualityChange,
  textTracks,
  ...videoProps
}: VideoProperties & SafeVideoPlayerProps) => {
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
  const [showingSubtitleOptions, setShowingSubtitleOptions] = useState(false);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('disable');
  const [qualitySources, setQualitySources] = useState<ISource[]>([]);
  const [_disableOptions] = useState(
    Array.isArray(disableOptions)
      ? disableOptions.reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            [currentValue]: true,
          }),
          {} as any
        )
      : disableOptions
  );

  const castState = useCastState();
  const remoteMediaClient = useRemoteMediaClient();
  const streamPosition = useStreamPosition();
  const mediaStatus = useMediaStatus();

  const videoRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [_source, setSource] = useState<ISource>({
    uri: source.uri,
    quality: 'auto',
  });

  useEffect(() => {
    if (!disableCast && remoteMediaClient) {
      switch (castState) {
        case CastState.CONNECTED:
          remoteMediaClient.getMediaStatus().then((_mediaStatus) => {
            if (!castId || _mediaStatus?.mediaInfo?.contentId !== castId) {
              remoteMediaClient.loadMedia({
                autoplay: true,
                startTime: videoInfo.currentTime || startAt,
                playbackRate: rate,
                mediaInfo: {
                  contentId: castId,
                  contentUrl: source.uri,
                  contentType: 'application/x-mpegURL',
                },
              });

              if (playInBackground) {
                MusicControl.setNowPlaying({
                  title,
                  artwork,
                  artist,
                  duration: videoInfo.duration || 0,
                  isLiveStream: false,
                });

                MusicControl.updatePlayback({
                  state: MusicControl.STATE_PLAYING,
                });
              }
            }
          });
          break;
        case CastState.NOT_CONNECTED:
          videoRef.current.seek(videoInfo.currentTime);
          break;
        default:
          break;
      }
    }
  }, [
    disableCast,
    castState,
    remoteMediaClient,
    artist,
    artwork,
    castId,
    playInBackground,
    rate,
    source.uri,
    startAt,
    title,
    videoInfo.currentTime,
    videoInfo.duration,
  ]);

  useEffect(() => {
    if (!disableCast && streamPosition) {
      setVideoInfo({
        duration: videoInfo.duration,
        currentTime: streamPosition,
      });

      if (playInBackground) {
        MusicControl.updatePlayback({
          elapsedTime: streamPosition,
        });
      }
    }
  }, [disableCast, videoInfo.duration, streamPosition, playInBackground]);

  useEffect(() => {
    if (!disableCast && mediaStatus) {
      setPlaying(mediaStatus?.playerState === MediaPlayerState.PLAYING);
      setLoading(
        mediaStatus?.playerState === MediaPlayerState.LOADING ||
          mediaStatus?.playerState === MediaPlayerState.BUFFERING
      );
      setRate(mediaStatus.playbackRate);
    }
  }, [disableCast, mediaStatus]);

  useEffect(() => {
    fetch(source.uri)
      .then((response) => response.text())
      .then((playList) => {
        const lines = playList.split('\n').slice(2);
        const resolutions = lines
          .filter((line, index) => index % 2 === 0 && line)
          .map((quality) => quality.slice(quality.indexOf('RESOLUTION=') + 11));
        const uris = lines.filter((_, index) => index % 2 !== 0);

        const _qualitySources = resolutions
          .map((resolution, index) => ({
            uri: uris[index],
            quality: parseInt(
              resolution.slice(resolution.indexOf('x') + 1),
              10
            ),
          }))
          .sort((a, b) => b.quality - a.quality);

        setQualitySources([
          {
            uri: source.uri,
            quality: 'auto',
          },
          ..._qualitySources,
        ]);

        const defaultQualitySource = _qualitySources.find(
          (_qualitySource) => _qualitySource.quality === defaultQuality
        );

        if (defaultQualitySource) {
          setSource(defaultQualitySource);
        }
      });
  }, [defaultQuality, source.uri]);

  const play = useCallback(
    (event?: GestureResponderEvent) => {
      if (remoteMediaClient && !disableCast) {
        remoteMediaClient.play();
      }

      setPlaying(true);

      if (playInBackground) {
        if (event) {
          MusicControl.setNowPlaying({
            title,
            artwork,
            artist,
            duration: videoInfo.duration || 0,
            isLiveStream: false,
          });
        }

        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING,
        });
      }
    },
    [
      artist,
      artwork,
      disableCast,
      playInBackground,
      remoteMediaClient,
      title,
      videoInfo.duration,
    ]
  );

  const pause = useCallback(() => {
    if (remoteMediaClient && !disableCast) {
      remoteMediaClient.pause();
    }

    setPlaying(false);

    if (playInBackground) {
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PAUSED,
      });
    }
  }, [disableCast, playInBackground, remoteMediaClient]);

  useEffect(() => {
    if (playInBackground) {
      MusicControl.enableBackgroundMode(true);

      MusicControl.enableControl('play', true);
      MusicControl.enableControl('pause', true);
      MusicControl.enableControl('stop', false);
      MusicControl.enableControl('nextTrack', false);
      MusicControl.enableControl('previousTrack', false);
      MusicControl.enableControl('changePlaybackPosition', false);
      MusicControl.enableControl('seekForward', false); // iOS only
      MusicControl.enableControl('seekBackward', false); // iOS only
      MusicControl.enableControl('seek', false); // Android only
      MusicControl.enableControl('skipBackward', false, { interval: 15 });
      MusicControl.enableControl('skipForward', false, { interval: 30 });
      MusicControl.enableControl('setRating', false); // Android only
      MusicControl.enableControl('volume', false); // Android only. Only affected when remoteVolume is enabled
      MusicControl.enableControl('remoteVolume', false); // Android only
      MusicControl.enableControl('enableLanguageOption', false); // iOS only
      MusicControl.enableControl('disableLanguageOption', false); // iOS only

      MusicControl.on(Command.play, () => {
        play();
      });

      MusicControl.on(Command.pause, () => {
        pause();
      });
    }

    return () => {
      if (playInBackground) {
        MusicControl.stopControl();
      }
    };
  }, [remoteMediaClient, play, pause, playInBackground]);

  const setVideoRate = (_rate: number) => () => {
    if (remoteMediaClient && !disableCast) {
      remoteMediaClient.setPlaybackRate(_rate);
    }
    setRate(_rate);
  };

  const setVideoQuality = (quality: number | 'auto') => () => {
    const qualitySource = qualitySources.find(
      (_qualitySource) => _qualitySource.quality === quality
    );

    if (qualitySource) {
      setSource(qualitySource);
      onQualityChange?.(qualitySource.quality);
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
    Animated.timing(fadeAnim, {
      toValue: fadeIn ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setControlsEnabled(fadeIn);
  };

  const onLoadStart = () => {
    setLoading(true);
  };

  const onLoad = (event: OnLoadData) => {
    setVideoInfo({
      currentTime: startAt,
      duration: event.duration,
    });
    videoRef.current.seek(startAt);
    setLoading(false);
    fadeControls(false);
  };

  const onVideoProgress = (data: OnProgressData) => {
    setVideoInfo({
      ...videoInfo,
      currentTime: data.currentTime,
    });

    onProgress && onProgress(data);

    if (playInBackground) {
      MusicControl.updatePlayback({
        elapsedTime: data.currentTime,
      });
    }
  };

  const onProgressTouchStart = () => {
    clearTimeout(timeoutId);
    setPlaying(false);
    onSeekStart && onSeekStart();
  };

  const onSeek = (seekTo: number) => {
    if (remoteMediaClient && !disableCast) {
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

  const showSubtitleOptions = () => {
    hideOptions();
    setShowingSubtitleOptions(true);
  };

  const hideSubtitleOptions = () => {
    setShowingSubtitleOptions(false);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(0);

    date.setSeconds(seconds);
    let timeString = date.toISOString().substr(11, 8);

    if (seconds < 3600) {
      timeString = timeString.replace('00:', '');
    }

    return timeString;
  };

  const handleForwardOrBackward = (type: 'forward' | 'backward') => {
    let currentTime = 0;

    if (type === 'forward') {
      currentTime = videoInfo.currentTime + 10;
    } else {
      currentTime = videoInfo.currentTime - 10;
    }

    setVideoInfo({ ...videoInfo, currentTime });
    videoRef.current.seek(currentTime);
  };

  const selectSubtitleOption = (option: string) => () => {
    setSelectedSubtitle(option.toLowerCase());
  };

  const subtitleLanguage = (language: string) => {
    switch (language) {
      case 'pt-br':
        return 'Português';
      case 'en-us':
        return 'Inglês';
      case 'es-es':
        return 'Espanhol';
      default:
        return 'Desativado';
    }
  };

  return (
    <View
      style={[containerStyle, { backgroundColor }]}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <Video
        ref={videoRef}
        source={
          {
            type: 'm3u8',
            ...source,
            uri: _source.uri,
          } as any
        }
        resizeMode="contain"
        paused={
          disableCast
            ? !playing
            : !playing ||
              castState === CastState.CONNECTED ||
              castState === CastState.CONNECTING
        }
        rate={rate}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onProgress={onVideoProgress}
        style={styles.player}
        ignoreSilentSwitch="ignore"
        playInBackground={playInBackground}
        selectedTextTrack={{ type: 'language', value: selectedSubtitle }}
        textTracks={textTracks}
        {...videoProps}
      />
      <Animated.View
        style={[styles.controls, { opacity: fadeAnim }]}
        pointerEvents={controlsEnabled ? 'auto' : 'none'}
      >
        <View style={styles.backdrop} />
        <View style={[styles.controlsContent, controlsStyle]}>
          <View style={styles.header}>
            {!disableCloseButton && (
              <TouchableOpacity onPress={onRequestClose}>
                <Image style={styles.closeIcon} source={closeImage} />
              </TouchableOpacity>
            )}
            <Text numberOfLines={1} style={styles.videoTitle}>
              {title}
            </Text>
            <View style={styles.headerActions}>
              {!disableCast && <CastButton style={styles.castButton} />}
              {(!disableOptions || typeof _disableOptions !== 'boolean') && (
                <TouchableOpacity onPress={showOptions}>
                  <Image style={styles.optionsIcon} source={optionsImage} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.body}>
            {(
              disableCast
                ? loading
                : loading || castState === CastState.CONNECTING
            ) ? (
              <Loading />
            ) : (
              <View style={styles.actionControlls}>
                <TouchableOpacity
                  style={styles.buttonAction}
                  onPress={() => handleForwardOrBackward('backward')}
                >
                  <Image style={styles.iconAction} source={backward} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonAction}
                  onPress={playing ? pause : play}
                >
                  <Image
                    style={styles.iconAction}
                    source={playing ? pauseImage : playImage}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonAction}
                  onPress={() => handleForwardOrBackward('forward')}
                >
                  <Image style={styles.iconAction} source={forward} />
                </TouchableOpacity>
              </View>
            )}
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
              <Text style={styles.timer}>
                {formatTime(videoInfo.currentTime)} /{' '}
                {formatTime(videoInfo.duration)}
              </Text>
              <View style={styles.footerActionsContent}>
                <Image
                  style={styles.safevideoLogo}
                  source={safevideoLogoImage}
                />
                {!disableFullscreen && (
                  <TouchableOpacity
                    onPress={fullscreen ? exitFullscreen : enterFullscreen}
                  >
                    <Image
                      style={styles.fullscreenIcon}
                      source={
                        fullscreen ? exitFullscreenImage : enterFullscreenImage
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
      {(!disableOptions || typeof _disableOptions !== 'boolean') && (
        <>
          <OptionsModal
            visible={showingSettings}
            textColor={textColor}
            backgroundColor={backgroundColor}
            onRequestClose={hideOptions}
          >
            {!_disableOptions?.subtitle &&
              castState !== CastState.CONNECTED && (
                <OptionItem
                  title="Legenda"
                  iconImage={subtitleImage}
                  color={textColor}
                  onPress={showSubtitleOptions}
                />
              )}
            {!!menuOption &&
              [
                ...(menuOption?.length ? menuOption : [menuOption]),
              ].map((option, index) => cloneElement(option, { key: index }))}
            {!_disableOptions?.quality && castState !== CastState.CONNECTED && (
              <OptionItem
                title="Qualidade"
                iconImage={qualityImage}
                color={textColor}
                onPress={showQualityOptions}
              />
            )}
            {!_disableOptions?.rate && (
              <OptionItem
                title="Velocidade"
                iconImage={videoSpeedImage}
                color={textColor}
                onPress={showSpeedOptions}
              />
            )}
          </OptionsModal>
          {!_disableOptions?.quality && castState !== CastState.CONNECTED && (
            <OptionsModal
              visible={showingQualityOptions}
              textColor={textColor}
              backgroundColor={backgroundColor}
              onRequestClose={hideQualityOptions}
            >
              {qualitySources.map((qualitySource, index) => (
                <OptionItem
                  key={index}
                  title={
                    qualitySource.quality === 'auto'
                      ? qualitySource.quality
                      : qualitySource.quality + 'p'
                  }
                  onPress={setVideoQuality(qualitySource.quality)}
                  iconImage={
                    _source.quality === qualitySource.quality && checkImage
                  }
                  color={textColor}
                />
              ))}
            </OptionsModal>
          )}
          {!_disableOptions?.rate && (
            <OptionsModal
              visible={showingSpeedOptions}
              textColor={textColor}
              backgroundColor={backgroundColor}
              onRequestClose={hideSpeedOptions}
            >
              <OptionItem
                title="0.25x"
                onPress={setVideoRate(0.25)}
                iconImage={rate === 0.25 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="0.5x"
                onPress={setVideoRate(0.5)}
                iconImage={rate === 0.5 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="0.75x"
                onPress={setVideoRate(0.75)}
                iconImage={rate === 0.75 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="Normal"
                onPress={setVideoRate(1)}
                iconImage={rate === 1 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="1.25x"
                onPress={setVideoRate(1.25)}
                iconImage={rate === 1.25 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="1.5x"
                onPress={setVideoRate(1.5)}
                iconImage={rate === 1.5 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="1.75x"
                onPress={setVideoRate(1.75)}
                iconImage={rate === 1.75 && checkImage}
                color={textColor}
              />
              <OptionItem
                title="2x"
                onPress={setVideoRate(2)}
                iconImage={rate === 2 && checkImage}
                color={textColor}
              />
            </OptionsModal>
          )}
          {!_disableOptions?.subtitle && (
            <OptionsModal
              visible={showingSubtitleOptions}
              textColor={textColor}
              backgroundColor={backgroundColor}
              onRequestClose={hideSubtitleOptions}
            >
              <OptionItem
                title="Desativado"
                onPress={selectSubtitleOption('disable')}
                iconImage={selectedSubtitle === 'disable' && checkImage}
                color={textColor}
              />
              {textTracks?.map((item, index) => (
                <OptionItem
                  key={index}
                  title={subtitleLanguage(item.language || '')}
                  onPress={selectSubtitleOption(item.language || '')}
                  iconImage={selectedSubtitle === item.language && checkImage}
                  color={textColor}
                />
              ))}
            </OptionsModal>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
  },

  actionControlls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  buttonAction: {
    width: 100,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconAction: {
    width: 50,
    height: 50,
  },
  controlsContent: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    opacity: 0.7,
  },
  header: {
    flex: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  headerActions: {
    flex: 0,
    paddingLeft: 8,
    flexDirection: 'row',
  },
  closeIcon: {
    width: 15,
    height: 15,
    marginRight: 16,
  },
  castButton: {
    width: 24,
    height: 24,
    tintColor: '#fff',
    marginRight: 16,
  },
  optionsIcon: {
    width: 20,
    height: 20,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
  },
  player: {
    flex: 1,
  },
  footer: {
    padding: 16,
    flex: 0,
    width: '100%',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  footerActionsContent: {
    flexDirection: 'row',
  },
  timer: {
    color: '#fff',
    fontSize: 12,
  },
  fullscreenIcon: {
    width: 15,
    height: 15,
    marginLeft: 15,
  },
  safevideoLogo: {
    width: 76,
    height: 16,
  },
});

export default SafeVideoPlayer;
