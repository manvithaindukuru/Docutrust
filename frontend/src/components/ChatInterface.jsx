import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import ChatMessage from './ChatMessage'

const SUGGESTED_QUERIES = [
  "What are the key findings in the uploaded documents?",
  "Summarize the main topics covered",
  "What policies or procedures are mentioned?",
  "List any important dates or deadlines",
]

const ChatInterface = ({ messages, loading, onSend, onClear, hasDocuments }) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = () => {
    if (!input.trim() || loading) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatHeader}>
        <div style={styles.chatTitle}>
          <MessageSquare size={14} color="#4a5568" />
          <span style={styles.chatTitleText}>QUERY INTERFACE</span>
        </div>
        {messages.length > 0 && (
          <button style={styles.clearBtn} onClick={onClear}>
            <Trash2 size={12} />
            Clear chat
          </button>
        )}
      </div>

      <div style={styles.messagesArea}>
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              style={styles.emptyState}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={styles.emptyIcon}>
                <Sparkles size={28} color="#2d4060" />
              </div>
              <h2 style={styles.emptyTitle}>Ask Anything</h2>
              <p style={styles.emptySubtitle}>
                {hasDocuments
                  ? 'Query your indexed documents with natural language'
                  : 'Upload documents to start querying your knowledge base'}
              </p>
              {hasDocuments && (
                <div style={styles.suggestions}>
                  {SUGGESTED_QUERIES.map((q, i) => (
                    <motion.button
                      key={i}
                      style={styles.suggestionBtn}
                      onClick={() => onSend(q)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06 }}
                      whileHover={{ borderColor: 'rgba(0, 212, 255, 0.3)', color: '#e2e8f0' }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              style={styles.messageList}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id} message={msg} index={idx} />
              ))}
              {loading && (
                <motion.div
                  style={styles.typingIndicator}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div style={styles.typingAvatar}>
                    <Loader2 size={13} color="#00e5a0" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                  <div style={styles.typingBubble}>
                    <div style={styles.typingDots}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            ...styles.dot,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={hasDocuments ? "Ask a question about your documents..." : "Upload documents first..."}
            disabled={loading || !hasDocuments}
            rows={1}
          />
          <button
            style={{
              ...styles.sendBtn,
              ...(loading || !input.trim() || !hasDocuments ? styles.sendBtnDisabled : styles.sendBtnActive),
            }}
            onClick={handleSubmit}
            disabled={loading || !input.trim() || !hasDocuments}
          >
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
        <p style={styles.hint}>Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid #1e2d3d',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid #1e2d3d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chatTitleText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    fontWeight: 500,
    color: '#4a5568',
    letterSpacing: '0.12em',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: '1px solid #2d4060',
    color: '#94a3b8',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
    gap: '12px',
  },
  emptyIcon: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e2d3d',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '22px',
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '-0.02em',
  },
  emptySubtitle: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#4a5568',
    maxWidth: '320px',
    lineHeight: 1.6,
  },
  suggestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '8px',
    width: '100%',
    maxWidth: '480px',
  },
  suggestionBtn: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    color: '#94a3b8',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
    lineHeight: 1.4,
  },
  typingIndicator: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  typingAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(0, 229, 160, 0.08)',
    border: '1px solid rgba(0, 229, 160, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  typingBubble: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e2d3d',
    borderRadius: '12px',
    borderTopLeftRadius: '4px',
  },
  typingDots: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4a5568',
    animation: 'bounce 1.2s ease-in-out infinite',
  },
  inputArea: {
    padding: '16px 20px',
    borderTop: '1px solid #1e2d3d',
    flexShrink: 0,
  },
  inputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #2d4060',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#e2e8f0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.5,
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s',
    minHeight: '42px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  sendBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
  },
  sendBtnActive: {
    background: 'linear-gradient(135deg, #00d4ff, #00e5a0)',
    color: '#080c10',
  },
  sendBtnDisabled: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid #1e2d3d',
    color: '#4a5568',
    cursor: 'not-allowed',
  },
  hint: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#2d4060',
    marginTop: '8px',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
}

export default ChatInterface
