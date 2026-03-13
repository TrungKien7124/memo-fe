import axiosClient from '../../services/axiosClient'

export async function getFoldersAPI() {
  const { data } = await axiosClient.get('/api/nfs/folders/')
  return data
}

export async function createFolderAPI(data) {
  const { data: result } = await axiosClient.post('/api/nfs/folders/', data)
  return result
}

export async function updateFolderAPI(id, data) {
  const { data: result } = await axiosClient.patch(`/api/nfs/folders/${id}/`, data)
  return result
}

export async function deleteFolderAPI(id) {
  await axiosClient.delete(`/api/nfs/folders/${id}/`)
}

export async function getFlashcardsAPI(folderId) {
  const { data } = await axiosClient.get('/api/nfs/flashcards/', {
    params: { folder: folderId },
  })
  return data
}

export async function createFlashcardAPI(data) {
  const { data: result } = await axiosClient.post('/api/nfs/flashcards/', data)
  return result
}

export async function updateFlashcardAPI(id, data) {
  const { data: result } = await axiosClient.patch(`/api/nfs/flashcards/${id}/`, data)
  return result
}

export async function deleteFlashcardAPI(id) {
  await axiosClient.delete(`/api/nfs/flashcards/${id}/`)
}
