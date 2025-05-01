import AccountServices from '@services/AccountServices';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '@core/store/authSlice';
import { AppDispatch } from '@core/store/store';
import { validateEmail } from '@utils/validation';
import { FontAwesome } from '@expo/vector-icons';
import { t } from 'i18next';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import LoadingSplashScreen from '@screens/SplashScreen/LoadingSplashScreen';

const SignInScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch: AppDispatch = useDispatch();

  // Redirect URI for OAuth (must match Google OAuth client configuration)
  const redirectUri = 'exp://192.168.2.12:8081/--/oauth2/callback';

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (!text) {
      setEmailError('Email is required');
    } else if (!validateEmail(text)) {
      setEmailError('Invalid email format.');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
    } else {
      setPasswordError('');
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert(
        t('Error'),
        t('Please enter both email and password.', {
          defaultValue: 'Please enter both email and password.',
        })
      );
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert(
        t('Error'),
        t('Invalid email format.', { defaultValue: 'Invalid email format.' })
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        t('Error'),
        t('Password must be at least 6 characters long', {
          defaultValue: 'Password must be at least 6 characters long',
        })
      );
      return;
    }
    setLoading(true);
    try {
      const response = await AccountServices.login(email, password);
      if (response && response.data) {
        Alert.alert(
          t('Success'),
          t('welcome_message', {
            name: response.data?.fullName,
            defaultValue: `Welcome, ${response.data?.fullName || 'User'}`,
          })
        );
        const { accessToken, roleName } = response.data;
        if (roleName.toLowerCase() !== 'manager') {
          dispatch(login({ ...response.data, isAuthenticated: true }));
        } else {
          Alert.alert(
            t('Error'),
            t('You are not authorized to access this page.', {
              defaultValue: 'You are not authorized to access this page.',
            })
          );
        }
      } else {
        Alert.alert(
          t('Error'),
          t('Invalid email or password.', { defaultValue: 'Invalid email or password.' })
        );
      }
    } catch (error: any) {
      Alert.alert(t('Error'), error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateGoogle = async () => {
    const baseUrl = 'https://api.dairyfarmfpt.website/oauth2/authorize/google';
    const googleAuthUrl =
      `${baseUrl}?` +
      `client_id=796302756667-v8k7e9vj907llfj9nrucos35ndqll7i5.apps.googleusercontent.com` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid%20profile%20email` +
      `&state=platform=mobile`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(googleAuthUrl, redirectUri);
      // const redirect = Linking.createURL('/oauth2/callback');
      if (result.type === 'success' && result.url) {
        const { queryParams } = require('expo-linking').parse(result.url);
        const accessToken = queryParams?.access_token;
        const refreshToken = queryParams?.refresh_token;
        const userId = queryParams?.userId;
        const userName = queryParams?.userName;
        const roleName = queryParams?.roleName;

        if (accessToken && refreshToken) {
          dispatch(
            login({
              accessToken,
              refreshToken,
              userId,
              userName,
              roleName,
              isAuthenticated: true,
            })
          );
          Alert.alert(
            t('Success'),
            t('welcome_message', {
              name: userName || 'User',
              defaultValue: `Welcome, ${userName || 'User'}`,
            })
          );
        } else {
          Alert.alert(
            t('Error'),
            t('error_failed_auth_tokens', {
              defaultValue: 'Failed to retrieve authentication tokens',
            })
          );
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        Alert.alert(
          'Cancelled',
          t('Google Sign-In was cancelled', { defaultValue: 'Google Sign-In was cancelled' })
        );
      } else {
        Alert.alert(
          t('Error'),
          t('Failed to complete Google Sign-In', {
            defaultValue: 'Failed to complete Google Sign-In',
          })
        );
      }
    } catch (error) {
      Alert.alert(
        t('Error'),
        t('Failed to initiate Google Sign-In', {
          defaultValue: 'Failed to initiate Google Sign-In',
        })
      );
    }
  };

  if (loading) {
    return <LoadingSplashScreen />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Dairy Farm Management</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder='Email'
              placeholderTextColor='#777'
              keyboardType='email-address'
              value={email}
              onChangeText={handleEmailChange}
            />
            {emailError ? <Text style={styles.errorText}>{t(emailError)}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('Password', { defaultValue: 'Password' })}
                placeholderTextColor='#777'
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={handlePasswordChange}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={24} color='#777' />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{t(passwordError)}</Text> : null}
          </View>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.signInButtonText}>{t('Sign In')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.orText}>{t('OR')}</Text>

          <TouchableOpacity onPress={handleNavigateGoogle} style={styles.googleButton}>
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png',
              }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>{t('Sign In with Google')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  inputError: {
    borderColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  signInButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SignInScreen;
