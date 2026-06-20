import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react'

const ChatMessage = ({ message, index }) => {
  const [showSources, setShowSources] = useState(false)

  const isUser = message.type === 'user'
  const isError = message.type === 'error'
  const isAssistant = message.type === 'assistant'

  const formatContent = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} style={styles.bold}>{line.slice(2, -2)}</strong>
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <li key={i} style={styles.listItem}>{line.slice(2)}</li>
      }
      if (line.trim() === '') return <br key={i} />
      return <span key={i} style={styles.textLine}>{line}{'\n'}</span>
    })
  }

  return (
    <motion.div
      style={{
        ...styles.wrapper,
        ...(isUser ? styles.wrapperUser : styles.wrapperAssistant),
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <div style={{ ...styles.avatar, ...(isUser ? styles.avatarUser : isError ? styles.avatarError : styles.avatarAssistant) }}>
        {isUser ? <User size={14} /> : isError ? <AlertCircle size={14} /> : <Bot size={14} />}
      </div>

      <div style={{ ...styles.bubble, ...(isUser ? styles.bubbleUser : isError ? styles.bubbleError : styles.bubbleAssistant) }}>
        {isError ? (
          <p style={styles.errorText}>{message.content}</p>
        ) : (
          <div style={styles.messageContent}>
            {isUser ? (
              <p style={styles.userText}>{message.content}</p>
            ) : (
              <div style={styles.assistantText}>{formatContent(message.content)}</div>
            )}

            {isAssistant && message.sources && message.sources.length > 0 && (
              <div style={styles.sourcesSection}>
                <button
                  style={styles.sourcesToggle}
                  onClick={() => setShowSources(!showSources)}
                >
                  <FileText size={11} color="#4a5568" />
                  <span style={styles.sourcesLabel}>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
                  {showSources ? <ChevronUp size={11} color="#4a5568" /> : <ChevronDown size={11} color="#4a5568" />}
                </button>

                {showSources && (
                  <motion.div
                    style={styles.sourcesList}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {message.sources.map((src, i) => (
                      <div key={i} style={styles.sourceItem}>
                        <div style={styles.sourceHeader}>
                          <span style={styles.sourceFile}>{src.filename}</span>
                          {src.page && <span style={styles.sourcePage}>p.{src.page}</span>}
                          <span style={styles.sourceScore}>{(src.relevance_score * 100).toFixed(0)}%</span>
                        </div>
                        {src.excerpt && (
                          <p style={styles.sourceExcerpt}>{src.excerpt}</p>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}

        <p style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: '12px',
    maxWidth: '85%',
  },
  wrapperUser: {
    flexDirection: 'row-reverse',
    marginLeft: 'auto',
  },
  wrapperAssistant: {
    flexDirection: 'row',
    marginRight: 'auto',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  avatarUser: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.25)',
    color: '#00d4ff',
  },
  avatarAssistant: {
    background: 'rgba(0, 229, 160, 0.08)',
    border: '1px solid rgba(0, 229, 160, 0.2)',
    color: '#00e5a0',
  },
  avatarError: {
    background: 'rgba(255, 77, 109, 0.1)',
    border: '1px solid rgba(255, 77, 109, 0.25)',
    color: '#ff4d6d',
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '12px',
    position: 'relative',
  },
  bubbleUser: {
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.2)',
    borderTopRightRadius: '4px',
  },
  bubbleAssistant: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e2d3d',
    borderTopLeftRadius: '4px',
  },
  bubbleError: {
    background: 'rgba(255, 77, 109, 0.06)',
    border: '1px solid rgba(255, 77, 109, 0.2)',
    borderTopLeftRadius: '4px',
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#e2e8f0',
    lineHeight: 1.6,
    fontWeight: 300,
  },
  assistantText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: 1.7,
    fontWeight: 300,
  },
  textLine: {
    whiteSpace: 'pre-wrap',
  },
  bold: {
    color: '#e2e8f0',
    fontWeight: 600,
    display: 'block',
    marginBottom: '4px',
  },
  listItem: {
    marginLeft: '16px',
    marginBottom: '2px',
    display: 'list-item',
    listStyleType: 'none',
    paddingLeft: '8px',
    borderLeft: '2px solid rgba(0, 229, 160, 0.3)',
  },
  errorText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#ff4d6d',
    lineHeight: 1.5,
  },
  timestamp: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#4a5568',
    marginTop: '8px',
    textAlign: 'right',
  },
  sourcesSection: {
    borderTop: '1px solid #1e2d3d',
    paddingTop: '8px',
  },
  sourcesToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 0',
  },
  sourcesLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#4a5568',
    letterSpacing: '0.05em',
  },
  sourcesList: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    overflow: 'hidden',
  },
  sourceItem: {
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e2d3d',
    borderRadius: '6px',
  },
  sourceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  sourceFile: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#00d4ff',
    flex: 1,
  },
  sourcePage: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#4a5568',
  },
  sourceScore: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#00e5a0',
    padding: '1px 5px',
    background: 'rgba(0, 229, 160, 0.1)',
    borderRadius: '3px',
  },
  sourceExcerpt: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    color: '#4a5568',
    lineHeight: 1.5,
    fontStyle: 'italic',
  },
}

export default ChatMessage
