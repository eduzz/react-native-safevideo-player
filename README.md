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
  title='SaveVideo player example'
  onError={handleError}
  style={StyleSheet.absoluteFill}
  source={{ uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' }}
/>
```

### Configurable props
* [title](#title)
* [progressBarColor](#progressBarColor)
* [textColor](#textColor)
* [backgroundColor](#backgroundColor)
* [onEnterFullscreen](#onEnterFullscreen)
* [onExitFullscreen](#onExitFullscreen)
* [containerStyle](#containerStyle)
* [Every prop from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#configurable-props)

### Event props
* [Every prop from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#event-props)

### Methods
* [Every method from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#methods)

## Configurable props

#### title
The text that will be shown in the player's header
* **string**

Platforms: All

#### progressBarColor
The color that will override the default player's progressBar color
* **string**

Default: #FEC92D

Platforms: All

#### textColor
The color that will override the default player's menu background color
* **string**

Default: #000

Platforms: All

#### backgroundColor
The color that will override the default player's menu text and icons color
* **string**

Default: #FFF

Platforms: All

#### onEnterFullscreen
Callback executed when the player enters full screen
* **() => void**

Platforms: All

#### onExitFullscreen
Callback executed when the player exit full screen
* **() => void**

Platforms: All

#### containerStyle
The style applied to the view that wraps the player and the controls
* **ViewStyle**

Platforms: All

## Examples

```sh
# Android app
yarn example android
# iOS app
yarn example ios
```

<img src="https://cdn.discordapp.com/attachments/770721962464247830/799283972973658112/ezgif.com-video-to-gif-3.gif" width="200" />

## License

MIT
