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
- **Advanced Filtering & Pagination** with enterprise-grade features

### Key Benefits

- **Frontend Development** without backend dependencies
- **Realistic User Experience** with proper loading states
- **Comprehensive Testing** of all application flows
- **Data Consistency** across development and testing
- **Easy Reset** for demo and testing purposes
- **Production-Ready API** with advanced query capabilities
- **Production-Ready API** with advanced query capabilities

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

### 1. Centers (`centers.json`) ⭐ **ENHANCED FOR TASK 16**
**Purpose:** Imaging center facilities with capabilities and features

**Key Fields:**
- `id`: Unique identifier (e.g., "center-001")
- `name`: Center name and branding
- `address`: Full address with geo coordinates
- `geo`: Latitude and longitude for mapping
- `modalities`: Available imaging types (MRI, CT, X-Ray, etc.)
- `bodyParts`: Available body part specializations
- `magnetStrength`: MRI magnet strength (1.5T, 3T, etc.)
- `openUpright`: Whether open/Upright MRI available
- `sedationAvailable`: Whether sedation services available
- `languages`: Supported languages for patient communication
- `ADA`: ADA compliance status
- `parking`: Parking information
- `accreditations`: Medical certifications and accreditations
- `phone`: Contact phone number
- `email`: Contact email address
- `website`: Center website URL
- `hours`: Operating hours and availability
- `rating`: Center rating (1-5 scale)
- `reviewCount`: Number of reviews
- `avgTat`: Average turnaround time in days
- `utilization`: Center utilization percentage
- `noShowRate`: Patient no-show rate percentage
- `satisfactionScore`: Patient satisfaction score percentage
- `specialties`: Medical specialties and focus areas
- `insuranceAccepted`: Accepted insurance providers
- `description`: Detailed center description
- `features`: Amenities and special features
- `adaCompliant`: ADA compliance status (standardized field)

**Enhanced Fields for Public Finder:**
- **Performance Metrics**: avgTat, utilization, noShowRate, satisfactionScore
- **Compliance**: adaCompliant, languages, bodyParts
- **Enhanced Features**: magnetStrength, openUpright, sedationAvailable
- **Rich Metadata**: accreditations, specialties, insuranceAccepted, features

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
- `type`: Question type (yes/no, multiple choice, text)
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
- **Advanced filtering, sorting, and pagination**
- **Enhanced query parameter validation**
- **Rich response metadata**
- **Advanced filtering, sorting, and pagination**
- **Enhanced query parameter validation**
- **Rich response metadata**

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

### Public Endpoints (No Authentication) - **ENHANCED**

#### `GET /api/centers` ⭐ **ENHANCED**
**Purpose:** List imaging centers with advanced filtering, sorting, and pagination

**Query Parameters:**
- `city`: Filter by city name
- `zip`: Filter by ZIP code
- `modality`: Filter by imaging modality
- `bodyPart`: Filter by body part specialty
- `rating`: Filter by minimum rating (0-5)
- `search`: Full-text search across name, description, notes, city, specialty
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (name, rating, city, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Advanced Features:**
- **Price Range Filtering**: `priceRange={"min":100,"max":500}`
- **Rating-Based Filtering**: `rating=4` (minimum rating)
- **Full-Text Search**: `search=advanced` (searches multiple fields)
- **Multi-Field Sorting**: Sort by any entity field
- **Configurable Pagination**: Flexible page sizes with validation

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "sorting": {
    "field": "name",
    "order": "asc"
  },
  "filters": {
    "appliedFilters": {
      "modality": "MRI",
      "city": "Miami",
      "rating": "4"
    },
    "totalBeforeFiltering": 8,
    "totalAfterFiltering": 3
  },
  "timestamp": "2024-08-25T..."
}
```

**Example:**
```bash
# Basic filtering
GET /api/centers?modality=MRI&city=Miami

# Advanced filtering with pagination
GET /api/centers?modality=MRI&rating=4&search=advanced&page=1&limit=5&sortBy=rating&sortOrder=desc

# Price range filtering
GET /api/centers?priceRange={"min":100,"max":500}&rating=4
```

#### `GET /api/centers/:id` ⭐ **ENHANCED**
**Purpose:** Get specific center details with enhanced error handling and related data

**Enhanced Features:**
- **ID Format Validation**: Validates center-XXX format
- **Related Data**: Includes slot counts, staff counts, availability stats
- **Enhanced Error Messages**: Helpful suggestions and available options
- **Rich Metadata**: Center information with operational statistics

**Response:** Single center object with enhanced metadata
```json
{
  "success": true,
  "data": { /* center object */ },
  "metadata": {
    "relatedData": {
      "availableSlots": 15,
      "totalSlots": 20,
      "technologists": 3,
      "radiologists": 2
    },
    "lastUpdated": "2024-08-25T..."
  }
}
```

#### `GET /api/centers/:id/availability` ⭐ **ENHANCED**
**Purpose:** Get center availability with advanced filtering, pagination, and sorting

**Query Parameters:**
- `from`: Start date (ISO 8601 format)
- `to`: End date (ISO 8601 format)
- `modality`: Filter by modality
- `bodyPart`: Filter by body part
- `status`: Filter by slot status (available, booked, completed)
- `priceRange`: Filter by price range (JSON format: `{"min":100,"max":300}`)
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (startTime, price, duration, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Enhanced Features:**
- **Date Validation**: ISO 8601 format validation with helpful error messages
- **Price Range Filtering**: JSON-based price range filtering
- **Status Filtering**: Filter by slot availability status
- **Advanced Sorting**: Sort by time, price, duration, etc.
- **Rich Metadata**: Center info, availability statistics, applied filters

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { /* pagination info */ },
  "sorting": { /* sorting info */ },
  "filters": {
    "centerInfo": {
      "id": "center-001",
      "name": "Advanced Imaging Center",
      "address": { /* address object */ }
    },
    "availability": {
      "totalSlots": 20,
      "availableSlots": 15,
      "bookedSlots": 3,
      "completedSlots": 2
    },
    "appliedFilters": {
      "modality": "MRI",
      "bodyPart": "Head",
      "dateRange": {
        "from": "2024-08-25",
        "to": "2024-08-30"
      },
      "priceRange": {"max": 300}
    }
  }
}
```

#### `GET /api/body-parts` ⭐ **ENHANCED**
**Purpose:** Get available body parts with enhanced filtering, categorization, and pagination

