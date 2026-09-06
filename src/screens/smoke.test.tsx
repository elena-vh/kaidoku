import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App.tsx'
import { clear } from '../engine/storage.ts'
import { seedStorage } from '../test/harness.tsx'
import { itemId } from '../types.ts'

beforeEach(() => {
  clear()
})

describe('screen smoke tests', () => {
  it('Today renders with a fresh install and reads the empty state, not an error', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Kaidoku' })).toBeInTheDocument()
    expect(
      screen.getByText(/the queue is empty\. nothing is owed/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /begin reviews/i })).toBeDisabled()
  })

  it('Today shows a due count when items are due', () => {
    seedStorage({
      progress: {
        [itemId('kanji', '火')]: { stage: 1, due: 1, lapses: 0, seen: 2, correct: 2 },
      },
    })
    render(<App />)
    expect(screen.getByRole('button', { name: /begin reviews/i })).toBeEnabled()
  })
})
