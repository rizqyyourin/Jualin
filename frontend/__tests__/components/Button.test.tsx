import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders button with disabled state', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('renders button with variant styles', () => {
    const { container } = render(<Button variant="outline">Click me</Button>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    button.click()
    expect(handleClick).toHaveBeenCalled()
  })

  it('renders children correctly', () => {
    render(
      <Button>
        <span data-testid="child">Child content</span>
      </Button>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