**Query Parameters:**
- `category`: Filter by anatomical category
- `modality`: Filter by compatible imaging modality
- `search`: Full-text search across name, description, indications
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (name, category, description, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Enhanced Features:**
- **Category Filtering**: Filter by anatomical categories
- **Modality Filtering**: Filter by compatible imaging types
- **Full-Text Search**: Search across multiple fields
- **Rich Metadata**: Category and modality information
- **Pagination & Sorting**: Configurable page sizes and sorting

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { /* pagination info */ },
  "sorting": { /* sorting info */ },
  "filters": {
    "categories": ["Head", "Spine", "Chest", "Abdomen", "Extremities"],
    "modalities": ["MRI", "CT", "X-Ray", "Ultrasound"],
    "appliedFilters": {
      "category": "Spine",
      "modality": "MRI",
      "search": "herniation"
    },
    "totalCategories": 5,
    "totalModalities": 4
  }
}
```

#### `GET /api/safety-questions` ⭐ **ENHANCED**
**Purpose:** Get safety questions with advanced filtering, validation, and pagination

**Query Parameters:**
- `modality`: Filter by imaging type
- `bodyPart`: Filter by body area
- `type`: Filter by question type (yes/no, multiple choice, text)
- `required`: Filter by required status (true, false)
- `search`: Full-text search across question text and contraindications
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (question, type, required, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Enhanced Features:**
- **Type Filtering**: Filter by question type
- **Required Field Filtering**: Filter by mandatory questions
- **Enhanced Search**: Search questions and contraindications
- **Safety Statistics**: Question counts and risk information
- **Validation**: Parameter validation with helpful error messages

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { /* pagination info */ },
  "sorting": { /* sorting info */ },
  "filters": {
    "safety": {
      "totalQuestions": 15,
      "requiredQuestions": 8,
      "questionsWithContraindications": 12
    },
    "modalities": ["MRI", "CT", "X-Ray"],
    "bodyParts": ["Head", "Spine", "Chest"],
    "questionTypes": ["yes/no", "multiple choice", "text"],
    "appliedFilters": {
      "modality": "MRI",
      "bodyPart": "Head",
      "type": "yes/no",
      "required": "true",
      "search": "metal"
    }
  }
}
```

### Referral and Booking Endpoints - **ENHANCED**

#### `POST /api/referrals` ⭐ **ENHANCED**
**Purpose:** Create new referral with comprehensive validation and safety screening

**Request Body:**
```json
{
  "patientId": "patient-001",
  "modality": "MRI",
  "bodyPart": "Head",
  "referrerId": "provider-001",
  "clinicalNotes": "Patient reports persistent headaches for the past week"
}
```

**Enhanced Features:**
- **Required Field Validation**: patientId, modality, bodyPart, referrerId
- **Patient Existence Validation**: Verifies patient exists in system
- **Provider Existence Validation**: Verifies referring provider exists
- **Modality Compatibility**: Validates modality/body part compatibility
- **Safety Screening Integration**: Automatically includes relevant safety questions
- **Webhook Simulation**: Triggers referral creation events

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ref-1234567890",
    "patientId": "patient-001",
    "modality": "MRI",
    "bodyPart": "Head",
    "referrerId": "provider-001",
    "clinicalNotes": "Patient reports persistent headaches...",
    "status": "pending",
    "createdAt": "2024-08-25T12:00:00Z",
    "updatedAt": "2024-08-25T12:00:00Z",
    "safetyScreening": {
      "completed": false,
      "required": true,
      "questions": [...]
    }
  },
  "message": "Referral created successfully",
  "nextSteps": [
    "Complete safety screening questions",
    "Select preferred imaging center",
    "Choose appointment slot"
  ],
  "webhookTriggered": true
}
```

#### `GET /api/referrals` ⭐ **ENHANCED**
**Purpose:** List referrals with advanced filtering, pagination, and sorting

**Query Parameters:**
- `status`: Filter by status (pending, approved, completed, cancelled)
- `patientId`: Filter by patient ID
- `referrerId`: Filter by referring provider ID
- `modality`: Filter by imaging modality
- `bodyPart`: Filter by body part
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (createdAt, status, modality, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Enhanced Features:**
- **Advanced Filtering**: Multi-field filtering with exact matches
- **Pagination**: Configurable page sizes with validation
- **Multi-Field Sorting**: Sort by any entity field
- **Rich Metadata**: Statistics by status and modality
- **Filtering Statistics**: Total counts before/after filtering

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "sorting": { "field": "createdAt", "order": "desc" },
  "filters": {
    "appliedFilters": {
      "status": "pending",
      "modality": "MRI"
    },
    "totalBeforeFiltering": 10,
    "totalAfterFiltering": 5,
    "statistics": {
      "byStatus": { "pending": 5, "approved": 3, "completed": 2 },
      "byModality": { "MRI": 5, "CT": 3, "X-Ray": 2 }
    }
  }
}
```

#### `GET /api/referrals/:id` ⭐ **ENHANCED**
**Purpose:** Get specific referral with enhanced data and related information

**Enhanced Features:**
- **Related Data**: Patient, provider, appointments, reports information
- **Timeline Information**: Creation, update, and milestone tracking
- **Enhanced Error Handling**: Helpful suggestions and available options

**Response:**
```json
{
  "success": true,
  "data": { /* referral object */ },
  "relatedData": {
    "patient": { "id": "patient-001", "name": "John Doe", "dob": "1980-01-01" },
    "provider": { "id": "provider-001", "name": "Dr. Smith", "specialty": "Neurology" },
    "appointments": [...],
    "reports": [...]
  },
  "timeline": {
    "created": "2024-08-25T12:00:00Z",
    "lastUpdated": "2024-08-25T12:00:00Z",
    "nextMilestone": "Safety screening"
  }
}
```

#### `POST /api/slots/hold` ⭐ **ENHANCED**
**Purpose:** Temporarily hold a time slot with enhanced validation and expiration management

**Request Body:**
```json
{
  "slotId": "slot-001",
  "referralId": "ref-001",
  "duration": 20
}
```

**Enhanced Features:**
- **Referral Eligibility**: Validates referral status (pending/approved only)
- **Slot Availability**: Checks slot status and availability
- **Duration Validation**: 5-60 minute hold duration with validation
- **Webhook Simulation**: Triggers slot hold events
- **Rich Response**: Includes complete slot information

**Response:**
```json
{
  "success": true,
  "data": {
    "holdId": "hold-1234567890",
    "slotId": "slot-001",
    "referralId": "ref-001",
    "expiresAt": "2024-08-25T12:20:00Z",
    "status": "held",
    "duration": 20,
    "slot": {
      "id": "slot-001",
      "startTime": "2024-08-26T10:00:00Z",
      "endTime": "2024-08-26T11:00:00Z",
      "centerId": "center-001",
      "modality": "MRI",
      "bodyPart": "Head"
    }
  },
  "message": "Slot held successfully",
  "nextSteps": [
    "Complete appointment details",
    "Confirm appointment within hold duration",
    "Slot will be released automatically if not confirmed"
  ],
  "webhookTriggered": true
}
```

#### `POST /api/appointments` ⭐ **ENHANCED**
**Purpose:** Create appointment from held slot with comprehensive validation and business logic

**Request Body:**
```json
{
  "referralId": "ref-001",
  "slotId": "slot-001"
}
```

