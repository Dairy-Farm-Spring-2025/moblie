import { COLORS } from '@common/GlobalStyle';
import { RootState } from '@core/store/store';
import React from 'react';
import { ImageProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Avatar, Card, CardContentProps, CardProps, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

export const LeftContent = (props: any) => {
  const { roleName } = useSelector((state: RootState) => state.auth);
  const getColorByrole = () => {
    switch (roleName) {
      case 'veterinarians':
        return COLORS.veterinarian.primary;
      case 'workers':
        return COLORS.worker.primary;
      default:
        return COLORS.worker.primary;
    }
  };
  return <Avatar.Icon style={{ backgroundColor: getColorByrole() }} {...props} />;
};

interface CardComponentProps extends CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

interface CardTitleProps {
  title?: string;
  subTitle?: string;
  leftContent?: any;
}

interface CardCoverProps {
  source: any;
  resizeMode?: ImageProps['resizeMode'];
}

interface CardContentCustomProps extends CardContentProps {
  children: React.ReactNode;
}

const CardComponent = ({ children, style }: CardComponentProps) => {
  return <Card style={[styles.card, style]}>{children}</Card>;
};

const Title = ({ title, subTitle, leftContent, ...props }: CardTitleProps) => {
  return (
    <Card.Title
      title={<Text style={styles.title}>{title}</Text>}
      subtitle={<Text style={styles.subTitle}>{subTitle}</Text>}
      left={leftContent}
      {...props}
    />
  );
};

const Cover = ({ source, resizeMode = 'cover', ...props }: CardCoverProps) => {
  return <Card.Cover source={source} resizeMode={resizeMode} {...props} />;
};

const Content = ({ children, ...props }: CardContentCustomProps) => {
  return <Card.Content {...props}>{children}</Card.Content>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subTitle: {
    fontSize: 14,
    color: 'grey',
  },
  card: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

CardComponent.Title = Title;
CardComponent.Cover = Cover;
CardComponent.Content = Content;

export default CardComponent;
