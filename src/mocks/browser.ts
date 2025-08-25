import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// This configures a Service Worker using the given request handlers.
// Let's make this "configurable" by the main app module.
export const worker = setupWorker(...handlers)

// Expose the worker instance so it can be used by the main app
export default worker
