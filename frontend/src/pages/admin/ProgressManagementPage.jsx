import { useState, useEffect } from 'react';
import { db, storage } from '../../firebaseConfig';
import { collection, onSnapshot, query, where, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';

// 성취 리포트 폼 컴포넌트
const ReportForm = ({ report, childId, onSave, onCancel }) => {
  const [notes, setNotes] = useState(report?.notes || '');
  const [stats, setStats] = useState(report?.stats || { shooting: 0, dribbling: 0, passing: 0, stamina: 0, teamwork: 0 });
  const [photo, setPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatChange = (stat, value) => {
    setStats(prev => ({ ...prev, [stat]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    let photoUrl = report?.photoUrl || null;
    let videoUrl = report?.videoUrl || null;

    try {
        if (photo) {
            const photoRef = ref(storage, `reports/${childId}/${Date.now()}_${photo.name}`);
            await uploadBytes(photoRef, photo);
            photoUrl = await getDownloadURL(photoRef);
        }
        if (video) {
            const videoRef = ref(storage, `reports/${childId}/${Date.now()}_${video.name}`);
            await uploadBytes(videoRef, video);
            videoUrl = await getDownloadURL(videoRef);
        }
    } catch(err) {
        console.error("File upload error:", err);
        alert("파일 업로드 중 오류가 발생했습니다.");
        setIsSaving(false);
        return;
    }
    
    await onSave({ notes, stats, photoUrl, videoUrl });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="font-semibold">코치 코멘트</label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} /></div>
      <div className="grid grid-cols-2 gap-4">
        {Object.keys(stats).map(stat => (
          <div key={stat}>
            <label className="capitalize">{stat}</label>
            <Input type="number" min="0" max="10" value={stats[stat]} onChange={e => handleStatChange(stat, e.target.value)} />
          </div>
        ))}
      </div>
      <div><label>사진 업로드 (선택)</label><Input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} /></div>
      <div><label>영상 업로드 (선택)</label><Input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} /></div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>취소</Button>
        <Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>} 저장</Button>
      </DialogFooter>
    </form>
  );
};

export default function ProgressManagementPage() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  useEffect(() => {
    const unsubChildren = onSnapshot(collection(db, 'children'), (snap) => {
      const childrenData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChildren(childrenData);
      if (childrenData.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenData[0].id);
      } else if (childrenData.length === 0) {
        setSelectedChildId('');
      }
      setLoading(false);
    });
    return () => unsubChildren();
  }, [selectedChildId]);

  useEffect(() => {
    if (!selectedChildId) {
        setReports([]);
        return;
    };
    const reportsQuery = query(
      collection(db, 'progressReports'),
      where('childId', '==', selectedChildId),
      orderBy('date', 'desc')
    );
    const unsubReports = onSnapshot(reportsQuery, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubReports();
  }, [selectedChildId]);
  
  const handleSaveReport = async (data) => {
    if (editingReport) {
      await updateDoc(doc(db, 'progressReports', editingReport.id), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'progressReports'), { ...data, childId: selectedChildId, date: serverTimestamp() });
    }
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleDeleteReport = async (reportId) => {
      if (window.confirm('이 리포트를 정말 삭제하시겠습니까?')) {
          await deleteDoc(doc(db, 'progressReports', reportId));
      }
  };

  const selectedChildName = children.find(c => c.id === selectedChildId)?.name || '';

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => { if (!isOpen) { setIsModalOpen(false); setEditingReport(null); }}}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingReport ? `리포트 수정 (${selectedChildName})` : `새 리포트 작성 (${selectedChildName})`}</DialogTitle>
              <DialogDescription>학생의 훈련 성과를 기록합니다.</DialogDescription>
            </DialogHeader>
            <ReportForm report={editingReport} childId={selectedChildId} onSave={handleSaveReport} onCancel={() => { setIsModalOpen(false); setEditingReport(null); }} />
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>학생 성과 관리</CardTitle>
              <CardDescription>학생을 선택하고 성취 리포트를 작성 및 관리합니다.</CardDescription>
            </div>
            <Button onClick={() => setIsModalOpen(true)} disabled={!selectedChildId}>
              <PlusCircle className="w-4 h-4 mr-2"/> 새 리포트 작성
            </Button>
          </div>
          <div className="mt-4">
            <label className="font-semibold">학생 선택</label>
            {loading ? <p>학생 목록 로딩 중...</p> : (
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger>{selectedChildName || "학생을 선택하세요"}</SelectTrigger>
                <SelectContent>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.name} ({child.team})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
            {loading ? <Loader2 className="mx-auto w-8 h-8 animate-spin"/> : (
                <div className="space-y-4">
                    {reports.map(report => (
                        <Card key={report.id} className="p-4">
                           <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold">{report.date?.toDate().toLocaleDateString('ko-KR')} 리포트</h3>
                                    <p className="text-sm text-gray-600 mt-2">{report.notes}</p>
                                </div>
                                <div className="space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => { setEditingReport(report); setIsModalOpen(true); }}>수정</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDeleteReport(report.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                           </div>
                        </Card>
                    ))}
                    {reports.length === 0 && !loading && <p className="text-center text-gray-500 py-8">선택된 학생의 리포트가 없습니다.</p>}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}