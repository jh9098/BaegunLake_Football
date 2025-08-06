import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; // ⭐️ 주간 뷰를 위해 추가
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { combineDateAndTime, formatDateWithDay } from '@/lib/timeUtils'; // ⭐️ 시간 유틸리티 import

const SessionForm = ({ sessionData, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(sessionData?.title || '');
  const [description, setDescription] = useState(sessionData?.description || '');
  const [targetGrade, setTargetGrade] = useState(sessionData?.targetGrade || '');
  const [targetTeam, setTargetTeam] = useState(sessionData?.targetTeam || '');
  const [startTime, setStartTime] = useState(sessionData?.startTime || '16:00');
  const [endTime, setEndTime] = useState(sessionData?.endTime || '18:00');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ title, description, targetGrade, targetTeam, startTime, endTime });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sessionData.date && <p className="font-semibold text-center text-lg">{formatDateWithDay(sessionData.date)}</p>}
      <div><label>훈련명</label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
      <div><label>상세 내용</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>대상 학년</label><Input value={targetGrade} onChange={(e) => setTargetGrade(e.target.value)} placeholder="예: 초등 3학년"/></div>
        <div><label>대상 팀</label><Input value={targetTeam} onChange={(e) => setTargetTeam(e.target.value)} placeholder="예: U-10"/></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label>시작 시간</label><Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
        <div><label>종료 시간</label><Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
      </div>
      <DialogFooter className="!justify-between mt-6">
        <div>{sessionData?.id && <Button type="button" variant="destructive" onClick={onDelete}>삭제</Button>}</div>
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
          <Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 저장</Button>
        </div>
      </DialogFooter>
    </form>
  );
};

export default function ScheduleManagementPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sessions'), (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ⭐️ [핵심 수정] FullCalendar 이벤트 객체 생성 로직
  const calendarEvents = sessions.map(session => {
    const sessionDate = session.date.toDate();
    const startDateTime = combineDateAndTime(sessionDate, session.startTime);
    const endDateTime = combineDateAndTime(sessionDate, session.endTime);

    return {
      id: session.id,
      // ⭐️ 이벤트 제목에 시간 포함
      title: session.title,
      start: startDateTime,
      end: endDateTime,
      allDay: false, // ⭐️ 시간 정보를 사용하므로 명시적으로 false
    };
  });

  const handleDateClick = (arg) => {
    setModalData({ date: arg.date });
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const session = sessions.find(s => s.id === clickInfo.event.id);
    if (session) {
        setModalData({ ...session, date: session.date.toDate() });
        setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveSession = async (data) => {
    if (modalData?.id) { // 수정
      const eventRef = doc(db, 'sessions', modalData.id);
      await updateDoc(eventRef, { ...data, updatedAt: serverTimestamp() });
    } else { // 생성
      await addDoc(collection(db, 'sessions'), {
        ...data,
        date: modalData.date,
        createdAt: serverTimestamp()
      });
    }
    handleCloseModal();
  };

  const handleDeleteSession = async () => {
    if (modalData?.id && window.confirm('이 훈련 일정을 정말 삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'sessions', modalData.id));
      handleCloseModal();
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>훈련 일정 관리</CardTitle>
          <CardDescription>날짜를 클릭하여 새 일정을 추가하거나, 기존 일정을 클릭하여 수정/삭제하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} // ⭐️ timeGridPlugin 추가
              initialView="dayGridMonth"
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }} // ⭐️ timeGridWeek 추가
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              locale="ko"
              height="auto"
              // ⭐️ 사용자 친화적인 시간 포맷 설정
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short' // '오전'/'오후' 표시
              }}
              eventClassNames="cursor-pointer bg-brand-green-soft border-brand-green-soft"
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => !isOpen && handleCloseModal()}>
        {modalData && (
          <SessionForm
            sessionData={modalData}
            onSave={handleSaveSession}
            onCancel={handleCloseModal}
            onDelete={handleDeleteSession}
          />
        )}
      </Dialog>
    </div>
  );
}