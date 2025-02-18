import React from 'react';
import { ImageProps, StyleSheet } from 'react-native';
import {
  Avatar,
  Card,
  CardContentProps,
  CardProps,
  Text,
} from 'react-native-paper';

export const LeftContent = (props: any) => <Avatar.Icon {...props} />;

interface CardComponentProps extends CardProps {
  children: React.ReactNode;
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

const CardComponent = ({ children }: CardComponentProps) => {
  return <Card style={styles.card}>{children}</Card>;
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
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});

CardComponent.Title = Title;
CardComponent.Cover = Cover;
CardComponent.Content = Content;

export default CardComponent;
