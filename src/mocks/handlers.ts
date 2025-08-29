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

// Enhanced response patterns with metadata
const createSuccessResponse = (data: any, metadata?: any) => {
  return HttpResponse.json({
    success: true,
    data,
    metadata: metadata || {},
    timestamp: new Date().toISOString()
  })
}

const createErrorResponse = (status: number, message: string, details?: any) => {
  return HttpResponse.json({
    success: false,
    error: {
      code: status,
      message,
      details: details || {},
      timestamp: new Date().toISOString()
    }
  }, { status })
}

// Enhanced pagination with sorting and filtering metadata
const createPaginatedResponse = (
  data: any[], 
  page: number = 1, 
  limit: number = 20, 
  sortBy?: string, 
  sortOrder: 'asc' | 'desc' = 'asc',
  filters?: any
) => {
  // Apply sorting if specified
  let sortedData = [...data]
  if (sortBy) {
    sortedData.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (aVal === undefined || bVal === undefined) return 0
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      
      return 0
    })
  }
  
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = sortedData.slice(start, end)
  
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
    sorting: sortBy ? { field: sortBy, order: sortOrder } : null,
    filters: filters || {},
    timestamp: new Date().toISOString()
  })
}

// Enhanced validation utilities
const validateQueryParams = (params: Record<string, any>, validators: Record<string, any>) => {
  const errors: string[] = []
  const validated: Record<string, any> = {}
  
  for (const [key, validator] of Object.entries(validators)) {
    const value = params[key]
    
    if (value !== undefined && value !== null) {
      if (validator.type === 'string' && validator.minLength && value.length < validator.minLength) {
        errors.push(`${key} must be at least ${validator.minLength} characters`)
      } else if (validator.type === 'number') {
        const num = Number(value)
        if (isNaN(num)) {
          errors.push(`${key} must be a valid number`)
        } else {
          if (validator.min !== undefined && num < validator.min) {
            errors.push(`${key} must be at least ${validator.min}`)
          }
          if (validator.max !== undefined && num > validator.max) {
            errors.push(`${key} must be at most ${validator.max}`)
          }
          validated[key] = num
        }
      } else if (validator.type === 'date') {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          errors.push(`${key} must be a valid date`)
        } else {
          validated[key] = date
        }
      } else if (validator.type === 'enum' && !validator.values.includes(value)) {
        errors.push(`${key} must be one of: ${validator.values.join(', ')}`)
      } else {
        validated[key] = value
      }
    } else if (validator.required) {
      errors.push(`${key} is required`)
    }
  }
  
  return { errors, validated }
}

// Enhanced filtering utilities
const applyAdvancedFilters = (data: any[], filters: any) => {
  let filteredData = [...data]
  
  for (const [key, filter] of Object.entries(filters)) {
    if (filter === undefined || filter === null) continue
    
    switch (key) {
      case 'priceRange':
        if (filter.min !== undefined || filter.max !== undefined) {
          filteredData = filteredData.filter(item => {
            const price = item.price || item.total || 0
            if (filter.min !== undefined && price < filter.min) return false
            if (filter.max !== undefined && price > filter.max) return false
            return true
          })
        }
        break
        
      case 'rating':
        if (filter.min !== undefined) {
          filteredData = filteredData.filter(item => 
            (item.rating || 0) >= filter.min
          )
        }
        break
        
      case 'dateRange':
        if (filter.from || filter.to) {
          filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.startTime || item.date || item.createdAt)
            if (filter.from && itemDate < new Date(filter.from)) return false
            if (filter.to && itemDate > new Date(filter.to)) return false
            return true
          })
        }
        break
        
      case 'search':
        if (filter.query) {
          const query = filter.query.toLowerCase()
          filteredData = filteredData.filter(item => {
            // Search in multiple fields
            const searchableFields = ['name', 'description', 'notes', 'city', 'specialty']
            return searchableFields.some(field => 
              item[field] && item[field].toLowerCase().includes(query)
            )
          })
        }
        break
        
      case 'status':
        if (Array.isArray(filter.values)) {
          filteredData = filteredData.filter(item => 
            filter.values.includes(item.status)
          )
        }
        break
    }
  }
  
  return filteredData
}

