// Simplified Polls Feed - Replaces complex GSAP-based infinite scroll
// with reliable CSS-based solution that handles variable height cards properly

import SimplifiedPollsFeed from './SimplifiedPollsFeed'

export default function PollFeedInfiniteScroll() {
  return (
    <SimplifiedPollsFeed
      className="h-full"
      showHeader={true}
      enableInfiniteScroll={true}
      itemsPerPage={30}
      maxHeight="calc(100vh - 160px)"
    />
  )
}