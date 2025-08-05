import PollPageClient from './PollPageClient'

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return <PollPageClient id={id} />
}