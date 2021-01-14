# react-native-safevideo-player

SafeVideo player for react native apps

## Installation

```sh
yarn add react-native-video
yarn add react-native-safevideo-player
```

## Usage

```js
import SafevideoPlayer from "react-native-safevideo-player";

// ...

<SafeVideoPlayer
  onError={handleError}
  style={StyleSheet.absoluteFill}
  source={{ uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' }}
/>
```

## License

MIT
