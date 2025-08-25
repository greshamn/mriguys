import { http, HttpResponse, delay } from 'msw'

// Import seed data
import centerData from './fixtures/centers.json'
import slotData from './fixtures/slots.json'
import referralData from './fixtures/referrals.json'
import appointmentData from './fixtures/appointments.json'
import reportData from './fixtures/reports.json'
import billData from './fixtures/bills.json'
import lienData from './fixtures/liens.json'
import settlementData from './fixtures/settlements.json'
import insurerData from './fixtures/insurers.json'
import claimData from './fixtures/claims.json'
import bodyPartsData from './fixtures/bodyParts.json'
import safetyQuestionsData from './fixtures/safetyQuestions.json'
import patientData from './fixtures/patients.json'
import providerData from './fixtures/providers.json'
import technologistData from './fixtures/technologists.json'
import radiologistData from './fixtures/radiologists.json'
import attorneyData from './fixtures/attorneys.json'

// Utility function for simulated network latency (300-700ms as per PRD)
const simulateLatency = async () => {
  const latency = 300 + Math.random() * 400
  await delay(latency)
}

// Common response patterns
const createSuccessResponse = (data: any) => {
  return HttpResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  })
}

const createErrorResponse = (status: number, message: string) => {
  return HttpResponse.json({
    success: false,
    error: {
      code: status,
      message,
      timestamp: new Date().toISOString()
    }
  }, { status })
}

const createPaginatedResponse = (data: any[], page: number = 1, limit: number = 20) => {
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = data.slice(start, end)
  
  return HttpResponse.json({
    success: true,
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext: end < data.length,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  })
}

// Public API endpoints (no authentication required)
const publicHandlers = [
  // GET /api/centers - List imaging centers with filtering
  http.get('/api/centers', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const zip = url.searchParams.get('zip')
    const modality = url.searchParams.get('modality')
    const bodyPart = url.searchParams.get('bodyPart')
    
    let filteredCenters = centerData
    
    // Apply filters
    if (city) {
      filteredCenters = filteredCenters.filter(center => 
        center.address.city.toLowerCase().includes(city.toLowerCase())
      )
    }
    
    if (zip) {
      filteredCenters = filteredCenters.filter(center => 
        center.address.zip.startsWith(zip)
      )
    }
    
    if (modality) {
      filteredCenters = filteredCenters.filter(center => 
        center.modalities.includes(modality)
      )
    }
    
    if (bodyPart) {
      filteredCenters = filteredCenters.filter(center => 
        center.specialties.some(specialty => 
          specialty.toLowerCase().includes(bodyPart.toLowerCase())
        )
      )
    }
    
    return createSuccessResponse(filteredCenters)
  }),

  // GET /api/centers/:id - Get specific center details
  http.get('/api/centers/:id', async ({ params }) => {
    await simulateLatency()
    
    const center = centerData.find(c => c.id === params.id)
    
    if (!center) {
      return createErrorResponse(404, 'Center not found')
    }
    
    return createSuccessResponse(center)
  }),

  // GET /api/centers/:id/availability - Get center availability/slots
  http.get('/api/centers/:id/availability', async ({ params, request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const modality = url.searchParams.get('modality')
    
    let centerSlots = slotData.filter(slot => slot.centerId === params.id)
    
    // Filter by modality if specified
    if (modality) {
      centerSlots = centerSlots.filter(slot => slot.modality === modality)
    }
    
    // Filter by date range if specified
    if (from && to) {
      const fromDate = new Date(from)
      const toDate = new Date(to)
      
      centerSlots = centerSlots.filter(slot => {
        const slotDate = new Date(slot.startTime)
        return slotDate >= fromDate && slotDate <= toDate
      })
    }
    
    return createSuccessResponse(centerSlots)
  }),

  // GET /api/body-parts - Get available body parts
  http.get('/api/body-parts', async () => {
    await simulateLatency()
    return createSuccessResponse(bodyPartsData)
  }),

  // GET /api/safety-questions - Get safety questions with filtering
  http.get('/api/safety-questions', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const modality = url.searchParams.get('modality')
    const bodyPart = url.searchParams.get('bodyPart')
    
    let filteredQuestions = safetyQuestionsData
    
    // Filter questions based on modality and body part
    if (modality) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.modality || q.modality === modality
      )
    }
    
    if (bodyPart) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.bodyPart || q.bodyPart === bodyPart
      )
    }
    
    return createSuccessResponse(filteredQuestions)
  })
]

