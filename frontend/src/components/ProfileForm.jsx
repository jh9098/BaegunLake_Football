import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export default function ProfileForm({ initialData = {}, onSubmit, submitLabel, loading }) {
  const [username, setUsername] = useState(initialData.username || '');
  const [name, setName] = useState(initialData.name || '');
  const [contact, setContact] = useState(initialData.contact || '');
  const [children, setChildren] = useState(
    initialData.children && initialData.children.length > 0
      ? initialData.children
      : [{ id: null, name: '', gender: '', age: '', grade: '', note: '' }]
  );

  const handleAddChild = () => {
    setChildren([...children, { id: null, name: '', gender: '', age: '', grade: '', note: '' }]);
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, name, contact, children });
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">아이디</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">연락처</Label>
        <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>자녀 정보</Label>
        {children.map((child, idx) => (
          <div key={idx} className="border p-4 rounded-md space-y-2">
            <div className="space-y-2">
              <Label htmlFor={`child-name-${idx}`}>이름</Label>
              <Input
                id={`child-name-${idx}`}
                value={child.name}
                onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>성별</Label>
              <Select value={child.gender} onValueChange={(val) => handleChildChange(idx, 'gender', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="성별 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남</SelectItem>
                  <SelectItem value="female">여</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`child-age-${idx}`}>연령</Label>
              <Input
                id={`child-age-${idx}`}
                type="number"
                value={child.age}
                onChange={(e) => handleChildChange(idx, 'age', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`child-grade-${idx}`}>학년</Label>
              <Input
                id={`child-grade-${idx}`}
                value={child.grade}
                onChange={(e) => handleChildChange(idx, 'grade', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`child-note-${idx}`}>특이사항</Label>
              <Textarea
                id={`child-note-${idx}`}
                value={child.note}
                onChange={(e) => handleChildChange(idx, 'note', e.target.value)}
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddChild}>
          자녀 추가
        </Button>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}

