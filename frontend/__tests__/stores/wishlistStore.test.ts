import { renderHook, act } from '@testing-library/react'
import { useWishlistStore } from '@/lib/stores/wishlistStore'

describe('Wishlist Store', () => {
  beforeEach(() => {
    const store = useWishlistStore.getState()
    store.clearWishlist()
  })

  it('adds item to wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Test Product',
        price: 99.99,
      })
    })

    expect(result.current.items.length).toBe(1)
    expect(result.current.items[0].name).toBe('Test Product')
  })

  it('removes item from wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Test Product',
        price: 99.99,
      })
      result.current.removeFromWishlist('1')
    })

    expect(result.current.items.length).toBe(0)
  })

  it('checks if item is in wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Test Product',
        price: 99.99,
      })
    })

    const isInWishlist = result.current.isInWishlist('1')
    expect(isInWishlist).toBe(true)

    const notInWishlist = result.current.isInWishlist('2')
    expect(notInWishlist).toBe(false)
  })

  it('returns correct wishlist count', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Product 1',
        price: 99.99,
      })
      result.current.addToWishlist({
        id: '2',
        name: 'Product 2',
        price: 199.99,
      })
    })

    const count = result.current.getWishlistCount()
    expect(count).toBe(2)
  })

  it('clears wishlist', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Product 1',
        price: 99.99,
      })
      result.current.clearWishlist()
    })

    expect(result.current.items.length).toBe(0)
  })

  it('prevents duplicate items', () => {
    const { result } = renderHook(() => useWishlistStore())

    act(() => {
      result.current.addToWishlist({
        id: '1',
        name: 'Test Product',
        price: 99.99,
      })
      result.current.addToWishlist({
        id: '1',
        name: 'Test Product',
        price: 99.99,
      })
    })

    expect(result.current.items.length).toBe(1)
  })
})
