declare module '*.png';

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