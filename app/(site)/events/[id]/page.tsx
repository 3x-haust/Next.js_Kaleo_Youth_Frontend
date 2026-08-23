import { redirect } from 'next/navigation';

export default function EventDetailRedirect() {
  redirect('/events');
}
