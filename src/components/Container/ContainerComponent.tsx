import { COLORS } from '@common/GlobalStyle';
import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
interface ContainerComponentProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

interface ScrollViewComponentProps extends ScrollViewProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const ContainerComponent = ({ children, style, ...props }: ContainerComponentProps) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const ScrollViewComponent = ({ children, style, ...props }: ScrollViewComponentProps) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

ContainerComponent.ScrollView = ScrollViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLayout,
  },
});

export default ContainerComponent;
