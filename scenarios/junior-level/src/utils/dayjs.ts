import dayjs from 'dayjs';

export const formatTime = (time: string | Date, format = 'YYYY. MM. DD') => {
  return dayjs(time).format(format);
};
