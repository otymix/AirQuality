// types/AirQuality.ts
export interface AirQualityData {
  id?: number;
  date: string;
  time: string;
  co: number;
  pt08_s1_co: number;
  nmhc: number;
  benzene: number;
  pt08_s2_nmhc: number;
  nox: number;
  pt08_s3_nox: number;
  no2: number;
  pt08_s4_no2: number;
  pt08_s5_o3: number;
  temperature: number;
  relative_humidity: number;
  absolute_humidity: number;
}

export type AirQualityDataNoId = Omit<AirQualityData, "id">;
