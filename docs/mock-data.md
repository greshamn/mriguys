# MRIGuys Platform - Mock Data & MSW Documentation

**Version:** v2.2  
**Last Updated:** August 25, 2024  
**Purpose:** Complete reference guide for mock data structure and MSW (Mock Service Worker) implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Mock Data Architecture](#mock-data-architecture)
3. [Entity Documentation](#entity-documentation)
4. [MSW Implementation](#msw-implementation)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Development Workflow](#development-workflow)
8. [Testing & Validation](#testing--validation)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The MRIGuys Platform uses comprehensive mock data and MSW (Mock Service Worker) to simulate a complete backend API during development and prototyping. This setup provides:

- **17 Core Entities** with realistic sample data
- **Full API Surface** covering all business requirements
- **Simulated Network Latency** (300-700ms) for realistic UX
- **Comprehensive Error Handling** with proper HTTP status codes
- **Data Relationships** maintained across all entities
- **Testing Interface** at `/msw-test` for validation

### Key Benefits

- **Frontend Development** without backend dependencies
- **Realistic User Experience** with proper loading states
- **Comprehensive Testing** of all application flows
- **Data Consistency** across development and testing
- **Easy Reset** for demo and testing purposes

---

## Mock Data Architecture

### Directory Structure

```
src/mocks/
├── fixtures/           # JSON seed data files
│   ├── centers.json
│   ├── slots.json
│   ├── patients.json
│   ├── referrals.json
│   ├── appointments.json
│   ├── reports.json
│   ├── bills.json
│   ├── claims.json
│   ├── liens.json
│   ├── settlements.json
│   ├── insurers.json
│   ├── bodyParts.json
│   ├── safetyQuestions.json
│   ├── providers.json
│   ├── technologists.json
│   ├── radiologists.json
│   └── attorneys.json
├── browser.ts          # MSW browser integration
├── handlers.ts         # API endpoint handlers
└── index.ts           # MSW initialization
```

### Data Model Relationships

```
Patient → Referral → Appointment → Report
  ↓           ↓           ↓         ↓
Insurance   Provider    Center   Radiologist
  ↓           ↓           ↓         ↓
Claims     Attorney    Slots    Technologist
  ↓           ↓           ↓         ↓
Liens    Settlements  Bills    Safety Qs
```

---

## Entity Documentation

### 1. Centers (`centers.json`)
**Purpose:** Imaging center facilities with capabilities and features

**Key Fields:**
- `id`: Unique identifier (e.g., "center-001")
- `name`: Center name and branding
- `address`: Full address with geo coordinates
- `modalities`: Available imaging types (MRI, CT, X-Ray, etc.)
- `magnetStrength`: MRI magnet strength (1.5T, 3T, etc.)
- `specialties`: Body part specializations
- `accreditations`: Medical certifications
- `hours`: Operating hours and availability
- `features`: Amenities (parking, ADA, languages, etc.)

**Sample Record Count:** 8 centers
**Relationships:** Referenced by slots, appointments, reports

### 2. Slots (`slots.json`)
**Purpose:** Available appointment time slots

**Key Fields:**
- `id`: Unique identifier (e.g., "slot-001")
- `centerId`: Reference to center
- `modality`: Imaging type
- `bodyPart`: Target body area
- `startTime`/`endTime`: ISO timestamp
- `status`: Available, booked, completed
- `price`: Cost information
- `technologistId`: Assigned staff

**Sample Record Count:** 20 slots
**Relationships:** Links centers, appointments, technologists

### 3. Patients (`patients.json`)
**Purpose:** Patient demographic and medical information

**Key Fields:**
- `id`: Unique identifier (e.g., "patient-001")
- `name`: Full patient name
- `dob`: Date of birth
- `insurance`: Insurance details and coverage
- `pipFlag`: Personal Injury Protection flag
- `medicalHistory`: Previous conditions
- `allergies`: Known allergies
- `preferredLanguage`: Communication preference

**Sample Record Count:** 10 patients
**Relationships:** Referenced by referrals, appointments, claims

### 4. Referrals (`referrals.json`)
**Purpose:** Medical referral requests from providers

**Key Fields:**
- `id`: Unique identifier (e.g., "ref-001")
- `patientId`: Reference to patient
- `referrerId`: Referring provider
- `modality`: Requested imaging type
- `bodyPart`: Target body area
- `clinicalNotes`: Medical context
- `safetyAnswers`: Patient safety screening responses
- `status`: Pending, approved, completed

**Sample Record Count:** 10 referrals
**Relationships:** Links patients, providers, appointments

### 5. Appointments (`appointments.json`)
**Purpose:** Scheduled imaging appointments

**Key Fields:**
- `id`: Unique identifier (e.g., "apt-001")
- `referralId`: Reference to referral
- `centerId`: Imaging center
- `slotId`: Time slot
- `status`: Confirmed, in-progress, completed
- `checkInTime`: Patient arrival time
- `notes`: Special instructions

**Sample Record Count:** 12 appointments
**Relationships:** Links referrals, centers, slots, reports

### 6. Reports (`reports.json`)
**Purpose:** Radiological imaging reports

**Key Fields:**
- `id`: Unique identifier (e.g., "report-001")
- `appointmentId`: Reference to appointment
- `radiologistId`: Interpreting physician
- `status`: Draft, final, amended
- `findings`: Clinical observations
- `impressions`: Radiologist interpretation
- `recommendations`: Follow-up suggestions
- `reportPdfUrl`: Document location

**Sample Record Count:** 10 reports
**Relationships:** Links appointments, radiologists

### 7. Bills (`bills.json`)
**Purpose:** Patient billing and insurance claims

**Key Fields:**
- `id`: Unique identifier (e.g., "bill-001")
- `appointmentId`: Reference to appointment
- `total`: Total amount
- `insuranceAmount`: Insurance coverage
- `patientResponsibility`: Patient's portion
- `status`: Pending, paid, overdue
- `billingDate`: Date billed
- `dueDate`: Payment due date

**Sample Record Count:** 10 bills
**Relationships:** Links appointments, claims, liens

### 8. Claims (`claims.json`)
**Purpose:** Insurance claim processing

**Key Fields:**
- `id`: Unique identifier (e.g., "claim-001")
- `patientId`: Reference to patient
- `insurerId`: Insurance company
- `billId`: Reference to bill
- `status`: Submitted, processing, approved, denied
- `allowedAmount`: Insurance approved amount
- `paidAmount`: Amount paid by insurance
- `deniedAmount`: Denied amount

**Sample Record Count:** 10 claims
**Relationships:** Links patients, insurers, bills

### 9. Liens (`liens.json`)
**Purpose:** Medical lien documentation for PI cases

**Key Fields:**
- `id`: Unique identifier (e.g., "lien-001")
- `patientId`: Reference to patient
- `attorneyId`: Legal representative
- `caseNumber`: Legal case identifier
- `accidentDate`: Date of incident
- `accidentType`: Type of accident
- `injuryDescription`: Medical injury details
- `amount`: Lien amount
- `balance`: Outstanding balance
- `settlementStatus`: Case settlement status

**Sample Record Count:** 5 liens
**Relationships:** Links patients, attorneys, settlements

### 10. Settlements (`settlements.json`)
**Purpose:** Case settlement and payment information

**Key Fields:**
- `id`: Unique identifier (e.g., "settlement-001")
- `lienId`: Reference to lien
- `status`: Pending, settled, closed
- `totalSettlement`: Total settlement amount
- `medicalExpenses`: Medical cost portion
- `painAndSuffering`: Pain and suffering award
- `attorneyFees`: Legal fees
- `patientRecovery`: Patient's net recovery

**Sample Record Count:** 5 settlements
**Relationships:** Links liens, attorneys

### 11. Insurers (`insurers.json`)
**Purpose:** Insurance company information

**Key Fields:**
- `id`: Unique identifier (e.g., "insurer-001")
- `name`: Insurance company name
- `planTypes`: Available plan types
- `coverageTypes`: Types of coverage offered
- `networkTypes`: Network participation
- `priorAuthPhone`: Prior authorization contact
- `acceptedCenters`: Participating imaging centers

**Sample Record Count:** 8 insurers
**Relationships:** Referenced by claims, patients

### 12. Body Parts (`bodyParts.json`)
**Purpose:** Available body areas for imaging

**Key Fields:**
- `id`: Unique identifier (e.g., "bp-001")
- `name`: Body part name
- `category`: Anatomical category
- `modalities`: Compatible imaging types
- `description`: Detailed description
- `commonIndications`: Common reasons for imaging
- `prepInstructions`: Patient preparation requirements

**Sample Record Count:** 15 body parts
**Relationships:** Referenced by referrals, appointments, safety questions

### 13. Safety Questions (`safetyQuestions.json`)
**Purpose:** Patient safety screening questions

**Key Fields:**
- `id`: Unique identifier (e.g., "sq-001")
- `question`: Safety question text
- `type`: Question type (yes/no, multiple choice)
- `required`: Whether question is mandatory
- `modality`: Applicable imaging type
- `bodyPart`: Applicable body area
- `contraindication`: Safety risk if answered positively
- `followUpQuestions`: Additional questions if needed

**Sample Record Count:** 15 safety questions
**Relationships:** Referenced by referrals, body parts

### 14. Providers (`providers.json`)
**Purpose:** Healthcare provider information

**Key Fields:**
- `id`: Unique identifier (e.g., "provider-001")
- `name`: Provider name
- `specialty`: Medical specialty
- `subspecialty`: Subspecialty areas
- `license`: Medical license number
- `contact`: Phone, email, address
- `practiceAreas`: Areas of practice
- `acceptingPatients`: Whether accepting new patients

**Sample Record Count:** 5 providers
**Relationships:** Referenced by referrals

### 15. Technologists (`technologists.json`)
**Purpose:** Imaging technologist staff

**Key Fields:**
- `id`: Unique identifier (e.g., "tech-001")
- `name`: Technologist name
- `specialty`: Imaging specialty
- `certifications`: Professional certifications
- `experience`: Years of experience
- `availability`: Work schedule
- `centerId`: Assigned imaging center

**Sample Record Count:** 5 technologists
**Relationships:** Links centers, slots

### 16. Radiologists (`radiologists.json`)
**Purpose:** Radiologist physicians

**Key Fields:**
- `id`: Unique identifier (e.g., "rad-001")
- `name`: Radiologist name
- `specialty`: Radiological specialty
- `subspecialty`: Subspecialty areas
- `experience`: Years of experience
- `availability`: Work schedule
- `centerId`: Assigned imaging center

**Sample Record Count:** 5 radiologists
**Relationships:** Links centers, reports

### 17. Attorneys (`attorneys.json`)
**Purpose:** Legal representative information

**Key Fields:**
- `id`: Unique identifier (e.g., "attorney-001")
- `name`: Attorney name
- `firm`: Law firm name
- `specialty`: Legal specialty
- `practiceAreas`: Areas of practice
- `experience`: Years of experience
- `contingencyFee`: Fee structure
- `acceptingCases`: Whether accepting new cases

**Sample Record Count:** 5 attorneys
**Relationships:** Referenced by liens, settlements

---

## MSW Implementation

### Architecture Overview

MSW (Mock Service Worker) intercepts network requests at the browser level, allowing us to simulate a complete backend API without server infrastructure.

### Core Files

#### `src/mocks/browser.ts`
```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
export default worker
```

#### `src/mocks/index.ts`
```typescript
import { worker } from './browser'

export const startMSW = async () => {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' }
    })
  }
}
```

#### `src/mocks/handlers.ts`
Comprehensive API endpoint handlers with:
- Simulated network latency (300-700ms)
- Standardized response patterns
- Error handling with proper HTTP status codes
- Query parameter filtering and pagination
- Data validation and business logic

### Integration Points

#### Application Bootstrap (`src/index.jsx`)
```typescript
import { startMSW } from './mocks';

if (process.env.NODE_ENV === 'development') {
  startMSW();
}
```

#### Service Worker (`public/mockServiceWorker.js`)
Generated automatically using `npx msw init public/ --save`

---

## API Endpoints

### Public Endpoints (No Authentication)

#### `GET /api/centers`
**Purpose:** List imaging centers with filtering

**Query Parameters:**
- `city`: Filter by city name
- `zip`: Filter by ZIP code
- `modality`: Filter by imaging modality
- `bodyPart`: Filter by body part specialty

**Response:**
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-08-25T..."
}
```

**Example:**
```bash
GET /api/centers?modality=MRI&city=Miami
```

#### `GET /api/centers/:id`
**Purpose:** Get specific center details

**Response:** Single center object with full details

#### `GET /api/centers/:id/availability`
**Purpose:** Get center availability and slots

**Query Parameters:**
- `from`: Start date
- `to`: End date
- `modality`: Filter by modality

#### `GET /api/body-parts`
**Purpose:** Get available body parts for imaging

**Response:** Array of body part objects

#### `GET /api/safety-questions`
**Purpose:** Get safety screening questions

**Query Parameters:**
- `modality`: Filter by imaging type
- `bodyPart`: Filter by body area

### Referral and Booking Endpoints

#### `POST /api/referrals`
**Purpose:** Create new referral

**Request Body:**
```json
{
  "patientId": "patient-001",
  "modality": "MRI",
  "bodyPart": "Head",
  "clinicalNotes": "Patient reports headaches..."
}
```

**Response:** Created referral with generated ID

#### `GET /api/referrals`
**Purpose:** List referrals with filtering

**Query Parameters:**
- `status`: Filter by status
- `patientId`: Filter by patient
- `referrerId`: Filter by referring provider

#### `POST /api/slots/hold`
**Purpose:** Temporarily hold a time slot

**Request Body:**
```json
{
  "slotId": "slot-001",
  "referralId": "ref-001",
  "duration": 15
}
```

#### `POST /api/appointments`
**Purpose:** Create appointment from held slot

**Request Body:**
```json
{
  "referralId": "ref-001",
  "slotId": "slot-001"
}
```

### Reports and Images Endpoints

#### `GET /api/reports/:id`
**Purpose:** Get specific report

**Response:** Report object with findings and impressions

#### `GET /api/reports`
**Purpose:** List reports with filtering

**Query Parameters:**
- `status`: Filter by status
- `centerId`: Filter by center
- `patientId`: Filter by patient

#### `GET /api/images/:id/download`
**Purpose:** Get image download URL

**Response:** Download information with expiring link

### Attorney and Funder Endpoints

#### `GET /api/liens`
**Purpose:** Get liens with filtering

**Query Parameters:**
- `caseId`: Filter by case number
- `attorneyId`: Filter by attorney
- `status`: Filter by status

#### `GET /api/exposure`
**Purpose:** Get exposure data for funders

**Query Parameters:**
- `funderId`: Filter by funder

**Response:** Exposure calculations and trends

#### `GET /api/cases/:id/packet`
**Purpose:** Get case packet for attorneys

**Response:** Compiled case information with all related documents

### System and Admin Endpoints

#### `POST /api/webhooks/test`
**Purpose:** Test webhook delivery

**Request Body:** Any JSON payload for testing

#### `GET /api/audit/:entityId`
**Purpose:** Get audit logs for entity

**Response:** Array of audit log entries

#### `GET /api/system/health`
**Purpose:** System health check

**Response:** Health status and service information

#### `POST /api/admin/reset`
**Purpose:** Reset data for demos

**Response:** Reset confirmation

---

## Usage Examples

### Testing MSW Endpoints

#### Using the Test Page
1. Navigate to `/msw-test` in development
2. Use "Test All Endpoints" to verify all handlers
3. Use individual test buttons for specific endpoints
4. View results with latency measurements

#### Manual Testing
```javascript
// Test centers endpoint
fetch('/api/centers?modality=MRI')
  .then(response => response.json())
  .then(data => console.log(data));

// Test referral creation
fetch('/api/referrals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: 'patient-001',
    modality: 'MRI',
    bodyPart: 'Head'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Data Relationships

#### Finding Related Data
```javascript
// Get patient's appointments
const patientId = 'patient-001';
const appointments = await fetch(`/api/appointments?patientId=${patientId}`);

// Get center's available slots
const centerId = 'center-001';
const slots = await fetch(`/api/centers/${centerId}/availability`);

// Get case packet for attorney
const caseId = 'CASE-2024-001';
const packet = await fetch(`/api/cases/${caseId}/packet`);
```

### Filtering and Pagination

#### Advanced Filtering
```javascript
// Complex center search
const params = new URLSearchParams({
  modality: 'MRI',
  city: 'Miami',
  bodyPart: 'Head'
});
const centers = await fetch(`/api/centers?${params}`);

// Status-based filtering
const pendingReferrals = await fetch('/api/referrals?status=pending');
const completedReports = await fetch('/api/reports?status=final');
```

---

## Development Workflow

### Adding New Entities

1. **Create JSON file** in `src/mocks/fixtures/`
2. **Define data structure** with realistic sample data
3. **Update handlers.ts** to import and use new data
4. **Add API endpoints** for the new entity
5. **Update documentation** in this file

### Adding New Endpoints

1. **Define handler** in appropriate section of `handlers.ts`
2. **Add simulated latency** using `simulateLatency()`
3. **Implement filtering** and validation logic
4. **Add to test page** for validation
5. **Update API documentation** in this file

### Modifying Existing Data

1. **Update JSON files** with new fields or data
2. **Ensure referential integrity** across related entities
3. **Test endpoints** to verify changes
4. **Update documentation** to reflect changes

---

## Testing & Validation

### Automated Testing

#### MSW Test Page (`/msw-test`)
- **Comprehensive Testing**: All endpoints with one click
- **Individual Testing**: Test specific endpoints
- **Latency Measurement**: Verify realistic response times
- **Error Handling**: Test various error scenarios
- **Data Validation**: Ensure proper response formats

#### Manual Testing
```bash
# Test public endpoints
curl http://localhost:3000/api/centers
curl http://localhost:3000/api/body-parts

# Test with query parameters
curl "http://localhost:3000/api/centers?modality=MRI&city=Miami"

# Test POST endpoints
curl -X POST http://localhost:3000/api/referrals \
  -H "Content-Type: application/json" \
  -d '{"patientId":"patient-001","modality":"MRI","bodyPart":"Head"}'
```

### Validation Checklist

- [ ] All endpoints return proper HTTP status codes
- [ ] Response formats match API specifications
- [ ] Simulated latency is within 300-700ms range
- [ ] Error handling works for invalid requests
- [ ] Data relationships are maintained
- [ ] Query parameters filter correctly
- [ ] Pagination works for large datasets

---

## Troubleshooting

### Common Issues

#### MSW Not Starting
**Symptoms:** No console messages, API calls go to real endpoints

**Solutions:**
1. Check `process.env.NODE_ENV` is 'development'
2. Verify `mockServiceWorker.js` exists in `public/`
3. Check browser console for errors
4. Ensure MSW import in `index.jsx` is correct

#### Endpoints Not Responding
**Symptoms:** 404 errors or no response

**Solutions:**
1. Verify handler is properly exported in `handlers.ts`
2. Check endpoint path matches handler definition
3. Ensure handler is included in `handlers` array
4. Check browser console for MSW errors

#### Data Not Loading
**Symptoms:** Empty responses or missing data

**Solutions:**
1. Verify JSON files are properly imported
2. Check data structure matches handler expectations
3. Ensure file paths are correct
4. Validate JSON syntax in fixture files

#### Performance Issues
**Symptoms:** Very slow responses or timeouts

**Solutions:**
1. Check `simulateLatency()` function
2. Verify delay values are reasonable
3. Check for infinite loops in handlers
4. Monitor browser performance tools

### Debug Mode

Enable detailed MSW logging:
```typescript
// In src/mocks/index.ts
await worker.start({
  onUnhandledRequest: 'warn', // Show unhandled requests
  serviceWorker: { url: '/mockServiceWorker.js' }
});
```

### Reset and Recovery

#### Reset All Data
```bash
# Use admin reset endpoint
curl -X POST http://localhost:3000/api/admin/reset
```

#### Restart MSW
```javascript
// In browser console
import { worker } from './mocks';
worker.stop();
worker.start();
```

---

## Best Practices

### Data Management

1. **Maintain Referential Integrity**: Ensure all entity relationships are valid
2. **Use Realistic Data**: Sample data should represent real-world scenarios
3. **Consistent IDs**: Use predictable ID patterns for easy debugging
4. **Regular Updates**: Keep sample data current with business requirements

### API Design

1. **RESTful Patterns**: Follow REST conventions for endpoint design
2. **Consistent Responses**: Use standardized response formats
3. **Proper Error Handling**: Return appropriate HTTP status codes
4. **Query Parameter Support**: Enable filtering and pagination

### Performance

1. **Realistic Latency**: Simulate network conditions users will experience
2. **Efficient Filtering**: Optimize data filtering for large datasets
3. **Caching Strategy**: Consider response caching for static data
4. **Batch Operations**: Support bulk operations where appropriate

---

## Future Enhancements

### Planned Improvements

1. **Dynamic Data Generation**: Generate realistic data on-the-fly
2. **State Persistence**: Save changes to localStorage for session persistence
3. **Advanced Filtering**: Add full-text search and complex queries
4. **Webhook Simulation**: Real-time event simulation for testing
5. **Performance Metrics**: Track and report API performance

### Integration Opportunities

1. **Storybook Integration**: Use mock data in component stories
2. **E2E Testing**: Integrate with Playwright for automated testing
3. **API Documentation**: Generate OpenAPI specs from handlers
4. **Data Visualization**: Create dashboards for mock data insights

---

## Conclusion

This mock data and MSW implementation provides a robust foundation for frontend development without backend dependencies. The comprehensive coverage of business entities, realistic data relationships, and full API surface enables developers to build and test complete user flows.

For questions or issues, refer to the troubleshooting section or check the browser console for detailed error messages. The `/msw-test` page provides an interactive way to validate all endpoints and data relationships.

---

**Document Version:** 1.0  
**Last Updated:** August 25, 2024  
**Maintained By:** Development Team  
**Next Review:** September 25, 2024
