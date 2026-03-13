function normalizeFieldErrors(rawErrors) {
  if (!rawErrors || typeof rawErrors !== 'object' || Array.isArray(rawErrors))
    return {}

  const normalized = {}
  for (const [field, value] of Object.entries(rawErrors)) {
    if (Array.isArray(value)) {
      normalized[field] = value.map((item) => String(item))
      continue
    }

    if (value == null) {
      normalized[field] = []
      continue
    }

    normalized[field] = [String(value)]
  }
  return normalized
}

export function parseApiError(error, fallbackMessage = 'Operation failed') {
  const responseData = error?.response?.data
  const detail = responseData?.detail
  const message = responseData?.message || detail || fallbackMessage
  const oldData = responseData?.old_data && typeof responseData.old_data === 'object'
    ? responseData.old_data
    : {}
  const fieldErrors = normalizeFieldErrors(responseData?.error)

  return {
    message,
    oldData,
    fieldErrors,
  }
}

export function getApiErrorMessage(error, fallbackMessage = 'Operation failed') {
  return parseApiError(error, fallbackMessage).message
}

export function applyFormApiError(form, parsedApiError) {
  if (!form || !parsedApiError) return

  const { oldData, fieldErrors } = parsedApiError

  if (oldData && Object.keys(oldData).length)
    form.setFieldsValue(oldData)

  const fieldEntries = Object.entries(fieldErrors)
  if (!fieldEntries.length) return

  form.setFields(
    fieldEntries.map(([name, errors]) => ({
      name,
      errors: errors || [],
    }))
  )
}
