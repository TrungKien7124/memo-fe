import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  createAdminModuleAPI,
  deleteAdminModuleAPI,
  getAdminModulesAPI,
  updateAdminModuleAPI,
} from './adminService'
import { AdminListCreateLayout } from '../../components/admin/AdminListCreateLayout'
import { TableEditDeleteActions } from '../../components/admin/TableEditDeleteActions'
import { applyFormApiError, parseApiError } from '../../utils/apiError'
import styles from './AdminCoursesPage.module.css'

function normalizeListResponse(data) {
  if (Array.isArray(data))
    return data
  if (Array.isArray(data?.data))
    return data.data
  if (Array.isArray(data?.results))
    return data.results
  if (Array.isArray(data?.data?.results))
    return data.data.results
  return []
}

function toModuleOrderPayload(moduleList) {
  return moduleList.map((module, index) => ({
    id: String(module.id),
    order_index: index + 1,
  }))
}

function reorderByIds(items, fromId, toId) {
  const fromIndex = items.findIndex((item) => String(item.id) === String(fromId))
  const toIndex = items.findIndex((item) => String(item.id) === String(toId))
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex)
    return items
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function AdminCourseModulesPanel({ courseId, onModulesOrderChange }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState([])
  const [editingModule, setEditingModule] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [draggingModuleId, setDraggingModuleId] = useState(null)

  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()

  const parsedCourseId = useMemo(() => Number(courseId), [courseId])

  async function loadModules() {
    if (!courseId) return
    setLoading(true)
    try {
      const modulesData = await getAdminModulesAPI(courseId)
      const normalized = normalizeListResponse(modulesData)
      setModules(normalized)
      if (typeof onModulesOrderChange === 'function')
        onModulesOrderChange(toModuleOrderPayload(normalized))
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to load modules')
      message.error(parsed.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [courseId])

  function handleOpenCreateModal() {
    createForm.resetFields()
    createForm.setFieldsValue({ order_index: 0 })
    setIsCreateModalOpen(true)
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  async function handleCreateModule(values) {
    try {
      await createAdminModuleAPI({ ...values, course: parsedCourseId || courseId })
      message.success('Module created successfully')
      handleCloseCreateModal()
      loadModules()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to create module')
      applyFormApiError(createForm, parsed)
      message.error(parsed.message)
    }
  }

  function handleOpenEditModuleModal(module) {
    setEditingModule(module)
    editForm.setFieldsValue({
      title: module.title,
      order_index: module.order_index,
    })
    setIsEditModalOpen(true)
  }

  function handleCloseEditModuleModal() {
    setEditingModule(null)
    setIsEditModalOpen(false)
    editForm.resetFields()
  }

  async function handleUpdateModule(values) {
    if (!editingModule?.id) return
    try {
      await updateAdminModuleAPI(editingModule.id, values)
      message.success('Module updated successfully')
      handleCloseEditModuleModal()
      loadModules()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to update module')
      applyFormApiError(editForm, parsed)
      message.error(parsed.message)
    }
  }

  async function handleDeleteModule(moduleId) {
    try {
      await deleteAdminModuleAPI(moduleId)
      message.success('Module deleted successfully')
      loadModules()
    } catch (error) {
      const parsed = parseApiError(error, 'Failed to delete module')
      message.error(parsed.message)
    }
  }

  function handleDragStart(moduleId) {
    setDraggingModuleId(String(moduleId))
  }

  function handleDragOver(event) {
    event.preventDefault()
  }

  function handleDrop(targetModuleId) {
    if (!draggingModuleId)
      return
    const reordered = reorderByIds(modules, draggingModuleId, targetModuleId)
    setModules(reordered)
    if (typeof onModulesOrderChange === 'function')
      onModulesOrderChange(toModuleOrderPayload(reordered))
    setDraggingModuleId(null)
  }

  function handleDragEnd() {
    setDraggingModuleId(null)
  }

  return (
    <>
      <AdminListCreateLayout
        title="Modules"
        cardClassName={styles.tableCard}
        createLabel="Create new module"
        onCreateClick={handleOpenCreateModal}
      >
        <Table
          rowKey="id"
          loading={loading}
          dataSource={modules}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
              key: 'title',
              render: (title, record) => (
                <Button
                  type="link"
                  className={styles.courseTitleLink}
                  onClick={() => navigate(`/admin/module/detail/${record.id}?sub=lessons`)}
                >
                  {title}
                </Button>
              ),
            },
            { title: 'Order', dataIndex: 'order_index', key: 'order_index', width: 100 },
            {
              title: 'Actions',
              key: 'actions',
              width: 100,
              align: 'center',
              render: (_, record) => (
                <TableEditDeleteActions
                  onEdit={() => navigate(`/admin/module/detail/${record.id}`)}
                  onDelete={() => handleDeleteModule(record.id)}
                  editLabel="Edit module"
                  deleteLabel="Delete module"
                  deleteTitle="Delete this module?"
                  deleteDescription="All lessons under this module will be removed."
                />
              ),
            },
          ]}
          onRow={(record) => ({
            draggable: true,
            onDragStart: () => handleDragStart(record.id),
            onDragOver: handleDragOver,
            onDrop: () => handleDrop(record.id),
            onDragEnd: handleDragEnd,
            className: draggingModuleId === String(record.id) ? styles.draggingRow : styles.draggableRow,
          })}
        />
      </AdminListCreateLayout>

      <Modal
        title="Create module"
        open={isCreateModalOpen}
        onCancel={handleCloseCreateModal}
        onOk={() => createForm.submit()}
        okText="Create"
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateModule} requiredMark={false}>
          <Form.Item name="title" label="Module title" rules={[{ required: true, message: 'Please enter the module title' }]}>
            <Input placeholder="Module 1: Greetings" />
          </Form.Item>
          <Form.Item name="order_index" label="Order" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit module"
        open={isEditModalOpen}
        onCancel={handleCloseEditModuleModal}
        onOk={() => editForm.submit()}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateModule} requiredMark={false}>
          <Form.Item name="title" label="Module title" rules={[{ required: true, message: 'Please enter the module title' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order_index" label="Order" rules={[{ required: true, message: 'Please enter the module order' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
