import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AttendanceManagementPage() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'children'), (snap) => {
      setChildren(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, 'children', id), { attendanceStatus: status });
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>출결 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>팀</TableHead>
                <TableHead>현재 상태</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {children.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>{child.team}</TableCell>
                  <TableCell>
                    <Badge>{child.attendanceStatus || '미등원'}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(child.id, '출석')}>출석</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(child.id, '지각')}>지각</Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(child.id, '결석')}>결석</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
