import axios from 'axios';

export const profileApi = {
  getProvinceApi: async () => {
    try {
      const response = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getDistrictApi: async (province: string) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/2/${province}.htm`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getWardApi: async (district: string) => {
    try {
      const response = await axios.get(`https://esgoo.net/api-tinhthanh/3/${district}.htm`);
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
};
