import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, Modal, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import OptionItem from './OptionItem';
import closeImage from '../../../Assets/close.png';
import qualityImage from '../../../Assets/quality.png';
import videoSpeedImage from '../../../Assets/video-speed.png';

interface IProps {
  visible: boolean;
  onRequestClose?: () => void;
}

const ANIMATION_INTERVAL = {
  initial: 0,
  final: 1
};
const ANIMATION_DURATION = 200;
const TARGET_OPACITY = 0.7;

const OptionsModal = ({ visible, onRequestClose }: IProps) => {
  const slideAnim = useRef(new Animated.Value(ANIMATION_INTERVAL.initial)).current;
  const [controlsPercenageOfScreen, setControlsPercenageOfScreen] = useState(0);
  const [animationValue, setAnimationValue] = useState(ANIMATION_INTERVAL.initial);
  const [localVisible, setLocalVisible] = useState(visible);

  useEffect(() => {
    slideAnim.addListener(anim => setAnimationValue(anim.value));

    return () => slideAnim.removeAllListeners();
  }, []);

  useEffect(() => {
    if(visible) {
      setLocalVisible(visible);
    }

    Animated.timing(
      slideAnim,
      {
        toValue: visible ? ANIMATION_INTERVAL.initial : ANIMATION_INTERVAL.final,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }
    ).start(() => {
      setLocalVisible(visible);
    });
  }, [visible]);

  const onLayout = (event: LayoutChangeEvent) => {
    var { height } = event.nativeEvent.layout;

    setControlsPercenageOfScreen(height / Dimensions.get('window').height);
  };

  let opacity =  (TARGET_OPACITY / ANIMATION_INTERVAL.final) * (1 - animationValue);
  let bottom = (controlsPercenageOfScreen / ANIMATION_INTERVAL.final) * animationValue * -100 + '%';

  return (
    <Modal animationType="none" visible={localVisible} transparent supportedOrientations={['portrait', 'landscape']}>
      <Animated.View style={[styles.backdrop, { opacity }]} />
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={styles.content}>
          <Animated.View style={[styles.options, { bottom }]} onLayout={onLayout}>
            <ScrollView>
              <OptionItem title='Qualidade' iconImage={qualityImage} />
              <OptionItem title='Velocidade' iconImage={videoSpeedImage} />
            </ScrollView>
            <View style={styles.divider} />
            <OptionItem title='Fechar' iconImage={closeImage} onPress={onRequestClose} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  content: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  options: {
    position: 'absolute',
    width: '100%',
    flex: 0,
    paddingBottom: 56,
    backgroundColor: '#fff'
  },
  backdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#000'
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#000',
    opacity: .3
  }
});

export default OptionsModal;