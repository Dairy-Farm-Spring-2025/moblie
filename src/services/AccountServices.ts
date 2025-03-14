import { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '@config/axios/axios';
import { LoginResponse } from '@common/types/type';

class AccountServices {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = apiClient;
  }

  async login(email: string, password: string): Promise<LoginResponse | null> {
    try {
      const response: LoginResponse = await this.apiClient.post(
        '/users/signin',
        {
          email,
          password,
        }
      );

      const { code, message, data } = response;
      console.log(code, message, data);

      if (
        response.code === 200 &&
        (response.message === 'Login successfully' ||
          response.message === 'Đăng nhập thành công')
      ) {
        const { accessToken, refreshToken, userId, fullName, roleName } =
          response.data!;

        // Store tokens and user info in AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userId', userId.toString());
        await AsyncStorage.setItem('fullName', fullName);
        await AsyncStorage.setItem('roleName', roleName);

        return response;
      } else {
        return null;
      }
    } catch (error: any) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.data[0]);
      } else {
        console.error('Network or server error:', error.message);
        throw new Error('Something went wrong. Please try again.');
      }
    }
  }
}

export default new AccountServices();
