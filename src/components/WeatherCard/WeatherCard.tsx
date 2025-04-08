import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format, isAfter, isToday } from 'date-fns';
import { useQuery, UseQueryResult } from 'react-query';

interface WeatherData {
  temperature: number; // in Celsius (average or current)
  maxTemp?: number; // Maximum temperature in Celsius (optional for current)
  minTemp?: number; // Minimum temperature in Celsius (optional for current)
  condition: string; // Weather description
  icon: string; // Weather icon URL
  humidity: number; // in percentage
  windSpeed: number; // in kph
}

interface WeatherCardProps {
  date: Date; // Date for which weather is fetched
}

const fetchWeather = async (date: Date): Promise<WeatherData> => {
  const API_KEY = '2124cd937c4745e399753107250404';
  const today = new Date();
  const formattedDate = format(date, 'yyyy-MM-dd');
  const location = '10.841254037526662,106.81040870930549';

  try {
    if (isToday(date)) {
      const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
        params: { key: API_KEY, q: location, lang: 'vi' },
      });
      return {
        temperature: response.data.current.temp_c,
        condition: response.data.current.condition.text,
        icon: `https:${response.data.current.condition.icon}`,
        humidity: response.data.current.humidity,
        windSpeed: response.data.current.wind_kph,
        // No max/min temp for current; could fetch forecast for today if needed
      };
    } else if (isAfter(date, today)) {
      const daysAhead = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysAhead <= 14) {
        const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
          params: { key: API_KEY, q: location, days: daysAhead + 1, lang: 'vi' },
        });
        const forecastDay = response.data.forecast.forecastday[daysAhead];
        return {
          temperature: forecastDay.day.avgtemp_c,
          maxTemp: forecastDay.day.maxtemp_c,
          minTemp: forecastDay.day.mintemp_c,
          condition: forecastDay.day.condition.text,
          icon: `https:${forecastDay.day.condition.icon}`,
          humidity: forecastDay.day.avghumidity,
          windSpeed: forecastDay.day.maxwind_kph,
        };
      }
      throw new Error('Weather data is only available up to 14 days in the future.');
    } else {
      const response = await axios.get('http://api.weatherapi.com/v1/history.json', {
        params: { key: API_KEY, q: location, dt: formattedDate, lang: 'vi' },
      });
      const forecastDay = response.data.forecast.forecastday[0].day;
      return {
        temperature: forecastDay.avgtemp_c,
        maxTemp: forecastDay.maxtemp_c,
        minTemp: forecastDay.mintemp_c,
        condition: forecastDay.condition.text,
        icon: `https:${forecastDay.condition.icon}`,
        humidity: forecastDay.avghumidity,
        windSpeed: forecastDay.maxwind_kph,
      };
    }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data.error;
      throw new Error(
        apiError ? apiError.message : 'An unknown error occurred during the API request.'
      );
    }
    throw new Error(error.message || 'Could not fetch weather data.');
  }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ date }) => {
  const queryKey = ['weather', format(date, 'yyyy-MM-dd')];

  const {
    data: weather,
    isLoading,
    isError,
    error,
  }: UseQueryResult<WeatherData, Error> = useQuery(queryKey, () => fetchWeather(date), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{format(date, 'EEEE, MMMM dd, yyyy')}</Text>
      </View>

      {/* Weather Display */}
      {isLoading ? (
        <ActivityIndicator size='large' color='#007bff' style={styles.loader} />
      ) : isError ? (
        <Text style={styles.errorText}>
          {error ? `Error: ${error.message}` : 'Could not fetch weather data.'}
        </Text>
      ) : weather ? (
        <View style={styles.weatherContent}>
          <View style={styles.weatherMain}>
            <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
            <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
            <Text style={styles.description}>
              {weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)}
            </Text>
            {weather.maxTemp !== undefined && weather.minTemp !== undefined && (
              <Text style={styles.tempRange}>
                Cao: {Math.round(weather.maxTemp)}°C / Thấp: {Math.round(weather.minTemp)}°C
              </Text>
            )}
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Ionicons name='water' size={16} color='#007bff' />
              <Text style={styles.detailText}>Độ ẩm: {weather.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name='speedometer' size={16} color='#007bff' />
              <Text style={styles.detailText}>Gió: {weather.windSpeed} kph</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name='location' size={16} color='#007bff' />
              <Text style={styles.detailText}>Địa Chỉ: FPT University</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>Không có dữ liệu thời tiết</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  header: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    textAlign: 'center',
    marginVertical: 20,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  weatherMain: {
    alignItems: 'center',
    flex: 1,
  },
  weatherIcon: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
  temperature: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007bff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  tempRange: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  weatherDetails: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default WeatherCard;