**Enhanced Features:**
- **Referral Eligibility**: Validates referral can have appointments
- **Slot Availability**: Ensures slot is available for booking
- **Conflict Detection**: Prevents double-booking for same patient
- **Preparation Instructions**: Automatic preparation guidance based on modality
- **Slot Status Updates**: Updates slot status to booked
- **Webhook Simulation**: Triggers appointment creation events

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "apt-1234567890",
    "referralId": "ref-001",
    "slotId": "slot-001",
    "status": "confirmed",
    "createdAt": "2024-08-25T12:00:00Z",
    "updatedAt": "2024-08-25T12:00:00Z",
    "patientId": "patient-001",
    "centerId": "center-001",
    "modality": "MRI",
    "bodyPart": "Head",
    "startTime": "2024-08-26T10:00:00Z",
    "endTime": "2024-08-26T11:00:00Z",
    "preparation": {
      "fasting": true,
      "duration": "4 hours",
      "instructions": "No food or drink 4 hours before appointment. Remove all metal objects."
    }
  },
  "message": "Appointment created successfully",
  "nextSteps": [
    "Patient will receive confirmation email",
    "Center staff notified of new appointment",
    "Referral status updated to confirmed"
  ],
  "webhookTriggered": true,
  "slotUpdated": true
}
```

#### `GET /api/appointments` ⭐ **ENHANCED**
**Purpose:** List appointments with advanced filtering, pagination, and sorting

**Query Parameters:**
- `status`: Filter by status (confirmed, in-progress, completed, cancelled)
- `centerId`: Filter by imaging center
- `patientId`: Filter by patient
- `referralId`: Filter by referral
- `modality`: Filter by imaging modality
- `bodyPart`: Filter by body part
- `from`: Start date (ISO 8601 format)
- `to`: End date (ISO 8601 format)
- `page`: Page number (1-100, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Sort field (startTime, status, modality, etc.)
- `sortOrder`: Sort direction (asc, desc, default: asc)

**Enhanced Features:**
- **Advanced Filtering**: Multi-field filtering with date ranges
- **Date Validation**: ISO 8601 format validation with helpful error messages
- **Pagination & Sorting**: Configurable page sizes and multi-field sorting
- **Rich Metadata**: Statistics by status and modality
- **Filtering Statistics**: Total counts and applied filters summary

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { /* pagination info */ },
  "sorting": { /* sorting info */ },
  "filters": {
    "appliedFilters": {
      "status": "confirmed",
      "modality": "MRI",
      "dateRange": { "from": "2024-08-25", "to": "2024-08-30" }
    },
    "totalBeforeFiltering": 12,
    "totalAfterFiltering": 5,
    "statistics": {
      "byStatus": { "confirmed": 5, "in-progress": 3, "completed": 4 },
      "byModality": { "MRI": 5, "CT": 4, "X-Ray": 3 }
    }
  }
}
```

### Reports and Images Endpoints - **ENHANCED**

#### `GET /api/reports/:id`
**Purpose:** Get specific report with related data and metadata

**Response:** Enhanced report object with related entities and rich metadata
**Features:** 
- Related data (appointment, patient, center, radiologist, body part)
- Rich metadata (report type, body part, status, attachment info)
- Comprehensive error handling with detailed messages

#### `GET /api/reports`
**Purpose:** List reports with advanced filtering, pagination, and sorting

**Query Parameters:**
- **Filtering**: `status`, `centerId`, `patientId`, `radiologistId`, `modality`, `bodyPart`, `fromDate`, `toDate`, `search`
- **Pagination**: `page`, `limit` (1-100)
- **Sorting**: `sortBy`, `sortOrder` (asc/desc)

**Advanced Features**:
- Full-text search across impression, findings, recommendations, clinical correlation
- Date range filtering with ISO 8601 validation
- Status-based filtering with validation
- Modality and body part filtering
- Rich metadata with statistics by status and modality

#### `POST /api/reports`
**Purpose:** Create a new report

**Required Fields**: `appointmentId`, `patientId`, `centerId`, `radiologistId`, `modality`, `bodyPart`
**Validation**: 
- Appointment must exist and be completed
- Required fields validation
- Business rule enforcement
**Features**: Webhook simulation, next steps guidance

#### `PUT /api/reports/:id`
**Purpose:** Update an existing report

**Validation**: Cannot modify finalized reports, status transition rules
**Features**: Business rule enforcement, webhook simulation, change tracking

#### `GET /api/images/:id/download`
**Purpose:** Get image download URL with enhanced metadata and secure tokens

**Response:** Enhanced download information with comprehensive metadata
**Features**:
- Secure token-based expiring links (24 hours)
- Image-specific metadata (size, format, type, resolution)
- Access tracking and compression information
- Download type and authentication requirements

#### `GET /api/images`
**Purpose:** List available images with filtering and pagination

**Query Parameters**: `page`, `limit`, `format`, `type`, `search`, `fromDate`, `toDate`
**Features**:
- Filtering by modality, body part, date ranges
- Full-text search across image metadata
- Pagination and sorting
- Rich metadata with statistics by modality and body part

### Attorney and Funder Endpoints - **ENHANCED**

#### `GET /api/liens` ⭐ **ENHANCED**
**Purpose:** Get liens with advanced filtering, pagination, and sorting

**Query Parameters:**
- **Filtering**: `caseId`, `attorneyId`, `funderId`, `status`, `fromDate`, `toDate`, `minAmount`, `maxAmount`, `search`
- **Pagination**: `page`, `limit` (1-100)
- **Sorting**: `sortBy`, `sortOrder` (asc/desc)

**Advanced Features:**
- **Status Validation**: Validates lien status with allowed values
- **Date Range Filtering**: Filter by accident date ranges
- **Amount Range Filtering**: Filter by lien amount ranges
- **Full-Text Search**: Search across case number, accident description, injury description
- **Rich Metadata**: Statistics by status, amount categories, total exposure
- **Comprehensive Filtering**: Multi-field filtering with exact matches

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": { /* pagination info */ },
  "sorting": { /* sorting info */ },
  "filters": {
    "appliedFilters": { /* applied filters */ },
    "totalLiens": 5,
    "byStatus": { "pending": 2, "active": 2, "approved": 1 },
    "byAmount": { "low": 1, "medium": 2, "high": 2 },
    "totalExposure": 125000,
    "averageAmount": 25000
  }
}
```

#### `POST /api/liens` ⭐ **NEW**
**Purpose:** Create new lien with comprehensive validation

**Required Fields**: `patientId`, `attorneyId`, `accidentDate`, `accidentType`, `injuryDescription`, `amount`
**Validation**: 
- Patient and attorney existence validation
- Required fields validation
- Business rule enforcement
**Features**: Webhook simulation, next steps guidance

#### `PUT /api/liens/:id` ⭐ **NEW**
**Purpose:** Update existing lien with status transition validation

**Validation**: Status transition rules, business rule enforcement
**Features**: Change tracking, webhook simulation, status validation

#### `POST /api/liens/:id/approve` ⭐ **NEW**
**Purpose:** Approve lien for funding with comprehensive validation

**Required Fields**: `funderId`, `approvedAmount`, `rateApr`
**Validation**: 
- Lien must be in 'active' status
- Required approval fields validation
**Features**: Webhook simulation, next steps guidance

#### `GET /api/exposure` ⭐ **ENHANCED**
**Purpose:** Get comprehensive exposure data for funders with advanced analytics

**Query Parameters**: `funderId`, `fromDate`, `toDate`
**Enhanced Features**:
- **Funder-Specific Filtering**: Filter by specific funder
- **Date Range Filtering**: Filter by creation date ranges
- **Comprehensive Analytics**: Status breakdowns, amount categories, monthly trends
- **Risk Metrics**: Average amounts, min/max exposure, total cases
- **Rich Metadata**: Date ranges, calculation timestamps

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250000,
    "active": 850000,
    "approved": 250000,
    "settled": 150000,
    "byStatus": { /* status breakdowns */ },
    "byAmount": { /* amount categories */ },
    "byMonth": [ /* monthly trends */ ],
    "riskMetrics": {
      "averageAmount": 62500,
      "maxExposure": 150000,
      "minExposure": 5000,
      "totalCases": 20
    }
  },
  "metadata": {
    "funderId": "funder-001",
    "dateRange": { "fromDate": "2024-01-01", "toDate": "2024-06-30" },
    "calculatedAt": "2024-08-25T..."
  }
}
```

