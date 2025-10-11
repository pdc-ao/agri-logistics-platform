import VerificationSystem from '@/components/verification/verification-system';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/prisma';

export default async function VerificationPage() {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Fetch user data from database
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
      isVerified: true,
      verificationStatus: true,
      verificationDetails: true,
      phoneNumber: true,
      entityType: true,
      companyName: true,
      // Add any other fields needed by VerificationSystem
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  return <VerificationSystem user={user} />;
}