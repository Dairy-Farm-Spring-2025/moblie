import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { COLORS } from '@common/GlobalStyle';
import { Ionicons } from '@expo/vector-icons'; // Already imported
import apiClient from '@config/axios/axios';
import { useSelector } from 'react-redux';
import { RootState } from '@core/store/store';

export type Area = {
  areaId: number;
  name: string;
  description: string;
  length: number;
  width: number;
  penLength: number | null;
  penWidth: number | null;
  areaType: 'cowHousing' | 'milkingParlor' | 'warehouse';
  createdAt: string;
  updatedAt: string;
  occupiedPens: number;
  emptyPens: number;
  damagedPens: number;
};

export type Pen = {
  penId: number;
  name: string;
  description: string;
  penStatus:
    | 'occupied'
    | 'empty'
    | 'reserved'
    | 'underMaintenance'
    | 'decommissioned'
    | 'inPlaning';
  areaBelongto: Area;
  cowId?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_AREA_WIDTH = SCREEN_WIDTH - 40;
const PENS_PER_ROW = 5;

const fetchAreas = async (): Promise<Area[]> => {
  const response = await apiClient.get('/areas');
  return response.data;
};

const fetchPens = async (areaId: number | null): Promise<Pen[]> => {
  if (!areaId) return [];
  const response = await apiClient.get(`/pens/area/${areaId}`);
  return response.data;
};

const colorRole = (role: string) => {
  switch (role) {
    case 'worker':
      return COLORS.worker;
    case 'veterinarians':
      return COLORS.veterinarian;
    default:
      return COLORS.worker;
  }
};

const FarmLayoutScreen = () => {
  const navigation = useNavigation();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const { roleName } = useSelector((state: RootState) => state.auth);
  // Determine roleColors based on roleName, defaulting to worker if roleName is undefined
  const roleColors =
    roleName?.toLowerCase() === 'veterinarians' ? COLORS.veterinarian : COLORS.worker;

  const {
    data: areas = [],
    isLoading: areasLoading,
    isError: areasError,
    error: areasErrorObj,
  } = useQuery('areas', fetchAreas);

  const {
    data: pens = [],
    isLoading: pensLoading,
    isError: pensError,
    error: pensErrorObj,
  } = useQuery(
    ['pens', expandedArea ? Number(expandedArea) : null],
    () => fetchPens(expandedArea ? Number(expandedArea) : null),
    { enabled: !!expandedArea }
  );

  const renderAreaLayout = (area: Area) => {
    const isExpanded = expandedArea === area.areaId.toString();
    const pensToRender = isExpanded ? pens : [];

    // Parse pen names and organize by row
    const pensByRow: { [row: string]: Pen[] } = {};
    pensToRender.forEach((pen) => {
      const [row, col] = pen.name.split('-');
      if (!pensByRow[row]) pensByRow[row] = [];
      pensByRow[row].push(pen);
    });

    Object.keys(pensByRow).forEach((row) => {
      pensByRow[row].sort((a, b) => {
        const colA = parseInt(a.name.split('-')[1], 10);
        const colB = parseInt(b.name.split('-')[1], 10);
        return colA - colB;
      });
    });

    const rowLabels = Object.keys(pensByRow);
    const totalPens = area.occupiedPens + area.emptyPens + area.damagedPens;

    // Determine the maximum row letter (e.g., "C" if pens go up to "C-1")
    const maxRowLetter =
      rowLabels.length > 0
        ? rowLabels.reduce((max, current) => (current > max ? current : max), 'A')
        : 'A';
    const maxRowIndex = maxRowLetter.charCodeAt(0) - 'A'.charCodeAt(0);

    // Generate all rows from 'A' to the max row letter
    const displayRowLabels = Array.from({ length: maxRowIndex + 1 }, (_, i) =>
      String.fromCharCode('A'.charCodeAt(0) + i)
    );

    // Render a blank pen box (no content)
    const renderBlankPen = (index: number) => (
      <View key={`blank-${index}`} style={[styles.penBox, { borderColor: '#757575' }]} />
    );

    return (
      <View
        key={area.areaId.toString()}
        style={[styles.areaBox, { backgroundColor: roleColors.accent }]}
      >
        <TouchableOpacity
          style={styles.areaHeader}
          onPress={() =>
            setExpandedArea(expandedArea === area.areaId.toString() ? null : area.areaId.toString())
          }
        >
          <Ionicons name='map' size={20} color={COLORS.textWhite} />
          <Text style={[styles.areaTitle, { color: COLORS.textWhite }]}>
            {area.name} ({area.width}m x {area.length}m)
          </Text>
          <Badge style={[styles.penCountBadge, { backgroundColor: roleColors.primary }]}>
            {totalPens}
          </Badge>
          <Ionicons
            name={expandedArea === area.areaId.toString() ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textWhite}
          />
        </TouchableOpacity>
        {isExpanded && (
          <ScrollView horizontal contentContainerStyle={styles.areaScroll}>
            {pensLoading ? (
              <Text style={styles.loadingText}>Loading pens...</Text>
            ) : pensError ? (
              <Text style={styles.errorText}>
                Error: {(pensErrorObj as Error)?.message || 'Failed to load pens'}
              </Text>
            ) : (
              <View style={styles.areaLayout}>
                {displayRowLabels.map((rowLabel) => {
                  const rowPens = pensByRow[rowLabel] || [];
                  const leftPens = rowPens.filter((_, i) => i < PENS_PER_ROW);
                  const rightPens = rowPens.filter((_, i) => i >= PENS_PER_ROW);

                  // Create blank pens if no actual pens exist for this row
                  const leftBlanks =
                    rowPens.length === 0
                      ? Array.from({ length: PENS_PER_ROW }, (_, i) => renderBlankPen(i))
                      : [];
                  const rightBlanks =
                    rowPens.length === 0
                      ? Array.from({ length: PENS_PER_ROW }, (_, i) =>
                          renderBlankPen(i + PENS_PER_ROW)
                        )
                      : [];

                  return (
                    <View key={rowLabel} style={styles.rowContainer}>
                      <Text style={styles.rowLabel}>{rowLabel}</Text>
                      <View style={styles.row}>
                        {leftPens.length > 0
                          ? leftPens.map((pen) => (
                              <TouchableOpacity
                                key={pen.penId.toString()}
                                style={[
                                  styles.penBox,
                                  {
                                    borderColor:
                                      pen.penStatus === 'occupied'
                                        ? '#4CAF50'
                                        : pen.penStatus === 'underMaintenance'
                                        ? '#D32F2F'
                                        : '#757575',
                                  },
                                ]}
                                onPress={() => {
                                  if (pen.penStatus === 'occupied' && pen.cowId) {
                                    (navigation as any).navigate('CowDetails', {
                                      cowId: pen.cowId,
                                    });
                                  } else if (pen.penStatus === 'underMaintenance') {
                                    Alert.alert(
                                      'Pen Status',
                                      `Pen ${pen.name} is under maintenance.`
                                    );
                                  } else {
                                    Alert.alert(
                                      'Pen Status',
                                      `Pen ${pen.name} is ${pen.penStatus}.`
                                    );
                                  }
                                }}
                              >
                                <Text style={styles.penText}>{pen.name}</Text>
                                <Ionicons
                                  name={
                                    pen.penStatus === 'occupied'
                                      ? 'cow'
                                      : pen.penStatus === 'underMaintenance'
                                      ? 'warning-outline'
                                      : 'ellipsis-horizontal'
                                  }
                                  size={16}
                                  color={
                                    pen.penStatus === 'occupied'
                                      ? '#4CAF50'
                                      : pen.penStatus === 'underMaintenance'
                                      ? '#D32F2F'
                                      : '#757575'
                                  }
                                />
                              </TouchableOpacity>
                            ))
                          : leftBlanks}
                        <View style={styles.pathway} />
                        {rightPens.length > 0
                          ? rightPens.map((pen) => (
                              <TouchableOpacity
                                key={pen.penId.toString()}
                                style={[
                                  styles.penBox,
                                  {
                                    borderColor:
                                      pen.penStatus === 'occupied'
                                        ? '#4CAF50'
                                        : pen.penStatus === 'underMaintenance'
                                        ? '#D32F2F'
                                        : '#757575',
                                  },
                                ]}
                                onPress={() => {
                                  if (pen.penStatus === 'occupied' && pen.cowId) {
                                    (navigation as any).navigate('CowDetails', {
                                      cowId: pen.cowId,
                                    });
                                  } else if (pen.penStatus === 'underMaintenance') {
                                    Alert.alert(
                                      'Pen Status',
                                      `Pen ${pen.name} is under maintenance.`
                                    );
                                  } else {
                                    Alert.alert(
                                      'Pen Status',
                                      `Pen ${pen.name} is ${pen.penStatus}.`
                                    );
                                  }
                                }}
                              >
                                <Text style={styles.penText}>{pen.name}</Text>
                                <Ionicons
                                  name={
                                    pen.penStatus === 'occupied'
                                      ? 'cow'
                                      : pen.penStatus === 'underMaintenance'
                                      ? 'warning-outline'
                                      : 'ellipsis-horizontal'
                                  }
                                  size={16}
                                  color={
                                    pen.penStatus === 'occupied'
                                      ? '#4CAF50'
                                      : pen.penStatus === 'underMaintenance'
                                      ? '#D32F2F'
                                      : '#757575'
                                  }
                                />
                              </TouchableOpacity>
                            ))
                          : rightBlanks}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: roleColors.accent }]}>
        <Text style={styles.headerTitle}>Farm Layout</Text>
        <Badge style={[styles.roleBadge, { backgroundColor: roleColors.primary }]}>Worker</Badge>
      </View>
      {areasLoading ? (
        <Text style={styles.loadingText}>Loading farm layout...</Text>
      ) : areasError ? (
        <Text style={styles.errorText}>
          Error: {(areasErrorObj as Error)?.message || 'Failed to load areas'}
        </Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {areas.map((area) => renderAreaLayout(area))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLayout,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  roleBadge: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 10,
  },
  areaBox: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.worker.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  areaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  penCountBadge: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 10,
  },
  areaScroll: {
    padding: 10,
  },
  areaLayout: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  penBox: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 2,
    margin: 5,
  },
  penText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pathway: {
    width: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
});

export default FarmLayoutScreen;
