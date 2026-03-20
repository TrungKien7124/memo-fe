import axiosClient from '../../services/axiosClient'

function parseListDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!Array.isArray(payload.data))
    throw new Error(`Missing data list in ${endpoint} response`)
  return payload.data
}

function parseDetailDataEnvelope(payload, endpoint) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)
  if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data))
    throw new Error(`Missing data object in ${endpoint} response`)
  return payload.data
}

function mapFolderFromApi(row) {
  if (!row || typeof row !== 'object')
    throw new Error('Invalid folder payload')
  const count = row.flashcard_count
  if (typeof count !== 'number' || Number.isNaN(count))
    throw new Error('Invalid folder payload: flashcard_count')
  return {
    id: row.id,
    name: String(row.name ?? ''),
    flashcardCount: count,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

function mapFlashcardFromApi(row) {
  if (!row || typeof row !== 'object')
    throw new Error('Invalid flashcard payload')
  return {
    id: row.id,
    folderId: row.folder,
    frontText: String(row.front_text ?? ''),
    backText: String(row.back_text ?? ''),
    ipa: row.ipa != null ? String(row.ipa) : '',
    audioUrl: row.audio_url != null ? String(row.audio_url) : '',
    imageUrl: row.image_url != null ? String(row.image_url) : '',
    cardType: row.card_type != null ? String(row.card_type) : 'vocabulary',
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  }
}

/** Maps backend validation keys to FlashcardForm field names (camelCase DTO). */
export function mapFlashcardFieldErrorsToForm(fieldErrors) {
  if (!fieldErrors || typeof fieldErrors !== 'object' || Array.isArray(fieldErrors))
    return {}

  const keyMap = {
    front_text: 'frontText',
    back_text: 'backText',
    audio_url: 'audioUrl',
    image_url: 'imageUrl',
    card_type: 'cardType',
    folder: 'folderId',
  }

  const out = {}
  for (const [key, messages] of Object.entries(fieldErrors)) {
    const formKey = keyMap[key] ?? key
    out[formKey] = messages
  }
  return out
}

function buildFlashcardWritePayload(input) {
  const body = {}
  if (input.folderId != null) body.folder = input.folderId
  if (input.frontText != null) body.front_text = input.frontText
  if (input.backText != null) body.back_text = input.backText
  if (input.ipa != null) body.ipa = input.ipa
  if (input.audioUrl != null) body.audio_url = input.audioUrl
  if (input.imageUrl != null) body.image_url = input.imageUrl
  if (input.cardType != null) body.card_type = input.cardType
  return body
}

export async function getFoldersAPI() {
  const { data } = await axiosClient.get('/api/nfs/folders/')
  const rows = parseListDataEnvelope(data, 'folders list')
  return rows.map(mapFolderFromApi)
}

export async function createFolderAPI({ name }) {
  const { data } = await axiosClient.post('/api/nfs/folders/', { name })
  const row = parseDetailDataEnvelope(data, 'folder create')
  return mapFolderFromApi(row)
}

export async function updateFolderAPI(id, { name }) {
  const { data } = await axiosClient.patch(`/api/nfs/folders/${id}/`, { name })
  const row = parseDetailDataEnvelope(data, 'folder update')
  return mapFolderFromApi(row)
}

export async function deleteFolderAPI(id) {
  await axiosClient.delete(`/api/nfs/folders/${id}/`)
}

export async function getFlashcardsAPI(folderId) {
  const { data } = await axiosClient.get('/api/nfs/flashcards/', {
    params: { folder: folderId },
  })
  const rows = parseListDataEnvelope(data, 'flashcards list')
  return rows.map(mapFlashcardFromApi)
}

export async function createFlashcardAPI(input) {
  if (input?.folderId == null)
    throw new Error('folderId is required to create a flashcard')

  const body = buildFlashcardWritePayload({
    folderId: input.folderId,
    frontText: input.frontText,
    backText: input.backText,
    ipa: input.ipa ?? '',
    audioUrl: input.audioUrl ?? '',
    imageUrl: input.imageUrl ?? '',
    cardType: input.cardType ?? 'vocabulary',
  })
  const { data } = await axiosClient.post('/api/nfs/flashcards/', body)
  const row = parseDetailDataEnvelope(data, 'flashcard create')
  return mapFlashcardFromApi(row)
}

export async function updateFlashcardAPI(id, input) {
  const body = buildFlashcardWritePayload({
    frontText: input.frontText,
    backText: input.backText,
    ipa: input.ipa,
    audioUrl: input.audioUrl,
    imageUrl: input.imageUrl,
    cardType: input.cardType,
  })
  const keys = Object.keys(body)
  if (!keys.length)
    throw new Error('No flashcard fields to update')

  const { data } = await axiosClient.patch(`/api/nfs/flashcards/${id}/`, body)
  const row = parseDetailDataEnvelope(data, 'flashcard update')
  return mapFlashcardFromApi(row)
}

export async function deleteFlashcardAPI(id) {
  await axiosClient.delete(`/api/nfs/flashcards/${id}/`)
}