// Public API endpoints (no authentication required) - ENHANCED for Task 3.3
export const publicHandlers = [
  // GET /api/centers - List imaging centers with advanced filtering, sorting, and pagination
  http.get('/api/centers', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const queryParams = {
      city: url.searchParams.get('city'),
      zip: url.searchParams.get('zip'),
      modality: url.searchParams.get('modality'),
      bodyPart: url.searchParams.get('bodyPart'),
      priceRange: url.searchParams.get('priceRange'),
      rating: url.searchParams.get('rating'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc',
      search: url.searchParams.get('search')
    }
    
    // Validate parameters
    const validators = {
      page: { type: 'number', min: 1, max: 100 },
      limit: { type: 'number', min: 1, max: 100 },
      rating: { type: 'number', min: 0, max: 5 },
      sortOrder: { type: 'enum', values: ['asc', 'desc'] }
    }
    
    const validation = validateQueryParams(queryParams, validators)
    if (validation.errors.length > 0) {
      return createErrorResponse(400, 'Invalid query parameters', { 
        errors: validation.errors,
        validParams: Object.keys(validators)
      })
    }
    
    // Apply filters
    let filteredCenters = centerData
    
    // Basic filters
    if (queryParams.city) {
      filteredCenters = filteredCenters.filter(center => 
        center.address.city.toLowerCase().includes(queryParams.city!.toLowerCase())
      )
    }
    
    if (queryParams.zip) {
      filteredCenters = filteredCenters.filter(center => 
        center.address.zip.startsWith(queryParams.zip!)
      )
    }
    
    if (queryParams.modality) {
      filteredCenters = filteredCenters.filter(center => 
        center.modalities.includes(queryParams.modality!)
      )
    }
    
    if (queryParams.bodyPart) {
      filteredCenters = filteredCenters.filter(center => 
        center.specialties.some(specialty => 
          specialty.toLowerCase().includes(queryParams.bodyPart!.toLowerCase())
        )
      )
    }
    
    // Advanced filters
    const advancedFilters = {
      rating: queryParams.rating ? { min: Number(queryParams.rating) } : undefined,
      search: queryParams.search ? { query: queryParams.search } : undefined
    }
    
    filteredCenters = applyAdvancedFilters(filteredCenters, advancedFilters)
    
    // Apply pagination and sorting
    const page = Number(queryParams.page) || 1
    const limit = Number(queryParams.limit) || 20
    const sortBy = queryParams.sortBy || 'name'
    const sortOrder = queryParams.sortOrder || 'asc'
    
    // Create response with metadata
    const response = createPaginatedResponse(
      filteredCenters, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      {
        appliedFilters: {
          city: queryParams.city,
          zip: queryParams.zip,
          modality: queryParams.modality,
          bodyPart: queryParams.bodyPart,
          rating: queryParams.rating,
          search: queryParams.search
        },
        totalBeforeFiltering: centerData.length,
        totalAfterFiltering: filteredCenters.length
      }
    )
    
    return response
  }),

  // GET /api/centers/:id - Get specific center details with enhanced error handling
  http.get('/api/centers/:id', async ({ params }) => {
    await simulateLatency()
    
    // Validate center ID format
    if (!params.id || !params.id.match(/^center-\d+$/)) {
      return createErrorResponse(400, 'Invalid center ID format. Expected format: center-XXX', {
        expectedFormat: 'center-XXX',
        received: params.id
      })
    }
    
    const center = centerData.find(c => c.id === params.id)
    
    if (!center) {
      return createErrorResponse(404, 'Center not found', {
        requestedId: params.id,
        availableIds: centerData.map(c => c.id).slice(0, 5), // Show first 5 available IDs
        suggestion: 'Use /api/centers to see all available centers'
      })
    }
    
    // Add related data for enhanced response
    const relatedSlots = slotData.filter(slot => slot.centerId === params.id)
    const relatedTechnologists = technologistData.filter(tech => tech.centerId === params.id)
    const relatedRadiologists = radiologistData.filter(rad => rad.centerId === params.id)
    
    return createSuccessResponse(center, {
      relatedData: {
        availableSlots: relatedSlots.filter(slot => slot.status === 'available').length,
        totalSlots: relatedSlots.length,
        technologists: relatedTechnologists.length,
        radiologists: relatedRadiologists.length
      },
      lastUpdated: center.updatedAt || center.createdAt
    })
  }),

  // GET /api/centers/:id/availability - Get center availability with advanced filtering and pagination
  http.get('/api/centers/:id/availability', async ({ params, request }) => {
    await simulateLatency()
    
    // Validate center ID
    if (!params.id || !params.id.match(/^center-\d+$/)) {
      return createErrorResponse(400, 'Invalid center ID format', {
        expectedFormat: 'center-XXX',
        received: params.id
      })
    }
    
    // Check if center exists
    const center = centerData.find(c => c.id === params.id)
    if (!center) {
      return createErrorResponse(404, 'Center not found', {
        requestedId: params.id,
        suggestion: 'Use /api/centers to see all available centers'
      })
    }
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const queryParams = {
      from: url.searchParams.get('from'),
      to: url.searchParams.get('to'),
      modality: url.searchParams.get('modality'),
      bodyPart: url.searchParams.get('bodyPart'),
      status: url.searchParams.get('status'),
      priceRange: url.searchParams.get('priceRange'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc'
    }
    
    // Validate parameters
    const validators = {
      page: { type: 'number', min: 1, max: 100 },
      limit: { type: 'number', min: 1, max: 100 },
      sortOrder: { type: 'enum', values: ['asc', 'desc'] }
    }
    
    const validation = validateQueryParams(queryParams, validators)
    if (validation.errors.length > 0) {
      return createErrorResponse(400, 'Invalid query parameters', { 
        errors: validation.errors 
      })
    }
    
    // Get center slots
    let centerSlots = slotData.filter(slot => slot.centerId === params.id)
    
    // Apply filters
    if (queryParams.modality) {
      centerSlots = centerSlots.filter(slot => slot.modality === queryParams.modality)
    }
    
    if (queryParams.bodyPart) {
      centerSlots = centerSlots.filter(slot => slot.bodyPart === queryParams.bodyPart)
    }
    
    if (queryParams.status) {
      centerSlots = centerSlots.filter(slot => slot.status === queryParams.status)
    }
    
    // Date range filtering
    if (queryParams.from && queryParams.to) {
      const fromDate = new Date(queryParams.from)
      const toDate = new Date(queryParams.to)
      
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        return createErrorResponse(400, 'Invalid date format', {
          expectedFormat: 'ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
          received: { from: queryParams.from, to: queryParams.to }
        })
      }
      
      centerSlots = centerSlots.filter(slot => {
        const slotDate = new Date(slot.startTime)
        return slotDate >= fromDate && slotDate <= toDate
      })
    }
    
    // Price range filtering
    if (queryParams.priceRange) {
      try {
        const priceRange = JSON.parse(queryParams.priceRange)
        if (priceRange.min !== undefined || priceRange.max !== undefined) {
          centerSlots = centerSlots.filter(slot => {
            const price = slot.price || 0
            if (priceRange.min !== undefined && price < priceRange.min) return false
            if (priceRange.max !== undefined && price > priceRange.max) return false
            return true
          })
        }
      } catch (e) {
        return createErrorResponse(400, 'Invalid price range format', {
          expectedFormat: '{"min": 100, "max": 500}',
          received: queryParams.priceRange
        })
      }
    }
    
    // Apply pagination and sorting
    const page = Number(queryParams.page) || 1
    const limit = Number(queryParams.limit) || 20
    const sortBy = queryParams.sortBy || 'startTime'
    const sortOrder = queryParams.sortOrder || 'asc'
    
    // Create response with availability metadata
    const response = createPaginatedResponse(
      centerSlots, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      {
        centerInfo: {
          id: center.id,
          name: center.name,
          address: center.address
        },
        availability: {
          totalSlots: centerSlots.length,
          availableSlots: centerSlots.filter(slot => slot.status === 'available').length,
          bookedSlots: centerSlots.filter(slot => slot.status === 'booked').length,
          completedSlots: centerSlots.filter(slot => slot.status === 'completed').length
        },
        appliedFilters: {
          modality: queryParams.modality,
          bodyPart: queryParams.bodyPart,
          status: queryParams.status,
          dateRange: queryParams.from && queryParams.to ? 
            { from: queryParams.from, to: queryParams.to } : undefined,
          priceRange: queryParams.priceRange
        }
      }
    )
    
    return response
  }),

  // GET /api/body-parts - Get available body parts with enhanced filtering and categorization
  http.get('/api/body-parts', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract query parameters
    const queryParams = {
      category: url.searchParams.get('category'),
      modality: url.searchParams.get('modality'),
      search: url.searchParams.get('search'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc'
    }
    
    // Validate parameters
    const validators = {
      page: { type: 'number', min: 1, max: 100 },
      limit: { type: 'number', min: 1, max: 100 },
      sortOrder: { type: 'enum', values: ['asc', 'desc'] }
    }
    
    const validation = validateQueryParams(queryParams, validators)
    if (validation.errors.length > 0) {
      return createErrorResponse(400, 'Invalid query parameters', { 
        errors: validation.errors 
      })
    }
    
    // Apply filters
    let filteredBodyParts = bodyPartsData
    
    if (queryParams.category) {
      filteredBodyParts = filteredBodyParts.filter(bp => 
        bp.category.toLowerCase() === queryParams.category!.toLowerCase()
      )
    }
    
    if (queryParams.modality) {
      filteredBodyParts = filteredBodyParts.filter(bp => 
        bp.modalities.includes(queryParams.modality!)
      )
    }
    
    if (queryParams.search) {
      const searchQuery = queryParams.search.toLowerCase()
      filteredBodyParts = filteredBodyParts.filter(bp => 
        bp.name.toLowerCase().includes(searchQuery) ||
        bp.description.toLowerCase().includes(searchQuery) ||
        bp.commonIndications.some(indication => 
          indication.toLowerCase().includes(searchQuery)
        )
      )
    }
    
    // Apply pagination and sorting
    const page = Number(queryParams.page) || 1
    const limit = Number(queryParams.limit) || 20
    const sortBy = queryParams.sortBy || 'name'
    const sortOrder = queryParams.sortOrder || 'asc'
    
    // Create response with categorization metadata
    const response = createPaginatedResponse(
      filteredBodyParts, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      {
        categories: [...new Set(bodyPartsData.map(bp => bp.category))],
        modalities: [...new Set(bodyPartsData.flatMap(bp => bp.modalities))],
        appliedFilters: {
          category: queryParams.category,
          modality: queryParams.modality,
          search: queryParams.search
        },
        totalCategories: new Set(bodyPartsData.map(bp => bp.category)).size,
        totalModalities: new Set(bodyPartsData.flatMap(bp => bp.modalities)).size
      }
    )
    
    return response
  }),

  // GET /api/patients - Get patients with search and filtering
  http.get('/api/patients', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const searchTerm = url.searchParams.get('search') || ''
    const pipOnly = url.searchParams.get('pipOnly') === 'true'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    
    let filteredPatients = [...patientData]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filteredPatients = filteredPatients.filter(patient =>
        patient.name.toLowerCase().includes(term) ||
        patient.id.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term) ||
        patient.phone.includes(term)
      )
    }
    
    // Apply PIP filter
    if (pipOnly) {
      filteredPatients = filteredPatients.filter(patient => patient.pipFlag)
    }
    
    return createPaginatedResponse(filteredPatients, page, limit, undefined, 'asc', {
      search: searchTerm,
      pipOnly,
      total: filteredPatients.length
    })
  }),

  // GET /api/safety-questions - Get safety questions with advanced filtering and validation
  http.get('/api/safety-questions', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const queryParams = {
      modality: url.searchParams.get('modality'),
      bodyPart: url.searchParams.get('bodyPart'),
      type: url.searchParams.get('type'),
      required: url.searchParams.get('required'),
      search: url.searchParams.get('search'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc'
    }
    
    // Validate parameters
    const validators = {
      page: { type: 'number', min: 1, max: 100 },
      limit: { type: 'number', min: 1, max: 100 },
      sortOrder: { type: 'enum', values: ['asc', 'desc'] },
      type: { type: 'enum', values: ['yes/no', 'multiple choice', 'text'] },
      required: { type: 'enum', values: ['true', 'false'] }
    }
    
    const validation = validateQueryParams(queryParams, validators)
    if (validation.errors.length > 0) {
      return createErrorResponse(400, 'Invalid query parameters', { 
        errors: validation.errors 
      })
    }
    
    // Apply filters
    let filteredQuestions = safetyQuestionsData
    
    if (queryParams.modality) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.modality || q.modality === queryParams.modality
      )
    }
    
    if (queryParams.bodyPart) {
      filteredQuestions = filteredQuestions.filter(q => 
        !q.bodyPart || q.bodyPart === queryParams.bodyPart
      )
    }
    
    if (queryParams.type) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.type === queryParams.type
      )
    }
    
    if (queryParams.required !== undefined) {
      const isRequired = queryParams.required === 'true'
      filteredQuestions = filteredQuestions.filter(q => 
        q.required === isRequired
      )
    }
    
    if (queryParams.search) {
      const searchQuery = queryParams.search.toLowerCase()
      filteredQuestions = filteredQuestions.filter(q => 
        q.question.toLowerCase().includes(searchQuery) ||
        (q.contraindication && q.contraindication.toLowerCase().includes(searchQuery))
      )
    }
    
    // Apply pagination and sorting
    const page = Number(queryParams.page) || 1
    const limit = Number(queryParams.limit) || 20
    const sortBy = queryParams.sortBy || 'question'
    const sortOrder = queryParams.sortOrder || 'asc'
    
    // Create response with safety metadata
    const response = createPaginatedResponse(
      filteredQuestions, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      {
        safety: {
          totalQuestions: safetyQuestionsData.length,
          requiredQuestions: safetyQuestionsData.filter(q => q.required).length,
          questionsWithContraindications: safetyQuestionsData.filter(q => q.contraindication).length
        },
        modalities: [...new Set(safetyQuestionsData.map(q => q.modality).filter(Boolean))],
        bodyParts: [...new Set(safetyQuestionsData.map(q => q.bodyPart).filter(Boolean))],
        questionTypes: [...new Set(safetyQuestionsData.map(q => q.type))],
        appliedFilters: {
          modality: queryParams.modality,
          bodyPart: queryParams.bodyPart,
          type: queryParams.type,
          required: queryParams.required,
          search: queryParams.search
        }
      }
    )
    
    return response
  }),

  // GET /api/providers - Get healthcare providers with filtering and pagination
  http.get('/api/providers', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const queryParams = {
      name: url.searchParams.get('name'),
      specialty: url.searchParams.get('specialty'),
      npi: url.searchParams.get('npi'),
      status: url.searchParams.get('status'),
      page: url.searchParams.get('page'),
      limit: url.searchParams.get('limit'),
      sortBy: url.searchParams.get('sortBy'),
      sortOrder: url.searchParams.get('sortOrder') as 'asc' | 'desc'
    }
    
    // Validate parameters
    const validators = {
      page: { type: 'number', min: 1, max: 100 },
      limit: { type: 'number', min: 1, max: 100 },
      sortOrder: { type: 'enum', values: ['asc', 'desc'] }
    }
    
    const validation = validateQueryParams(queryParams, validators)
    if (validation.errors.length > 0) {
      return createErrorResponse(400, 'Invalid query parameters', { 
        errors: validation.errors 
      })
    }
    
    // Apply filters
    let filteredProviders = providerData
    
    if (queryParams.name) {
      filteredProviders = filteredProviders.filter(p => 
        p.name.toLowerCase().includes(queryParams.name!.toLowerCase())
      )
    }
    
    if (queryParams.specialty) {
      filteredProviders = filteredProviders.filter(p => 
        p.specialty.toLowerCase().includes(queryParams.specialty!.toLowerCase())
      )
    }
    
    if (queryParams.npi) {
      filteredProviders = filteredProviders.filter(p => 
        p.npi.includes(queryParams.npi!)
      )
    }
    
    if (queryParams.status) {
      filteredProviders = filteredProviders.filter(p => 
        p.acceptingPatients === (queryParams.status === 'accepting')
      )
    }
    
    // Apply pagination and sorting
    const page = Number(queryParams.page) || 1
    const limit = Number(queryParams.limit) || 20
    const sortBy = queryParams.sortBy || 'name'
    const sortOrder = queryParams.sortOrder || 'asc'
    
    // Create response with provider metadata
    const response = createPaginatedResponse(
      filteredProviders, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      {
        specialties: [...new Set(providerData.map(p => p.specialty))],
        totalProviders: providerData.length,
        acceptingPatients: providerData.filter(p => p.acceptingPatients).length,
        appliedFilters: {
          name: queryParams.name,
          specialty: queryParams.specialty,
          npi: queryParams.npi,
          status: queryParams.status
        }
      }
    )
    
    return response
  }),

  // GET /api/providers/:id - Get specific provider details
  http.get('/api/providers/:id', async ({ params }) => {
    await simulateLatency()
    
    const { id } = params
    
    // Validate ID format
    if (!id || !id.startsWith('provider-')) {
      return createErrorResponse(400, 'Invalid provider ID format. Expected format: provider-XXX', {
        suggestions: ['provider-001', 'provider-002', 'provider-003'],
        availableIds: providerData.map(p => p.id)
      })
    }
    
    const provider = providerData.find(p => p.id === id)
    
    if (!provider) {
      return createErrorResponse(404, 'Provider not found', {
        requestedId: id,
        availableIds: providerData.map(p => p.id),
        suggestions: providerData.map(p => ({ id: p.id, name: p.name }))
      })
    }
    
    return Response.json({
      success: true,
      data: provider,
      metadata: {
        lastUpdated: provider.updatedAt
      }
    })
  })
]

