import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import SafeVideoPlayer, { LoadError } from 'react-native-safevideo-player';

export default function App() {
  const handleError = (error: LoadError) => {
    console.warn(error);
  };

  return (
    <View style={styles.container}>
      <SafeVideoPlayer
        onError={handleError}
        style={styles.player}
        source={{ uri: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  player: { 
    width: '100%', 
    height: Dimensions.get('window').width / 1.77,
  }
})