#### `GET /api/cases/:id/packet` ⭐ **ENHANCED**
**Purpose:** Get comprehensive case packet for attorneys with all related documents

**Enhanced Features**:
- **Complete Case Information**: Patient, attorney, liens, appointments, reports, bills, centers
- **Document Summary**: Counts and types of available documents
- **Timeline Information**: Accident date, first/last appointments, first report
- **Export Ready**: Multiple export formats (PDF, JSON, CSV)
- **Rich Metadata**: Case type, document count, export readiness

**Response:**
```json
{
  "success": true,
  "data": {
    "caseId": "CASE-2024-001",
    "caseNumber": "CASE-2024-001",
    "patient": { /* patient info */ },
    "attorney": { /* attorney info */ },
    "liens": [...],
    "appointments": [...],
    "reports": [...],
    "bills": [...],
    "centers": [...],
    "summary": {
      "totalExposure": 25000,
      "totalBilled": 15000,
      "totalSettled": 0,
      "outstandingBalance": 25000,
      "caseStatus": "active",
      "totalAppointments": 3,
      "totalReports": 2,
      "totalBills": 2,
      "caseDuration": 45
    },
    "documents": {
      "reports": 2,
      "bills": 2,
      "images": 5,
      "totalDocuments": 9
    },
    "timeline": { /* timeline info */ },
    "generatedAt": "2024-08-25T...",
    "exportFormats": ["PDF", "JSON", "CSV"]
  },
  "metadata": {
    "caseType": "Personal Injury",
    "documentCount": 9,
    "exportReady": true
  }
}
```

#### `POST /api/approvals` ⭐ **NEW**
**Purpose:** Submit case for funding approval with comprehensive validation

**Required Fields**: `caseId`, `attorneyId`, `requestedAmount`, `caseSummary`
**Validation**: 
- Case existence validation
- Required fields validation
**Features**: Webhook simulation, next steps guidance, estimated response time

#### `GET /api/approvals` ⭐ **NEW**
**Purpose:** List approval requests with advanced filtering and pagination

**Query Parameters**: `page`, `limit`, `status`, `attorneyId`, `priority`, `fromDate`, `toDate`
**Features**:
- **Advanced Filtering**: Status, attorney, priority, date ranges
- **Pagination & Sorting**: Configurable page sizes with validation
- **Rich Metadata**: Statistics by status and priority, total requested amounts

### System and Admin Endpoints - **ENHANCED**

#### `POST /api/webhooks/test`
**Purpose:** Test webhook delivery and simulate center callbacks
**Features:** Event type specification, payload validation, delivery confirmation
**Request Body:** `{ eventType?: string, data: object }`
**Response:** Event ID, processing time, delivery status, and metadata

#### `GET /api/audit/:entityId`
**Purpose:** Get comprehensive audit logs for entity (unified timeline events)
**Query Parameters:** `action`, `fromDate`, `toDate`, `limit`
**Features:** Entity type identification, user role tracking, change tracking, IP logging
**Response:** Filtered audit logs with metadata and filtering summary

#### `GET /api/system/health`
**Purpose:** Comprehensive system health check with detailed metrics
**Features:** Uptime tracking, service status, resource utilization (CPU, memory, disk)
**Response:** Detailed health metrics, service status, and system resource information

#### `GET /api/system/status`
**Purpose:** System status overview and component health
**Features:** Component status, incident tracking, maintenance windows
**Response:** Overall system status, component health, and operational information

#### `POST /api/admin/reset`
**Purpose:** Reset mock data for demonstration purposes
**Request Body:** `{ type?: string, confirm: boolean }`
**Types:** `all`, `referrals`, `reports`, `financial`
**Features:** Confirmation requirement, selective reset, backup creation
**Response:** Reset confirmation, affected items, and metadata

#### `GET /api/admin/stats`
**Purpose:** System statistics and performance metrics
**Features:** User counts, data volumes, performance metrics, security statistics
**Response:** Comprehensive system statistics and performance data

#### `POST /api/admin/backup`
**Purpose:** Create system backups for data protection
**Request Body:** `{ type?: string, includeFiles?: boolean }`
**Types:** `full`, `incremental`, `data-only`
**Features:** Backup ID generation, compression, encryption, size estimation
**Response:** Backup confirmation, metadata, and processing details

#### `GET /api/admin/logs`
**Purpose:** System monitoring and troubleshooting
**Query Parameters:** `level`, `fromDate`, `toDate`, `limit`
**Features:** Multi-source logging, level-based filtering, trace ID tracking
**Response:** Filtered system logs with metadata and filtering summary

---

## Usage Examples

### Testing MSW Endpoints

#### Using the Enhanced Test Page (`/msw-test`)
1. Navigate to `/msw-test` in development
2. Use **"Test All Endpoints"** to verify all handlers
3. Use **"Test Advanced Filtering"** for complex query combinations
4. Use **"Test Error Scenarios"** for validation testing
5. Use **"Test Pagination & Sorting"** for pagination validation
6. Use **"Test Referral → Booking Flow"** for complete workflow testing
7. Use **"Test Validation Errors"** for error handling validation
8. Use **"Test Reports & Images Flow"** for complete report lifecycle testing
9. Use **"Test Reports & Images Errors"** for report and image error scenarios
10. Use **"Test Attorney & Funder Flow"** for complete attorney → lien → funding → approval workflow testing
11. Use **"Test Attorney & Funder Errors"** for attorney and funder error scenarios
12. Use **"Test System & Admin Endpoints"** for system health, admin operations, and audit functionality
13. Use **"Test System & Admin Errors"** for system and admin error scenarios
14. View results with latency measurements and status codes

