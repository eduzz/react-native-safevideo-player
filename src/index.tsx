import SafeVideoPlayer from './Components/SafeVideoPlayer';

export default SafeVideoPlayer;

export * from 'react-native-video';

declare module 'react-native-safevideo-player' {
  export interface SafeVideoPlayerProps {
    title?: string;
    progressBarColor?: string;
    textColor?: string;
    backgroundColor?: string;
    onEnterFullscreen?: () => void;
    onExitFullscreen?: () => void;
  }
}