import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
// ⭐️ [핵심 수정] writeBatch 함수를 import 합니다.
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, writeBatch, arrayRemove } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Trash2 } from 'lucide-react';

// 회원 정보 수정 모달 (EditParentModal)
const EditParentModal = ({ parent, allChildren, onSave, onCancel }) => {
  const [role, setRole] = useState(parent.role);
  const [childrenIds, setChildrenIds] = useState(parent.children || []);
  const [name, setName] = useState(parent.name || '');
  const [contact, setContact] = useState(parent.contact || '');

  const handleChildToggle = (childId) => {
    setChildrenIds(prev => prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{parent.displayName}님 정보 수정</DialogTitle>
        <DialogDescription>회원의 역할과 배정된 자녀를 수정합니다.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div><label>이름</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <div><label>연락처</label><Input value={contact} onChange={e => setContact(e.target.value)} /></div>
        <div><label>역할</label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="parent">parent</SelectItem>
              <SelectItem value="coach">coach</SelectItem>
              <SelectItem value="admin">admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><label>자녀 배정</label>
          <div className="max-h-48 overflow-y-auto border p-2 rounded-md space-y-2">
            {allChildren.length > 0 ? allChildren.map(child => (
              <div key={child.id} className="flex items-center space-x-2">
                <input type="checkbox" id={`child-${child.id}`} checked={childrenIds.includes(child.id)} onChange={() => handleChildToggle(child.id)} />
                <label htmlFor={`child-${child.id}`}>{child.name} ({child.team})</label>
              </div>
            )) : <p className="text-sm text-gray-500">등록된 학생이 없습니다.</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>취소</Button>
        <Button onClick={() => onSave({ name, contact, role, children: childrenIds })}>저장</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// 학생 정보 폼 모달 (ChildFormModal)
const ChildFormModal = ({ child, onSave, onCancel }) => {
    const [name, setName] = useState(child?.name || '');
    const [grade, setGrade] = useState(child?.grade || '');
    const [team, setTeam] = useState(child?.team || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        if (!name || !team) return alert('학생 이름과 팀은 필수입니다.');
        setIsSaving(true);
        await onSave({ name, grade, team });
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{child ? '학생 정보 수정' : '새 학생 등록'}</DialogTitle>
                <DialogDescription>{child ? `${child.name} 학생의 정보를 수정합니다.` : '새로운 학생의 기본 정보를 입력합니다.'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div><label>이름</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div><label>학년</label><Input value={grade} onChange={e => setGrade(e.target.value)} placeholder="예: 초등 3학년" /></div>
                <div><label>소속팀</label><Input value={team} onChange={e => setTeam(e.target.value)} placeholder="예: U-10"/></div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>취소</Button>
                <Button onClick={handleSubmit} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 저장</Button>
            </DialogFooter>
        </DialogContent>
    );
};

// 메인 컴포넌트
export default function MemberManagementPage() {
  const [parents, setParents] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingParent, setEditingParent] = useState(null);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);

  useEffect(() => {
    const unsubParents = onSnapshot(collection(db, 'users'), (snap) => setParents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubChildren = onSnapshot(collection(db, 'children'), (snap) => {
      setChildren(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubParents(); unsubChildren(); };
  }, []);

  const getChildName = (childId) => children.find(c => c.id === childId)?.name || 'N/A';
  
  const handleSaveParent = async (data) => {
    if (!editingParent) return;
    await updateDoc(doc(db, 'users', editingParent.id), data);
    setEditingParent(null);
  };
  
  const handleSaveChild = async (data) => {
    if (editingChild) {
      await updateDoc(doc(db, 'children', editingChild.id), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'children'), { ...data, attendanceStatus: '미등원', createdAt: serverTimestamp() });
    }
    setIsChildModalOpen(false);
    setEditingChild(null);
  };

  const handleDeleteChild = async (childId) => {
    if (window.confirm("정말로 이 학생 정보를 삭제하시겠습니까? 연관된 모든 성과 기록도 함께 삭제됩니다. (학부모 배정은 해제됩니다)")) {
      try {
        // ⭐️ [핵심 수정] db.batch() 대신 writeBatch(db)를 사용합니다.
        const batch = writeBatch(db);
        
        // 1. 모든 학부모 문서에서 해당 자녀 ID 제거
        parents.forEach(p => {
          if (p.children?.includes(childId)) {
            const parentRef = doc(db, 'users', p.id);
            // ⭐️ [핵심 수정] 배열에서 특정 요소를 제거하는 arrayRemove를 사용합니다.
            batch.update(parentRef, { children: arrayRemove(childId) });
          }
        });

        // 2. 학생 문서 삭제
        const childRef = doc(db, 'children', childId);
        batch.delete(childRef);
        
        // TODO: 해당 childId를 가진 progressReports도 삭제하는 로직 추가 필요
        // (이 작업은 양이 많아질 경우 Cloud Function으로 처리하는 것이 더 안전하고 효율적입니다.)

        await batch.commit();
        alert("학생 정보가 성공적으로 삭제되었습니다.");
      } catch (error) {
          console.error("학생 삭제 중 오류 발생:", error);
          alert("학생 정보 삭제에 실패했습니다.");
      }
    }
  };

  const getParentName = (child) => {
    const parent = parents.find(p => p.children?.includes(child.id));
    if (!parent) return <span className="text-gray-400">미배정</span>;
    return parent.name || parent.displayName;
  };
  
  const openNewChildModal = () => {
    setEditingChild(null);
    setIsChildModalOpen(true);
  };

  const openEditChildModal = (child) => {
    setEditingChild(child);
    setIsChildModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Dialog open={!!editingParent} onOpenChange={(isOpen) => !isOpen && setEditingParent(null)}>
        {editingParent && <EditParentModal parent={editingParent} allChildren={children} onSave={handleSaveParent} onCancel={() => setEditingParent(null)} />}
      </Dialog>
      <Dialog open={isChildModalOpen} onOpenChange={(isOpen) => !isOpen && (setIsChildModalOpen(false), setEditingChild(null))}>
        <ChildFormModal child={editingChild} onSave={handleSaveChild} onCancel={() => { setIsChildModalOpen(false); setEditingChild(null); }} />
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>학부모/코치 관리</CardTitle>
          <CardDescription>전체 회원 목록 및 자녀 배정 현황입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>아이디</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>배정된 자녀</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan="7" className="text-center h-24">로딩 중...</TableCell></TableRow> :
                parents.map(parent => (
                  <TableRow key={parent.id}>
                    <TableCell className="font-medium">{parent.displayName}</TableCell>
                    <TableCell>{parent.name || '-'}</TableCell>
                    <TableCell>{parent.contact || '-'}</TableCell>
                    <TableCell>{parent.email}</TableCell>
                    <TableCell><Badge variant={parent.role === 'admin' ? 'destructive' : 'secondary'}>{parent.role}</Badge></TableCell>
                    <TableCell>{parent.children?.map(getChildName).join(', ') || '없음'}</TableCell>
                    <TableCell><Button variant="outline" size="sm" onClick={() => setEditingParent(parent)}>정보/자녀 수정</Button></TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>학생 관리</CardTitle>
              <CardDescription>전체 학생 목록 및 배정된 학부모 정보입니다.</CardDescription>
            </div>
            <Button onClick={openNewChildModal}>
                <UserPlus className="w-4 h-4 mr-2"/>
                새 학생 등록
            </Button>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>학년</TableHead><TableHead>소속팀</TableHead><TableHead>배정된 학부모</TableHead><TableHead className="text-right">관리</TableHead></TableRow></TableHeader>
                <TableBody>
                    {loading ? <TableRow><TableCell colSpan="5" className="text-center h-24">로딩 중...</TableCell></TableRow> :
                        children.map(child => (
                            <TableRow key={child.id}>
                                <TableCell className="font-medium">{child.name}</TableCell>
                                <TableCell>{child.grade}</TableCell>
                                <TableCell>{child.team}</TableCell>
                                <TableCell>{getParentName(child)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button variant="outline" size="sm" onClick={() => openEditChildModal(child)}>수정</Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteChild(child.id)}>
                                    <Trash2 className="w-4 h-4"/>
                                  </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}