#### Advanced Filtering Examples
```javascript
// Complex center search with multiple filters
const params = new URLSearchParams({
  modality: 'MRI',
  city: 'Miami',
  rating: '4',
  search: 'advanced',
  page: '1',
  limit: '5',
  sortBy: 'rating',
  sortOrder: 'desc'
});
const centers = await fetch(`/api/centers?${params}`);

// Advanced availability filtering
const availabilityParams = new URLSearchParams({
  modality: 'MRI',
  bodyPart: 'Head',
  status: 'available',
  priceRange: JSON.stringify({max: 300}),
  from: '2024-08-25T00:00:00Z',
  to: '2024-08-30T23:59:59Z',
  page: '1',
  limit: '10',
  sortBy: 'startTime',
  sortOrder: 'asc'
});
const slots = await fetch(`/api/centers/center-001/availability?${availabilityParams}`);

// Advanced body parts filtering
const bodyPartsParams = new URLSearchParams({
  category: 'Spine',
  modality: 'MRI',
  search: 'herniation',
  page: '1',
  limit: '3',
  sortBy: 'name',
  sortOrder: 'asc'
});
const bodyParts = await fetch(`/api/body-parts?${bodyPartsParams}`);

// Advanced safety questions filtering
const safetyParams = new URLSearchParams({
  modality: 'MRI',
  bodyPart: 'Head',
  type: 'yes/no',
  required: 'true',
  search: 'metal',
  page: '1',
  limit: '5',
  sortBy: 'question',
  sortOrder: 'asc'
});
const questions = await fetch(`/api/safety-questions?${safetyParams}`);

// Advanced referral filtering
const referralParams = new URLSearchParams({
  status: 'pending',
  modality: 'MRI',
  bodyPart: 'Head',
  page: '1',
  limit: '3',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
const referrals = await fetch(`/api/referrals?${referralParams}`);

// Advanced appointment filtering
const appointmentParams = new URLSearchParams({
  status: 'confirmed',
  modality: 'MRI',
  centerId: 'center-001',
  from: '2024-08-25',
  to: '2024-08-30',
  page: '1',
  limit: '5',
  sortBy: 'startTime',
  sortOrder: 'asc'
});
const appointments = await fetch(`/api/appointments?${appointmentParams}`);

// Advanced reports filtering with search and date ranges
const reportsParams = new URLSearchParams({
  status: 'finalized',
  modality: 'MRI',
  bodyPart: 'bp-002',
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  search: 'herniation',
  page: '1',
  limit: '10',
  sortBy: 'reportDate',
  sortOrder: 'desc'
});
const reports = await fetch(`/api/reports?${reportsParams}`);

// Advanced images filtering by modality and type
const imagesParams = new URLSearchParams({
  format: 'MRI',
  type: 'bp-002',
  fromDate: '2024-01-01',
  search: 'scan',
  page: '1',
  limit: '5',
  sortBy: 'uploadedAt',
  sortOrder: 'desc'
});
const images = await fetch(`/api/images?${imagesParams}`);

// Advanced liens filtering with comprehensive parameters
const liensParams = new URLSearchParams({
  status: 'active',
  attorneyId: 'attorney-001',
  minAmount: '10000',
  maxAmount: '50000',
  fromDate: '2024-01-01',
  toDate: '2024-06-30',
  search: 'cervical',
  page: '1',
  limit: '5',
  sortBy: 'amount',
  sortOrder: 'desc'
});
const liens = await fetch(`/api/liens?${liensParams}`);

// Advanced exposure filtering with date ranges
const exposureParams = new URLSearchParams({
  funderId: 'funder-001',
  fromDate: '2024-01-01',
  toDate: '2024-06-30'
});
const exposure = await fetch(`/api/exposure?${exposureParams}`);

// Advanced approvals filtering with priority and dates
const approvalsParams = new URLSearchParams({
  status: 'pending',
  attorneyId: 'attorney-001',
  priority: 'high',
  fromDate: '2024-08-01',
  toDate: '2024-08-25',
  page: '1',
  limit: '5',
  sortBy: 'submittedAt',
  sortOrder: 'desc'
});
const approvals = await fetch(`/api/approvals?${approvalsParams}`);

// Advanced system and admin filtering
const auditParams = new URLSearchParams({
  action: 'update',
  fromDate: '2024-08-01',
  toDate: '2024-08-25',
  limit: '20'
});
const auditLogs = await fetch(`/api/audit/referral-001?${auditParams}`);

const adminLogsParams = new URLSearchParams({
  level: 'error',
  fromDate: '2024-08-01',
  toDate: '2024-08-25',
  limit: '50'
});
const systemLogs = await fetch(`/api/admin/logs?${adminLogsParams}`);
```

#### Manual Testing
```javascript
// Test centers endpoint with advanced filtering
fetch('/api/centers?modality=MRI&rating=4&search=advanced&page=1&limit=5&sortBy=rating&sortOrder=desc')
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

// Test report creation
fetch('/api/reports', {
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
.then(response => response.json())
.then(data => console.log(data));

// Test report update
fetch('/api/reports/report-001', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'finalized',
    recommendations: 'Conservative management recommended',
    clinicalCorrelation: 'Correlate with patient symptoms'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// Test system health check
fetch('/api/system/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Test admin reset with confirmation
fetch('/api/admin/reset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'all', confirm: true })
})
.then(response => response.json())
.then(data => console.log(data));

// Test webhook delivery
fetch('/api/webhooks/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'center_callback',
    data: { centerId: 'center-001', status: 'available' }
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
// Complex center search with price range
const params = new URLSearchParams({
  modality: 'MRI',
  city: 'Miami',
  bodyPart: 'Head',
  priceRange: JSON.stringify({min: 100, max: 500}),
  rating: '4',
  search: 'advanced'
});
const centers = await fetch(`/api/centers?${params}`);

// Status-based filtering with pagination
const pendingReferrals = await fetch('/api/referrals?status=pending&page=1&limit=10');
const completedReports = await fetch('/api/reports?status=final&page=1&limit=20');
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

#### Enhanced MSW Test Page (`/msw-test`)
- **Comprehensive Testing**: All endpoints with one click
- **Advanced Filtering Tests**: Complex query parameter combinations
- **Error Scenario Testing**: Invalid parameters and edge cases
- **Pagination Testing**: Multi-page navigation validation
- **Performance Monitoring**: Latency measurement and validation
- **Status Code Validation**: HTTP response status verification

#### Manual Testing
```bash
# Test public endpoints with advanced features
curl "http://localhost:3000/api/centers?modality=MRI&rating=4&search=advanced&page=1&limit=5&sortBy=rating&sortOrder=desc"

# Test availability with complex filtering
curl "http://localhost:3000/api/centers/center-001/availability?modality=MRI&bodyPart=Head&status=available&priceRange={\"max\":300}&from=2024-08-25&to=2024-08-30&page=1&limit=10&sortBy=startTime&sortOrder=asc"

# Test body parts with categorization
curl "http://localhost:3000/api/body-parts?category=Spine&modality=MRI&search=herniation&page=1&limit=3&sortBy=name&sortOrder=asc"

# Test safety questions with type filtering
curl "http://localhost:3000/api/safety-questions?modality=MRI&bodyPart=Head&type=yes/no&required=true&search=metal&page=1&limit=5&sortBy=question&sortOrder=asc"

# Test referral and booking endpoints
curl "http://localhost:3000/api/referrals?status=pending&modality=MRI&page=1&limit=5"
curl "http://localhost:3000/api/referrals/ref-001"
curl "http://localhost:3000/api/appointments?status=confirmed&centerId=center-001&from=2024-08-25&to=2024-08-30"

# Test referral creation
curl -X POST "http://localhost:3000/api/referrals" \
  -H "Content-Type: application/json" \
  -d '{"patientId":"patient-001","modality":"MRI","bodyPart":"Head","referrerId":"provider-001","clinicalNotes":"Patient reports headaches"}'

# Test slot holding
curl -X POST "http://localhost:3000/api/slots/hold" \
  -H "Content-Type: application/json" \
  -d '{"slotId":"slot-001","referralId":"ref-001","duration":20}'

# Test appointment creation
curl -X POST "http://localhost:3000/api/appointments" \
  -H "Content-Type: application/json" \
  -d '{"referralId":"ref-001","slotId":"slot-001"}'

