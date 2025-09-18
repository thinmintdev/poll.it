import PollPageClient from '../PollPageClient'

export default async function PollResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <PollPageClient id={id} forceResults={true} />
}