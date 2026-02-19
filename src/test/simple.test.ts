import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Env Check', () => {
    it('should have access to DOM', () => {
        const element = document.createElement('div')
        element.innerHTML = 'Hello World'
        document.body.appendChild(element)
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })
})