// Referral and booking endpoints - ENHANCED for Task 3.4
export const referralHandlers = [
  // POST /api/referrals - Create new referral
  http.post('/api/referrals', async ({ request }) => {
    await simulateLatency()
    
    try {
      const newReferral = await request.json()
      
      // Enhanced validation with detailed error messages
      const requiredFields = ['patientId', 'modality', 'bodyPart', 'referrerId']
      const missingFields = requiredFields.filter(field => !newReferral[field])
      
      if (missingFields.length > 0) {
        return createErrorResponse(400, 'Missing required fields', {
          missingFields,
          message: `Please provide: ${missingFields.join(', ')}`,
          example: {
            patientId: 'patient-001',
            modality: 'MRI',
            bodyPart: 'Head',
            referrerId: 'provider-001',
            clinicalNotes: 'Patient reports headaches...'
          }
        })
      }
      
      // Validate patient exists
      const patient = patientData.find(p => p.id === newReferral.patientId)
      if (!patient) {
        return createErrorResponse(400, 'Invalid patient ID', {
          providedId: newReferral.patientId,
          availablePatients: patientData.slice(0, 5).map(p => ({ id: p.id, name: p.name })),
          message: 'Please provide a valid patient ID from the available patients list'
        })
      }
      
      // Validate provider exists
      const provider = providerData.find(p => p.id === newReferral.referrerId)
      if (!provider) {
        return createErrorResponse(400, 'Invalid provider ID', {
          providedId: newReferral.referrerId,
          availableProviders: providerData.slice(0, 5).map(p => ({ id: p.id, name: p.name })),
          message: 'Please provide a valid provider ID from the available providers list'
        })
      }
      
      // Validate modality and body part compatibility
      const bodyPart = bodyPartsData.find(bp => bp.name === newReferral.bodyPart)
      if (bodyPart && !bodyPart.modalities.includes(newReferral.modality)) {
        return createErrorResponse(400, 'Incompatible modality and body part', {
          bodyPart: newReferral.bodyPart,
          modality: newReferral.modality,
          compatibleModalities: bodyPart.modalities,
          message: `${newReferral.bodyPart} is not compatible with ${newReferral.modality}. Compatible modalities: ${bodyPart.modalities.join(', ')}`
        })
      }
      
      // Generate new ID and add timestamps
      const referral = {
        ...newReferral,
        id: `ref-${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add safety screening status
        safetyScreening: {
          completed: false,
          required: true,
          questions: safetyQuestionsData
            .filter(q => q.modality === newReferral.modality || q.bodyPart === newReferral.bodyPart)
            .map(q => ({ id: q.id, question: q.question, required: q.required, answered: false }))
        }
      }
      
      // Simulate webhook for referral creation
      console.log('🔔 Webhook: Referral created', { referralId: referral.id, patientId: referral.patientId })
      
      return createSuccessResponse(referral, {
        message: 'Referral created successfully',
        nextSteps: [
          'Complete safety screening questions',
          'Select preferred imaging center',
          'Choose appointment slot'
        ],
        webhookTriggered: true
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload', {
        error: error.message,
        message: 'Please ensure the request body contains valid JSON'
      })
    }
  }),

  // GET /api/referrals - List referrals with enhanced filtering and pagination
  http.get('/api/referrals', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const patientId = url.searchParams.get('patientId')
    const referrerId = url.searchParams.get('referrerId')
    const modality = url.searchParams.get('modality')
    const bodyPart = url.searchParams.get('bodyPart')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const sortBy = url.searchParams.get('sortBy')
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'
    
    // Validate pagination parameters
    if (page < 1 || page > 100) {
      return createErrorResponse(400, 'Invalid page number', {
        provided: page,
        validRange: '1-100',
        message: 'Page number must be between 1 and 100'
      })
    }
    
    if (limit < 1 || limit > 100) {
      return createErrorResponse(400, 'Invalid limit', {
        provided: limit,
        validRange: '1-100',
        message: 'Limit must be between 1 and 100'
      })
    }
    
    let filteredReferrals = [...referralData]
    
    // Apply filters
    if (status) {
      filteredReferrals = filteredReferrals.filter(ref => ref.status === status)
    }
    
    if (patientId) {
      filteredReferrals = filteredReferrals.filter(ref => ref.patientId === patientId)
    }
    
    if (referrerId) {
      filteredReferrals = filteredReferrals.filter(ref => ref.referrerId === referrerId)
    }
    
    if (modality) {
      filteredReferrals = filteredReferrals.filter(ref => ref.modality === modality)
    }
    
    if (bodyPart) {
      filteredReferrals = filteredReferrals.filter(ref => ref.bodyPart === bodyPart)
    }
    
    // Create paginated response with enhanced metadata
    const filters = {
      appliedFilters: {
        status: status || null,
        patientId: patientId || null,
        referrerId: referrerId || null,
        modality: modality || null,
        bodyPart: bodyPart || null
      },
      totalBeforeFiltering: referralData.length,
      totalAfterFiltering: filteredReferrals.length,
      statistics: {
        byStatus: {
          pending: filteredReferrals.filter(r => r.status === 'pending').length,
          approved: filteredReferrals.filter(r => r.status === 'approved').length,
          completed: filteredReferrals.filter(r => r.status === 'completed').length,
          cancelled: filteredReferrals.filter(r => r.status === 'cancelled').length
        },
        byModality: {
          MRI: filteredReferrals.filter(r => r.modality === 'MRI').length,
          CT: filteredReferrals.filter(r => r.modality === 'CT').length,
          XRay: filteredReferrals.filter(r => r.modality === 'X-Ray').length
        }
      }
    }
    
    return createPaginatedResponse(filteredReferrals, page, limit, sortBy, sortOrder, filters)
  }),

  // GET /api/referrals/:id - Get specific referral with enhanced data
  http.get('/api/referrals/:id', async ({ params }) => {
    await simulateLatency()
    
    const referral = referralData.find(r => r.id === params.id)
    
    if (!referral) {
      return createErrorResponse(404, 'Referral not found', {
        providedId: params.id,
        availableReferrals: referralData.slice(0, 5).map(r => ({ id: r.id, patientId: r.patientId, modality: r.modality })),
        message: 'Please provide a valid referral ID'
      })
    }
    
    // Get related data
    const patient = patientData.find(p => p.id === referral.patientId)
    const provider = providerData.find(p => p.id === referral.referrerId)
    const appointments = appointmentData.filter(apt => apt.referralId === referral.id)
    const reports = reportData.filter(rep => rep.appointmentId && appointments.some(apt => apt.id === rep.appointmentId))
    
    return createSuccessResponse(referral, {
      relatedData: {
        patient: patient ? { id: patient.id, name: patient.name, dob: patient.dob } : null,
        provider: provider ? { id: provider.id, name: provider.name, specialty: provider.specialty } : null,
        appointments: appointments.map(apt => ({ id: apt.id, status: apt.status, centerId: apt.centerId })),
        reports: reports.map(rep => ({ id: rep.id, status: rep.status, releasedAt: rep.releasedAt }))
      },
      timeline: {
        created: referral.createdAt,
        lastUpdated: referral.updatedAt,
        nextMilestone: referral.status === 'pending' ? 'Safety screening' : 'Appointment booking'
      }
    })
  }),

  // POST /api/slots/hold - Enhanced slot holding with expiration and validation
  http.post('/api/slots/hold', async ({ request }) => {
    await simulateLatency()
    
    try {
      const { slotId, referralId, duration = 15 } = await request.json()
      
      // Enhanced validation
      if (!slotId || !referralId) {
        return createErrorResponse(400, 'Missing required fields', {
          missingFields: [slotId ? null : 'slotId', referralId ? null : 'referralId'].filter(Boolean),
          message: 'Both slotId and referralId are required'
        })
      }
      
      // Validate referral exists and is in correct status
      const referral = referralData.find(r => r.id === referralId)
      if (!referral) {
        return createErrorResponse(400, 'Invalid referral ID', {
          providedId: referralId,
          message: 'Please provide a valid referral ID'
        })
      }
      
      if (referral.status !== 'pending' && referral.status !== 'approved') {
        return createErrorResponse(400, 'Referral not eligible for booking', {
          referralStatus: referral.status,
          eligibleStatuses: ['pending', 'approved'],
          message: 'Referral must be pending or approved to book a slot'
        })
      }
      
      // Check if slot is available
      const slot = slotData.find(s => s.id === slotId)
      if (!slot) {
        return createErrorResponse(400, 'Slot not found', {
          providedId: slotId,
          message: 'Please provide a valid slot ID'
        })
      }
      
      if (slot.status !== 'available') {
        return createErrorResponse(400, 'Slot not available', {
          slotStatus: slot.status,
          slotId: slot.id,
          message: `Slot is currently ${slot.status}. Please select an available slot.`
        })
      }
      
      // Validate duration
      if (duration < 5 || duration > 60) {
        return createErrorResponse(400, 'Invalid hold duration', {
          provided: duration,
          validRange: '5-60 minutes',
          message: 'Hold duration must be between 5 and 60 minutes'
        })
      }
      
      const holdId = `hold-${Date.now()}`
      const expiresAt = new Date(Date.now() + duration * 60000).toISOString()
      
      // Simulate webhook for slot hold
      console.log('🔔 Webhook: Slot held', { holdId, slotId, referralId, expiresAt })
      
      return createSuccessResponse({
        holdId,
        slotId,
        referralId,
        expiresAt,
        status: 'held',
        duration: duration,
        slot: {
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          centerId: slot.centerId,
          modality: slot.modality,
          bodyPart: slot.bodyPart
        }
      }, {
        message: 'Slot held successfully',
        nextSteps: [
          'Complete appointment details',
          'Confirm appointment within hold duration',
          'Slot will be released automatically if not confirmed'
        ],
        webhookTriggered: true
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload', {
        error: error.message,
        message: 'Please ensure the request body contains valid JSON'
      })
    }
  }),

  // POST /api/appointments - Enhanced appointment creation with status transitions
  http.post('/api/appointments', async ({ request }) => {
    await simulateLatency()
    
    try {
      const appointmentData = await request.json()
      
      // Enhanced validation
      if (!appointmentData.referralId || !appointmentData.slotId) {
        return createErrorResponse(400, 'Missing required fields', {
          missingFields: [appointmentData.referralId ? null : 'referralId', appointmentData.slotId ? null : 'slotId'].filter(Boolean),
          message: 'Both referralId and slotId are required'
        })
      }
      
      // Validate referral exists and is eligible
      const referral = referralData.find(r => r.id === appointmentData.referralId)
      if (!referral) {
        return createErrorResponse(400, 'Invalid referral ID', {
          providedId: appointmentData.referralId,
          message: 'Please provide a valid referral ID'
        })
      }
      
      if (referral.status === 'completed' || referral.status === 'cancelled') {
        return createErrorResponse(400, 'Referral not eligible for appointment', {
          referralStatus: referral.status,
          message: 'Cannot create appointment for completed or cancelled referral'
        })
      }
      
      // Validate slot exists and is available
      const slot = slotData.find(s => s.id === appointmentData.slotId)
      if (!slot) {
        return createErrorResponse(400, 'Invalid slot ID', {
          providedId: appointmentData.slotId,
          message: 'Please provide a valid slot ID'
        })
      }
      
      if (slot.status !== 'available') {
        return createErrorResponse(400, 'Slot not available', {
          slotStatus: slot.status,
          message: `Slot is currently ${slot.status}. Please select an available slot.`
        })
      }
      
      // Check if patient has other appointments at the same time
      const conflictingAppointments = appointmentData.filter(apt => 
        apt.patientId === referral.patientId &&
        apt.id !== appointmentData.id &&
        apt.status !== 'cancelled' &&
        apt.status !== 'completed'
      )
      
      if (conflictingAppointments.length > 0) {
        return createErrorResponse(400, 'Patient has conflicting appointments', {
          conflictingAppointments: conflictingAppointments.map(apt => ({
            id: apt.id,
            date: apt.date,
            centerId: apt.centerId
          })),
          message: 'Patient cannot have multiple appointments at the same time'
        })
      }
      
      // Generate new appointment with enhanced data
      const appointment = {
        ...appointmentData,
        id: `apt-${Date.now()}`,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add appointment details
        patientId: referral.patientId,
        centerId: slot.centerId,
        modality: slot.modality,
        bodyPart: slot.bodyPart,
        startTime: slot.startTime,
        endTime: slot.endTime,
        // Add preparation instructions
        preparation: {
          fasting: slot.modality === 'MRI' || slot.modality === 'CT',
          duration: slot.modality === 'MRI' ? '4 hours' : '2 hours',
          instructions: slot.modality === 'MRI' ? 
            'No food or drink 4 hours before appointment. Remove all metal objects.' :
            'No food or drink 2 hours before appointment.'
        }
      }
      
      // Update slot status
      // Note: In a real implementation, this would update the slot data
      console.log('📅 Slot status updated:', { slotId: slot.id, newStatus: 'booked' })
      
      // Simulate webhook for appointment creation
      console.log('🔔 Webhook: Appointment created', { 
        appointmentId: appointment.id, 
        referralId: appointment.referralId,
        patientId: appointment.patientId,
        centerId: appointment.centerId
      })
      
      return createSuccessResponse(appointment, {
        message: 'Appointment created successfully',
        nextSteps: [
          'Patient will receive confirmation email',
          'Center staff notified of new appointment',
          'Referral status updated to confirmed'
        ],
        webhookTriggered: true,
        slotUpdated: true
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload', {
        error: error.message,
        message: 'Please ensure the request body contains valid JSON'
      })
    }
  }),

  // GET /api/appointments - Enhanced appointment listing with filtering and pagination
  http.get('/api/appointments', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const centerId = url.searchParams.get('centerId')
    const patientId = url.searchParams.get('patientId')
    const referralId = url.searchParams.get('referralId')
    const modality = url.searchParams.get('modality')
    const bodyPart = url.searchParams.get('bodyPart')
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const sortBy = url.searchParams.get('sortBy')
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'
    
    // Validate pagination parameters
    if (page < 1 || page > 100) {
      return createErrorResponse(400, 'Invalid page number', {
        provided: page,
        validRange: '1-100',
        message: 'Page number must be between 1 and 100'
      })
    }
    
    if (limit < 1 || limit > 100) {
      return createErrorResponse(400, 'Invalid limit', {
        provided: limit,
        validRange: '1-100',
        message: 'Limit must be between 1 and 100'
      })
    }
    
    let filteredAppointments = [...appointmentData]
    
    // Apply filters
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status)
    }
    
    if (centerId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.centerId === centerId)
    }
    
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId)
    }
    
    if (referralId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.referralId === referralId)
    }
    
    if (modality) {
      filteredAppointments = filteredAppointments.filter(apt => apt.modality === modality)
    }
    
    if (bodyPart) {
      filteredAppointments = filteredAppointments.filter(apt => apt.bodyPart === bodyPart)
    }
    
    // Date range filtering
    if (from || to) {
      if (from) {
        const fromDate = new Date(from)
        if (isNaN(fromDate.getTime())) {
          return createErrorResponse(400, 'Invalid from date', {
            provided: from,
            message: 'Please provide a valid ISO 8601 date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)'
          })
        }
        filteredAppointments = filteredAppointments.filter(apt => new Date(apt.startTime) >= fromDate)
      }
      
      if (to) {
        const toDate = new Date(to)
        if (isNaN(toDate.getTime())) {
          return createErrorResponse(400, 'Invalid to date', {
            provided: to,
            message: 'Please provide a valid ISO 8601 date format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)'
          })
        }
        filteredAppointments = filteredAppointments.filter(apt => new Date(apt.startTime) <= toDate)
      }
    }
    
    // Create paginated response with enhanced metadata
    const filters = {
      appliedFilters: {
        status: status || null,
        centerId: centerId || null,
        patientId: patientId || null,
        referralId: referralId || null,
        modality: modality || null,
        bodyPart: bodyPart || null,
        dateRange: from || to ? { from: from || null, to: to || null } : null
      },
      totalBeforeFiltering: appointmentData.length,
      totalAfterFiltering: filteredAppointments.length,
      statistics: {
        byStatus: {
          confirmed: appointmentData.filter(apt => apt.status === 'confirmed').length,
          inProgress: appointmentData.filter(apt => apt.status === 'in-progress').length,
          completed: appointmentData.filter(apt => apt.status === 'completed').length,
          cancelled: appointmentData.filter(apt => apt.status === 'cancelled').length
        },
        byModality: {
          MRI: appointmentData.filter(apt => apt.modality === 'MRI').length,
          CT: appointmentData.filter(apt => apt.modality === 'CT').length,
          XRay: appointmentData.filter(apt => apt.modality === 'X-Ray').length
        }
      }
    }
    
    return createPaginatedResponse(filteredAppointments, page, limit, sortBy, sortOrder, filters)
  })
]

// Reports and Images endpoints - ENHANCED for Task 3.5
export const reportHandlers = [
  // GET /api/reports/:id - Get specific report with related data
  http.get('/api/reports/:id', async ({ params }) => {
    await simulateLatency()
    
    const report = reportData.find(r => r.id === params.id)
    
    if (!report) {
      return createErrorResponse(404, 'Report not found', { reportId: params.id })
    }
    
    // Find related data for rich response
    const appointment = appointmentData.find(apt => apt.id === report.appointmentId)
    const patient = patientData.find(p => p.id === report.patientId)
    const center = centerData.find(c => c.id === report.centerId)
    const radiologist = radiologistData.find(r => r.id === report.radiologistId)
    const bodyPart = bodyPartsData.find(bp => bp.id === report.bodyPart)
    
    const enrichedReport = {
      ...report,
      relatedData: {
        appointment: appointment ? {
          id: appointment.id,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          status: appointment.status
        } : null,
        patient: patient ? {
          id: patient.id,
          name: patient.name,
          dateOfBirth: patient.dateOfBirth,
          mrn: patient.mrn
        } : null,
        center: center ? {
          id: center.id,
          name: center.name,
          city: center.city,
          state: center.state
        } : null,
        radiologist: radiologist ? {
          id: radiologist.id,
          name: radiologist.name,
          specialty: radiologist.specialty,
          npi: radiologist.npi
        } : null,
        bodyPart: bodyPart ? {
          id: bodyPart.id,
          name: bodyPart.name,
          category: bodyPart.category
        } : null
      }
    }
    
    return createSuccessResponse(enrichedReport, {
      reportType: report.modality,
      bodyPart: report.bodyPart,
      status: report.status,
      hasAttachments: report.attachments && report.attachments.length > 0
    })
  }),

  // GET /api/reports - List reports with advanced filtering, pagination, and sorting
  http.get('/api/reports', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'reportDate', 
      sortOrder = 'desc',
      status,
      centerId,
      patientId,
      radiologistId,
      modality,
      bodyPart,
      fromDate,
      toDate,
      search
    } = Object.fromEntries(url.searchParams)
    
    // Validate pagination parameters
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return createErrorResponse(400, 'Invalid pagination parameters', {
        page: pageNum,
        limit: limitNum,
        maxLimit: 100
      })
    }
    
    // Validate sort order
    if (!['asc', 'desc'].includes(sortOrder)) {
      return createErrorResponse(400, 'Invalid sort order', { 
        sortOrder, 
        allowedValues: ['asc', 'desc'] 
      })
    }
    
    // Apply filters
    let filteredReports = reportData
    
    if (status) {
      const validStatuses = ['draft', 'in-progress', 'finalized', 'amended', 'cancelled']
      if (!validStatuses.includes(status)) {
        return createErrorResponse(400, 'Invalid status filter', {
          status,
          allowedValues: validStatuses
        })
      }
      filteredReports = filteredReports.filter(r => r.status === status)
    }
    
    if (centerId) {
      filteredReports = filteredReports.filter(r => r.centerId === centerId)
    }
    
    if (patientId) {
      filteredReports = filteredReports.filter(r => r.patientId === patientId)
    }
    
    if (radiologistId) {
      filteredReports = filteredReports.filter(r => r.radiologistId === radiologistId)
    }
    
    if (modality) {
      const validModalities = ['MRI', 'CT', 'X-Ray', 'Ultrasound', 'Mammography', 'Nuclear Medicine']
      if (!validModalities.includes(modality)) {
        return createErrorResponse(400, 'Invalid modality filter', {
          modality,
          allowedValues: validModalities
        })
      }
      filteredReports = filteredReports.filter(r => r.modality === modality)
    }
    
    if (bodyPart) {
      filteredReports = filteredReports.filter(r => r.bodyPart === bodyPart)
    }
    
    if (fromDate) {
      const from = new Date(fromDate)
      if (isNaN(from.getTime())) {
        return createErrorResponse(400, 'Invalid fromDate format', { fromDate })
      }
      filteredReports = filteredReports.filter(r => new Date(r.reportDate) >= from)
    }
    
    if (toDate) {
      const to = new Date(toDate)
      if (isNaN(to.getTime())) {
        return createErrorResponse(400, 'Invalid toDate format', { toDate })
      }
      filteredReports = filteredReports.filter(r => new Date(r.reportDate) <= to)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredReports = filteredReports.filter(r => 
        r.impression?.toLowerCase().includes(searchLower) ||
        r.findings?.toLowerCase().includes(searchLower) ||
        r.recommendations?.toLowerCase().includes(searchLower) ||
        r.clinicalCorrelation?.toLowerCase().includes(searchLower)
      )
    }
    
    // Create paginated response with sorting
    return createPaginatedResponse(
      filteredReports,
      pageNum,
      limitNum,
      sortBy,
      sortOrder,
      {
        appliedFilters: {
          status,
          centerId,
          patientId,
          radiologistId,
          modality,
          bodyPart,
          fromDate,
          toDate,
          search
        },
        totalReports: filteredReports.length,
        byStatus: {
          draft: filteredReports.filter(r => r.status === 'draft').length,
          'in-progress': filteredReports.filter(r => r.status === 'in-progress').length,
          finalized: filteredReports.filter(r => r.status === 'finalized').length,
          amended: filteredReports.filter(r => r.status === 'amended').length,
          cancelled: filteredReports.filter(r => r.status === 'cancelled').length
        },
        byModality: {
          MRI: filteredReports.filter(r => r.modality === 'MRI').length,
          CT: filteredReports.filter(r => r.modality === 'CT').length,
          'X-Ray': filteredReports.filter(r => r.modality === 'X-Ray').length,
          Ultrasound: filteredReports.filter(r => r.modality === 'Ultrasound').length,
          Mammography: filteredReports.filter(r => r.modality === 'Mammography').length,
          'Nuclear Medicine': filteredReports.filter(r => r.modality === 'Nuclear Medicine').length
        }
      }
    )
  }),

  // POST /api/reports - Create new report (for testing purposes)
  http.post('/api/reports', async ({ request }) => {
    await simulateLatency()
    
    try {
      const body = await request.json()
      
      // Validate required fields
      const requiredFields = ['appointmentId', 'patientId', 'centerId', 'radiologistId', 'modality', 'bodyPart']
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return createErrorResponse(400, 'Missing required fields', { missingFields })
      }
      
      // Validate appointment exists and is completed
      const appointment = appointmentData.find(apt => apt.id === body.appointmentId)
      if (!appointment) {
        return createErrorResponse(404, 'Appointment not found', { appointmentId: body.appointmentId })
      }
      
      if (appointment.status !== 'completed') {
        return createErrorResponse(400, 'Cannot create report for incomplete appointment', {
          appointmentId: body.appointmentId,
          appointmentStatus: appointment.status
        })
      }
      
      // Create new report
      const newReport = {
        id: `report-${Date.now()}`,
        ...body,
        status: 'draft',
        reportDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        finalizedAt: null
      }
      
      // Simulate webhook for report creation
      console.log('🔔 Webhook: Report created', { reportId: newReport.id, status: newReport.status })
      
      return createSuccessResponse(newReport, {
        message: 'Report created successfully',
        nextSteps: ['Complete findings', 'Add impression', 'Finalize report']
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // PUT /api/reports/:id - Update report
  http.put('/api/reports/:id', async ({ params, request }) => {
    await simulateLatency()
    
    const report = reportData.find(r => r.id === params.id)
    
    if (!report) {
      return createErrorResponse(404, 'Report not found', { reportId: params.id })
    }
    
    if (report.status === 'finalized') {
      return createErrorResponse(400, 'Cannot modify finalized report', { 
        reportId: params.id,
        currentStatus: report.status
      })
    }
    
    try {
      const updates = await request.json()
      
      // Validate status transitions
      if (updates.status === 'finalized' && (!updates.impression || !updates.findings)) {
        return createErrorResponse(400, 'Cannot finalize report without impression and findings', {
          reportId: params.id,
          missingFields: ['impression', 'findings'].filter(field => !updates[field])
        })
      }
      
      const updatedReport = {
        ...report,
        ...updates,
        updatedAt: new Date().toISOString(),
        finalizedAt: updates.status === 'finalized' ? new Date().toISOString() : report.finalizedAt
      }
      
      // Simulate webhook for report update
      console.log('🔔 Webhook: Report updated', { 
        reportId: updatedReport.id, 
        status: updatedReport.status,
        changes: Object.keys(updates)
      })
      
      return createSuccessResponse(updatedReport, {
        message: 'Report updated successfully',
        statusChanged: updates.status !== report.status
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // GET /api/images/:id/download - Get image download URL with enhanced metadata
  http.get('/api/images/:id/download', async ({ params }) => {
    await simulateLatency()
    
    // Simulate image metadata lookup
    const imageId = params.id
    
    // Generate expiring download link (24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const token = btoa(`${imageId}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '')
    
    // Simulate different image types and sizes
    const imageTypes = {
      'images-001': { size: '2.4 MB', format: 'DICOM', type: 'CT Scan' },
      'images-002': { size: '1.8 MB', format: 'DICOM', type: 'CT Scan' },
      'images-003': { size: '3.2 MB', format: 'DICOM', type: 'CT Scan' },
      'images-004': { size: '4.1 MB', format: 'DICOM', type: 'MRI Scan' },
      'images-005': { size: '3.9 MB', format: 'DICOM', type: 'MRI Scan' },
      'images-006': { size: '2.8 MB', format: 'DICOM', type: 'MRI Scan' },
      'images-007': { size: '0.8 MB', format: 'JPEG', type: 'X-Ray' },
      'images-008': { size: '0.9 MB', format: 'JPEG', type: 'X-Ray' }
    }
    
    const imageInfo = imageTypes[imageId] || { size: '2.0 MB', format: 'DICOM', type: 'Medical Image' }
    
    return createSuccessResponse({
      imageId,
      downloadUrl: `https://api.mriguys.com/images/${imageId}/download?token=${token}`,
      expiresAt,
      ...imageInfo,
      metadata: {
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: Math.floor(Math.random() * 50) + 1,
        compression: 'Lossless',
        resolution: '512x512',
        bitDepth: 16
      }
    }, {
      downloadType: 'secure',
      requiresAuth: true,
      maxDownloads: 5
    })
  }),

  // GET /api/images - List available images with filtering
  http.get('/api/images', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const { 
      page = 1, 
      limit = 20, 
      format, 
      type,
      search,
      fromDate,
      toDate
    } = Object.fromEntries(url.searchParams)
    
    // Validate pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return createErrorResponse(400, 'Invalid pagination parameters', {
        page: pageNum,
        limit: limitNum,
        maxLimit: 100
      })
    }
    
    // Simulate image collection from reports
    const allImages = []
    reportData.forEach(report => {
      if (report.attachments) {
        report.attachments.forEach(imageId => {
          allImages.push({
            id: imageId,
            reportId: report.id,
            patientId: report.patientId,
            modality: report.modality,
            bodyPart: report.bodyPart,
            uploadedAt: report.createdAt,
            status: 'available'
          })
        })
      }
    })
    
    let filteredImages = allImages
    
    if (format) {
      filteredImages = filteredImages.filter(img => img.modality === format)
    }
    
    if (type) {
      filteredImages = filteredImages.filter(img => img.bodyPart === type)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredImages = filteredImages.filter(img => 
        img.id.toLowerCase().includes(searchLower) ||
        img.modality.toLowerCase().includes(searchLower) ||
        img.bodyPart.toLowerCase().includes(searchLower)
      )
    }
    
    if (fromDate) {
      const from = new Date(fromDate)
      if (!isNaN(from.getTime())) {
        filteredImages = filteredImages.filter(img => new Date(img.uploadedAt) >= from)
      }
    }
    
    if (toDate) {
      const to = new Date(toDate)
      if (!isNaN(to.getTime())) {
        filteredImages = filteredImages.filter(img => new Date(img.uploadedAt) <= to)
      }
    }
    
    return createPaginatedResponse(
      filteredImages,
      pageNum,
      limitNum,
      'uploadedAt',
      'desc',
      {
        appliedFilters: { format, type, search, fromDate, toDate },
        totalImages: filteredImages.length,
        byModality: {
          MRI: filteredImages.filter(img => img.modality === 'MRI').length,
          CT: filteredImages.filter(img => img.modality === 'CT').length,
          'X-Ray': filteredImages.filter(img => img.modality === 'X-Ray').length,
          Ultrasound: filteredImages.filter(img => img.modality === 'Ultrasound').length,
          Mammography: filteredImages.filter(img => img.modality === 'Mammography').length
        },
        byBodyPart: {
          Head: filteredImages.filter(img => img.bodyPart === 'bp-002').length,
          Spine: filteredImages.filter(img => img.bodyPart === 'bp-004').length,
          Chest: filteredImages.filter(img => img.bodyPart === 'bp-006').length,
          Abdomen: filteredImages.filter(img => img.bodyPart === 'bp-008').length,
          Extremities: filteredImages.filter(img => img.bodyPart === 'bp-010').length
        }
      }
    )
  })
]