# Test error scenarios
curl "http://localhost:3000/api/centers?page=0&limit=200"
curl "http://localhost:3000/api/centers?sortOrder=invalid"
curl "http://localhost:3000/api/centers/center-001/availability?from=invalid-date&to=invalid-date"
curl "http://localhost:3000/api/referrals/ref-999"
curl "http://localhost:3000/api/appointments?page=0&limit=200"
```

### Validation Checklist

- [ ] All endpoints return proper HTTP status codes
- [ ] Response formats match API specifications
- [ ] Simulated latency is within 300-700ms range
- [ ] Error handling works for invalid requests
- [ ] Data relationships are maintained
- [ ] Query parameters filter correctly
- [ ] Pagination works for large datasets
- [ ] **Advanced filtering functions properly**
- [ ] **Sorting works across all fields**
- [ ] **Parameter validation provides helpful errors**
- [ ] **Response metadata is comprehensive**

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

#### **Advanced Filtering Issues**
**Symptoms:** Filters not working, unexpected results

**Solutions:**
1. Check parameter validation in handlers
2. Verify filter logic in `applyAdvancedFilters()`
3. Test individual filter components
4. Check query parameter format (especially JSON)

#### **Pagination Problems**
**Symptoms:** Wrong page sizes, missing data

**Solutions:**
1. Verify pagination logic in `createPaginatedResponse()`
2. Check page and limit parameter validation
3. Ensure sorting is applied before pagination
4. Test with different page sizes

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
5. **Advanced Filtering**: Implement comprehensive filtering capabilities
6. **Rich Metadata**: Provide detailed response information

### Performance

1. **Realistic Latency**: Simulate network conditions users will experience
2. **Efficient Filtering**: Optimize data filtering for large datasets
3. **Smart Sorting**: Implement type-aware sorting algorithms
4. **Caching Strategy**: Consider response caching for static data
5. **Batch Operations**: Support bulk operations where appropriate

---

## Future Enhancements

### Planned Improvements

1. **Dynamic Data Generation**: Generate realistic data on-the-fly
2. **State Persistence**: Save changes to localStorage for session persistence
3. **Advanced Filtering**: Add full-text search and complex queries
4. **Webhook Simulation**: Real-time event simulation for testing
5. **Performance Metrics**: Track and report API performance
6. **GraphQL Support**: Add GraphQL endpoint support
7. **Real-time Updates**: WebSocket support for live data

### Integration Opportunities

1. **Storybook Integration**: Use mock data in component stories
2. **E2E Testing**: Integrate with Playwright for automated testing
3. **API Documentation**: Generate OpenAPI specs from handlers
4. **Data Visualization**: Create dashboards for mock data insights
5. **CI/CD Integration**: Automated testing in deployment pipelines

---

## Zustand Store Implementation

### Overview

The project implements a comprehensive Zustand store for state management, providing centralized state for all business entities, UI state, and system operations. The store is organized into logical slices that mirror the API structure and business domain.

### Store Architecture

#### Main Store (`src/store/index.js`)
- **Combined Store**: Integrates all entity slices into a single store
- **Middleware**: Uses `devtools` for Redux DevTools integration and `persist` for state persistence
- **Storage**: Persists UI preferences to localStorage while excluding sensitive data
- **Exports**: Provides both combined store hook and individual slice hooks

#### Entity Slices

##### Core Business Entities
- **`centersSlice`**: MRI center management with location, modality, and availability
- **`slotsSlice`**: Appointment slot management with holding, booking, and release
- **`referralsSlice`**: Patient referral workflow with status tracking
- **`appointmentsSlice`**: Appointment scheduling with confirmation and cancellation
- **`reportsSlice`**: Clinical report management with lifecycle states
- **`patientsSlice`**: Patient demographics and medical history
- **`providersSlice`**: Healthcare provider management with specialties
- **`insurersSlice`**: Insurance company management with types and status

##### Financial & Legal Entities
- **`billsSlice`**: Billing management with status and amount tracking
- **`liensSlice`**: Medical lien management with approval workflows
- **`settlementsSlice`**: Settlement tracking with distribution
- **`claimsSlice`**: Insurance claim management with status tracking
- **`attorneysSlice`**: Legal representation management

##### Clinical Support Entities
- **`bodyPartsSlice`**: Anatomical body part definitions
- **`safetyQuestionsSlice`**: Clinical safety screening questions
- **`technologistsSlice`**: Imaging technologist management
- **`radiologistsSlice`**: Radiologist management with specialties

##### System & Admin
- **`systemSlice`**: System health, settings, logs, and notifications
- **`adminSlice`**: User management, roles, permissions, and audit logs

##### UI State
- **`uiSlice`**: Theme management, sidebar state, modals, notifications, and toasts

### Slice Structure

Each slice follows a consistent pattern:

```javascript
export const entitySlice = (set, get) => ({
  // State
  entities: [],
  selectedEntity: null,
  loading: false,
  error: null,
  filters: { /* filter fields */ },
  pagination: { page: 1, limit: 20, total: 0 },

  // Actions
  setEntities: (entities) => set({ entities }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set((state) => ({ /* update filters */ })),
  setPagination: (pagination) => set((state) => ({ /* update pagination */ })),

  // API Integration
  fetchEntities: async (params = {}) => { /* API call logic */ },
  fetchEntityById: async (id) => { /* single entity fetch */ },
  createEntity: async (entityData) => { /* create logic */ },
  updateEntity: async (id, updates) => { /* update logic */ },

  // Optimistic Updates
  addEntity: (entity) => { /* optimistic add */ },
  updateEntityStatus: (id, status) => { /* optimistic status update */ },

  // Selectors
  getEntitiesByStatus: (status) => { /* filtered entities */ },
  getEntityById: (id) => { /* find entity */ },
  getEntityStats: () => { /* computed statistics */ },

  // Reset
  resetEntities: () => set({ /* initial state */ }),
});
```

### Key Features

#### API Integration
- **RESTful Endpoints**: All slices integrate with the MSW mock API
- **Query Parameters**: Support for filtering, pagination, and sorting
- **Error Handling**: Comprehensive error state management
- **Loading States**: Individual loading states for each operation

#### Optimistic Updates
- **Immediate Feedback**: UI updates before API confirmation
- **Rollback Support**: Error handling with state restoration
- **Temporary IDs**: Temporary IDs for new entities during creation

#### Advanced Filtering
- **Multi-field Filters**: Support for complex filtering criteria
- **Date Ranges**: Comprehensive date-based filtering
- **Search Integration**: Full-text search across entity fields
- **Dynamic Queries**: Runtime query parameter construction

#### Pagination & Sorting
- **Configurable Limits**: Adjustable page sizes
- **Sort Options**: Multi-field sorting with direction
- **Total Counts**: Accurate record counts for pagination
- **Page Navigation**: Efficient page-to-page navigation

#### Selectors & Computed Values
- **Filtered Views**: Pre-computed filtered entity lists
- **Statistics**: Aggregated data and counts
- **Relationships**: Cross-entity relationship queries
- **Search Results**: Full-text search across entities

#### State Persistence
- **Selective Persistence**: Only UI preferences are persisted
- **Session Recovery**: Maintains state across browser sessions
- **Storage Strategy**: Excludes sensitive data from persistence
- **Performance**: Efficient serialization and deserialization

### Usage Patterns

#### Basic Store Usage
```javascript
import { useStore } from '../store';

const MyComponent = () => {
  const centers = useStore((state) => state.centers);
  const fetchCenters = useStore((state) => state.fetchCenters);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : `${centers.length} centers`}
    </div>
  );
};
```

#### Individual Slice Usage
```javascript
import { useCentersStore } from '../store';

