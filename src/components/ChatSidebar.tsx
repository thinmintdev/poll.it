"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { MessageCircle, Send, Search, MoreVertical, Phone, Video, X, Minimize2 } from "lucide-react"

export interface Message {
  id: number
  user: string
  avatar?: string
  message: string
  timestamp: string
  isOwn: boolean
  type: "text" | "poll" | "system"
}

export interface ChatUser {
  id: number
  name: string
  avatar?: string
  status: "online" | "away" | "offline"
  lastSeen?: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  onMinimize: () => void
  messages?: Message[]
  users?: ChatUser[]
  onSendMessage?: (msg: string) => Promise<void> | void
  sending?: boolean
  pollId?: string // Needed for realtime subscription
  onLiveUpdate?: () => void // Called when a new message is inserted
}

export function ChatSidebar({
  isOpen,
  onClose,
  onMinimize,
  messages = [],
  users = [],
  onSendMessage,
  sending: sendingProp = false,
  pollId,
  onLiveUpdate,
}: ChatSidebarProps) {
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"chat" | "users">("chat")
  const [searchQuery, setSearchQuery] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // If parent controls sending, use that, else local state
  const isSending = sendingProp || sending

  const handleSendMessage = async () => {
    if (message.trim()) {
      setSending(true)
      try {
        await onSendMessage?.(message)
        setMessage("")
      } finally {
        setSending(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getStatusColor = (status: ChatUser["status"]) => {
    switch (status) {
      case "online":
        return "bg-poll-teal-500"
      case "away":
        return "bg-poll-orange-500"
      case "offline":
        return "bg-poll-grey-500"
    }
  }

  const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    // Subscription logic removed. All realtime updates should be handled in the parent poll page.
  }, []);

  if (!isOpen) return null

  return (
    <div className="fixed right-4 bottom-4 w-80 h-[600px] bg-poll-grey-900 border border-poll-grey-700 rounded-lg shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-poll-grey-700 bg-poll-grey-800/50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-poll-teal-400" />
          <h3 className="text-white font-semibold">Team Chat</h3>
          <Badge className="bg-poll-teal-600/20 text-poll-teal-400 border-poll-teal-600/30 text-xs">
            {users.filter((u) => u.status === "online").length} online
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-poll-grey-400 hover:text-white hover:bg-poll-grey-700"
          >

            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-poll-grey-400 hover:text-white hover:bg-poll-grey-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-poll-grey-700 bg-poll-grey-800/30">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "text-poll-teal-400 border-b-2 border-poll-teal-400 bg-poll-grey-800/50"
              : "text-poll-grey-400 hover:text-white"
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "text-poll-orange-400 border-b-2 border-poll-orange-400 bg-poll-grey-800/50"
              : "text-poll-grey-400 hover:text-white"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <>
            {/* Messages */}
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                    {!msg.isOwn && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-poll-blue-600/20 text-poll-blue-400 text-xs">
                          {msg.user
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex-1 max-w-[80%] ${msg.isOwn ? "text-right" : ""}`}>
                      {!msg.isOwn && <p className="text-xs text-poll-grey-400 mb-1">{msg.user}</p>}
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.isOwn
                            ? "bg-poll-teal-600 text-white"
                            : msg.type === "system"
                              ? "bg-poll-orange-600/20 text-poll-orange-400 border border-poll-orange-600/30"
                              : msg.type === "poll"
                                ? "bg-poll-salmon-600/20 text-poll-salmon-400 border border-poll-salmon-600/30"
                                : "bg-poll-grey-800 text-poll-grey-200"
                        }`}
                      >
                        {msg.message}
                      </div>
                      <p className="text-xs text-poll-grey-500 mt-1">{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-poll-grey-700">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-poll-grey-800 border-poll-grey-600 text-white placeholder:text-poll-grey-500 focus:border-poll-teal-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSending}
                  className="bg-poll-teal-600 hover:bg-poll-teal-700 text-white px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* User Search */}
            <div className="p-4 border-b border-poll-grey-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-poll-grey-500" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-poll-grey-800 border-poll-grey-600 text-white placeholder:text-poll-grey-500 focus:border-poll-orange-400"
                />
              </div>
            </div>

            {/* Users List */}
            <ScrollArea className="h-[440px] p-4">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-poll-grey-800/50 transition-colors cursor-pointer"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-poll-blue-600/20 text-poll-blue-400">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-poll-grey-900 ${getStatusColor(user.status)}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-poll-grey-400 text-xs">
                        {user.status === "offline" && user.lastSeen ? `Last seen ${user.lastSeen}` : user.status}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-poll-grey-400 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  )
}
