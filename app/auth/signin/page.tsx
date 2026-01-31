import { redirect } from 'next/navigation';

export default function SignInPage() {
  // Public signup/signin is not available
  // Only staff (admin/editor) access via /login
  redirect('/login');
}
