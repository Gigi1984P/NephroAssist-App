# NephroAssist AI Architecture

## 1. Core AI Principle

**AI is an assistant, NOT a decision maker.**

All AI results require human review before affecting business logic or patient workflows.

```
AI Suggestion → Human Review → Human Decision
```

## 2. Prohibited AI Actions

AI MUST NOT autonomously:
- Make diagnoses
- Classify patients as transplantable
- Medically prioritize patients
- Grant medical clearances
- Make listing decisions
- Confirm examinations as medically sufficient
- Replace physician decisions

## 3. AI Capabilities

AI MAY assist with:
- Document classification
- OCR processing
- Information extraction
- Requirement suggestions
- Document summarization
- Explain requirements in patient-friendly language
- Translation support
- Flag possible missing information
- Suggest organizational next steps
- Support workflows

## 4. Architecture: LLMGateway

### All AI calls go through backend LLMGateway

NO direct LLM API calls from frontend.

```
Frontend → Backend API → LLMGateway → LLM Provider
```

### LLMGateway Responsibilities

```
Provider Selection
  ├── Choose provider based on task type
  ├── Fallback on provider failure
  └── Cost optimization

Data Redaction
  ├── Remove PHI before sending to LLM
  ├── Replace names with tokens
  └── Remove sensitive identifiers

Logging Policy
  ├── Log prompt version
  ├── Log structured output
  ├── Log confidence scores
  └── NO chain-of-thought stored

Prompt Versioning
  ├── PromptTemplate table
  ├── Version tracking
  └── A/B testing capability

Timeout & Retry
  ├── Configurable timeout
  ├── Exponential backoff
  └── Max retry limit

Cost Tracking
  ├── Per-organization cost tracking
  ├── Usage limits
  └── Budget alerts

Structured Output Validation
  ├── JSON Schema / Zod validation
  ├── Invalid output → retry or manual review
  └── Confidence threshold checks
```

## 5. AI Service Layer

### DocumentProcessingService
```
Input: Document (PDF, image, scan)
Output: ProcessedDocument

Steps:
  1. OCR (extract raw text)
  2. Classification (document type)
  3. Extraction (structured data)
  4. Requirement Matching (suggest requirements)
  5. Pre-Check (flag possible issues)
```

### OCRProvider (Abstract)
```
Interface:
  processDocument(file): OCRResult

Implementations:
  - Tesseract (local, no PHI leaves system)
  - AWS Textract (if BAA in place)
  - Google Cloud Vision (if DPA in place)
  - Azure Form Recognizer (if DPA in place)
```

### LLMProvider (Abstract)
```
Interface:
  classifyDocument(text, mimeType): ClassificationResult
  extractInformation(text, schema): ExtractionResult
  explainRequirement(requirement, language): Explanation
  summarizeDocument(text): Summary
  matchRequirements(document, requirements): MatchResult

Implementations:
  - OpenAI GPT-4 (if BAA in place)
  - Anthropic Claude (if BAA in place)
  - Local LLM (no PHI leaves system)
  - EU-hosted LLM (GDPR compliance)
```

### DocumentClassifier
```
Input: OCR text + MIME type
Output: DocumentType + Confidence

Types:
  - Prescription
  - Laboratory Report
  - Cardiology Report
  - Dental Report
  - Dermatology Report
  - Radiology Report
  - Referral Letter
  - Other

AI result is editable by human.
```

### DocumentExtractor
```
Input: OCR text + DocumentType
Output: Structured data

Extracted fields:
  - document type
  - document date
  - provider name
  - specialty
  - patient identifiers (redacted)
  - tests performed
  - medical codes
  - requested services
  - document validity hints

All values have confidence scores.
```

### RequirementMatcher
```
Input: Document + PatientRequirements
Output: Suggested matches

Example:
  "This document could fulfill:
   - HBV Screening: 96%
   - HCV Screening: 94%
   - HIV Screening: 92%"

Human confirms assignment.
NO automatic medical clearance.
```

## 6. Document Pre-Check

### Before Review, AI flags possible issues
```
Possible missing signature
Document date not detected
Possible outdated document
Required section may be missing
Patient name mismatch
```

### Always presented as hints
```
"Possible issue / needs human review"
```

## 7. AI Auditability

### Every AI action logged
```
provider: string
model: string
timestamp: datetime
promptVersion: string
inputHash: string (hashed for privacy)
output: JSON
confidence: number
humanOverride: boolean
reviewerId: UUID (if overridden)
```

### NO chain-of-thought stored
Only store:
- Structured results
- Confidence scores
- Human overrides

## 8. AI Quality Dashboard (Future)

### Metrics
```
classification acceptance rate
requirement matching acceptance rate
manual correction rate
OCR failure rate
extraction accuracy
```

### NO patient data in analytics
Use anonymized/aggregated data only.

