import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format, isAfter, isToday } from 'date-fns';
import { useQuery, UseQueryResult } from 'react-query';
import { useTranslation } from 'react-i18next';
import { vi, enUS } from 'date-fns/locale'; // Import locales for Vietnamese and English
import { t } from 'i18next';

interface WeatherData {
  temperature: number;
  maxTemp?: number;
  minTemp?: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherCardProps {
  date: Date;
}

const fetchWeather = async (date: Date, lang: string): Promise<WeatherData> => {
  const API_KEY = 'ca17c81acf994fbeb7f172133252104';
  const today = new Date();
  const formattedDate = format(date, 'yyyy-MM-dd');
  const location = '10.841254037526662,106.81040870930549';
  const apiLang = lang === 'vi' ? 'vi' : 'en';

  try {
    if (isToday(date)) {
      const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
        params: { key: API_KEY, q: location, lang: apiLang },
      });
      return {
        temperature: response.data.current.temp_c,
        condition: response.data.current.condition.text,
        icon: `https:${response.data.current.condition.icon}`,
        humidity: response.data.current.humidity,
        windSpeed: response.data.current.wind_kph,
      };
    } else if (isAfter(date, today)) {
      const daysAhead = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (daysAhead <= 14) {
        const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
          params: { key: API_KEY, q: location, days: daysAhead + 1, lang: apiLang },
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
        params: { key: API_KEY, q: location, dt: formattedDate, lang: apiLang },
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
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0]; // Get base language code (vi or en)

  const queryKey = ['weather', format(date, 'yyyy-MM-dd'), currentLang];

  const {
    data: weather,
    isLoading,
    isError,
    error,
  }: UseQueryResult<WeatherData, Error> = useQuery(
    queryKey,
    () => fetchWeather(date, currentLang),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const dateFormat = currentLang === 'vi' ? 'EEEE, dd MMMM yyyy' : 'EEEE, MMMM dd, yyyy';
  const dateLocale = currentLang === 'vi' ? vi : enUS;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{format(date, dateFormat, { locale: dateLocale })}</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size='large' color='#007bff' style={styles.loader} />
      ) : isError ? (
        <Text style={styles.errorText}>
          {error ? `${t('error')}: ${error.message}` : t('fetchError')}
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
                {currentLang === 'vi'
                  ? `Cao: ${Math.round(weather.maxTemp)}°C / Thấp: ${Math.round(weather.minTemp)}°C`
                  : `High: ${Math.round(weather.maxTemp)}°C / Low: ${Math.round(
                      weather.minTemp
                    )}°C`}
              </Text>
            )}
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <Ionicons name='water' size={16} color='#007bff' />
              <Text style={styles.detailText}>
                {t('weather.humidity', { defaultValue: 'Humidity' })}: {weather.humidity}%
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name='speedometer' size={16} color='#007bff' />
              <Text style={styles.detailText}>
                {t('weather.wind', { defaultValue: 'Wind' })}: {weather.windSpeed} kph
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name='location' size={16} color='#007bff' />
              <Text style={styles.detailText}>
                {t('weather.location', { defaultValue: 'Location' })}: FPT University
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>{t('weather.noData')}</Text>
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
