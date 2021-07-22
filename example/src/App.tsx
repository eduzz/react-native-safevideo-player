import * as React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import SafeVideoPlayer, { LoadError } from 'react-native-safevideo-player';

export default function App() {
  const [fullscreen, setFullscreen] = React.useState(false);
  const [darkModeActive, setDarkModeActive] = React.useState(false);
  const [showPlayer, setShowPlayer] = React.useState(true);

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

  const toggleShowPlayer = () => {
    setShowPlayer(!showPlayer);
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
      {showPlayer &&
        <SafeVideoPlayer
          title='SaveVideo player example'
          artwork='https://jovemenriquecedor.com.br/wp-content/uploads/2021/04/eduzz-1.jpg'
          artist='Eduzz'
          castId="test-id"
          textColor={theme.textColor}
          backgroundColor={theme.backgroundColor}
          onError={handleError}
          onEnterFullscreen={onEnterFullscreen}
          onExitFullscreen={onExitFullscreen}
          containerStyle={[styles.playerContainer, fullscreen && styles.fullscreen]}
          source={{ uri: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8' }}
        />
      }
      <View style={styles.option}>
        <Switch value={darkModeActive} onValueChange={toggleDarkMode} />
        <Text style={[styles.switchLabel, { color: theme.textColor }]}>Dark mode</Text>
      </View>
      <View style={styles.option}>
        <Switch value={showPlayer} onValueChange={toggleShowPlayer} />
        <Text style={[styles.switchLabel, { color: theme.textColor }]}>Show player</Text>
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 8
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 18
  }
})
