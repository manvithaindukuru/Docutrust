import React from 'react'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Header from './components/Header'
import UploadZone from './components/UploadZone'
import DocumentList from './components/DocumentList'
import ChatInterface from './components/ChatInterface'
import { useDocuments } from './hooks/useDocuments'
import { useQuery } from './hooks/useQuery'
import './App.css'

const App = () => {
  const {
    documents,
    loading: docsLoading,
    uploading,
    uploadProgress,
    handleUpload,
    handleDelete,
    handleClearAll,
  } = useDocuments()

  const { messages, loading: queryLoading, sendQuery, clearMessages } = useQuery()

  return (
    <div style={styles.app}>
      <Header docCount={documents.length} />

      <main style={styles.main}>
        <motion.aside
          style={styles.sidebar}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <UploadZone
            onUpload={handleUpload}
            uploading={uploading}
            uploadProgress={uploadProgress}
          />
          <DocumentList
            documents={documents}
            loading={docsLoading}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        </motion.aside>

        <motion.section
          style={styles.chatSection}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ChatInterface
            messages={messages}
            loading={queryLoading}
            onSend={sendQuery}
            onClear={clearMessages}
            hasDocuments={documents.length > 0}
          />
        </motion.section>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#e2e8f0',
            border: '1px solid #1e2d3d',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 300,
          },
          success: {
            iconTheme: { primary: '#00e5a0', secondary: '#080c10' },
          },
          error: {
            iconTheme: { primary: '#ff4d6d', secondary: '#080c10' },
          },
        }}
      />
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    padding: '24px 2rem',
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    height: 'calc(100vh - 64px)',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    overflowY: 'auto',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid #1e2d3d',
    borderRadius: '16px',
    padding: '20px',
    height: 'fit-content',
    maxHeight: '100%',
  },
  chatSection: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
}

export default App
