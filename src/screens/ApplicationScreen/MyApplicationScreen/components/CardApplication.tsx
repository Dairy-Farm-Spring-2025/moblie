import CardComponent from '@components/Card/CardComponent';
import { Application } from '@model/Application/Application';
import React, { useState } from 'react';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import TextRenderHorizontal from '@components/UI/TextRenderHorizontal';
import { t } from 'i18next';
import { convertToDDMMYYYY, formatCamelCase } from '@utils/format';
import DividerUI from '@components/UI/DividerUI';
import ButtonComponent from '@components/Button/ButtonComponent';

interface CardApplicationProps {
  items: Application;
  onCancelApplication: any;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processing':
      return 'progress-clock';
    case 'complete':
      return 'check-circle';
    case 'cancel':
      return 'close-circle';
    case 'reject':
      return 'alert-circle';
    default:
      return 'help-circle'; // Fallback icon
  }
};

const CardApplication = ({
  items,
  onCancelApplication,
}: CardApplicationProps) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [viewCommnent, setViewComment] = useState(false);
  return (
    <CardComponent
      style={{
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons
              name={getStatusIcon(items.status)}
              size={30}
              color={
                items.status === 'complete'
                  ? 'green'
                  : items.status === 'processing'
                  ? 'blue'
                  : items.status === 'cancel'
                  ? 'gray'
                  : 'red'
              }
              style={{ marginRight: 8 }}
            />
            <Text>{t(formatCamelCase(items.status))}</Text>
          </View>
          <Text style={styles.title} numberOfLines={3}>
            {items.title}
          </Text>
        </View>
        <TextRenderHorizontal
          title={`📅 ${t('application.requestDate', {
            defaultValue: 'Request date',
          })}`}
          content={convertToDDMMYYYY(items.requestDate)}
        />
      </View>
      <DividerUI />
      <View style={styles.commentBackground}>
        <Text>
          {showFullContent ? items.content : `${items.content.slice(0, 300)}`}
          {items.content.length > 300 && !showFullContent && (
            <Text
              style={styles.viewMoreButton}
              onPress={() => setShowFullContent(true)}
            >
              ...{t('application.viewMore', { defaultValue: 'View more' })}
            </Text>
          )}
          {showFullContent && (
            <Text
              style={styles.viewMoreButton}
              onPress={() => setShowFullContent(false)}
            >
              {t('application.viewLess', { defaultValue: 'View less' })}
            </Text>
          )}
        </Text>
      </View>
      <View style={styles.contentContainer}>
        <TextRenderHorizontal
          title={`📝 ${t('application.applicationType', {
            defaultValue: 'Appliation Type',
          })}`}
          content={items.type.name}
        />
        <TextRenderHorizontal
          title={`🚀 ${t('application.fromDate', {
            defaultValue: 'From date',
          })}`}
          content={convertToDDMMYYYY(items.fromDate)}
        />
        <TextRenderHorizontal
          title={`🏁 ${t('application.toDate', {
            defaultValue: 'To date',
          })}`}
          content={convertToDDMMYYYY(items.toDate)}
        />
        {items.approveBy !== undefined && (
          <TextRenderHorizontal
            title={`👤 ${t('application.checkBy', {
              defaultValue: 'Check by',
            })}`}
            content={items.approveBy ? items?.approveBy?.name : 'N/A'}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {items.status === 'processing' && (
            <ButtonComponent type="danger" onPress={onCancelApplication}>
              {t('application.cancelButton', { defaultValue: 'Cancel' })}
            </ButtonComponent>
          )}
          {(items.status === 'complete' || items.status === 'reject') && (
            <ButtonComponent onPress={() => setViewComment(!viewCommnent)}>
              {!viewCommnent
                ? t('application.viewCommentButton', {
                    defaultValue: 'View comment',
                  })
                : t('application.closeComment', {
                    defaultValue: 'Close comment',
                  })}
            </ButtonComponent>
          )}
        </View>
        {viewCommnent && (
          <View style={styles.commentBackground}>
            <Text>
              {items?.commentApprove
                ? items.commentApprove
                : t('application.noComment', { defaultValue: 'No comment' })}
            </Text>
          </View>
        )}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
  },
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
    gap: 5,
  },
  contentContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  viewMoreButton: {
    color: 'blue',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  commentBackground: {
    marginBottom: 10,
    marginTop: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
});

export default CardApplication;
