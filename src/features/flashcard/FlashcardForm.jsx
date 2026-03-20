import { useEffect } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import {
  createFlashcardAPI,
  updateFlashcardAPI,
  mapFlashcardFieldErrorsToForm,
} from './flashcardService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'

const CARD_TYPE_OPTIONS = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'phrase', label: 'Phrase' },
  { value: 'sentence', label: 'Sentence' },
]

export function FlashcardForm({ open, onClose, folderId, initialValues, onSuccess }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.resetFields()
      if (initialValues?.id) {
        form.setFieldsValue({
          frontText: initialValues.frontText,
          backText: initialValues.backText,
          ipa: initialValues.ipa ?? '',
          audioUrl: initialValues.audioUrl ?? '',
          imageUrl: initialValues.imageUrl ?? '',
          cardType: initialValues.cardType ?? 'vocabulary',
        })
      } else {
        form.setFieldsValue({ cardType: 'vocabulary' })
      }
    }
  }, [open, initialValues, form])

  async function handleSubmit(values) {
    try {
      if (initialValues?.id) {
        await updateFlashcardAPI(initialValues.id, values)
        message.success('Flashcard updated!')
      } else {
        await createFlashcardAPI({ folderId, ...values })
        message.success('Flashcard created!')
      }
      onSuccess?.()
      onClose()
      form.resetFields()
    } catch (err) {
      const parsedError = parseApiError(err, 'Operation failed')
      const mapped = {
        ...parsedError,
        fieldErrors: mapFlashcardFieldErrorsToForm(parsedError.fieldErrors),
      }
      applyFormApiError(form, mapped)
      message.error(parsedError.message)
    }
  }

  return (
    <Modal
      title={initialValues?.id ? 'Edit Flashcard' : 'Add Flashcard'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={480}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="frontText"
          label="Front"
          rules={[{ required: true, message: 'Front text is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Word or phrase (e.g. Hello)" />
        </Form.Item>

        <Form.Item
          name="backText"
          label="Back"
          rules={[{ required: true, message: 'Back text is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Translation or definition" />
        </Form.Item>

        <Form.Item name="ipa" label="IPA (optional)">
          <Input placeholder="e.g. /həˈloʊ/" />
        </Form.Item>

        <Form.Item name="audioUrl" label="Audio URL (optional)">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item name="imageUrl" label="Image URL (optional)">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item name="cardType" label="Card type">
          <Select options={CARD_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '8px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600 }}>
              {initialValues?.id ? 'Update' : 'Create'}
            </button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
