import { redirect } from 'next/navigation'

// The notebook is still the static prototype; it moves into React pages as it gets wired to Payload.
export default function HomePage() {
  redirect('/prototype.html')
}
