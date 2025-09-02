// @ts-nocheck
import { worker } from './browser'

// Function to start MSW in development and optionally in production
export const startMSW = async () => {
  const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined
  const isViteDev = !!(env && env.DEV)
  const enableInProd = !!(env && env.VITE_ENABLE_MSW === 'true')

  if (!isViteDev && !enableInProd) {
    return
  }

  try {
    // Start the worker
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        // Vite places public assets at site root in production
        url: '/mockServiceWorker.js',
      },
    })

    const mode = isViteDev ? 'development' : 'production'
    console.log(`✅ MSW started successfully (${mode} mode)`) 
    try { (window as any).__MSW_READY__ = true } catch {}
    console.log('📡 Mock API endpoints are now active')
    console.log('🌐 Available endpoints:')
    console.log('   Public: /api/centers, /api/body-parts, /api/safety-questions')
    console.log('   Referrals: /api/referrals, /api/slots/hold, /api/appointments')
    console.log('   Reports: /api/reports, /api/images/:id/download')
    console.log('   Attorney: /api/liens, /api/exposure, /api/cases/:id/packet')
    console.log('   System: /api/webhooks/test, /api/audit/:entityId, /api/system/health')
  } catch (error) {
    console.error('❌ Failed to start MSW:', error)
  }
}

// Export the worker for direct access if needed
export { worker }

// Export handlers for testing purposes
export { handlers } from './handlers'

// Default export for easy importing
export default startMSW
