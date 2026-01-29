export const toLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const buildISODateTime = (dateStr: string, hour: number) => {
  const date = new Date(dateStr); // local date (YYYY-MM-DD)

  const hours = Math.floor(hour);
  const minutes = Math.round((hour % 1) * 60);

  date.setHours(hours, minutes, 0, 0); // local time
  return date.toISOString(); // UTC ISO
};
