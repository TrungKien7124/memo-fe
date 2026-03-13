import { useEffect } from 'react'
import { Modal, Form, Input, message } from 'antd'
import { createFlashcardAPI, updateFlashcardAPI } from './flashcardService'
import { applyFormApiError, parseApiError } from '../../utils/apiError'

export function FlashcardForm({ open, onClose, folderId, initialValues, onSuccess }) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (open) {
      form.resetFields()
      if (initialValues) {
        form.setFieldsValue(initialValues)
      }
    }
  }, [open, initialValues, form])

  async function handleSubmit(values) {
    try {
      if (initialValues?.id) {
        await updateFlashcardAPI(initialValues.id, values)
        message.success('Flashcard updated!')
      } else {
        await createFlashcardAPI({ ...values, folder: folderId })
        message.success('Flashcard created!')
      }
      onSuccess?.()
      onClose()
      form.resetFields()
    } catch (err) {
      const parsedError = parseApiError(err, 'Operation failed')
      applyFormApiError(form, parsedError)
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
          name="front"
          label="Front"
          rules={[{ required: true, message: 'Front text is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Word or phrase (e.g. Hello)" />
        </Form.Item>

        <Form.Item
          name="back"
          label="Back"
          rules={[{ required: true, message: 'Back text is required' }]}
        >
          <Input.TextArea rows={2} placeholder="Translation or definition" />
        </Form.Item>

        <Form.Item name="ipa" label="IPA (optional)">
          <Input placeholder="e.g. /həˈloʊ/" />
        </Form.Item>

        <Form.Item name="example_sentence" label="Example Sentence (optional)">
          <Input.TextArea rows={2} placeholder="e.g. Hello, how are you?" />
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
