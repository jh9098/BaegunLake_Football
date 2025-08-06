import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Trash2, Edit } from 'lucide-react';

// 게시글 폼 컴포넌트 (글쓰기/수정용)
const PostForm = ({ post, onSave, onCancel }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return alert('제목과 내용을 모두 입력해주세요.');
    setIsSaving(true);
    await onSave({ title, content });
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="font-semibold">제목</label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" />
      </div>
      <div>
        <label htmlFor="content" className="font-semibold">내용</label>
        <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="내용을 입력하세요" rows={6} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>취소</Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {post ? '수정하기' : '작성하기'}
        </Button>
      </DialogFooter>
    </form>
  );
};


export default function CommunityPage() {
  const { currentUser, userData } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    const postsQuery = query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (postData) => {
    await addDoc(collection(db, 'communityPosts'), {
      ...postData,
      authorUid: currentUser.uid,
      authorName: userData.displayName,
      createdAt: serverTimestamp(),
    });
    setIsWriteModalOpen(false);
  };

  const handleUpdatePost = async (postData) => {
    if (!editingPost) return;
    const postRef = doc(db, 'communityPosts', editingPost.id);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp(),
    });
    setEditingPost(null);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      await deleteDoc(doc(db, 'communityPosts', postId));
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">학부모 커뮤니티</h1>
        <Dialog open={isWriteModalOpen} onOpenChange={setIsWriteModalOpen}>
          <DialogTrigger asChild>
            <Button>새 글 작성</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>새 글 작성</DialogTitle></DialogHeader>
            <PostForm onSave={handleCreatePost} onCancel={() => setIsWriteModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-green" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
            <p>작성된 게시글이 없습니다.</p>
            <p>첫 번째 글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-xl">{post.title}</span>
                  {currentUser && currentUser.uid === post.authorUid && (
                    <div className="flex items-center space-x-2">
                      <Dialog open={editingPost?.id === post.id} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)}><Edit className="w-4 h-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>글 수정</DialogTitle></DialogHeader>
                          <PostForm post={editingPost} onSave={handleUpdatePost} onCancel={() => setEditingPost(null)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  작성자: {post.authorName} | 작성일: {post.createdAt?.toDate().toLocaleDateString('ko-KR')}
                </p>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}