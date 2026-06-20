import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Trash2, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react'

const DocumentList = ({ documents, loading, onDelete, onClearAll }) => {
  const [confirmClear, setConfirmClear] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const colors = { pdf: '#ff4d6d', docx: '#00d4ff', txt: '#94a3b8', md: '#00e5a0' }
    return colors[ext] || '#94a3b8'
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <p style={styles.sectionLabel}>INDEXED DOCUMENTS ({documents.length})</p>
          {collapsed ? <ChevronDown size={14} color="#4a5568" /> : <ChevronUp size={14} color="#4a5568" />}
        </button>
        {documents.length > 0 && !collapsed && (
          <button style={styles.clearBtn} onClick={() => setConfirmClear(true)}>
            <Trash2 size={12} />
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {loading ? (
              <div style={styles.loadingState}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={styles.skeleton} />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div style={styles.emptyState}>
                <FileText size={20} color="#2d4060" />
                <p style={styles.emptyText}>No documents indexed yet</p>
              </div>
            ) : (
              <div style={styles.list}>
                <AnimatePresence>
                  {documents.map((doc, idx) => (
                    <motion.div
                      key={doc.filename}
                      style={styles.docItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <div style={styles.docIcon}>
                        <FileText size={13} color={getFileIcon(doc.filename)} />
                      </div>
                      <div style={styles.docInfo}>
                        <p style={styles.docName} title={doc.filename}>
                          {doc.filename.length > 22 ? doc.filename.slice(0, 20) + '…' : doc.filename}
                        </p>
                        <p style={styles.docMeta}>
                          {doc.chunks} chunks{doc.pages ? ` · ${doc.pages}p` : ''}
                        </p>
                      </div>
                      <button style={styles.deleteBtn} onClick={() => onDelete(doc.filename)}>
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmClear && (
          <motion.div
            style={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={styles.confirmBox}>
              <AlertTriangle size={18} color="#ffb800" />
              <p style={styles.confirmText}>Delete all documents?</p>
              <div style={styles.confirmActions}>
                <button style={styles.confirmYes} onClick={() => { onClearAll(); setConfirmClear(false) }}>
                  Delete
                </button>
                <button style={styles.confirmNo} onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  sectionLabel: {
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
    padding: '3px 8px',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '280px',
    overflowY: 'auto',
    paddingRight: '2px',
  },
  docItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    transition: 'border-color 0.2s',
  },
  docIcon: {
    width: '28px',
    height: '28px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
  },
  docName: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: '#e2e8f0',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docMeta: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#4a5568',
    marginTop: '1px',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#4a5568',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    flexShrink: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '24px 16px',
  },
  emptyText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: '#4a5568',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  skeleton: {
    height: '44px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e2d3d',
    borderRadius: '8px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  confirmOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(8, 12, 16, 0.92)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    backdropFilter: 'blur(4px)',
  },
  confirmBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
  },
  confirmText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#e2e8f0',
  },
  confirmActions: {
    display: 'flex',
    gap: '8px',
  },
  confirmYes: {
    padding: '6px 16px',
    background: 'rgba(255, 77, 109, 0.15)',
    border: '1px solid rgba(255, 77, 109, 0.4)',
    color: '#ff4d6d',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
  confirmNo: {
    padding: '6px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid #1e2d3d',
    color: '#94a3b8',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
  },
}

export default DocumentList
