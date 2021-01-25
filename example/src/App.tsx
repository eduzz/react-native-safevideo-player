import * as React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import SafeVideoPlayer, { LoadError } from 'react-native-safevideo-player';

export default function App() {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [darkModeActive, setDarkModeActive] = React.useState(false);

  const handleError = (error: LoadError) => {
    console.warn(error);
  };

  const onEnterFullscreen = () => {
    setFullscreen(true);
  };

  const onExitFullscreen = () => {
    setFullscreen(false);
  };

  const toggleDarkMode = () => {
    setDarkModeActive(!darkModeActive);
  };

  const theme = {
    get textColor() {
      return darkModeActive ? '#fff' : '#000';
    },
    get backgroundColor() {
      return darkModeActive ? '#1e2124' : '#fff';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }, fullscreen && { justifyContent: 'center', alignItems: 'center' }]}>
      <SafeVideoPlayer
        title='SaveVideo player example'
        textColor={theme.textColor}
        backgroundColor={theme.backgroundColor}
        onError={handleError}
        onEnterFullscreen={onEnterFullscreen}
        onExitFullscreen={onExitFullscreen}
        containerStyle={[styles.playerContainer, fullscreen && styles.fullscreen]}
        source={{ uri: 'https://gw.safevideo.com/playlist?p=l%2B%2Bolmfwzx10zvTiD9j6TGxHlU5nyeRXX6iG4mWM9HGRMyfqx3WQkfQYp30QAXuyiYDIekzVf5t7sPtXyiPhwywhSOUIE3n0hG2bfTKyQ94ongW1GnZRNsNpXfKg8OKj2uuw8eUcMS6XHu%2FyzJxmsi2vq3EQaL73W3rQe4xkoX7LWOfqMrjm7Pn43LyJDWxX1JgjTj87ovWrTrg%3D&.m3u8' }}
      />
      <View style={styles.darkMode}>
        <Switch value={darkModeActive} onValueChange={toggleDarkMode} />
        <Text style={[styles.darkModeLabel, { color: theme.textColor }]}>Dark mode</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  playerContainer: { 
    width: '100%', 
    height: Dimensions.get('window').width / 1.77
  },
  fullscreen: {
    position: 'absolute',
    zIndex: 999,
    height: '100%'
  },
  darkMode: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 8
  },
  darkModeLabel: {
    marginLeft: 8,
    fontSize: 18
  }
})
