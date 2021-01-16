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
        containerStyle={[styles.player, fullscreen && styles.fullscreen]}
        source={{ uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' }}
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
  player: { 
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
