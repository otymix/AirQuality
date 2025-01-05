// Basic conversion from DD/MM/YYYY to timestamp in ms
export const convertToTimestamp = (dateStr: string): string => {
  // Split the date string into day, month, year
  const [day, month, year] = dateStr.split("/");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  // Get timestamp in milliseconds
  return String(date.getTime() / 1000);
};

export const validFields = [
  "co",
  "nmhc",
  "benzene",
  "nox",
  "no2",
  "pt08_s1_co",
  "pt08_s2_nmhc",
  "pt08_s3_nox",
  "pt08_s4_no2",
  "pt08_s5_o3",
  "temperature",
  "relative_humidity",
  "absolute_humidity",
];

export const isValidField = (field: string): boolean => {
  !validFields.includes(field);
  return validFields.includes(field);
};