// Referral and booking endpoints
const referralHandlers = [
  // POST /api/referrals - Create new referral
  http.post('/api/referrals', async ({ request }) => {
    await simulateLatency()
    
    try {
      const newReferral = await request.json()
      
      // Basic validation
      if (!newReferral.patientId || !newReferral.modality || !newReferral.bodyPart) {
        return createErrorResponse(400, 'Missing required fields: patientId, modality, bodyPart')
      }
      
      // Generate new ID and add timestamps
      const referral = {
        ...newReferral,
        id: `ref-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return HttpResponse.json(referral, { status: 201 })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload')
    }
  }),

  // GET /api/referrals - List referrals with filtering
  http.get('/api/referrals', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const patientId = url.searchParams.get('patientId')
    const referrerId = url.searchParams.get('referrerId')
    
    let filteredReferrals = referralData
    
    if (status) {
      filteredReferrals = filteredReferrals.filter(ref => ref.status === status)
    }
    
    if (patientId) {
      filteredReferrals = filteredReferrals.filter(ref => ref.patientId === patientId)
    }
    
    if (referrerId) {
      filteredReferrals = filteredReferrals.filter(ref => ref.referrerId === referrerId)
    }
    
    return createSuccessResponse(filteredReferrals)
  }),

  // GET /api/referrals/:id - Get specific referral
  http.get('/api/referrals/:id', async ({ params }) => {
    await simulateLatency()
    
    const referral = referralData.find(r => r.id === params.id)
    
    if (!referral) {
      return createErrorResponse(404, 'Referral not found')
    }
    
    return createSuccessResponse(referral)
  }),

  // POST /api/slots/hold - Hold a time slot temporarily
  http.post('/api/slots/hold', async ({ request }) => {
    await simulateLatency()
    
    try {
      const { slotId, referralId, duration = 15 } = await request.json()
      
      if (!slotId || !referralId) {
        return createErrorResponse(400, 'Missing required fields: slotId, referralId')
      }
      
      // Check if slot is available
      const slot = slotData.find(s => s.id === slotId)
      if (!slot || slot.status !== 'available') {
        return createErrorResponse(400, 'Slot not available')
      }
      
      const holdId = `hold-${Date.now()}`
      const expiresAt = new Date(Date.now() + duration * 60000).toISOString()
      
      return createSuccessResponse({
        holdId,
        slotId,
        referralId,
        expiresAt,
        status: 'held'
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload')
    }
  }),

  // POST /api/appointments - Create appointment from held slot
  http.post('/api/appointments', async ({ request }) => {
    await simulateLatency()
    
    try {
      const appointmentData = await request.json()
      
      if (!appointmentData.referralId || !appointmentData.slotId) {
        return createErrorResponse(400, 'Missing required fields: referralId, slotId')
      }
      
      // Generate new appointment
      const appointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return HttpResponse.json(appointment, { status: 201 })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload')
    }
  }),

  // GET /api/appointments - List appointments
  http.get('/api/appointments', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const centerId = url.searchParams.get('centerId')
    const patientId = url.searchParams.get('patientId')
    
    let filteredAppointments = appointmentData
    
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status)
    }
    
    if (centerId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.centerId === centerId)
    }
    
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId)
    }
    
    return createSuccessResponse(filteredAppointments)
  })
]

// Reports and images endpoints
const reportHandlers = [
  // GET /api/reports/:id - Get specific report
  http.get('/api/reports/:id', async ({ params }) => {
    await simulateLatency()
    
    const report = reportData.find(r => r.id === params.id)
    
    if (!report) {
      return createErrorResponse(404, 'Report not found')
    }
    
    return createSuccessResponse(report)
  }),

  // GET /api/reports - List reports with filtering
  http.get('/api/reports', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const centerId = url.searchParams.get('centerId')
    const patientId = url.searchParams.get('patientId')
    
    let filteredReports = reportData
    
    if (status) {
      filteredReports = filteredReports.filter(r => r.status === status)
    }
    
    if (centerId) {
      filteredReports = filteredReports.filter(r => r.centerId === centerId)
    }
    
    if (patientId) {
      filteredReports = filteredReports.filter(r => r.patientId === patientId)
    }
    
    return createSuccessResponse(filteredReports)
  }),

  // GET /api/images/:id/download - Get image download URL (expiring link simulation)
  http.get('/api/images/:id/download', async ({ params }) => {
    await simulateLatency()
    
    // Simulate expiring download link
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    
    return createSuccessResponse({
      imageId: params.id,
      downloadUrl: `https://api.mriguys.com/images/${params.id}/download?token=${Date.now()}`,
      expiresAt,
      size: '2.4 MB',
      format: 'DICOM'
    })
  })
]

