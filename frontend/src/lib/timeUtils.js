import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 날짜 객체와 'HH:mm' 형식의 시간 문자열을 결합하여 새로운 Date 객체를 생성합니다.
 * @param {Date} date - 기준 날짜 객체
 * @param {string} timeString - 'HH:mm' 형식의 시간 (예: '16:00')
 * @returns {Date} 날짜와 시간이 합쳐진 새로운 Date 객체
 */
export const combineDateAndTime = (date, timeString) => {
  if (!date || !timeString) return date;
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0); // 시, 분, 초, 밀리초 설정
  return newDate;
};

/**
 * Date 객체를 받아서 '오후 4:00' 과 같은 형식의 문자열로 변환합니다.
 * @param {Date} date - 변환할 Date 객체
 * @returns {string} 포맷팅된 시간 문자열
 */
export const formatTime = (date) => {
  if (!date) return '';
  return format(date, 'a h:mm', { locale: ko }); // 'a'가 오전/오후를 나타냄
};

/**
 * Date 객체를 받아서 '2024. 8. 7. (수)' 와 같은 형식의 문자열로 변환합니다.
 * @param {Date} date - 변환할 Date 객체
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDateWithDay = (date) => {
    if (!date) return '';
    return format(date, 'yyyy. M. d. (EEE)', { locale: ko });
};