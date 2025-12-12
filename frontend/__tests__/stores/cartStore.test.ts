import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/lib/stores/cartStore'

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const store = useCartStore.getState()
    store.clearCart()
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].name).toBe('Test Product')
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
      result.current.removeItem('1')
    })

    expect(result.current.items.length).toBe(0)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
      result.current.updateQuantity('1', 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
  })

  it('calculates total price correctly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 2,
      })
      result.current.addItem({
        id: '2',
        name: 'Another Product',
        price: 50,
        quantity: 1,
      })
    })

    const total = result.current.getTotalPrice()
    expect(total).toBe(250) // (100 * 2) + (50 * 1)
  })

  it('calculates total items correctly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 100,
        quantity: 3,
      })
      result.current.addItem({
        id: '2',
        name: 'Another Product',
        price: 50,
        quantity: 2,
      })
    })

    const totalItems = result.current.getTotalItems()
    expect(totalItems).toBe(5)
  })

  it('clears cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
      result.current.clearCart()
    })

    expect(result.current.items.length).toBe(0)
  })

  it('prevents duplicate items and increments quantity', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
      result.current.addItem({
        id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 1,
      })
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].quantity).toBe(2)
  })
})