## 9. AI Configuration

### Admin-configurable
```
AI enabled: true/false
OCR provider: string
LLM provider: string
Model: string
Confidence threshold: number (0-1)
Auto-suggestion enabled: true/false
```

### Per-organization settings
```
Organization A: AI fully enabled
Organization B: AI disabled, manual only
Organization C: AI suggestions, manual confirmation required
```

## 10. Prompt Versioning

### PromptTemplate
```
id: UUID
name: string
description: string
prompt: string
version: number
status: ACTIVE | DEPRECATED
createdAt: datetime
updatedAt: datetime
```

### PromptVersion
```
id: UUID
templateId: UUID
version: number
changes: string
prompt: string
performance: JSON
usedAt: datetime
```

## 11. Human Override

### AI results are suggestions
```
AI suggested: X
Human selected: Y
```

### Override tracking
```
aiSuggestion: JSON
humanSelection: JSON
reviewerId: UUID
overriddenAt: datetime
reason: string
```

### Used for
- Audit trail
- Quality measurement
- Model improvement

## 12. AI Failure Fallback

### When OCR/LLM fails
```
Document remains available
Status: AI_PROCESSING_FAILED
Status: MANUAL_REVIEW_REQUIRED
Core workflow NOT blocked
```

### User-friendly error
```
"Document could not be automatically processed. 
It has been saved and can be manually reviewed."
```

## 13. Data Privacy in AI Processing

### PHI Redaction
```
Before sending to LLM:
  1. Remove patient names
  2. Remove birth dates
  3. Remove medical record numbers
  4. Remove addresses
  5. Remove phone numbers
  6. Replace with tokens: [PATIENT_NAME], [DOB], [MRN]
```

### EU Data Residency
```
If using cloud LLM:
  - EU-hosted endpoint preferred
  - Data processing agreement in place
  - Or use local LLM for full control
```

## 14. Explain This Requirement

### Patient Feature
```
Button: "What does this mean?"

AI generates:
  - What is needed?
  - Why does the center require this?
  - What do you need to do?
  - What do you need to bring?
  - What document do you need afterward?

Binding medical content comes from the center.
AI may simplify language, NOT extend medically.
```

## 15. Structured AI Output

### All LLM responses validated
```typescript
// Zod schema example
const DocumentExtractionResult = z.object({
  documentType: z.string(),
  documentDate: z.string().datetime().optional(),
  extractedItems: z.array(z.object({
    type: z.string(),
    value: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  suggestedRequirements: z.array(z.object({
    requirementId: z.string(),
    confidence: z.number().min(0).max(1)
  })),
  confidence: z.number().min(0).max(1),
  warnings: z.array(z.string())
})
```

### Invalid output handling
```
1. Retry with same prompt (max 2 retries)
2. If still invalid → manual review queue
3. Log failure for quality tracking
```

## 16. AI Processing Pipeline

```
Document Upload
  ↓
Virus Scan
  ↓
Store S3
  ↓
Queue OCR Job
  ↓
OCR Provider
  ↓
Queue Classification Job
  ↓
LLMGateway → LLM Provider
  ↓
Queue Extraction Job
  ↓
LLMGateway → LLM Provider
  ↓
Queue Requirement Matching Job
  ↓
LLMGateway → LLM Provider
  ↓
Store Results
  ↓
Human Review Queue
```

## 17. Job Dashboard

### Admin can monitor
```
OCR Jobs: running/completed/failed
AI Jobs: running/completed/failed
Email Jobs: queued/sent/failed
Reminder Jobs: scheduled/sent
Failed Jobs: with error code
Retry Count: per job
```

### Manual retry
- Requires permission: admin.manage.ai.config
- Audit logged
- Idempotent (no duplicates)

## 18. Explainability

### AI results must be explainable
```
"This document was classified as 'Cardiology Report' 
because it contains terms: 'ECG', 'echocardiography', 
'cardiologist', and a cardiac clinic header."

Confidence: 96%
```

### Not a black box
- Show which features led to decision
- Allow human to understand and verify
- Enable effective override

## 19. Cost Management

### Per-organization tracking
```
Monthly AI budget: €500
Current usage: €320
Remaining: €180
```

### Alerts
```
80% of budget used → warning
100% of budget used → AI disabled until next month
```

## 20. Model Selection Strategy

### Task-based model selection
```
OCR: Tesseract (local) for standard docs, cloud for complex
Classification: Lightweight model for speed
Extraction: Full LLM for accuracy
Summarization: Full LLM
Translation: Dedicated translation model
```

### Fallback chain
```
Primary model (e.g., GPT-4) → timeout/failure
  ↓
Secondary model (e.g., Claude) → timeout/failure
  ↓
Local model (e.g., Llama) → timeout/failure
  ↓
Manual processing queue
```