// Attorney and funder endpoints - ENHANCED
export const attorneyHandlers = [
  // GET /api/liens - Get liens with advanced filtering, pagination, and sorting
  http.get('/api/liens', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    
    // Extract and validate query parameters
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      caseId,
      attorneyId,
      funderId,
      status,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      search
    } = Object.fromEntries(url.searchParams)
    
    // Validate pagination parameters
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return createErrorResponse(400, 'Invalid pagination parameters', {
        page: pageNum,
        limit: limitNum,
        maxLimit: 100
      })
    }
    
    // Validate sort order
    if (!['asc', 'desc'].includes(sortOrder)) {
      return createErrorResponse(400, 'Invalid sort order', { 
        sortOrder, 
        allowedValues: ['asc', 'desc'] 
      })
    }
    
    // Apply filters
    let filteredLiens = lienData
    
    if (caseId) {
      filteredLiens = filteredLiens.filter(lien => lien.caseNumber === caseId)
    }
    
    if (attorneyId) {
      filteredLiens = filteredLiens.filter(lien => lien.attorneyId === attorneyId)
    }
    
    if (funderId) {
      filteredLiens = filteredLiens.filter(lien => lien.funderId === funderId)
    }
    
    if (status) {
      const validStatuses = ['pending', 'active', 'approved', 'settled', 'closed']
      if (!validStatuses.includes(status)) {
        return createErrorResponse(400, 'Invalid status filter', {
          status,
          allowedValues: validStatuses
        })
      }
      filteredLiens = filteredLiens.filter(lien => lien.status === status)
    }
    
    if (fromDate) {
      const from = new Date(fromDate)
      if (isNaN(from.getTime())) {
        return createErrorResponse(400, 'Invalid fromDate format', { fromDate })
      }
      filteredLiens = filteredLiens.filter(lien => new Date(lien.accidentDate) >= from)
    }
    
    if (toDate) {
      const to = new Date(toDate)
      if (isNaN(to.getTime())) {
        return createErrorResponse(400, 'Invalid toDate format', { toDate })
      }
      filteredLiens = filteredLiens.filter(lien => new Date(lien.accidentDate) <= to)
    }
    
    if (minAmount) {
      const min = parseFloat(minAmount)
      if (isNaN(min)) {
        return createErrorResponse(400, 'Invalid minAmount format', { minAmount })
      }
      filteredLiens = filteredLiens.filter(lien => lien.amount >= min)
    }
    
    if (maxAmount) {
      const max = parseFloat(maxAmount)
      if (isNaN(max)) {
        return createErrorResponse(400, 'Invalid maxAmount format', { maxAmount })
      }
      filteredLiens = filteredLiens.filter(lien => lien.amount <= max)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLiens = filteredLiens.filter(lien => 
        lien.caseNumber?.toLowerCase().includes(searchLower) ||
        lien.accidentDescription?.toLowerCase().includes(searchLower) ||
        lien.injuryDescription?.toLowerCase().includes(searchLower)
      )
    }
    
    // Create paginated response with sorting
    return createPaginatedResponse(
      filteredLiens,
      pageNum,
      limitNum,
      sortBy,
      sortOrder,
      {
        appliedFilters: {
          caseId,
          attorneyId,
          funderId,
          status,
          fromDate,
          toDate,
          minAmount,
          maxAmount,
          search
        },
        totalLiens: filteredLiens.length,
        byStatus: {
          pending: filteredLiens.filter(lien => lien.status === 'pending').length,
          active: filteredLiens.filter(lien => lien.status === 'active').length,
          approved: filteredLiens.filter(lien => lien.status === 'approved').length,
          settled: filteredLiens.filter(lien => lien.status === 'settled').length,
          closed: filteredLiens.filter(lien => lien.status === 'closed').length
        },
        byAmount: {
          low: filteredLiens.filter(lien => lien.amount < 10000).length,
          medium: filteredLiens.filter(lien => lien.amount >= 10000 && lien.amount < 50000).length,
          high: filteredLiens.filter(lien => lien.amount >= 50000).length
        },
        totalExposure: filteredLiens.reduce((sum, lien) => sum + lien.amount, 0),
        averageAmount: filteredLiens.length > 0 ? 
          filteredLiens.reduce((sum, lien) => sum + lien.amount, 0) / filteredLiens.length : 0
      }
    )
  }),

  // POST /api/liens - Create new lien
  http.post('/api/liens', async ({ request }) => {
    await simulateLatency()
    
    try {
      const body = await request.json()
      
      // Validate required fields
      const requiredFields = ['patientId', 'attorneyId', 'accidentDate', 'accidentType', 'injuryDescription', 'amount']
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return createErrorResponse(400, 'Missing required fields', { missingFields })
      }
      
      // Validate patient exists
      const patient = patientData.find(p => p.id === body.patientId)
      if (!patient) {
        return createErrorResponse(404, 'Patient not found', { patientId: body.patientId })
      }
      
      // Validate attorney exists
      const attorney = attorneyData.find(a => a.id === body.attorneyId)
      if (!attorney) {
        return createErrorResponse(404, 'Attorney not found', { attorneyId: body.attorneyId })
      }
      
      // Create new lien
      const newLien = {
        id: `lien-${Date.now()}`,
        ...body,
        status: 'pending',
        balance: body.amount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        caseNumber: body.caseNumber || `CASE-${Date.now()}`,
        settlementStatus: 'pending'
      }
      
      // Simulate webhook for lien creation
      console.log('🔔 Webhook: Lien created', { lienId: newLien.id, status: newLien.status })
      
      return createSuccessResponse(newLien, {
        message: 'Lien created successfully',
        nextSteps: ['Submit for funding approval', 'Complete case documentation', 'Schedule medical appointments']
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // PUT /api/liens/:id - Update lien
  http.put('/api/liens/:id', async ({ params, request }) => {
    await simulateLatency()
    
    const lien = lienData.find(l => l.id === params.id)
    
    if (!lien) {
      return createErrorResponse(404, 'Lien not found', { lienId: params.id })
    }
    
    try {
      const updates = await request.json()
      
      // Validate status transitions
      const validTransitions = {
        'pending': ['active', 'cancelled'],
        'active': ['approved', 'settled', 'closed'],
        'approved': ['settled', 'closed'],
        'settled': ['closed'],
        'closed': []
      }
      
      if (updates.status && !validTransitions[lien.status]?.includes(updates.status)) {
        return createErrorResponse(400, 'Invalid status transition', {
          currentStatus: lien.status,
          requestedStatus: updates.status,
          allowedTransitions: validTransitions[lien.status] || []
        })
      }
      
      const updatedLien = {
        ...lien,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      // Simulate webhook for lien update
      console.log('🔔 Webhook: Lien updated', { 
        lienId: updatedLien.id, 
        status: updatedLien.status,
        changes: Object.keys(updates)
      })
      
      return createSuccessResponse(updatedLien, {
        message: 'Lien updated successfully',
        statusChanged: updates.status !== lien.status
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // POST /api/liens/:id/approve - Approve lien for funding
  http.post('/api/liens/:id/approve', async ({ params, request }) => {
    await simulateLatency()
    
    const lien = lienData.find(l => l.id === params.id)
    
    if (!lien) {
      return createErrorResponse(404, 'Lien not found', { lienId: params.id })
    }
    
    if (lien.status !== 'active') {
      return createErrorResponse(400, 'Lien must be active for approval', {
        lienId: params.id,
        currentStatus: lien.status,
        requiredStatus: 'active'
      })
    }
    
    try {
      const body = await request.json()
      
      // Validate approval data
      if (!body.funderId || !body.approvedAmount || !body.rateApr) {
        return createErrorResponse(400, 'Missing required approval fields', {
          required: ['funderId', 'approvedAmount', 'rateApr'],
          provided: Object.keys(body)
        })
      }
      
      // Update lien with approval information
      const approvedLien = {
        ...lien,
        status: 'approved',
        funderId: body.funderId,
        approvedAmount: body.approvedAmount,
        rateApr: body.rateApr,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvalNotes: body.notes || ''
      }
      
      // Simulate webhook for lien approval
      console.log('🔔 Webhook: Lien approved', { 
        lienId: approvedLien.id, 
        funderId: approvedLien.funderId,
        approvedAmount: approvedLien.approvedAmount
      })
      
      return createSuccessResponse(approvedLien, {
        message: 'Lien approved successfully',
        nextSteps: ['Process funding disbursement', 'Update case status', 'Monitor repayment schedule']
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // GET /api/exposure - Get comprehensive exposure data for funders
  http.get('/api/exposure', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const funderId = url.searchParams.get('funderId')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    
    // Calculate comprehensive exposure data
    let relevantLiens = lienData
    
    if (funderId) {
      relevantLiens = relevantLiens.filter(lien => lien.funderId === funderId)
    }
    
    if (fromDate) {
      const from = new Date(fromDate)
      if (!isNaN(from.getTime())) {
        relevantLiens = relevantLiens.filter(lien => new Date(lien.createdAt) >= from)
      }
    }
    
    if (toDate) {
      const to = new Date(toDate)
      if (!isNaN(to.getTime())) {
        relevantLiens = relevantLiens.filter(lien => new Date(lien.createdAt) <= to)
      }
    }
    
    const totalExposure = relevantLiens.reduce((sum, lien) => sum + lien.amount, 0)
    const activeExposure = relevantLiens
      .filter(lien => lien.status === 'active')
      .reduce((sum, lien) => sum + lien.balance, 0)
    const approvedExposure = relevantLiens
      .filter(lien => lien.status === 'approved')
      .reduce((sum, lien) => sum + (lien.approvedAmount || lien.amount), 0)
    
    // Calculate monthly trends
    const monthlyData = []
    const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06']
    
    months.forEach(month => {
      const monthLiens = relevantLiens.filter(lien => 
        lien.createdAt?.startsWith(month.substring(0, 7))
      )
      monthlyData.push({
        month,
        amount: monthLiens.reduce((sum, lien) => sum + lien.amount, 0),
        count: monthLiens.length
      })
    })
    
    const exposureData = {
      total: totalExposure,
      active: activeExposure,
      approved: approvedExposure,
      settled: totalExposure - activeExposure - approvedExposure,
      byStatus: {
        pending: relevantLiens.filter(lien => lien.status === 'pending').length,
        active: relevantLiens.filter(lien => lien.status === 'active').length,
        approved: relevantLiens.filter(lien => lien.status === 'approved').length,
        settled: relevantLiens.filter(lien => lien.status === 'settled').length,
        closed: relevantLiens.filter(lien => lien.status === 'closed').length
      },
      byAmount: {
        low: relevantLiens.filter(lien => lien.amount < 10000).length,
        medium: relevantLiens.filter(lien => lien.amount >= 10000 && lien.amount < 50000).length,
        high: relevantLiens.filter(lien => lien.amount >= 50000).length
      },
      byMonth: monthlyData,
      riskMetrics: {
        averageAmount: relevantLiens.length > 0 ? totalExposure / relevantLiens.length : 0,
        maxExposure: Math.max(...relevantLiens.map(lien => lien.amount), 0),
        minExposure: Math.min(...relevantLiens.map(lien => lien.amount), 0),
        totalCases: relevantLiens.length
      }
    }
    
    return createSuccessResponse(exposureData, {
      funderId,
      dateRange: { fromDate, toDate },
      calculatedAt: new Date().toISOString()
    })
  }),

  // GET /api/cases/:id/packet - Get comprehensive case packet for attorneys
  http.get('/api/cases/:id/packet', async ({ params }) => {
    await simulateLatency()
    
    const caseId = params.id
    
    // Find comprehensive related data for the case
    const liens = lienData.filter(lien => lien.caseNumber === caseId)
    
    if (liens.length === 0) {
      return createErrorResponse(404, 'Case not found', { caseId })
    }
    
    // Get all related appointments from liens
    const appointmentIds = liens.map(lien => lien.appointmentId).filter(Boolean)
    const appointments = appointmentData.filter(apt => appointmentIds.includes(apt.id))
    
    // Get all related reports from appointments
    const reportIds = appointments.map(apt => apt.id).filter(Boolean)
    const reports = reportData.filter(report => reportIds.includes(report.appointmentId))
    
    // Get all related bills from appointments
    const billIds = appointments.map(apt => apt.id).filter(Boolean)
    const bills = billData.filter(bill => billIds.includes(bill.id))
    
    // Get patient and attorney information
    const patientId = liens[0]?.patientId
    const attorneyId = liens[0]?.attorneyId
    const patient = patientData.find(p => p.id === patientId)
    const attorney = attorneyData.find(a => a.id === attorneyId)
    
    // Get center information
    const centerIds = appointments.map(apt => apt.centerId).filter(Boolean)
    const centers = centerData.filter(c => centerIds.includes(c.id))
    
    // Calculate comprehensive case summary
    const totalExposure = liens.reduce((sum, lien) => sum + lien.amount, 0)
    const totalBilled = bills.reduce((sum, bill) => sum + bill.total, 0)
    const totalSettled = liens
      .filter(lien => lien.status === 'settled')
      .reduce((sum, lien) => sum + (lien.settledAmount || 0), 0)
    
    const casePacket = {
      caseId,
      caseNumber: liens[0]?.caseNumber,
      patient: patient ? {
        id: patient.id,
        name: patient.name,
        dateOfBirth: patient.dateOfBirth,
        mrn: patient.mrn,
        insurance: patient.insurance
      } : null,
      attorney: attorney ? {
        id: attorney.id,
        name: attorney.name,
        firm: attorney.firm,
        specialty: attorney.specialty
      } : null,
      liens: liens.map(lien => ({
        id: lien.id,
        amount: lien.amount,
        balance: lien.balance,
        status: lien.status,
        accidentDate: lien.accidentDate,
        accidentType: lien.accidentType,
        injuryDescription: lien.injuryDescription,
        settlementStatus: lien.settlementStatus
      })),
      appointments: appointments.map(apt => ({
        id: apt.id,
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        modality: apt.modality,
        bodyPart: apt.bodyPart,
        centerId: apt.centerId
      })),
      reports: reports.map(report => ({
        id: report.id,
        status: report.status,
        impression: report.impression,
        findings: report.findings,
        recommendations: report.recommendations,
        reportDate: report.reportDate,
        radiologistId: report.radiologistId
      })),
      bills: bills.map(bill => ({
        id: bill.id,
        total: bill.total,
        status: bill.status,
        billingDate: bill.billingDate,
        dueDate: bill.dueDate
      })),
      centers: centers.map(center => ({
        id: center.id,
        name: center.name,
        city: center.city,
        state: center.state
      })),
      summary: {
        totalExposure,
        totalBilled,
        totalSettled,
        outstandingBalance: totalExposure - totalSettled,
        caseStatus: liens[0]?.status || 'unknown',
        totalAppointments: appointments.length,
        totalReports: reports.length,
        totalBills: bills.length,
        caseDuration: liens.length > 0 ? 
          Math.floor((new Date() - new Date(liens[0].accidentDate)) / (1000 * 60 * 60 * 24)) : 0
      },
      documents: {
        reports: reports.length,
        bills: bills.length,
        images: reports.reduce((sum, report) => sum + (report.attachments?.length || 0), 0),
        totalDocuments: reports.length + bills.length
      },
      timeline: {
        accidentDate: liens[0]?.accidentDate,
        firstAppointment: appointments.length > 0 ? 
          appointments.reduce((earliest, apt) => 
            new Date(apt.startTime) < new Date(earliest.startTime) ? apt : earliest
          ).startTime : null,
        lastAppointment: appointments.length > 0 ? 
          appointments.reduce((latest, apt) => 
            new Date(apt.startTime) > new Date(latest.startTime) ? apt : latest
          ).startTime : null,
        firstReport: reports.length > 0 ? 
          reports.reduce((earliest, report) => 
            new Date(report.reportDate) < new Date(earliest.reportDate) ? report : earliest
          ).reportDate : null
      },
      generatedAt: new Date().toISOString(),
      exportFormats: ['PDF', 'JSON', 'CSV']
    }
    
    return createSuccessResponse(casePacket, {
      caseType: 'Personal Injury',
      documentCount: casePacket.documents.totalDocuments,
      exportReady: true
    })
  }),

  // POST /api/approvals - Submit case for funding approval
  http.post('/api/approvals', async ({ request }) => {
    await simulateLatency()
    
    try {
      const body = await request.json()
      
      // Validate required fields
      const requiredFields = ['caseId', 'attorneyId', 'requestedAmount', 'caseSummary']
      const missingFields = requiredFields.filter(field => !body[field])
      
      if (missingFields.length > 0) {
        return createErrorResponse(400, 'Missing required fields', { missingFields })
      }
      
      // Validate case exists
      const liens = lienData.filter(lien => lien.caseNumber === body.caseId)
      if (liens.length === 0) {
        return createErrorResponse(404, 'Case not found', { caseId: body.caseId })
      }
      
      // Create approval request
      const approvalRequest = {
        id: `approval-${Date.now()}`,
        caseId: body.caseId,
        attorneyId: body.attorneyId,
        requestedAmount: body.requestedAmount,
        caseSummary: body.caseSummary,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: body.priority || 'medium',
        expectedROI: body.expectedROI || '15-25%',
        riskFactors: body.riskFactors || [],
        documents: body.documents || []
      }
      
      // Simulate webhook for approval request
      console.log('🔔 Webhook: Approval request submitted', { 
        approvalId: approvalRequest.id, 
        caseId: approvalRequest.caseId,
        requestedAmount: approvalRequest.requestedAmount
      })
      
      return createSuccessResponse(approvalRequest, {
        message: 'Approval request submitted successfully',
        nextSteps: ['Review by underwriting team', 'Risk assessment', 'Funding decision'],
        estimatedResponseTime: '3-5 business days'
      })
      
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', { error: error.message })
    }
  }),

  // GET /api/approvals - List approval requests with filtering
  http.get('/api/approvals', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const { 
      page = 1, 
      limit = 20, 
      status, 
      attorneyId,
      priority,
      fromDate,
      toDate
    } = Object.fromEntries(url.searchParams)
    
    // Validate pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return createErrorResponse(400, 'Invalid pagination parameters', {
        page: pageNum,
        limit: limitNum,
        maxLimit: 100
      })
    }
    
    // Simulate approval requests (in real app, this would come from database)
    const mockApprovals = [
      {
        id: 'approval-001',
        caseId: 'CASE-2024-001',
        attorneyId: 'attorney-001',
        requestedAmount: 25000,
        caseSummary: 'Cervical spine injury from motor vehicle accident',
        status: 'pending',
        submittedAt: '2024-08-20T10:00:00Z',
        priority: 'high',
        expectedROI: '20-30%'
      },
      {
        id: 'approval-002',
        caseId: 'CASE-2024-002',
        attorneyId: 'attorney-002',
        requestedAmount: 15000,
        caseSummary: 'Lower back injury from slip and fall',
        status: 'approved',
        submittedAt: '2024-08-18T14:00:00Z',
        priority: 'medium',
        expectedROI: '15-25%'
      }
    ]
    
    let filteredApprovals = mockApprovals
    
    if (status) {
      filteredApprovals = filteredApprovals.filter(approval => approval.status === status)
    }
    
    if (attorneyId) {
      filteredApprovals = filteredApprovals.filter(approval => approval.attorneyId === attorneyId)
    }
    
    if (priority) {
      filteredApprovals = filteredApprovals.filter(approval => approval.priority === priority)
    }
    
    if (fromDate) {
      const from = new Date(fromDate)
      if (!isNaN(from.getTime())) {
        filteredApprovals = filteredApprovals.filter(approval => new Date(approval.submittedAt) >= from)
      }
    }
    
    if (toDate) {
      const to = new Date(toDate)
      if (!isNaN(to.getTime())) {
        filteredApprovals = filteredApprovals.filter(approval => new Date(approval.submittedAt) <= to)
      }
    }
    
    return createPaginatedResponse(
      filteredApprovals,
      pageNum,
      limitNum,
      'submittedAt',
      'desc',
      {
        appliedFilters: { status, attorneyId, priority, fromDate, toDate },
        totalApprovals: filteredApprovals.length,
        byStatus: {
          pending: filteredApprovals.filter(a => a.status === 'pending').length,
          approved: filteredApprovals.filter(a => a.status === 'approved').length,
          rejected: filteredApprovals.filter(a => a.status === 'rejected').length
        },
        byPriority: {
          high: filteredApprovals.filter(a => a.priority === 'high').length,
          medium: filteredApprovals.filter(a => a.priority === 'medium').length,
          low: filteredApprovals.filter(a => a.priority === 'low').length
        },
        totalRequested: filteredApprovals.reduce((sum, a) => sum + a.requestedAmount, 0)
      }
    )
  })
]

// System and admin endpoints
export const systemHandlers = [
  // POST /api/webhooks/test - Test webhook delivery (simulate center callback)
  http.post('/api/webhooks/test', async ({ request }) => {
    await simulateLatency()
    
    try {
      const payload = await request.json()
      
      // Log webhook test (in real app, this would be sent to webhook endpoints)
      console.log('🔔 Webhook test payload:', payload)
      
      // Simulate different webhook event types
      const eventType = payload.eventType || 'center_callback'
      const eventId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      return createSuccessResponse({
        success: true,
        message: 'Webhook test received and processed',
        eventId,
        eventType,
        payload,
        deliveredAt: new Date().toISOString(),
        metadata: {
          endpoint: '/api/webhooks/test',
          processingTime: '2ms',
          status: 'delivered'
        }
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid JSON payload', {
        error: error.message,
        expectedFormat: {
          eventType: 'string (optional)',
          data: 'object (required)'
        }
      })
    }
  }),

  // GET /api/audit/:entityId - Get audit logs for entity (unified timeline events)
  http.get('/api/audit/:entityId', async ({ params, request }) => {
    await simulateLatency()
    
    const { entityId } = params
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    // Simulate comprehensive audit logs with different entity types
    const auditLogs = [
      {
        id: `audit-${Date.now()}-1`,
        entityId,
        entityType: 'referral',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        user: 'john.doe',
        userRole: 'referrer',
        action: 'view',
        details: 'Viewed referral details and timeline',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        sessionId: 'sess-001'
      },
      {
        id: `audit-${Date.now()}-2`,
        entityId,
        entityType: 'appointment',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: 'jane.smith',
        userRole: 'center_staff',
        action: 'update',
        details: 'Updated appointment status to confirmed',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sessionId: 'sess-002',
        changes: {
          before: { status: 'pending' },
          after: { status: 'confirmed' }
        }
      },
      {
        id: `audit-${Date.now()}-3`,
        entityId,
        entityType: 'report',
        timestamp: new Date().toISOString(),
        user: 'admin',
        userRole: 'admin',
        action: 'reassign',
        details: 'Reassigned report to different radiologist',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        sessionId: 'sess-003',
        changes: {
          before: { radiologistId: 'radio-001' },
          after: { radiologistId: 'radio-002' }
        }
      },
      {
        id: `audit-${Date.now()}-4`,
        entityId,
        entityType: 'lien',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        user: 'attorney.jones',
        userRole: 'attorney',
        action: 'create',
        details: 'Created new lien for case',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sessionId: 'sess-004'
      },
      {
        id: `audit-${Date.now()}-5`,
        entityId,
        entityType: 'center',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        user: 'center.manager',
        userRole: 'center_staff',
        action: 'upload',
        details: 'Uploaded new report document',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        sessionId: 'sess-005',
        metadata: {
          fileSize: '2.4MB',
          fileType: 'application/pdf',
          documentType: 'scan_report'
        }
      }
    ]
    
    // Filter by action if specified
    let filteredLogs = auditLogs
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action)
    }
    
    // Filter by date range if specified
    if (fromDate || toDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        if (fromDate && logDate < new Date(fromDate)) return false
        if (toDate && logDate > new Date(toDate)) return false
        return true
      })
    }
    
    // Apply limit
    filteredLogs = filteredLogs.slice(0, limit)
    
    return createSuccessResponse({
      entityId,
      auditLogs: filteredLogs,
      metadata: {
        total: filteredLogs.length,
        filtered: action || fromDate || toDate,
        limit,
        entityTypes: [...new Set(filteredLogs.map(log => log.entityType))],
        actions: [...new Set(filteredLogs.map(log => log.action))],
        timeRange: {
          from: filteredLogs.length > 0 ? filteredLogs[filteredLogs.length - 1].timestamp : null,
          to: filteredLogs.length > 0 ? filteredLogs[0].timestamp : null
        }
      }
    })
  }),

  // GET /api/system/health - System health check
  http.get('/api/system/health', async () => {
    await simulateLatency()
    
    // Simulate realistic system health data
    const uptime = Math.floor(Math.random() * 86400) + 3600 // 1-24 hours
    const memoryUsage = Math.floor(Math.random() * 20) + 60 // 60-80%
    const cpuUsage = Math.floor(Math.random() * 30) + 40 // 40-70%
    const diskUsage = Math.floor(Math.random() * 15) + 65 // 65-80%
    
    return createSuccessResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.2.0',
      environment: 'development',
      uptime: {
        seconds: uptime,
        formatted: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`
      },
      services: {
        database: {
          status: 'healthy',
          responseTime: `${Math.floor(Math.random() * 50) + 10}ms`,
          connections: Math.floor(Math.random() * 20) + 5
        },
        cache: {
          status: 'healthy',
          hitRate: `${Math.floor(Math.random() * 20) + 70}%`,
          memoryUsage: `${Math.floor(Math.random() * 10) + 20}MB`
        },
        external: {
          status: 'healthy',
          lastCheck: new Date(Date.now() - Math.random() * 300000).toISOString()
        }
      },
      system: {
        memory: {
          used: memoryUsage,
          available: 100 - memoryUsage,
          unit: '%'
        },
        cpu: {
          current: cpuUsage,
          unit: '%'
        },
        disk: {
          used: diskUsage,
          available: 100 - diskUsage,
          unit: '%'
        }
      }
    })
  }),

  // GET /api/system/status - System status overview
  http.get('/api/system/status', async () => {
    await simulateLatency()
    
    return createSuccessResponse({
      system: 'MRIGuys Platform',
      version: '2.2.0',
      status: 'operational',
      lastUpdated: new Date().toISOString(),
      components: {
        api: { status: 'operational', uptime: '99.9%' },
        database: { status: 'operational', uptime: '99.8%' },
        cache: { status: 'operational', uptime: '99.9%' },
        webhooks: { status: 'operational', uptime: '99.7%' },
        fileStorage: { status: 'operational', uptime: '99.9%' }
      },
      incidents: [],
      maintenance: {
        scheduled: false,
        nextWindow: null
      }
    })
  }),

  // POST /api/admin/reset - Reset data for demos
  http.post('/api/admin/reset', async ({ request }) => {
    await simulateLatency()
    
    try {
      const body = await request.json()
      const resetType = body?.type || 'all'
      const confirmReset = body?.confirm || false
      
      if (!confirmReset) {
        return createErrorResponse(400, 'Reset confirmation required', {
          error: 'Must set confirm: true to proceed with data reset',
          resetType,
          warning: 'This action will reset all mock data to initial state'
        })
      }
      
      // Simulate reset process
      const resetItems = {
        all: ['referrals', 'appointments', 'reports', 'bills', 'liens', 'settlements'],
        referrals: ['referrals', 'appointments'],
        reports: ['reports', 'bills'],
        financial: ['bills', 'liens', 'settlements']
      }
      
      const itemsToReset = resetItems[resetType] || resetItems.all
      
      // Simulate webhook for reset event
      console.log('🔄 Admin reset initiated:', { resetType, items: itemsToReset })
      
      return createSuccessResponse({
        message: 'Data reset successful',
        resetType,
        itemsReset: itemsToReset,
        resetAt: new Date().toISOString(),
        note: 'This is a mock endpoint. In production, this would reset all data.',
        metadata: {
          resetDuration: '150ms',
          recordsAffected: Math.floor(Math.random() * 1000) + 500,
          backupCreated: true
        }
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', {
        error: error.message,
        expectedFormat: {
          type: 'string (optional: all, referrals, reports, financial)',
          confirm: 'boolean (required: true)'
        }
      })
    }
  }),

  // GET /api/admin/stats - Admin dashboard statistics
  http.get('/api/admin/stats', async () => {
    await simulateLatency()
    
    return createSuccessResponse({
      system: {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 500) + 200,
        totalCenters: centerData.length,
        totalProviders: providerData.length
      },
      data: {
        totalReferrals: referralData.length,
        totalAppointments: appointmentData.length,
        totalReports: reportData.length,
        totalBills: billData.length,
        totalLiens: lienData.length
      },
      performance: {
        avgResponseTime: `${Math.floor(Math.random() * 100) + 50}ms`,
        uptime: '99.9%',
        errorRate: '0.1%',
        lastBackup: new Date(Date.now() - Math.random() * 86400000).toISOString()
      },
      security: {
        failedLogins: Math.floor(Math.random() * 10),
        suspiciousActivity: Math.floor(Math.random() * 5),
        lastSecurityScan: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }
    })
  }),

  // POST /api/admin/backup - Create system backup
  http.post('/api/admin/backup', async ({ request }) => {
    await simulateLatency()
    
    try {
      const body = await request.json()
      const backupType = body?.type || 'full'
      const includeFiles = body?.includeFiles || false
      
      // Simulate backup process
      const backupId = `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      console.log('💾 Admin backup initiated:', { backupType, includeFiles, backupId })
      
      return createSuccessResponse({
        message: 'Backup created successfully',
        backupId,
        backupType,
        includeFiles,
        createdAt: new Date().toISOString(),
        metadata: {
          size: `${Math.floor(Math.random() * 100) + 50}MB`,
          duration: '45s',
          compression: 'gzip',
          encryption: 'AES-256'
        }
      })
    } catch (error) {
      return createErrorResponse(400, 'Invalid request body', {
        error: error.message,
        expectedFormat: {
          type: 'string (optional: full, incremental, data-only)',
          includeFiles: 'boolean (optional)'
        }
      })
    }
  }),

  // GET /api/admin/logs - System logs
  http.get('/api/admin/logs', async ({ request }) => {
    await simulateLatency()
    
    const url = new URL(request.url)
    const level = url.searchParams.get('level') || 'info'
    const fromDate = url.searchParams.get('fromDate')
    const toDate = url.searchParams.get('toDate')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    
    // Simulate system logs
    const logLevels = ['error', 'warn', 'info', 'debug']
    const logSources = ['api', 'database', 'cache', 'webhook', 'auth', 'system']
    
    const logs = Array.from({ length: Math.min(limit, 100) }, (_, i) => ({
      id: `log-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      level: logLevels[Math.floor(Math.random() * logLevels.length)],
      source: logSources[Math.floor(Math.random() * logSources.length)],
      message: `Sample log message ${i + 1} from ${logSources[Math.floor(Math.random() * logSources.length)]}`,
      details: {
        userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 100)}` : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        traceId: `trace-${Math.random().toString(36).substr(2, 9)}`
      }
    }))
    
    // Filter by level if specified
    let filteredLogs = logs
    if (level && level !== 'all') {
      filteredLogs = logs.filter(log => log.level === level)
    }
    
    // Filter by date range if specified
    if (fromDate || toDate) {
      filteredLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.timestamp)
        if (fromDate && logDate < new Date(fromDate)) return false
        if (toDate && logDate > new Date(toDate)) return false
        return true
      })
    }
    
    return createSuccessResponse({
      logs: filteredLogs,
      metadata: {
        total: filteredLogs.length,
        level,
        filtered: level !== 'all' || fromDate || toDate,
        limit,
        levels: logLevels,
        sources: logSources,
        timeRange: {
          from: filteredLogs.length > 0 ? filteredLogs[filteredLogs.length - 1].timestamp : null,
          to: filteredLogs.length > 0 ? filteredLogs[0].timestamp : null
        }
      }
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
