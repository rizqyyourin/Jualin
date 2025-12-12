import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/products/ProductCard'

// Mock the WishlistButton component
jest.mock('@/components/products/WishlistButton', () => ({
  WishlistButton: () => <div data-testid="wishlist-button">Wishlist Button</div>,
}))

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    image: '/test-image.jpg',
    category: 'Electronics',
    rating: 4.5,
    reviews: 100,
    inStock: true,
  }

  it('renders product name', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('Electronics')).toBeInTheDocument()
  })

  it('renders star ratings based on rating value', () => {
    render(<ProductCard {...mockProduct} />)
    const stars = screen.getAllByText('★')
    // 4.5 rating should show 4 filled stars
    expect(stars.length).toBeGreaterThan(0)
  })

  it('renders review count', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByText('(100)')).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
  })

  it('disables add to cart button when out of stock', () => {
    render(<ProductCard {...mockProduct} inStock={false} />)
    const button = screen.getByRole('button', { name: /add to cart/i })
    expect(button).toBeDisabled()
  })

  it('renders out of stock overlay when inStock is false', () => {
    render(<ProductCard {...mockProduct} inStock={false} />)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('renders wishlist button component', () => {
    render(<ProductCard {...mockProduct} />)
    expect(screen.getByTestId('wishlist-button')).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    const { container } = render(<ProductCard {...mockProduct} />)
    const link = container.querySelector('a')
    expect(link).toHaveAttribute('href', '/products/1')
  })
})
