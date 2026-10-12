'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/account/profile');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-gold" />
    </div>
  );
}
