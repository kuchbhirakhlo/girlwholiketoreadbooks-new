import { redirect } from 'next/navigation';

export default function SignUpPage() {
  // Public signup is not available
  // Only staff (admin/editor) accounts are provisioned by administrators
  redirect('/login');
}
