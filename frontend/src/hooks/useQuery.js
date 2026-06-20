import { useState, useCallback } from 'react'
import { queryKnowledgeBase } from '../utils/api'
import toast from 'react-hot-toast'

export const useQuery = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const sendQuery = useCallback(async (query) => {
    if (!query.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const result = await queryKnowledgeBase(query)
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: result.answer,
        sources: result.sources || [],
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: err.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [loading])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, loading, sendQuery, clearMessages }
}
