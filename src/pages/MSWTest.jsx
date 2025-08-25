import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const MSWTest = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testResults, setTestResults] = useState({})

  const testEndpoint = async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const startTime = Date.now()
      const response = await fetch(endpoint, options)
      const endTime = Date.now()
      const latency = endTime - startTime
      
      const data = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          status: response.status,
          latency,
          data,
          timestamp: new Date().toISOString()
        }
      }))
      
      return { success: response.ok, data, latency }
    } catch (err) {
      setError(`Error testing ${endpoint}: ${err.message}`)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const testAllEndpoints = async () => {
    setLoading(true)
    setError(null)
    
    const endpoints = [
      '/api/centers',
      '/api/centers?modality=MRI&city=Miami',
      '/api/centers?page=1&limit=5&sortBy=name&sortOrder=asc',
      '/api/centers?rating=4&search=advanced',
      '/api/centers/center-001',
      '/api/centers/center-001/availability',
      '/api/centers/center-001/availability?modality=MRI&from=2024-08-25&to=2024-08-30',
      '/api/centers/center-001/availability?page=1&limit=10&sortBy=startTime&sortOrder=asc',
      '/api/body-parts',
      '/api/body-parts?category=Head&modality=MRI',
      '/api/body-parts?search=brain&page=1&limit=5',
      '/api/safety-questions',
      '/api/safety-questions?modality=MRI&bodyPart=Head',
      '/api/safety-questions?type=yes/no&required=true&page=1&limit=10',
      
      // Referral and booking endpoints
      '/api/referrals',
      '/api/referrals?status=pending&page=1&limit=5',
      '/api/referrals?modality=MRI&bodyPart=Head',
      '/api/referrals/ref-001',
      '/api/appointments',
      '/api/appointments?status=confirmed&page=1&limit=5',
      '/api/appointments?centerId=center-001&from=2024-08-25&to=2024-08-30',
      
      // Attorney and funder endpoints
      '/api/liens',
      '/api/liens?status=active&attorneyId=attorney-001',
      '/api/liens?caseId=CASE-2024-001',
      '/api/liens?page=1&limit=5&sortBy=amount&sortOrder=desc',
      '/api/exposure',
      '/api/exposure?funderId=funder-001',
      '/api/exposure?fromDate=2024-01-01&toDate=2024-06-30',
      '/api/cases/CASE-2024-001/packet',
      '/api/approvals',
      '/api/approvals?status=pending&attorneyId=attorney-001',
      '/api/approvals?page=1&limit=5&priority=high',
      
      // System and admin endpoints
      '/api/system/health',
      '/api/system/status',
      '/api/admin/stats',
      '/api/admin/logs',
      '/api/admin/logs?level=error&limit=10',
      '/api/audit/referral-001',
      '/api/audit/referral-001?action=view&limit=20',
      '/api/audit/appointment-001?fromDate=2024-08-01&toDate=2024-08-25'
    ]
    
    for (const endpoint of endpoints) {
      await testEndpoint(endpoint)
      // Small delay between requests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testAdvancedFiltering = async () => {
    setLoading(true)
    setError(null)
    
    const advancedTests = [
      // Advanced center filtering
      '/api/centers?priceRange={"min":100,"max":500}&rating=4&search=advanced',
      '/api/centers?modality=MRI&bodyPart=Head&city=Miami&zip=33101&page=1&limit=3&sortBy=rating&sortOrder=desc',
      
      // Advanced availability filtering
      '/api/centers/center-001/availability?modality=MRI&bodyPart=Head&status=available&priceRange={"max":300}&from=2024-08-25&to=2024-08-30&page=1&limit=5&sortBy=price&sortOrder=asc',
      
      // Advanced body parts filtering
      '/api/body-parts?category=Spine&modality=MRI&search=herniation&page=1&limit=3&sortBy=name&sortOrder=asc',
      
      // Advanced safety questions filtering
      '/api/safety-questions?modality=MRI&bodyPart=Head&type=yes/no&required=true&search=metal&page=1&limit=5&sortBy=question&sortOrder=asc',
      
      // Advanced referral filtering
      '/api/referrals?status=pending&modality=MRI&bodyPart=Head&page=1&limit=3&sortBy=createdAt&sortOrder=desc',
      
      // Advanced appointment filtering
      '/api/appointments?status=confirmed&modality=MRI&centerId=center-001&from=2024-08-25&to=2024-08-30&page=1&limit=5&sortBy=startTime&sortOrder=asc',
      
      // Reports and images endpoints
      '/api/reports',
      '/api/reports?status=finalized&page=1&limit=5',
      '/api/reports?modality=MRI&bodyPart=bp-002',
      '/api/reports?fromDate=2024-01-01&toDate=2024-01-31',
      '/api/reports?search=headache&page=1&limit=3',
      '/api/reports/report-001',
      '/api/images',
      '/api/images?format=MRI&type=bp-002&page=1&limit=5',
      '/api/images?search=scan&fromDate=2024-01-01',
      '/api/images/images-001/download',
      
      // Advanced attorney and funder filtering
      '/api/liens?status=active&attorneyId=attorney-001&minAmount=10000&maxAmount=50000&fromDate=2024-01-01&toDate=2024-06-30&page=1&limit=5&sortBy=amount&sortOrder=desc',
      '/api/liens?caseId=CASE-2024-001&search=cervical&page=1&limit=3',
      '/api/exposure?funderId=funder-001&fromDate=2024-01-01&toDate=2024-06-30',
      '/api/approvals?status=pending&attorneyId=attorney-001&priority=high&fromDate=2024-08-01&toDate=2024-08-25&page=1&limit=5&sortBy=submittedAt&sortOrder=desc'
    ]
    
    for (const endpoint of advancedTests) {
      await testEndpoint(endpoint)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testErrorScenarios = async () => {
    setLoading(true)
    setError(null)
    
    const errorTests = [
      // Invalid center ID format
      '/api/centers/invalid-id',
      '/api/centers/invalid-id/availability',
      
      // Invalid query parameters
      '/api/centers?page=0&limit=200',
      '/api/centers?sortOrder=invalid',
      '/api/centers/center-001/availability?from=invalid-date&to=invalid-date',
      '/api/centers/center-001/availability?priceRange=invalid-json',
      
      // Non-existent resources
      '/api/centers/center-999',
      '/api/centers/center-999/availability',
      
      // Referral and appointment error scenarios
      '/api/referrals/ref-999',
      '/api/referrals?page=0&limit=200',
      '/api/appointments/apt-999',
      
      // Attorney and funder error scenarios
      '/api/liens/lien-999',
      '/api/liens?page=0&limit=200',
      '/api/liens?status=invalid-status',
      '/api/cases/CASE-999/packet',
      '/api/exposure?fromDate=invalid-date',
      '/api/approvals?page=0&limit=200',
      '/api/appointments?page=0&limit=200'
    ]
    
    for (const endpoint of errorTests) {
      await testEndpoint(endpoint)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testPaginationAndSorting = async () => {
    setLoading(true)
    setError(null)
    
    const paginationTests = [
      // Centers pagination
      '/api/centers?page=1&limit=3',
      '/api/centers?page=2&limit=3',
      '/api/centers?page=1&limit=3&sortBy=name&sortOrder=desc',
      
      // Availability pagination
      '/api/centers/center-001/availability?page=1&limit=5',
      '/api/centers/center-001/availability?page=1&limit=5&sortBy=startTime&sortOrder=desc',
      
      // Body parts pagination
      '/api/body-parts?page=1&limit=5',
      '/api/body-parts?page=1&limit=5&sortBy=category&sortOrder=asc',
      
      // Safety questions pagination
      '/api/safety-questions?page=1&limit=5',
      '/api/safety-questions?page=1&limit=5&sortBy=type&sortOrder=desc',
      
      // Referrals pagination
      '/api/referrals?page=1&limit=3',
      '/api/referrals?page=1&limit=3&sortBy=createdAt&sortOrder=desc',
      
      // Appointments pagination
      '/api/appointments?page=1&limit=3',
      '/api/appointments?page=1&limit=3&sortBy=startTime&sortOrder=asc'
    ]
    
    for (const endpoint of paginationTests) {
      await testEndpoint(endpoint)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testReferralAndBookingFlow = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test 1: Create a new referral
      console.log('🧪 Testing Referral Creation...')
      const referralResponse = await testEndpoint('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'patient-001',
          modality: 'MRI',
          bodyPart: 'Head',
          referrerId: 'provider-001',
          clinicalNotes: 'Patient reports persistent headaches for the past week'
        })
      })
      
      if (referralResponse.success) {
        const referralId = referralResponse.data.id
        console.log('✅ Referral created:', referralId)
        
        // Test 2: Hold a slot
        console.log('🧪 Testing Slot Holding...')
        const slotHoldResponse = await testEndpoint('/api/slots/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slotId: 'slot-001',
            referralId: referralId,
            duration: 20
          })
        })
        
        if (slotHoldResponse.success) {
          console.log('✅ Slot held successfully')
          
          // Test 3: Create appointment
          console.log('🧪 Testing Appointment Creation...')
          const appointmentResponse = await testEndpoint('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referralId: referralId,
              slotId: 'slot-001'
            })
          })
          
          if (appointmentResponse.success) {
            console.log('✅ Appointment created successfully')
            
            // Test 4: Verify the complete flow
            console.log('🧪 Verifying Complete Flow...')
            await testEndpoint(`/api/referrals/${referralId}`)
            await testEndpoint('/api/appointments?referralId=' + referralId)
            
            console.log('🎉 Complete referral → booking → appointment flow tested successfully!')
          } else {
            console.error('❌ Appointment creation failed:', appointmentResponse.error)
          }
        } else {
          console.error('❌ Slot holding failed:', slotHoldResponse.error)
        }
      } else {
        console.error('❌ Referral creation failed:', referralResponse.error)
      }
    } catch (error) {
      console.error('❌ Flow testing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testValidationErrors = async () => {
    setLoading(true)
    setError(null)
    
    const validationTests = [
      // Test referral creation with missing fields
      {
        endpoint: '/api/referrals',
        method: 'POST',
        body: { patientId: 'patient-001' }, // Missing required fields
        description: 'Referral creation with missing fields'
      },
      {
        endpoint: '/api/referrals',
        method: 'POST',
        body: { 
          patientId: 'invalid-patient',
          modality: 'MRI',
          bodyPart: 'Head',
          referrerId: 'provider-001'
        }, // Invalid patient ID
        description: 'Referral creation with invalid patient ID'
      },
      {
        endpoint: '/api/slots/hold',
        method: 'POST',
        body: { slotId: 'slot-001' }, // Missing referralId
        description: 'Slot holding with missing referralId'
      },
      {
        endpoint: '/api/slots/hold',
        method: 'POST',
        body: { 
          slotId: 'invalid-slot',
          referralId: 'ref-001'
        }, // Invalid slot ID
        description: 'Slot holding with invalid slot ID'
      },
      {
        endpoint: '/api/appointments',
        method: 'POST',
        body: { referralId: 'ref-001' }, // Missing slotId
        description: 'Appointment creation with missing slotId'
      },
      
      // Test report creation with missing fields
      {
        endpoint: '/api/reports',
        method: 'POST',
        body: { patientId: 'patient-001' }, // Missing required fields
        description: 'Report creation with missing fields'
      },
      {
        endpoint: '/api/reports',
        method: 'POST',
        body: { 
          appointmentId: 'invalid-appointment',
          patientId: 'patient-001',
          centerId: 'center-001',
          radiologistId: 'radiologist-001',
          modality: 'MRI',
          bodyPart: 'bp-002'
        }, // Invalid appointment ID
        description: 'Report creation with invalid appointment ID'
      }
    ]
    
    for (const test of validationTests) {
      console.log(`🧪 Testing: ${test.description}`)
      await testEndpoint(test.endpoint, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      })
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testReportsAndImagesFlow = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test 1: Create a new report
      console.log('🧪 Testing Report Creation...')
      const reportResponse = await testEndpoint('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: 'apt-001',
          patientId: 'patient-001',
          centerId: 'center-001',
          radiologistId: 'radiologist-001',
          modality: 'MRI',
          bodyPart: 'bp-002',
          impression: 'Preliminary findings suggest disc herniation',
          findings: 'Study shows cervical spine with potential disc herniation at C6-C7 level'
        })
      })
      
      if (reportResponse.success) {
        const reportId = reportResponse.data.data.id
        console.log('✅ Report created:', reportId)
        
        // Test 2: Update the report
        console.log('🧪 Testing Report Update...')
        const updateResponse = await testEndpoint(`/api/reports/${reportId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'finalized',
            recommendations: 'Conservative management recommended',
            clinicalCorrelation: 'Correlate with patient symptoms'
          })
        })
        
        if (updateResponse.success) {
          console.log('✅ Report updated successfully')
        }
        
        // Test 3: Get the updated report
        console.log('🧪 Testing Report Retrieval...')
        await testEndpoint(`/api/reports/${reportId}`)
        
        // Test 4: Test image download
        console.log('🧪 Testing Image Download...')
        await testEndpoint('/api/images/images-001/download')
        
        // Test 5: Test image listing
        console.log('🧪 Testing Image Listing...')
        await testEndpoint('/api/images?format=MRI&page=1&limit=5')
        
      }
      
    } catch (error) {
      console.error('❌ Error in reports and images flow:', error)
    } finally {
      setLoading(false)
    }
  }

  const testReportsAndImagesErrors = async () => {
    setLoading(true)
    setError(null)
    
    const errorTests = [
      // Non-existent report ID
      '/api/reports/report-999',
      
      // Invalid report status
      '/api/reports?status=invalid-status',
      
      // Invalid modality filter
      '/api/reports?modality=INVALID',
      
      // Invalid date formats
      '/api/reports?fromDate=invalid-date',
      '/api/reports?toDate=invalid-date',
      
      // Invalid pagination
      '/api/reports?page=0&limit=200',
      '/api/reports?page=1&limit=0',
      
      // Non-existent image ID
      '/api/images/images-999/download',
      
      // Invalid image filters
      '/api/images?format=INVALID',
      '/api/images?page=0&limit=200'
    ]
    
    for (const endpoint of errorTests) {
      await testEndpoint(endpoint)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const testAttorneyAndFunderFlow = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🧪 Testing Complete Attorney & Funder Workflow...')
      
      // Test 1: Create a new lien
      console.log('🧪 Testing Lien Creation...')
      const lienResponse = await testEndpoint('/api/liens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: 'patient-001',
          attorneyId: 'attorney-001',
          accidentDate: '2024-06-15',
          accidentType: 'Motor Vehicle Accident',
          injuryDescription: 'Cervical spine injury with radiating pain',
          amount: 25000,
          caseNumber: 'CASE-2024-003'
        })
      })
      
      if (lienResponse.success) {
        const lienId = lienResponse.data.id
        console.log('✅ Lien created:', lienId)
        
        // Test 2: Update lien status
        console.log('🧪 Testing Lien Status Update...')
        const updateResponse = await testEndpoint(`/api/liens/${lienId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'active',
            notes: 'Case investigation completed'
          })
        })
        
        if (updateResponse.success) {
          console.log('✅ Lien status updated successfully')
          
          // Test 3: Approve lien for funding
          console.log('🧪 Testing Lien Approval...')
          const approvalResponse = await testEndpoint(`/api/liens/${lienId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              funderId: 'funder-001',
              approvedAmount: 25000,
              rateApr: 18.5,
              notes: 'Approved based on strong case merit'
            })
          })
          
          if (approvalResponse.success) {
            console.log('✅ Lien approved successfully')
            
            // Test 4: Submit case for funding approval
            console.log('🧪 Testing Funding Approval Request...')
            const fundingResponse = await testEndpoint('/api/approvals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                caseId: 'CASE-2024-003',
                attorneyId: 'attorney-001',
                requestedAmount: 25000,
                caseSummary: 'Cervical spine injury from motor vehicle accident',
                priority: 'high',
                expectedROI: '20-30%'
              })
            })
            
            if (fundingResponse.success) {
              console.log('✅ Funding approval request submitted')
              
              // Test 5: Verify the complete flow
              console.log('🧪 Verifying Complete Flow...')
              await testEndpoint(`/api/liens?caseId=CASE-2024-003`)
              await testEndpoint('/api/exposure?funderId=funder-001')
              await testEndpoint('/api/cases/CASE-2024-003/packet')
              await testEndpoint('/api/approvals?attorneyId=attorney-001')
              
              console.log('🎉 Complete attorney → lien → funding → approval flow tested successfully!')
            } else {
              console.error('❌ Funding approval request failed:', fundingResponse.error)
            }
          } else {
            console.error('❌ Lien approval failed:', approvalResponse.error)
          }
        } else {
          console.error('❌ Lien status update failed:', updateResponse.error)
        }
      } else {
        console.error('❌ Lien creation failed:', lienResponse.error)
      }
    } catch (error) {
      console.error('❌ Flow testing error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testAttorneyAndFunderErrors = async () => {
    setLoading(true)
    setError(null)
    
    const errorTests = [
      // Test lien creation with missing fields
      {
        endpoint: '/api/liens',
        method: 'POST',
        body: { patientId: 'patient-001' }, // Missing required fields
        description: 'Lien creation with missing fields'
      },
      // Test lien creation with invalid patient ID
      {
        endpoint: '/api/liens',
        method: 'POST',
        body: { 
          patientId: 'invalid-patient',
          attorneyId: 'attorney-001',
          accidentDate: '2024-06-15',
          accidentType: 'Motor Vehicle Accident',
          injuryDescription: 'Cervical spine injury',
          amount: 25000
        },
        description: 'Lien creation with invalid patient ID'
      },
      // Test lien approval with wrong status
      {
        endpoint: '/api/liens/lien-001/approve',
        method: 'POST',
        body: { 
          funderId: 'funder-001',
          approvedAmount: 25000,
          rateApr: 18.5
        },
        description: 'Lien approval with wrong status'
      },
      // Test case packet with non-existent case
      {
        endpoint: '/api/cases/CASE-999/packet',
        description: 'Case packet for non-existent case'
      },
      // Test exposure with invalid date format
      {
        endpoint: '/api/exposure?fromDate=invalid-date',
        description: 'Exposure with invalid date format'
      },
      // Test approvals with invalid pagination
      {
        endpoint: '/api/approvals?page=0&limit=200',
        description: 'Approvals with invalid pagination'
      }
    ]
    
    for (const test of errorTests) {
      if (test.method === 'POST') {
        await testEndpoint(test.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(test.body)
        })
      } else {
        await testEndpoint(test.endpoint)
      }
    }
    
    setLoading(false)
  }

  const testSystemAndAdminEndpoints = async () => {
    setLoading(true)
    setError(null)
    
    const systemTests = [
      // System health and status
      '/api/system/health',
      '/api/system/status',
      
      // Admin statistics and logs
      '/api/admin/stats',
      '/api/admin/logs',
      '/api/admin/logs?level=error&limit=5',
      '/api/admin/logs?level=warn&fromDate=2024-08-01&toDate=2024-08-25',
      
      // Audit logs with different parameters
      '/api/audit/referral-001',
      '/api/audit/referral-001?action=view&limit=10',
      '/api/audit/appointment-001?fromDate=2024-08-01&toDate=2024-08-25',
      '/api/audit/center-001?action=update&limit=5',
      
      // Webhook test
      {
        endpoint: '/api/webhooks/test',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'center_callback',
            data: { centerId: 'center-001', status: 'available' }
          })
        }
      }
    ]
    
    for (const test of systemTests) {
      if (typeof test === 'string') {
        await testEndpoint(test)
      } else {
        await testEndpoint(test.endpoint, test.options)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setLoading(false)
  }

  const testSystemAndAdminErrors = async () => {
    setLoading(true)
    setError(null)
    
    const errorTests = [
      // Test admin reset without confirmation
      {
        endpoint: '/api/admin/reset',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'all' }) // Missing confirm: true
        }
      },
      // Test admin reset with invalid type
      {
        endpoint: '/api/admin/reset',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'invalid-type', confirm: true })
        }
      },
      // Test webhook with invalid JSON
      {
        endpoint: '/api/webhooks/test',
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json'
        }
      },
      // Test audit with invalid entity ID
      '/api/audit/invalid-entity-id',
      
      // Test admin logs with invalid parameters
      '/api/admin/logs?level=invalid-level',
      '/api/admin/logs?limit=invalid-limit'
    ]
    
    for (const test of errorTests) {
      if (typeof test === 'string') {
        await testEndpoint(test)
      } else {
        await testEndpoint(test.endpoint, test.options)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setLoading(false)
  }

  const clearResults = () => {
    setTestResults({})
    setError(null)
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800'
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800'
    if (status >= 500) return 'bg-red-100 text-red-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatLatency = (latency) => {
    if (latency < 1000) return `${latency}ms`
    return `${(latency / 1000).toFixed(2)}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 MSW API Testing Suite
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive testing interface for all Mock Service Worker endpoints with advanced filtering, 
            sorting, pagination, and error handling validation.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎮 Test Controls
            </CardTitle>
            <CardDescription>
              Run comprehensive tests on all enhanced public API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={testAllEndpoints} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                🚀 Test All Endpoints
              </Button>
              
              <Button 
                onClick={testAdvancedFiltering} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                🔍 Test Advanced Filtering
              </Button>
              
              <Button 
                onClick={testErrorScenarios} 
                disabled={loading}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                ⚠️ Test Error Scenarios
              </Button>
              
              <Button 
                onClick={testPaginationAndSorting} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                📄 Test Pagination & Sorting
              </Button>
              
              <Button 
                onClick={testReferralAndBookingFlow} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                🏥 Test Referral → Booking Flow
              </Button>
              
              <Button 
                onClick={testValidationErrors} 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                ❌ Test Validation Errors
              </Button>
              
              <Button 
                onClick={testReportsAndImagesFlow} 
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                📋 Test Reports & Images Flow
              </Button>
              
              <Button 
                onClick={testReportsAndImagesErrors} 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                🚨 Test Reports & Images Errors
              </Button>

              <Button 
                onClick={testAttorneyAndFunderFlow} 
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                ⚖️ Test Attorney & Funder Flow
              </Button>

              <Button 
                onClick={testAttorneyAndFunderErrors} 
                disabled={loading}
                className="bg-indigo-700 hover:bg-indigo-800 text-white"
              >
                🚨 Test Attorney & Funder Errors
              </Button>

              <Button 
                onClick={testSystemAndAdminEndpoints} 
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                ⚙️ Test System & Admin Endpoints
              </Button>

              <Button 
                onClick={testSystemAndAdminErrors} 
                disabled={loading}
                className="bg-teal-700 hover:bg-teal-800 text-white"
              >
                🚨 Test System & Admin Errors
              </Button>

              <Button 
                asChild
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <a href="/zustand-test">
                  🧠 Test Zustand Store
                </a>
              </Button>
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={clearResults} 
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                🗑️ Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-lg text-gray-600">Running tests...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <span className="text-xl">❌</span>
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Test Results
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(testResults).length} endpoints tested
                </Badge>
              </CardTitle>
              <CardDescription>
                Detailed results from all API endpoint tests including response times, status codes, and data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(testResults).map(([endpoint, result]) => (
                  <div key={endpoint} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-mono text-sm text-gray-800 break-all">
                        {endpoint}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(result.status)}>
                          {result.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatLatency(result.latency)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      Tested at: {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                    
                    {result.data && (
                      <div className="bg-gray-50 rounded p-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                            Response Data
                          </summary>
                          <pre className="text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ✨ Enhanced Features Overview
            </CardTitle>
            <CardDescription>
              New capabilities implemented in Task 3.3 for public API endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">🔍 Advanced Filtering</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Price range filtering</li>
                  <li>• Rating-based filtering</li>
                  <li>• Date range filtering</li>
                  <li>• Full-text search</li>
                  <li>• Status-based filtering</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700">📊 Pagination & Sorting</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Configurable page size (1-100)</li>
                  <li>• Multi-field sorting</li>
                  <li>• Ascending/descending order</li>
                  <li>• Pagination metadata</li>
                  <li>• Total count information</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-purple-700">✅ Enhanced Validation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Query parameter validation</li>
                  <li>• Detailed error messages</li>
                  <li>• Format validation</li>
                  <li>• Range validation</li>
                  <li>• Enum value validation</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-700">📈 Rich Metadata</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Applied filters summary</li>
                  <li>• Filtering statistics</li>
                  <li>• Related data counts</li>
                  <li>• Category information</li>
                  <li>• Safety statistics</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-red-700">🛡️ Error Handling</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HTTP status codes</li>
                  <li>• Detailed error messages</li>
                  <li>• Validation suggestions</li>
                  <li>• Available options</li>
                  <li>• Format examples</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-indigo-700">⚡ Performance</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Simulated latency (300-700ms)</li>
                  <li>• Efficient filtering</li>
                  <li>• Optimized sorting</li>
                  <li>• Response caching ready</li>
                  <li>• Batch processing support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MSWTest