const CentersComponent = () => {
  const { centers, loading, fetchCenters } = useCentersStore();
  
  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div>
      {loading ? 'Loading...' : `${centers.length} centers`}
    </div>
  );
};
```

#### Advanced Filtering
```javascript
const AdvancedFiltering = () => {
  const { filters, setFilters, fetchCenters } = useCentersStore();
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchCenters({ ...filters, ...newFilters });
  };

  return (
    <div>
      <input
        placeholder="Search centers..."
        onChange={(e) => handleFilterChange({ search: e.target.value })}
      />
      <select onChange={(e) => handleFilterChange({ modality: e.target.value })}>
        <option value="">All Modalities</option>
        <option value="MRI">MRI</option>
        <option value="CT">CT</option>
      </select>
    </div>
  );
};
```

#### Optimistic Updates
```javascript
const OptimisticUpdates = () => {
  const { addCenter, createCenter } = useCentersStore();
  
  const handleCreate = async (centerData) => {
    // Optimistically add to UI
    const tempCenter = addCenter(centerData);
    
    try {
      // Create via API
      const realCenter = await createCenter(centerData);
      // API will update the state with the real data
    } catch (error) {
      // Handle error - the optimistic update will be reverted
      console.error('Failed to create center:', error);
    }
  };

  return (
    <button onClick={() => handleCreate({ name: 'New Center' })}>
      Create Center
    </button>
  );
};
```

### Testing

#### Test Page (`/zustand-test`)
A comprehensive test page validates:
- **Store Initialization**: Proper store setup and slice integration
- **State Access**: Correct state retrieval and updates
- **Slice Integration**: Individual slice functionality
- **UI Store**: Theme management and UI state
- **API Functions**: Function availability and structure
- **Store Structure**: Complete key coverage verification
- **Theme Toggle**: Dynamic theme switching functionality

#### Test Results
The test page provides:
- **Pass/Fail Status**: Clear test result indicators
- **Detailed Information**: Specific test details and data
- **Timestamps**: Test execution timing
- **Summary Statistics**: Overall test performance metrics

### Performance Considerations

#### State Updates
- **Selective Updates**: Only affected state is updated
- **Immutable Patterns**: Proper state immutability
- **Batch Operations**: Efficient multiple state changes
- **Memory Management**: Proper cleanup and reset functions

#### API Integration
- **Request Debouncing**: Prevents excessive API calls
- **Caching Strategy**: Efficient data caching
- **Error Recovery**: Graceful error handling
- **Loading States**: User feedback during operations

#### Persistence
- **Selective Serialization**: Only necessary data is persisted
- **Storage Limits**: Respects browser storage constraints
- **Performance Impact**: Minimal impact on application performance
- **Recovery Time**: Fast state restoration

### Integration with MSW

The Zustand store seamlessly integrates with the MSW mock API:

1. **Unified Data Flow**: Store actions trigger MSW handlers
2. **Realistic Latency**: Simulated network delays
3. **Error Simulation**: Comprehensive error scenario testing
4. **Webhook Support**: Real-time event simulation
5. **Data Consistency**: Maintains referential integrity

### Future Enhancements

#### Planned Improvements
- **Real-time Updates**: WebSocket integration for live data
- **Offline Support**: Offline-first data management
- **Advanced Caching**: Intelligent caching strategies
- **State Synchronization**: Multi-tab state synchronization
- **Performance Monitoring**: Store performance metrics

#### Integration Opportunities
- **React Query**: Integration with React Query for advanced caching
- **GraphQL**: GraphQL endpoint support
- **Real-time**: WebSocket and Server-Sent Events
- **Analytics**: State change analytics and monitoring
- **Testing**: Enhanced testing utilities and mocks

---

## Conclusion

This mock data and MSW implementation provides a robust foundation for frontend development without backend dependencies. The comprehensive coverage of business entities, realistic data relationships, and full API surface enables developers to build and test complete user flows.

**New in v2.2**: Enhanced public API endpoints with enterprise-grade features including advanced filtering, comprehensive pagination, smart sorting, enhanced validation, and rich response metadata. These improvements provide a production-ready API experience during development.

**New in Task 3.4**: Enhanced referral and booking endpoints with comprehensive validation, business logic enforcement, advanced filtering and pagination, webhook simulation, and complete workflow support. The implementation provides a robust foundation for the complete referral → slot holding → appointment creation flow as specified in the PRD.

**New in Task 3.5**: Enhanced reports and images endpoints with complete lifecycle management, advanced filtering and search capabilities, business rule enforcement, secure image downloads, and comprehensive metadata. The implementation provides a robust foundation for the complete clinical workflow from report creation to finalization and image management.

**New in Task 3.6**: Enhanced attorney and funder endpoints with comprehensive lien management, advanced exposure calculations, case packet generation, and funding approval workflows. The implementation provides a robust foundation for the complete legal and financial workflow from lien creation to funding approval, including advanced filtering, pagination, business rule enforcement, and webhook simulation for all attorney and funder operations.

**New in Task 3.7**: Enhanced system and admin endpoints with comprehensive system monitoring, advanced audit logging, administrative operations, and webhook simulation. The implementation provides a robust foundation for system administration, compliance tracking, and operational monitoring, including detailed health metrics, comprehensive audit trails, selective data reset capabilities, backup management, and system log filtering.

**New in Task 3.8**: Complete Zustand store implementation with comprehensive state management for all business entities, including centers, slots, referrals, appointments, reports, patients, providers, insurers, bills, liens, settlements, claims, body parts, safety questions, attorneys, technologists, radiologists, system, and admin. The store provides API integration, optimistic updates, advanced filtering, pagination, selectors, and persistent state management with devtools support.

**New in Task 4**: **AI SIMULATION REQUIREMENTS FOR DEMO APP** - All AI functionality must be completely mocked and simulated using predefined rules and mock data. NO real AI services, APIs, or machine learning models should be required. This ensures the demo app can run completely offline while providing a convincing AI experience through rule-based logic and clever use of existing mock data structures.

**Updated in Tasks 5-17**: **ALL FUTURE TASKS NOW INCLUDE AI SIMULATION REQUIREMENTS** - Every task that contains AI functionality has been updated to emphasize the demo app requirements. This includes Imaging Center Dashboard, Referral Wizard, Attorney/Funder Dashboards, Ops Dashboard, AI Insight Drawer, Public Finder, and Email Intake systems.

**Enhanced in Task 16**: **COMPREHENSIVE NAVIGATION & USER ACCESS DOCUMENTATION** - Task 16 now includes detailed navigation integration requirements, user journey flows, and access patterns to ensure perfect alignment between implementation and user experience design.

**Updated in Task 16**: **SHADCN/UI COMPONENT REQUIREMENTS** - All UI components in Task 16 must use shadcn/ui components with proper cn() utility styling for consistent theming and responsive design. This includes Input, Select, Checkbox, DateRangePicker, Card, Dialog, Badge, Button, Skeleton, Pagination, and Separator components.

**Enhanced Mock Data for Task 16**: The centers.json mock data has been enhanced with comprehensive fields required for the Public Finder implementation:
- Performance metrics: avgTat (average turnaround time), utilization, noShowRate, satisfactionScore
- Compliance: adaCompliant, languages, bodyParts
- Enhanced features: magnetStrength, openUpright, sedationAvailable
- Rich metadata: accreditations, specialties, insuranceAccepted, features

---

## AI Simulation Implementation for Demo App

### Overview

Since this is a **DEMO APP**, all AI functionality must be completely simulated using predefined rules, mock data, and rule-based logic. The goal is to create a believable AI experience without requiring any external AI services or APIs.

### Core Principles

1. **Complete Offline Operation**: The demo app must run without internet connectivity
2. **Deterministic Responses**: All AI responses should be predictable and based on mock data
3. **Believable Intelligence**: Use clever heuristics and rule-based logic to simulate AI behavior
4. **No External Dependencies**: No real AI services, APIs, or machine learning models
5. **Mock Data Integration**: Leverage existing mock data structures for AI simulation

### AI Simulation Strategy

#### Patient Dashboard AI Tips
- **Appointment-based Advice**: Use predefined rules based on modality, body part, and appointment time
- **Preparation Instructions**: Generate contextual prep lists based on imaging type
- **Safety Reminders**: Use rule-based logic to identify relevant safety concerns

#### Referrer Dashboard AI Suggestions
- **Center Recommendations**: Mock scoring algorithm = distance weight + TAT weight + rating
- **Risk Assessment**: Use predefined thresholds and mock data for patient risk scoring
- **Workflow Optimization**: Rule-based suggestions for improving referral processes

#### AI Insight Drawer
- **Context-Aware Suggestions**: Generate tips based on current page, user role, and data context
- **Predictive Insights**: Use mock data patterns to simulate predictive analytics
- **Personalized Advice**: Apply role-specific rules and user preference settings

### Implementation Requirements

#### Mock AI Endpoints
```javascript
// Example mock AI endpoint structure
POST /api/ai/suggest
{
  "context": "patient_dashboard",
  "patientId": "patient-001",
  "appointmentType": "MRI",
  "bodyPart": "Head"
}

