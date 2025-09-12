import { redirect } from 'next/navigation';

export default function Home() {
  // Automatische Weiterleitung zum Dashboard
  redirect('/dashboard');
}
