export interface Holiday {
  dateKind: string; // 종류 (국경일, 공휴일 등)
  dateName: string; // 명칭
  isHoliday: 'Y' | 'N'; // 공휴일 여부
  locdate: number; // 날짜 (YYYYMMDD 형식)
  seq: number; // 순번
}

export interface HolidayApiResponse {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: Holiday | Holiday[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface HolidayCache {
  year: number;
  holidays: Holiday[];
  lastUpdated: string;
}

export interface MultiYearHolidayCache {
  [year: number]: {
    holidays: Holiday[];
    lastUpdated: string;
  };
}