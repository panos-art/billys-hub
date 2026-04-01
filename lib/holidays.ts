/**
 * Calculate Orthodox Easter date using the Julian calendar Meeus algorithm,
 * then convert to Gregorian calendar.
 */
export function getOrthodoxEaster(year: number): Date {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3 = March, 4 = April
  const day = ((d + e + 114) % 31) + 1;

  // Julian date
  const julianDate = new Date(year, month - 1, day);

  // Convert Julian to Gregorian: add 13 days for 1900-2099
  const gregorianDay = julianDate.getDate() + 13;
  return new Date(year, julianDate.getMonth(), gregorianDay);
}

export interface HolidayEntry {
  name: string;
  date: Date;
  isRecurring: boolean;
}

export function getFixedHolidays(year: number): HolidayEntry[] {
  return [
    { name: "Πρωτοχρονιά", date: new Date(year, 0, 1), isRecurring: true },
    { name: "Θεοφάνεια", date: new Date(year, 0, 6), isRecurring: true },
    { name: "25η Μαρτίου", date: new Date(year, 2, 25), isRecurring: true },
    {
      name: "Εργατική Πρωτομαγιά",
      date: new Date(year, 4, 1),
      isRecurring: true,
    },
    {
      name: "Κοίμηση της Θεοτόκου",
      date: new Date(year, 7, 15),
      isRecurring: true,
    },
    { name: "28η Οκτωβρίου", date: new Date(year, 9, 28), isRecurring: true },
    { name: "Χριστούγεννα", date: new Date(year, 11, 25), isRecurring: true },
    {
      name: "Σύναξη Θεοτόκου",
      date: new Date(year, 11, 26),
      isRecurring: true,
    },
  ];
}

export function getMovableHolidays(year: number): HolidayEntry[] {
  const easter = getOrthodoxEaster(year);
  const easterTime = easter.getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      name: "Καθαρά Δευτέρα",
      date: new Date(easterTime - 48 * dayMs),
      isRecurring: false,
    },
    {
      name: "Μεγάλη Παρασκευή",
      date: new Date(easterTime - 2 * dayMs),
      isRecurring: false,
    },
    {
      name: "Δευτέρα του Πάσχα",
      date: new Date(easterTime + 1 * dayMs),
      isRecurring: false,
    },
    {
      name: "Αγίου Πνεύματος",
      date: new Date(easterTime + 50 * dayMs),
      isRecurring: false,
    },
  ];
}

export function getAllHolidays(year: number): HolidayEntry[] {
  return [...getFixedHolidays(year), ...getMovableHolidays(year)];
}
