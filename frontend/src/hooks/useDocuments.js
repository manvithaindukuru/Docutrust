import { useState, useEffect, useCallback } from 'react'
import { listDocuments, deleteDocument, clearAllDocuments, uploadDocument } from '../utils/api'
import toast from 'react-hot-toast'

export const useDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listDocuments()
      setDocuments(data.documents || [])
    } catch (err) {
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    for (const file of files) {
      try {
        toast.loading(`Uploading ${file.name}...`, { id: `upload-${file.name}` })
        const result = await uploadDocument(file, setUploadProgress)
        toast.success(`✓ ${result.chunks_created} chunks indexed from "${file.name}"`, {
          id: `upload-${file.name}`,
          duration: 4000,
        })
      } catch (err) {
        toast.error(`Failed: ${err.message}`, { id: `upload-${file.name}` })
      }
    }

    setUploading(false)
    setUploadProgress(0)
    await fetchDocuments()
  }, [fetchDocuments])

  const handleDelete = useCallback(async (filename) => {
    try {
      await deleteDocument(filename)
      toast.success(`"${filename}" removed`)
      await fetchDocuments()
    } catch (err) {
      toast.error(err.message)
    }
  }, [fetchDocuments])

  const handleClearAll = useCallback(async () => {
    try {
      await clearAllDocuments()
      toast.success('All documents cleared')
      setDocuments([])
    } catch (err) {
      toast.error(err.message)
    }
  }, [])

  return {
    documents,
    loading,
    uploading,
    uploadProgress,
    handleUpload,
    handleDelete,
    handleClearAll,
    refetch: fetchDocuments,
  }
}
