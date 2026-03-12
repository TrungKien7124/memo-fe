import axiosClient from '../../services/axiosClient'

export async function getFoldersAPI() {
  const { data } = await axiosClient.get('/api/folders/')
  return data
}

export async function createFolderAPI(data) {
  const { data: result } = await axiosClient.post('/api/folders/', data)
  return result
}

export async function updateFolderAPI(id, data) {
  const { data: result } = await axiosClient.patch(`/api/folders/${id}/`, data)
  return result
}

export async function deleteFolderAPI(id) {
  await axiosClient.delete(`/api/folders/${id}/`)
}

export async function getFlashcardsAPI(folderId) {
  const { data } = await axiosClient.get('/api/flashcards/', {
    params: { folder: folderId },
  })
  return data
}

export async function createFlashcardAPI(data) {
  const { data: result } = await axiosClient.post('/api/flashcards/', data)
  return result
}

export async function updateFlashcardAPI(id, data) {
  const { data: result } = await axiosClient.patch(`/api/flashcards/${id}/`, data)
  return result
}

export async function deleteFlashcardAPI(id) {
  await axiosClient.delete(`/api/flashcards/${id}/`)
}
