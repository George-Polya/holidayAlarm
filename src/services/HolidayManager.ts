import moment from 'moment';
import { HolidayAPI } from '../utils/holidayApi';
import { Holiday } from '../types/holiday';

/**
 * 공휴일 데이터를 메모리에서 효율적으로 관리하는 싱글톤 클래스
 * API 호출을 최소화하고 빠른 조회를 제공
 */
export class HolidayManager {
  private static instance: HolidayManager;
  private holidaySet: Set<string> = new Set(); // YYYYMMDD 형식의 날짜 Set
  private holidayMap: Map<string, Holiday> = new Map(); // 날짜별 Holiday 정보
  private loadedYears: Set<number> = new Set(); // 로드된 연도들
  private isInitialized: boolean = false;

  private constructor() {}

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): HolidayManager {
    if (!HolidayManager.instance) {
      HolidayManager.instance = new HolidayManager();
    }
    return HolidayManager.instance;
  }

  /**
   * 특정 연도의 공휴일 데이터 로드
   */
  private async loadYear(year: number): Promise<void> {
    if (this.loadedYears.has(year)) {
      return; // 이미 로드됨
    }

    try {
      const holidays = await HolidayAPI.getHolidays(year);
      
      // Set과 Map에 추가
      holidays.forEach(holiday => {
        const dateStr = holiday.locdate.toString();
        this.holidaySet.add(dateStr);
        this.holidayMap.set(dateStr, holiday);
      });
      
      this.loadedYears.add(year);
      console.log(`${year}년 공휴일 ${holidays.length}개 로드 완료`);
    } catch (error) {
      console.error(`${year}년 공휴일 로드 실패:`, error);
    }
  }

  /**
   * 초기화 - 현재 연도와 다음 연도 공휴일 로드
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const currentYear = new Date().getFullYear();
    
    // 현재 연도와 다음 연도 로드
    await Promise.all([
      this.loadYear(currentYear),
      this.loadYear(currentYear + 1)
    ]);

    this.isInitialized = true;
    console.log('HolidayManager 초기화 완료');
  }

  /**
   * 특정 날짜가 공휴일인지 확인 (O(1) 성능)
   */
  async isHoliday(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    
    // 해당 연도 데이터가 없으면 로드
    if (!this.loadedYears.has(year)) {
      await this.loadYear(year);
    }
    
    const dateStr = moment(date).format('YYYYMMDD');
    return this.holidaySet.has(dateStr);
  }

  /**
   * 특정 날짜의 공휴일 이름 반환
   */
  async getHolidayName(date: Date): Promise<string | null> {
    const year = date.getFullYear();
    
    // 해당 연도 데이터가 없으면 로드
    if (!this.loadedYears.has(year)) {
      await this.loadYear(year);
    }
    
    const dateStr = moment(date).format('YYYYMMDD');
    const holiday = this.holidayMap.get(dateStr);
    return holiday ? holiday.dateName : null;
  }

  /**
   * 특정 연도의 모든 공휴일 반환
   */
  async getHolidaysForYear(year: number): Promise<Holiday[]> {
    if (!this.loadedYears.has(year)) {
      await this.loadYear(year);
    }
    
    const holidays: Holiday[] = [];
    this.holidayMap.forEach((holiday, dateStr) => {
      if (dateStr.startsWith(year.toString())) {
        holidays.push(holiday);
      }
    });
    
    return holidays.sort((a, b) => a.locdate - b.locdate);
  }

  /**
   * 캐시 상태 정보 반환 (디버깅용)
   */
  getCacheStatus(): {
    loadedYears: number[];
    totalHolidays: number;
    isInitialized: boolean;
  } {
    return {
      loadedYears: Array.from(this.loadedYears).sort(),
      totalHolidays: this.holidaySet.size,
      isInitialized: this.isInitialized
    };
  }

  /**
   * 캐시 갱신 - 강제로 특정 연도 다시 로드
   */
  async refreshYear(year: number): Promise<void> {
    this.loadedYears.delete(year);
    
    // 해당 연도의 기존 데이터 제거
    const yearStr = year.toString();
    const keysToDelete: string[] = [];
    
    this.holidayMap.forEach((_, dateStr) => {
      if (dateStr.startsWith(yearStr)) {
        keysToDelete.push(dateStr);
      }
    });
    
    keysToDelete.forEach(key => {
      this.holidaySet.delete(key);
      this.holidayMap.delete(key);
    });
    
    // 다시 로드
    await this.loadYear(year);
  }
}