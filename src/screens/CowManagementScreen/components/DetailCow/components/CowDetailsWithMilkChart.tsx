import { LineChart } from 'react-native-gifted-charts';
import apiClient from '@config/axios/axios';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useQuery } from 'react-query';
import { t } from 'i18next';
import CustomPicker, { Option } from '@components/CustomPicker/CustomPicker';

// Interface for Monthly Milk Data (based on API response structure)
interface MonthlyMilk {
  month: number;
  totalMilk: number;
}

interface CowDetailsWithMilkChartProps {
  cowId: number;
  year?: number; // Optional, will default to current year if not provided
}

// Fetch monthly milk records for a cow
const fetchMonthlyMilkRecords = async (cowId: number, year: number): Promise<MonthlyMilk[]> => {
  const response = await apiClient.get(`/dailymilks/total/${cowId}/month?year=${year}`);
  console.log('Fetched monthly milk records:', response.data);
  return response.data;
};

// Array of month names for labels
const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CowDetailsWithMilkChart: React.FC<CowDetailsWithMilkChartProps> = ({
  cowId,
  year: initialYear,
}) => {
  // Default to current year if initialYear is not provided
  const defaultYear = initialYear || new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Generate a range of years for the picker (e.g., 2020 to current year)
  const currentYear = new Date().getFullYear();
  const years: Option[] = Array.from({ length: currentYear - 2019 }, (_, index) => {
    const year = currentYear - index;
    return { label: year.toString(), value: year.toString() };
  });

  // Fetch monthly milk records for the selected year
  const {
    data: monthlyMilkRecords,
    isLoading: isMilkLoading,
    isError: isMilkError,
  } = useQuery(['monthlyMilk', cowId, selectedYear], () =>
    fetchMonthlyMilkRecords(cowId, selectedYear)
  );

  // Loading state
  if (isMilkLoading) {
    return <Text style={styles.loadingText}>{t('cowDetails.loading')}</Text>;
  }

  // Error state
  if (isMilkError) {
    return <Text style={styles.errorText}>{t('cowDetails.error')}</Text>;
  }

  const screenWidth = Dimensions.get('window').width;

  // Prepare data for the LineChart
  // Initialize an array for all 12 months with 0 values
  const milkData = Array.from({ length: 12 }, (_, index) => ({
    value: 0,
    label: monthNames[index],
    labelTextStyle: { color: '#555', fontSize: 12 },
    dataPointText: '0',
  }));

  // Populate the data with API response values
  (monthlyMilkRecords || []).forEach((record: MonthlyMilk) => {
    const monthIndex = record.month - 1; // Month is 1-12, array index is 0-11
    if (monthIndex >= 0 && monthIndex < 12) {
      milkData[monthIndex] = {
        value: record.totalMilk,
        label: monthNames[monthIndex],
        labelTextStyle: { color: '#555', fontSize: 12 },
        dataPointText: record.totalMilk.toString(),
      };
    }
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>
          {t('cowDetails.monthlyMilkChart', { year: selectedYear })}
        </Text>
        <View style={{ width: '100%' }}>
          <CustomPicker
            options={years}
            selectedValue={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            title={t('cowDetails.selectYear', { defaultValue: 'Select year...' })}
          />
        </View>
      </View>
      {milkData.some((point) => point.value > 0) ? (
        <LineChart
          data={milkData}
          width={screenWidth - 90}
          height={250}
          color='#2c3e50'
          thickness={3}
          dataPointsColor='#2c3e50'
          dataPointsHeight={10}
          dataPointsWidth={10}
          startFillColor='#e0e0e0'
          endFillColor='#ffffff'
          startOpacity={0.8}
          endOpacity={0.2}
          yAxisLabelSuffix=' L'
          yAxisTextStyle={{ color: '#555', fontSize: 12 }}
          xAxisLabelTextStyle={{ color: '#555', fontSize: 12 }}
          adjustToWidth={true}
          areaChart
          textColor='#2c3e50'
          textFontSize={12}
          textShiftY={-5}
          textShiftX={-5}
          yAxisThickness={1}
          xAxisThickness={1}
          yAxisColor='#ccc'
          xAxisColor='#ccc'
          initialSpacing={20}
          spacing={screenWidth / 14} // Adjusted spacing for 12 months
          backgroundColor='#f9f9f9'
          rulesColor='#ccc'
          rulesType='SOLID'
          showVerticalLines
          verticalLinesColor='#eee'
        />
      ) : (
        <Text style={styles.text}>{t('cowDetails.noMilkData')}</Text>
      )}
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
    marginBottom: 15,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 50,
  },
});

export default CowDetailsWithMilkChart;
