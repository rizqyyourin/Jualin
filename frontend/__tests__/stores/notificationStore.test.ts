import { renderHook, act } from '@testing-library/react'
import { useNotificationStore, useNotifications } from '@/lib/stores/notificationStore'

describe('Notification Store', () => {
  beforeEach(() => {
    const store = useNotificationStore.getState()
    store.clearNotifications()
  })

  it('adds notification to store', () => {
    const { result } = renderHook(() => useNotificationStore())

    act(() => {
      result.current.addNotification('Test message', 'success', 5000)
    })

    expect(result.current.notifications.length).toBe(1)
    expect(result.current.notifications[0].message).toBe('Test message')
    expect(result.current.notifications[0].type).toBe('success')
  })

  it('removes notification by id', () => {
    const { result } = renderHook(() => useNotificationStore())

    act(() => {
      result.current.addNotification('Test message', 'success', 5000)
    })

    const notificationId = result.current.notifications[0].id

    act(() => {
      result.current.removeNotification(notificationId)
    })

    expect(result.current.notifications.length).toBe(0)
  })

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotificationStore())

    act(() => {
      result.current.addNotification('Message 1', 'success')
      result.current.addNotification('Message 2', 'error')
      result.current.addNotification('Message 3', 'info')
    })

    expect(result.current.notifications.length).toBe(3)

    act(() => {
      result.current.clearNotifications()
    })

    expect(result.current.notifications.length).toBe(0)
  })

  it('useNotifications hook provides convenience methods', () => {
    const { result } = renderHook(() => useNotifications())

    expect(typeof result.current.success).toBe('function')
    expect(typeof result.current.error).toBe('function')
    expect(typeof result.current.warning).toBe('function')
    expect(typeof result.current.info).toBe('function')
    expect(typeof result.current.remove).toBe('function')
    expect(typeof result.current.clear).toBe('function')
  })
})
