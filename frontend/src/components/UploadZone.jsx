import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader2 } from 'lucide-react'

const UploadZone = ({ onUpload, uploading, uploadProgress }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    disabled: uploading,
    multiple: true,
  })

  return (
    <div style={styles.container}>
      <p style={styles.sectionLabel}>UPLOAD DOCUMENTS</p>
      <div
        {...getRootProps()}
        style={{
          ...styles.dropzone,
          ...(isDragActive ? styles.dropzoneActive : {}),
          ...(uploading ? styles.dropzoneDisabled : {}),
        }}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              style={styles.uploadingState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={28} color="#00d4ff" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={styles.uploadingText}>Processing document...</p>
              <div style={styles.progressBar}>
                <motion.div
                  style={styles.progressFill}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p style={styles.progressLabel}>{uploadProgress}%</p>
            </motion.div>
          ) : isDragActive ? (
            <motion.div
              key="active"
              style={styles.content}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div style={{ ...styles.iconArea, ...styles.iconAreaActive }}>
                <Upload size={24} color="#00d4ff" />
              </div>
              <p style={{ ...styles.mainText, color: '#00d4ff' }}>Release to upload</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              style={styles.content}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={styles.iconArea}>
                <FileText size={22} color="#4a5568" />
              </div>
              <p style={styles.mainText}>Drop files or click to browse</p>
              <p style={styles.subText}>PDF · DOCX · TXT · MD — max 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const styles = {
  container: {
    marginBottom: '1.5rem',
  },
  sectionLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    fontWeight: 500,
    color: '#4a5568',
    letterSpacing: '0.12em',
    marginBottom: '10px',
  },
  dropzone: {
    border: '1px dashed #1e2d3d',
    borderRadius: '12px',
    padding: '24px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'rgba(255,255,255,0.01)',
    position: 'relative',
    overflow: 'hidden',
  },
  dropzoneActive: {
    border: '1px dashed rgba(0, 212, 255, 0.5)',
    background: 'rgba(0, 212, 255, 0.04)',
  },
  dropzoneDisabled: {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  iconArea: {
    width: '48px',
    height: '48px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e2d3d',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  iconAreaActive: {
    background: 'rgba(0, 212, 255, 0.08)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
  },
  mainText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#94a3b8',
    fontWeight: 400,
  },
  subText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: '#4a5568',
    letterSpacing: '0.05em',
  },
  uploadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  uploadingText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: '#94a3b8',
  },
  progressBar: {
    width: '100%',
    maxWidth: '160px',
    height: '3px',
    background: '#1e2d3d',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00d4ff, #00e5a0)',
    borderRadius: '2px',
    width: '0%',
  },
  progressLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: '#00d4ff',
  },
}

export default UploadZone
