export interface Poll {
  id: string
  question: string
  description?: string
  options: string[]
  poll_type?: 'text' | 'image'
  image_options?: PollImageOption[]
  allow_multiple_selections?: boolean
  max_selections?: number
  comments_enabled?: boolean
  hide_results?: 'none' | 'until_vote' | 'entirely'
  user_id?: string | null
  is_public?: boolean
  allow_anonymous_voting?: boolean
  created_at: string
  updated_at: string
}

export interface PollImageOption {
  id: string
  image_url: string
  caption?: string
  order_index: number
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
  description?: string
  options: string[]
  pollType?: 'text' | 'image'
  imageOptions?: CreateImageOption[]
  allowMultipleSelections?: boolean
  maxSelections?: number
  commentsEnabled?: boolean
  hideResults?: 'none' | 'until_vote' | 'entirely'
}

export interface CreateImageOption {
  imageUrl: string
  caption?: string
}

export interface VoteData {
  optionIndex: number | number[]
}

export interface Comment {
  id: string
  poll_id: string
  user_id: string
  user_name: string
  user_image?: string
  content: string
  parent_id?: string
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface CreateCommentData {
  content: string
  parent_id?: string
}