// Returns predefined suggestions based on context
{
  "suggestions": [
    "Arrive 15 minutes early for your MRI appointment",
    "Remove all metal objects before the scan",
    "Wear comfortable, loose-fitting clothing"
  ],
  "source": "mock_ai_simulation",
  "confidence": 0.95
}
```

#### Rule-Based Logic Examples
```javascript
// Example: AI Tip generation for patient appointments
function generateAITip(appointment, patient) {
  const tips = [];
  
  // Rule 1: Modality-specific advice
  if (appointment.modality === 'MRI') {
    tips.push('Remove all metal objects before your MRI scan');
    tips.push('Arrive 15 minutes early for safety screening');
  }
  
  // Rule 2: Body part-specific preparation
  if (appointment.bodyPart === 'Head') {
    tips.push('Avoid hair products that contain metal');
    tips.push('Bring a list of current medications');
  }
  
  // Rule 3: Patient history considerations
  if (patient.pipFlag) {
    tips.push('Bring your attorney contact information');
    tips.push('Document any changes in symptoms');
  }
  
  return tips;
}
```

#### Mock AI Service Layer
```javascript
// Example: Mock AI service for center recommendations
class MockAIService {
  recommendCenters(referral, patient) {
    const centers = this.getAvailableCenters(referral.modality, referral.bodyPart);
    
    return centers.map(center => ({
      ...center,
      aiScore: this.calculateMockScore(center, referral, patient),
      aiReasoning: this.generateMockReasoning(center, referral, patient)
    })).sort((a, b) => b.aiScore - a.aiScore);
  }
  
  calculateMockScore(center, referral, patient) {
    // Mock scoring algorithm using existing data
    const distanceScore = this.calculateDistanceScore(center, patient);
    const tatScore = this.calculateTATScore(center);
    const ratingScore = center.rating / 5;
    
    return (distanceScore * 0.3) + (tatScore * 0.4) + (ratingScore * 0.3);
  }
}
```

### Testing AI Simulation

#### Validation Checklist
- [ ] All AI responses are deterministic and repeatable
- [ ] AI functionality works without internet connectivity
- [ ] Mock AI endpoints return realistic responses
- [ ] AI suggestions change appropriately with context
- [ ] No external AI service calls are made
- [ ] AI simulation appears intelligent and helpful

#### Test Scenarios
1. **Patient Dashboard**: Verify AI tips change based on appointment type and body part
2. **Referrer Dashboard**: Test center recommendations with different referral parameters
3. **AI Insight Drawer**: Validate context-aware suggestions across different pages
4. **Offline Mode**: Ensure all AI functionality works without network connectivity

### Future Considerations

When transitioning to production:
1. **Replace mock AI services** with real AI APIs
2. **Implement proper AI model integration** for machine learning features
3. **Add real-time AI processing** for dynamic suggestions
4. **Implement AI model training** and continuous improvement
5. **Add AI performance monitoring** and analytics

For now, focus on creating a **convincing demo experience** that showcases the intended AI functionality without external dependencies.

---

For questions or issues, refer to the troubleshooting section or check the browser console for detailed error messages. The enhanced `/msw-test` page provides an interactive way to validate all endpoints and data relationships. The new `/zustand-test` page provides comprehensive testing of the Zustand store implementation.

---

## Task Implementation Status

### Completed Tasks
- **Task 3.1**: ✅ **COMPLETED** - Created comprehensive mock data fixtures for all 17 core entities
- **Task 3.2**: ✅ **COMPLETED** - Implemented MSW handlers for all API endpoints with proper error handling
- **Task 3.3**: ✅ **COMPLETED** - Created Zustand store slices for all entities with proper state management
- **Task 3.4**: ✅ **COMPLETED** - Implemented comprehensive testing interfaces for MSW and Zustand
- **Task 3.5**: ✅ **COMPLETED** - Enhanced error handling and edge case testing for all endpoints
- **Task 3.6**: ✅ **COMPLETED** - Added advanced filtering, pagination, and sorting capabilities
- **Task 3.7**: ✅ **COMPLETED** - Implemented optimistic updates and webhook simulation
- **Task 3.8**: ✅ **COMPLETED** - Added AI simulation endpoints and enhanced testing interfaces
- **Task 3**: ✅ **COMPLETED** - All subtasks completed, main task marked as done

### Current Task
- **Task 16**: 🔄 **IN PROGRESS** - Public Finder Implementation with Map and List Views
  - **16.1**: ✅ **COMPLETED** - Search filter components using shadcn/ui components
  - **16.2**: ⏳ **PENDING** - Search results views (list and map)
  - **16.3**: ⏳ **PENDING** - Center Profile modal
  - **16.4**: ⏳ **PENDING** - Deep-linking functionality
  - **16.5**: ⏳ **PENDING** - Responsive design adaptations
  - **16.6**: ⏳ **PENDING** - Integration with existing components and mock APIs
  - **16.7**: ⏳ **PENDING** - Mocked AI center recommendations
  - **16.8**: ⏳ **PENDING** - Deterministic search suggestions
  - **16.9**: ⏳ **PENDING** - Intelligent filtering heuristics
  - **16.10**: ⏳ **PENDING** - Public access route at /centers
  - **16.11**: ⏳ **PENDING** - Navigation entry points for different user roles
  - **16.12**: ⏳ **PENDING** - User journey flows for different user types
  - **16.13**: ⏳ **PENDING** - Integration points with other application features

**Task 16 Requirements**: All UI components must use shadcn/ui components with proper cn() utility styling for consistent theming and responsive design. Mock data has been enhanced to support all required functionality.

---

**Document Version:** 2.8  
**Last Updated:** December 19, 2024  
**Maintained By:** Development Team  
**Next Review:** September 25, 2024
