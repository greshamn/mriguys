import { worker } from './browser'

// Function to start MSW in development mode
export const startMSW = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // Start the worker
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests in console
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })
      
      console.log('✅ MSW started successfully')
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
}

// Export the worker for direct access if needed
export { worker }

// Export handlers for testing purposes
export { handlers } from './handlers'

// Default export for easy importing
export default startMSW
