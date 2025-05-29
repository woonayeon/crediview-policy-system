import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PolicyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) return <div>로딩 중...</div>;
  
  return (
    <div>
      <h1>정책 상세 페이지</h1>
      <p>정책 ID: {id}</p>
    </div>
  );
}
