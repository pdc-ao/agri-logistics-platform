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
  const userData = await db.user.findUnique({
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
    }
  });

  if (!userData) {
    redirect('/auth/login');
  }

  // Transform null values to undefined for VerificationSystem
  const user = {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    fullName: userData.fullName ?? undefined,
    role: userData.role,
    isVerified: userData.isVerified,
    verificationStatus: userData.verificationStatus,
    verificationDetails: userData.verificationDetails ?? undefined,
    phoneNumber: userData.phoneNumber ?? undefined,
    entityType: userData.entityType,
    companyName: userData.companyName ?? undefined,
  };

  return <VerificationSystem user={user} />;
}