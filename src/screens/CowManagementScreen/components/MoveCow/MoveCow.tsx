import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import apiClient from '@config/axios/axios';
import { t } from 'i18next';
import { useQuery, useMutation } from 'react-query';
import { formatCamelCase } from '@utils/format';
import { PenResponse } from '@model/Cow/Cow';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';

type MoveCowProps = {
  cowId: number;
  cowName: string;
  currentPen?: PenResponse;
  cowStatus: string;
  cowTypeId: number;
  cowTypeName: string;
  areaType?: string; // Made optional
  onCancel?: () => void;
};

const fetchPens = async ({
  cowStatus,
  cowTypeId,
  areaType,
}: {
  cowStatus: string;
  cowTypeId: number;
  areaType: string; // areaType is now required in the function
}): Promise<PenResponse[]> => {
  let url = `/pens/available/cow?areaType=${areaType}&cowStatus=${cowStatus}&cowTypeId=${cowTypeId}`;
  if (areaType === 'quarantine') {
    url = `/pens/available/cow?areaType=${areaType}`;
  }
  const response = await apiClient.get(url);
  return response.data;
};

const moveCow = async ({ cowId, penId }: { cowId: number; penId: number }) => {
  const response = await apiClient.post(`/cow-pens/create`, { penId, cowId });
  return response.data;
};

const MoveCow: React.FC<MoveCowProps> = ({
  cowId,
  cowName,
  currentPen,
  cowStatus,
  cowTypeId,
  cowTypeName,
  areaType: propAreaType, // Renamed to distinguish from state
  onCancel,
}) => {
  const [selectedPen, setSelectedPen] = useState<string | null>(null);
  const [selectedAreaType, setSelectedAreaType] = useState<string | null>(
    propAreaType || null // Use prop if provided, otherwise null
  );

  // Define areaType options
  const areaTypeOptions: Option[] = [
    { label: t('cow_management.area_type.quarantine'), value: 'quarantine' },
    { label: t('cow_management.area_type.cowHousing'), value: 'cowHousing' },
  ];

  // Use propAreaType if provided, otherwise use selectedAreaType
  const effectiveAreaType = propAreaType || selectedAreaType;

  // Fetch available pens, only if areaType is selected or provided
  const {
    data: pens,
    isLoading: pensLoading,
    isError: pensError,
  } = useQuery(
    ['pens', cowStatus, cowTypeId, effectiveAreaType],
    () => fetchPens({ cowStatus, cowTypeId, areaType: effectiveAreaType! }),
    {
      enabled: !!effectiveAreaType, // Only fetch when areaType is available
    }
  );

  // Map pens to CustomPicker options
  const penOptions: Option[] =
    pens
      ?.filter((pen) => pen.penId !== currentPen?.penId)
      .map((pen) => ({
        label: `${formatCamelCase(pen.name)} (${t(formatCamelCase(pen.penStatus))})`,
        value: pen.penId.toString(),
      })) || [];

  // Mutation to move the cow
  const moveCowMutation = useMutation(moveCow, {
    onSuccess: () => {
      Alert.alert(t('cow_management.move_success'), t('cow_management.move_success_message'), [
        { text: 'OK', onPress: onCancel },
      ]);
    },
    onError: () => {
      Alert.alert(t('cow_management.move_error'), t('cow_management.move_error_message'));
    },
  });

  const handleMoveCow = () => {
    if (!selectedPen) {
      Alert.alert(t('cow_management.error'), t('cow_management.select_pen'));
      return;
    }
    if (!effectiveAreaType) {
      Alert.alert(t('cow_management.error'), t('cow_management.select_area_type'));
      return;
    }
    const penId = parseInt(selectedPen, 10);
    moveCowMutation.mutate({ cowId, penId });
  };

  if (!propAreaType && !selectedAreaType) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          {t('cow_management.move_cow')}: {cowName}
        </Text>
        <Text style={styles.label}>{t('cow_management.select_area_type')}</Text>
        <CustomPicker
          options={areaTypeOptions}
          selectedValue={selectedAreaType}
          onValueChange={(value) => setSelectedAreaType(value || null)}
          title={t('cow_management.select_area_type')}
          readOnly={moveCowMutation.isLoading}
        />
      </View>
    );
  }

  if (pensLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#2c3e50' />
        <Text style={styles.loadingText}>{t('cow_management.loading_pens')}</Text>
      </View>
    );
  }

  if (pensError || !pens) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t('cow_management.pens_error')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {t('cow_management.move_cow')}: {cowName}
      </Text>
      {currentPen ? (
        <Text style={styles.text}>
          <Text style={styles.bold}>{t('cowDetails.penName')}: </Text>
          {formatCamelCase(currentPen.name)}
        </Text>
      ) : (
        <Text style={styles.text}>{t('cow_management.no_current_pen')}</Text>
      )}
      {/* Note about pen selection criteria */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>{t('cow_management.pen_selection_note')}</Text>
        <Text style={styles.noteDetail}>
          {t('cow_management.cow_type')}: {cowTypeName}
        </Text>
        <Text style={styles.noteDetail}>
          {t('cow_management.cow_status')}: {t(formatCamelCase(cowStatus))}
        </Text>
      </View>
      {/* Show areaType picker if not provided in props */}
      {!propAreaType && (
        <>
          <Text style={styles.label}>{t('cow_management.select_area_type')}</Text>
          <CustomPicker
            options={areaTypeOptions}
            selectedValue={selectedAreaType}
            onValueChange={(value) => {
              setSelectedAreaType(value || null);
              setSelectedPen(null); // Reset pen selection when areaType changes
            }}
            title={t('cow_management.select_area_type')}
            readOnly={moveCowMutation.isLoading}
          />
        </>
      )}
      <Text style={styles.label}>{t('cow_management.select_destination_pen')}</Text>
      <CustomPicker
        options={penOptions}
        selectedValue={selectedPen}
        onValueChange={(value) => setSelectedPen(value || null)}
        title={t('cow_management.select_pen')}
        readOnly={moveCowMutation.isLoading}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode='contained'
          onPress={handleMoveCow}
          disabled={moveCowMutation.isLoading}
          style={styles.moveButton}
          labelStyle={styles.buttonLabel}
          icon={moveCowMutation.isLoading ? 'loading' : 'cow'}
        >
          {moveCowMutation.isLoading ? t('cow_management.moving') : t('cow_management.move_cow')}
        </Button>
        <Button
          mode='outlined'
          onPress={onCancel}
          disabled={moveCowMutation.isLoading}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        >
          {t('cow_management.cancel')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#222',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  moveButton: {
    backgroundColor: '#2c3e50',
    marginBottom: 10,
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: 16,
    color: 'white',
  },
  cancelButton: {
    borderColor: '#2c3e50',
    borderWidth: 1,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#e6f3ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  noteText: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
  },
  noteDetail: {
    fontSize: 14,
    color: '#2c3e50',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default MoveCow;
