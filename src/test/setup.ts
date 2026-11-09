import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Sem `globals`, o Testing Library não limpa sozinho entre os testes.
afterEach(() => cleanup())
