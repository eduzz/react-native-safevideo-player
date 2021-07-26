# react-native-safevideo-player

SafeVideo player for react native apps

## Installation

```sh
yarn add react-native-video
yarn add react-native-google-cast
yarn add react-native-music-control
yarn add react-native-safevideo-player
```

* See the installation steps for all the added dependencies to get it running. Some libs need extra configuration for android and iOS.

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
* [artist](#artist)
* [artwork](#artwork)
* [castId](#castId)
* [progressBarColor](#progressBarColor)
* [textColor](#textColor)
* [startAt](#startAt)
* [backgroundColor](#backgroundColor)
* [onEnterFullscreen](#onEnterFullscreen)
* [onExitFullscreen](#onExitFullscreen)
* [containerStyle](#containerStyle)
* [controlsStyle](#controlsStyle)
* [onSeekStart](#onSeekStart)
* [onSeekEnd](#onSeekEnd)
* [menuOption](#menuOption)
* [disableFullscreen](#disableFullscreen)
* [disableCast](#disableCast)
* [disableOptions](#disableOptions)
* [playOnStart](#playOnStart)
* [playInBackground](#playInBackground)
* [Every prop from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#configurable-props)

### Event props
* [Every prop from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#event-props)

### Methods
* [Every method from react-native-video](https://github.com/react-native-video/react-native-video/blob/master/README.md#methods)

## Configurable props

#### title
The text that will be shown in the player's header and the music card if the playInBackground prop is true
* **string**

Platforms: All

#### artist
The text that will be shown in the music card if the playInBackground prop is true
* **string**

Platforms: All

#### artwork
The text url that will be shown in the music card if the playInBackground prop is true
* **string**

Platforms: All

#### castId
The id used to verify if the video is already been played. 
If not set, every time the player is initiated it will restart the video while connected to a chromecast.
If set and the id is the same of the current one been casted, the player will continue the current video and show it's progress
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

#### startAt
The time in seconds the video will start when the player finish load
* **int**

Default: 0

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

#### style
The style applied to the player view
* **ViewStyle**

Platforms: All

#### containerStyle
The style applied to the view that wraps the player and the controls
* **ViewStyle**

Platforms: All

#### controlsStyle
The style applied to the player controls view
* **ViewStyle**

Platforms: All

#### onSeekStart
Callback executed when the user start the sliding or tap of the progressBar
* **() => void**

Platforms: All

#### onSeekEnd
Callback executed when the user end the sliding or tap of the progressBar
* **() => void**

Platforms: All

#### menuOption
The options that will be add to the player's menu
* **any | any[]**

Platforms: All

#### disableFullscreen
Hide the player's fullscreen button
* **boolean**

Platforms: All

#### disableCast
Hide the player's cast button
* **boolean**

Platforms: All

#### disableOptions
Can be a boolean to disable all the options and hide the player's options button or an string array with the options to be disabled
* **boolean | [\<quality\> | \<rate\>]**

Platforms: All

Platforms: All
#### disableCloseButton
Hide the player's close button
* **boolean**

Platforms: All

#### onRequestClose
Callback executed when the close button is click by the user
* **() => void**


#### playOnStart
Tells the player to start playing when the video has loaded
* **any | any[]**

Platforms: All

#### playInBackground
Play the video audio in background and creates a music card to control the audio via notification or in the lockscreen
* **boolean**

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
