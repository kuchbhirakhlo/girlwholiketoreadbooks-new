import { redirect } from 'next/navigation';

export default function NewEditorPage() {
  // Redirect to the main editor page for creating new reviews
  redirect('/editor');
}
