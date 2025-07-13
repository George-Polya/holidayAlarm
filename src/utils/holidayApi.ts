import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Config from 'react-native-config';
import { Holiday, HolidayApiResponse, HolidayCache, MultiYearHolidayCache } from '../types/holiday';

const API_BASE_URL = Config.API_BASE_URL;
const SERVICE_KEY = Config.SERVICE_KEY;
const CACHE_KEY = 'HOLIDAY_CACHE';
const MULTI_YEAR_CACHE_KEY = 'MULTI_YEAR_HOLIDAY_CACHE';

export class HolidayAPI {
  private static async getCachedHolidays(year: number): Promise<Holiday[] | null> {
    try {
      // 먼저 다중 연도 캐시 확인
      const multiYearCacheData = await AsyncStorage.getItem(MULTI_YEAR_CACHE_KEY);
      if (multiYearCacheData) {
        const multiYearCache: MultiYearHolidayCache = JSON.parse(multiYearCacheData);
        const yearCache = multiYearCache[year];
        
        if (yearCache) {
          const lastUpdated = moment(yearCache.lastUpdated);
          const now = moment();
          if (now.diff(lastUpdated, 'days') < 30) { // 30일 캐시
            return yearCache.holidays;
          }
        }
      }
      
      // 기존 단일 연도 캐시 확인 (하위 호환성)
      const cacheData = await AsyncStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;

      const cache: HolidayCache = JSON.parse(cacheData);
      
      // 같은 년도이고 7일 이내의 캐시라면 사용
      const lastUpdated = moment(cache.lastUpdated);
      const now = moment();
      if (cache.year === year && now.diff(lastUpdated, 'days') < 7) {
        return cache.holidays;
      }
      
      return null;
    } catch (error) {
      console.error('캐시 읽기 오류:', error);
      return null;
    }
  }

  private static async setCachedHolidays(year: number, holidays: Holiday[]): Promise<void> {
    try {
      // 다중 연도 캐시 업데이트
      let multiYearCache: MultiYearHolidayCache = {};
      
      const existingData = await AsyncStorage.getItem(MULTI_YEAR_CACHE_KEY);
      if (existingData) {
        multiYearCache = JSON.parse(existingData);
      }
      
      multiYearCache[year] = {
        holidays,
        lastUpdated: moment().toISOString(),
      };
      
      await AsyncStorage.setItem(MULTI_YEAR_CACHE_KEY, JSON.stringify(multiYearCache));
      
      // 하위 호환성을 위해 단일 연도 캐시도 업데이트
      const cache: HolidayCache = {
        year,
        holidays,
        lastUpdated: moment().toISOString(),
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('캐시 저장 오류:', error);
    }
  }

  static async getHolidays(year: number): Promise<Holiday[]> {
    // 캐시 확인
    const cachedHolidays = await this.getCachedHolidays(year);
    if (cachedHolidays) {
      return cachedHolidays;
    }

    try {
      const response = await axios.get<HolidayApiResponse>(`${API_BASE_URL}/getHoliDeInfo`, {
        params: {
          serviceKey: SERVICE_KEY,
          solYear: year,
          _type: 'json',
          numOfRows: 100,
        },
        timeout: 10000, // 10초 타임아웃
        headers: {
          'Accept': 'application/json',
        },
      });

      // 응답 디버깅
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 데이터 타입:', typeof response.data);
      console.log('API 응답 데이터:', JSON.stringify(response.data).substring(0, 200));

      // 응답 구조 안전하게 체크
      if (!response.data) {
        throw new Error('API 응답 데이터가 없습니다');
      }

      if (!response.data.response) {
        console.error('예상치 못한 응답 구조:', response.data);
        throw new Error('API 응답 구조가 올바르지 않습니다');
      }

      if (!response.data.response.header) {
        throw new Error('API 응답 헤더가 없습니다');
      }

      if (response.data.response.header.resultCode !== '00') {
        throw new Error(response.data.response.header.resultMsg || 'API 오류');
      }

      if (!response.data.response.body || !response.data.response.body.items) {
        throw new Error('API 응답에 데이터가 없습니다');
      }

      const items = response.data.response.body.items.item;
      const holidays = Array.isArray(items) ? items : (items ? [items] : []);
      
      // 공휴일만 필터링
      const filteredHolidays = holidays.filter(h => h.isHoliday === 'Y');
      
      // 캐시 저장
      await this.setCachedHolidays(year, filteredHolidays);
      
      return filteredHolidays;
    } catch (error: any) {
      console.error('공휴일 API 호출 오류:', error);
      console.error('오류 상세:', {
        message: error.message,
        code: error.code,
        config: error.config?.url,
      });
      
      // 네트워크 오류인 경우 더 자세한 정보 출력
      if (error.code === 'ECONNABORTED') {
        console.error('요청 시간 초과');
      } else if (error.message === 'Network Error') {
        console.error('네트워크 연결을 확인하세요');
      }
      
      // API 오류 시 빈 배열 반환
      return [];
    }
  }

  static async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const dateStr = moment(date).format('YYYYMMDD');
    
    const holidays = await this.getHolidays(year);
    return holidays.some(h => h.locdate.toString() === dateStr);
  }

  static async getHolidayName(date: Date): Promise<string | null> {
    const year = date.getFullYear();
    const dateStr = moment(date).format('YYYYMMDD');
    
    const holidays = await this.getHolidays(year);
    const holiday = holidays.find(h => h.locdate.toString() === dateStr);
    
    return holiday ? holiday.dateName : null;
  }
}