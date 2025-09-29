import VerificationSystem from '@/components/verification/verification-system';
import { getAuthSession } from '@/lib/auth';

export default async function VerificationPage() {
  const session = await getAuthSession();
  // ... get user data
  
  return <VerificationSystem user={userData} />;
}