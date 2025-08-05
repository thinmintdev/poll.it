export interface Poll {
  id: string
  question: string
  options: string[]
  allow_multiple_selections?: boolean
  max_selections?: number
  created_at: string
  updated_at: string
}

export interface Vote {
  id: string
  poll_id: string
  option_index: number
  voter_ip: string
  voted_at: string
}

export interface PollResults {
  poll: Poll
  results: {
    option: string
    votes: number
    percentage: number
  }[]
  totalVotes: number
}

export interface CreatePollData {
  question: string
  options: string[]
  allowMultipleSelections?: boolean
  maxSelections?: number
}

export interface VoteData {
  optionIndex: number | number[]
}
