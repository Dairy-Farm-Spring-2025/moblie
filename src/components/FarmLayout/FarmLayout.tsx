import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Text, Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@common/GlobalStyle';
import { farmData, Area, Pen } from '@services/data/farmData';
import { Ionicons } from '@expo/vector-icons';
import { faCow, faEllipsis, faWarning } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_AREA_WIDTH = SCREEN_WIDTH - 40;
const PENS_PER_ROW = 5;

const FarmLayoutScreen = () => {
  const navigation = useNavigation();
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const roleColors = COLORS.worker;

  const renderAreaLayout = (area: Area) => {
    const sortedPens = [...area.pens].sort((a, b) =>
      a.number.localeCompare(b.number, undefined, { numeric: true })
    );

    const rows = Math.ceil(sortedPens.length / (PENS_PER_ROW * 2));
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rows);

    return (
      <View key={area.id} style={[styles.areaBox, { backgroundColor: roleColors.accent }]}>
        <TouchableOpacity
          style={styles.areaHeader}
          onPress={() => setExpandedArea(expandedArea === area.id ? null : area.id)}
        >
          <Ionicons name='map' size={20} color={roleColors.primary} />
          <Text style={[styles.areaTitle, { color: roleColors.primary }]}>
            {' '}
            {area.name} ({area.width}m x {area.height}m){' '}
          </Text>
          <Badge style={[styles.penCountBadge, { backgroundColor: roleColors.primary }]}>
            {' '}
            {area.pens.length}{' '}
          </Badge>
          <Ionicons
            name={expandedArea === area.id ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={roleColors.primary}
          />
        </TouchableOpacity>
        {expandedArea === area.id && (
          <ScrollView horizontal contentContainerStyle={styles.areaScroll}>
            <View style={styles.areaLayout}>
              {rowLabels.map((label, rowIndex) => (
                <View key={`${label}-${rowIndex}`} style={styles.rowContainer}>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <View style={styles.row}>
                    {sortedPens
                      .slice(
                        rowIndex * PENS_PER_ROW * 2,
                        rowIndex * PENS_PER_ROW * 2 + PENS_PER_ROW
                      )
                      .map((pen) => (
                        <TouchableOpacity
                          key={pen.id}
                          style={[
                            styles.penBox,
                            {
                              borderColor:
                                pen.status === 'occupied'
                                  ? '#4CAF50'
                                  : pen.status === 'needs_attention'
                                  ? '#D32F2F'
                                  : '#757575',
                            },
                          ]}
                          onPress={() => {
                            if (pen.status === 'occupied' && pen.cowId) {
                              (navigation as any).navigate('CowDetails', { cowId: pen.cowId });
                            } else if (pen.status === 'needs_attention') {
                              Alert.alert('Pen Status', `Pen ${pen.number} needs attention.`);
                            } else {
                              Alert.alert('Pen Status', `Pen ${pen.number} is empty.`);
                            }
                          }}
                        >
                          <Text style={styles.penText}>{pen.number}</Text>
                          <FontAwesomeIcon
                            icon={
                              pen.status === 'occupied'
                                ? faCow
                                : pen.status === 'needs_attention'
                                ? faWarning
                                : faEllipsis
                            }
                            size={16}
                            color={
                              pen.status === 'occupied'
                                ? '#4CAF50'
                                : pen.status === 'needs_attention'
                                ? '#D32F2F'
                                : '#757575'
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    <View style={styles.pathway} />
                    {sortedPens
                      .slice(
                        rowIndex * PENS_PER_ROW * 2 + PENS_PER_ROW,
                        (rowIndex + 1) * PENS_PER_ROW * 2
                      )
                      .map((pen) => (
                        <TouchableOpacity
                          key={pen.id}
                          style={[
                            styles.penBox,
                            {
                              borderColor:
                                pen.status === 'occupied'
                                  ? '#4CAF50'
                                  : pen.status === 'needs_attention'
                                  ? '#D32F2F'
                                  : '#757575',
                            },
                          ]}
                          onPress={() => {
                            if (pen.status === 'occupied' && pen.cowId) {
                              (navigation as any).navigate('CowDetails', { cowId: pen.cowId });
                            } else if (pen.status === 'needs_attention') {
                              Alert.alert('Pen Status', `Pen ${pen.number} needs attention.`);
                            } else {
                              Alert.alert('Pen Status', `Pen ${pen.number} is empty.`);
                            }
                          }}
                        >
                          <Text style={styles.penText}>{pen.number}</Text>
                          <FontAwesomeIcon
                            icon={
                              pen.status === 'occupied'
                                ? faCow
                                : pen.status === 'needs_attention'
                                ? faWarning
                                : faEllipsis
                            }
                            size={16}
                            color={
                              pen.status === 'occupied'
                                ? '#4CAF50'
                                : pen.status === 'needs_attention'
                                ? '#D32F2F'
                                : '#757575'
                            }
                          />
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Farm Layout</Text>
        <Badge style={[styles.roleBadge, { backgroundColor: roleColors.primary }]}>Worker</Badge>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {farmData.map((area) => renderAreaLayout(area))}
      </ScrollView>
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
    backgroundColor: COLORS.worker.accent,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.worker.primary,
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
    paddingVertical: 10,
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
});

export default FarmLayoutScreen;
