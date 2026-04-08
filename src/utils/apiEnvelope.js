/**
 * Parse unified API wrapper: { status, code, message, data }.
 * Business fields stay snake_case inside `data`.
 */

export function assertSuccessEnvelope(payload, endpoint = 'API') {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error(`Invalid ${endpoint} response payload`)

  if (payload.status !== 'success')
    throw new Error(payload.message || `${endpoint} failed`)

  if (payload.code !== 200)
    throw new Error(payload.message || `${endpoint} failed`)

  return payload.data
}

export function parsePaginatedRecords(payload, endpoint = 'API') {
  const data = assertSuccessEnvelope(payload, endpoint)
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error(`Missing paginated data in ${endpoint} response`)
  if (!Array.isArray(data.records))
    throw new Error(`Missing records in ${endpoint} response`)
  return {
    records: data.records,
    pageinfo: data.pageinfo && typeof data.pageinfo === 'object' ? data.pageinfo : {},
  }
}

/**
 * List endpoints: either a JSON array in `data`, or paginated `{ records, pageinfo }`.
 */
export function parseListPayload(payload, endpoint = 'API') {
  const data = assertSuccessEnvelope(payload, endpoint)
  if (Array.isArray(data))
    return data
  if (data && typeof data === 'object' && Array.isArray(data.records))
    return data.records
  throw new Error(`Missing list data in ${endpoint} response`)
}
