// Standard Polls Feed - Now using the simplified approach
// for consistency and reliability across all feed components

import SimplifiedPollsFeed from './SimplifiedPollsFeed'

export default function PollFeed() {
  return (
    <SimplifiedPollsFeed
      showHeader={true}
      enableInfiniteScroll={true}
      itemsPerPage={15}
      maxHeight="calc(100vh - 200px)"
    />
  )
}