// Attorney and funder endpoints
const attorneyHandlers = [
  // GET /api/liens - Get liens with filtering
  http.get('/api/liens', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const caseId = url.searchParams.get('caseId')
    const attorneyId = url.searchParams.get('attorneyId')
    const status = url.searchParams.get('status')
    
    let filteredLiens = lienData
    
    if (caseId) {
      filteredLiens = filteredLiens.filter(lien => lien.caseNumber === caseId)
    }
    
    if (attorneyId) {
      filteredLiens = filteredLiens.filter(lien => lien.attorneyId === attorneyId)
    }
    
    if (status) {
      filteredLiens = filteredLiens.filter(lien => lien.status === status)
    }
    
    return createSuccessResponse(filteredLiens)
  }),

  // GET /api/exposure - Get exposure data for funders
  http.get('/api/exposure', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const funderId = url.searchParams.get('funderId')
    
    // Calculate exposure data from liens and settlements
    const totalExposure = lienData.reduce((sum, lien) => sum + lien.amount, 0)
    const activeExposure = lienData
      .filter(lien => lien.status === 'active')
      .reduce((sum, lien) => sum + lien.balance, 0)
    
    const exposureData = {
      total: totalExposure,
      active: activeExposure,
      settled: totalExposure - activeExposure,
      byStatus: {
        active: activeExposure,
        pending: lienData
          .filter(lien => lien.status === 'pending')
          .reduce((sum, lien) => sum + lien.balance, 0),
        settled: settlementData
          .filter(settlement => settlement.status === 'settled')
          .reduce((sum, settlement) => sum + settlement.totalSettlement, 0)
      },
      byMonth: [
        { month: '2024-01', amount: 950000 },
        { month: '2024-02', amount: 1050000 },
        { month: '2024-03', amount: 1150000 },
        { month: '2024-04', amount: totalExposure }
      ]
    }
    
    return createSuccessResponse(exposureData)
  }),

  // GET /api/cases/:id/packet - Get case packet for attorneys
  http.get('/api/cases/:id/packet', async ({ params }) => {
    await simulateLatency()
    
    const caseId = params.id
    
    // Find related data for the case
    const liens = lienData.filter(lien => lien.caseNumber === caseId)
    const appointments = appointmentData.filter(apt => 
      liens.some(lien => lien.appointmentId === apt.id)
    )
    const reports = reportData.filter(report => 
      appointments.some(apt => apt.id === report.appointmentId)
    )
    const bills = billData.filter(bill => 
      appointments.some(apt => apt.id === bill.appointmentId)
    )
    
    if (liens.length === 0) {
      return createErrorResponse(404, 'Case not found')
    }
    
    const casePacket = {
      caseId,
      liens,
      appointments,
      reports,
      bills,
      summary: {
        totalExposure: liens.reduce((sum, lien) => sum + lien.amount, 0),
        totalBilled: bills.reduce((sum, bill) => sum + bill.total, 0),
        status: liens[0]?.status || 'unknown'
      },
      generatedAt: new Date().toISOString()
    }
    
    return createSuccessResponse(casePacket)
  })
]

// System and admin endpoints
const systemHandlers = [
  // POST /api/webhooks/test - Test webhook delivery
  http.post('/api/webhooks/test', async ({ request }) => {
    await simulateLatency()
    
    try {
      const payload = await request.json()
      
      // Log webhook test (in real app, this would be sent to webhook endpoints)
      console.log('Webhook test payload:', payload)
      
      return createSuccessResponse({
        success: true,
        message: 'Webhook test received',
        payload,
        deliveredAt: new Date().toISOString()
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload')
    }
  }),

  // GET /api/audit/:entityId - Get audit logs for entity
  http.get('/api/audit/:entityId', async ({ params }) => {
    await simulateLatency()
    
    const { entityId } = params
    
    // Simulate audit logs
    const auditLogs = [
      {
        id: `audit-${Date.now()}-1`,
        entityId,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'john.doe',
        action: 'view',
        details: 'Viewed entity details',
        ipAddress: '192.168.1.100'
      },
      {
        id: `audit-${Date.now()}-2`,
        entityId,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: 'jane.smith',
        action: 'update',
        details: 'Updated status to active',
        ipAddress: '192.168.1.101'
      },
      {
        id: `audit-${Date.now()}-3`,
        entityId,
        timestamp: new Date().toISOString(),
        user: 'admin',
        action: 'reassign',
        details: 'Reassigned to Center B',
        ipAddress: '192.168.1.102'
      }
    ]
    
    return createSuccessResponse(auditLogs)
  }),

  // GET /api/system/health - System health check
  http.get('/api/system/health', async () => {
    await simulateLatency()
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.2.0',
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      services: {
        database: 'healthy',
        cache: 'healthy',
        external: 'healthy'
      }
    })
  }),

  // POST /api/admin/reset - Reset data for demos
  http.post('/api/admin/reset', async () => {
    await simulateLatency()
    
    // In a real implementation, this would reset the database
    // For now, just return success
    return createSuccessResponse({
      message: 'Data reset successful',
      resetAt: new Date().toISOString(),
      note: 'This is a mock endpoint. In production, this would reset all data.'
    })
  })
]

// Combine all handlers
export const handlers = [
  ...publicHandlers,
  ...referralHandlers,
  ...reportHandlers,
  ...attorneyHandlers,
  ...systemHandlers
]
