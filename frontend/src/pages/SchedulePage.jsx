import { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, orderBy } from '../firebaseConfig';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Clock, Users, UserCircle } from 'lucide-react';
import { combineDateAndTime, formatDateWithDay } from '@/lib/timeUtils'; // ⭐️ 관리자 페이지와 동일한 유틸리티 사용

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]); // Firestore 원본 데이터
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null); // 클릭된 이벤트의 원본 데이터

  useEffect(() => {
    setLoading(true);
    const sessionsQuery = query(collection(db, 'sessions'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(sessionsQuery, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(sessionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  // FullCalendar에 표시할 이벤트 데이터로 가공
  const calendarEvents = sessions.map(session => {
    const sessionDate = session.date.toDate();
    const startDateTime = combineDateAndTime(sessionDate, session.startTime);
    const endDateTime = combineDateAndTime(sessionDate, session.endTime);

    return {
      id: session.id,
      title: session.title,
      start: startDateTime,
      end: endDateTime,
      allDay: false,
    };
  });
  
  const handleEventClick = (clickInfo) => {
    // 캘린더 이벤트 ID를 사용하여 원본 세션 데이터를 찾음
    const sessionData = sessions.find(s => s.id === clickInfo.event.id);
    if (sessionData) {
      setSelectedEvent(sessionData);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">훈련 일정</CardTitle>
          <CardDescription>전체 훈련 일정을 확인할 수 있습니다. 일정을 클릭하여 상세 정보를 보세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
            </div>
          ) : (
            <div className="p-0.5 border rounded-md">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek'
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                locale="ko"
                height="auto" // 부모 요소에 맞춰 높이 자동 조절
                eventTimeFormat={{
                  hour: 'numeric',
                  minute: '2-digit',
                  meridiem: 'short'
                }}
                eventDisplay="block" // 이벤트를 블록 형태로 표시
                eventClassNames="cursor-pointer bg-brand-green-soft hover:bg-brand-green border-brand-green-soft text-white p-1"
                dayMaxEvents={true} // 하루에 이벤트가 많으면 "+ more" 링크 표시
              />
            </div>
          )}

          {/* 이벤트 상세 정보 Dialog */}
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent && formatDateWithDay(selectedEvent.date.toDate())}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-gray-500"/>
                  <span className="font-semibold">시간:</span>
                  <span className="ml-2">{selectedEvent?.startTime} ~ {selectedEvent?.endTime}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-gray-500"/>
                  <span className="font-semibold">대상:</span>
                  <span className="ml-2">{selectedEvent?.targetTeam} ({selectedEvent?.targetGrade})</span>
                </div>
                <div className="flex items-start">
                  <UserCircle className="w-5 h-5 mr-3 text-gray-500 mt-1"/>
                  <div className="flex-1">
                    <span className="font-semibold">훈련 내용:</span>
                    <p className="ml-2 mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedEvent?.description || '상세 내용이 없습니다.'}
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </CardContent>
      </Card>
    </div>
  );
}