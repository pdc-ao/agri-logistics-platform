// src/types/documents.ts

export const DocumentType = {
  // ========================================
  // INDIVIDUAL DOCUMENTS
  // ========================================
  ID_CARD: 'ID_CARD',
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  PROOF_OF_ADDRESS: 'PROOF_OF_ADDRESS',
  
  // ========================================
  // BUSINESS/COMPANY DOCUMENTS
  // ========================================
  BUSINESS_REGISTRATION: 'BUSINESS_REGISTRATION',
  TAX_ID_CERTIFICATE: 'TAX_ID_CERTIFICATE',
  VAT_CERTIFICATE: 'VAT_CERTIFICATE',
  TRADE_LICENSE: 'TRADE_LICENSE',
  COMPANY_CONSTITUTION: 'COMPANY_CONSTITUTION',
  MEMORANDUM_OF_ASSOCIATION: 'MEMORANDUM_OF_ASSOCIATION',
  CERTIFICATE_OF_INCORPORATION: 'CERTIFICATE_OF_INCORPORATION',
  SHAREHOLDER_AGREEMENT: 'SHAREHOLDER_AGREEMENT',
  
  // ========================================
  // ROLE-SPECIFIC DOCUMENTS
  // ========================================
  
  // Producer documents
  FARM_OWNERSHIP_CERTIFICATE: 'FARM_OWNERSHIP_CERTIFICATE',
  ORGANIC_CERTIFICATION: 'ORGANIC_CERTIFICATION',
  LAND_LEASE_AGREEMENT: 'LAND_LEASE_AGREEMENT',
  AGRICULTURAL_LICENSE: 'AGRICULTURAL_LICENSE',
  
  // Storage owner documents
  WAREHOUSE_LICENSE: 'WAREHOUSE_LICENSE',
  STORAGE_FACILITY_PERMIT: 'STORAGE_FACILITY_PERMIT',
  FOOD_SAFETY_CERTIFICATE: 'FOOD_SAFETY_CERTIFICATE',
  
  // Transporter documents
  VEHICLE_REGISTRATION: 'VEHICLE_REGISTRATION',
  TRANSPORT_LICENSE: 'TRANSPORT_LICENSE',
  INSURANCE_CERTIFICATE: 'INSURANCE_CERTIFICATE',
  ROADWORTHINESS_CERTIFICATE: 'ROADWORTHINESS_CERTIFICATE',
  
  // Transformer documents
  PROCESSING_LICENSE: 'PROCESSING_LICENSE',
  HEALTH_SAFETY_CERTIFICATE: 'HEALTH_SAFETY_CERTIFICATE',
  FACILITY_INSPECTION_REPORT: 'FACILITY_INSPECTION_REPORT',
  
  // ========================================
  // GENERAL DOCUMENTS
  // ========================================
  BANK_STATEMENT: 'BANK_STATEMENT',
  PROOF_OF_PAYMENT: 'PROOF_OF_PAYMENT',
  CONTRACT: 'CONTRACT',
  INVOICE: 'INVOICE',
  RECEIPT: 'RECEIPT',
  
  // Product/listing related
  PRODUCT_PHOTO: 'PRODUCT_PHOTO',
  PRODUCT_CERTIFICATE: 'PRODUCT_CERTIFICATE',
  QUALITY_REPORT: 'QUALITY_REPORT',
  LAB_TEST_RESULTS: 'LAB_TEST_RESULTS',
} as const;

export type DocumentTypeKey = keyof typeof DocumentType;

// ========================================
// DOCUMENT REQUIREMENTS BY USER TYPE
// ========================================

export const DocumentRequirements = {
  // Individual user (person)
  INDIVIDUAL: {
    PRODUCER: [
      DocumentType.ID_CARD, // or PASSPORT
      DocumentType.PROOF_OF_ADDRESS,
      DocumentType.FARM_OWNERSHIP_CERTIFICATE, // optional if renting
    ],
    CONSUMER: [
      DocumentType.ID_CARD, // or PASSPORT
      DocumentType.PROOF_OF_ADDRESS,
    ],
    TRANSPORTER: [
      DocumentType.ID_CARD,
      DocumentType.DRIVERS_LICENSE,
      DocumentType.VEHICLE_REGISTRATION,
      DocumentType.INSURANCE_CERTIFICATE,
    ],
    STORAGE_OWNER: [
      DocumentType.ID_CARD,
      DocumentType.WAREHOUSE_LICENSE,
      DocumentType.STORAGE_FACILITY_PERMIT,
    ],
    TRANSFORMER: [
      DocumentType.ID_CARD,
      DocumentType.PROCESSING_LICENSE,
      DocumentType.HEALTH_SAFETY_CERTIFICATE,
    ],
  },
  
  // Company/Business entity
  COMPANY: {
    PRODUCER: [
      DocumentType.BUSINESS_REGISTRATION,
      DocumentType.TAX_ID_CERTIFICATE,
      DocumentType.CERTIFICATE_OF_INCORPORATION,
      DocumentType.AGRICULTURAL_LICENSE,
      DocumentType.FARM_OWNERSHIP_CERTIFICATE, // or lease
    ],
    CONSUMER: [
      DocumentType.BUSINESS_REGISTRATION,
      DocumentType.TAX_ID_CERTIFICATE,
      DocumentType.CERTIFICATE_OF_INCORPORATION,
    ],
    TRANSPORTER: [
      DocumentType.BUSINESS_REGISTRATION,
      DocumentType.TAX_ID_CERTIFICATE,
      DocumentType.TRANSPORT_LICENSE,
      DocumentType.INSURANCE_CERTIFICATE,
      DocumentType.VEHICLE_REGISTRATION,
    ],
    STORAGE_OWNER: [
      DocumentType.BUSINESS_REGISTRATION,
      DocumentType.TAX_ID_CERTIFICATE,
      DocumentType.WAREHOUSE_LICENSE,
      DocumentType.FOOD_SAFETY_CERTIFICATE,
    ],
    TRANSFORMER: [
      DocumentType.BUSINESS_REGISTRATION,
      DocumentType.TAX_ID_CERTIFICATE,
      DocumentType.PROCESSING_LICENSE,
      DocumentType.HEALTH_SAFETY_CERTIFICATE,
      DocumentType.FACILITY_INSPECTION_REPORT,
    ],
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get required documents for a user based on their type and role
 */
export function getRequiredDocuments(
  entityType: 'INDIVIDUAL' | 'COMPANY',
  userRole: string
): string[] {
  return DocumentRequirements[entityType]?.[userRole as keyof typeof DocumentRequirements.INDIVIDUAL] || [];
}

/**
 * Check if a document type is for individuals only
 */
export function isIndividualDocument(docType: string): docType is typeof DocumentType.ID_CARD | typeof DocumentType.PASSPORT | typeof DocumentType.DRIVERS_LICENSE {
  return [
    DocumentType.ID_CARD,
    DocumentType.PASSPORT,
    DocumentType.DRIVERS_LICENSE,
  ].includes(docType as any);
}

/**
 * Check if a document type is for companies only
 */
export function isCompanyDocument(docType: string): boolean {
  return [
    DocumentType.BUSINESS_REGISTRATION,
    DocumentType.CERTIFICATE_OF_INCORPORATION,
    DocumentType.MEMORANDUM_OF_ASSOCIATION,
    DocumentType.SHAREHOLDER_AGREEMENT,
    DocumentType.COMPANY_CONSTITUTION,
  ].includes(docType as any);
}

/**
 * Validate document type for user entity type
 */
export function isValidDocumentForEntityType(
  docType: string,
  entityType: 'INDIVIDUAL' | 'COMPANY'
): boolean {
  if (entityType === 'INDIVIDUAL' && isCompanyDocument(docType)) {
    return false;
  }
  if (entityType === 'COMPANY' && isIndividualDocument(docType)) {
    return false;
  }
  return true;
}

/**
 * Get document display name
 */
export function getDocumentDisplayName(docType: string): string {
  const names: Record<string, string> = {
    [DocumentType.ID_CARD]: 'National ID Card',
    [DocumentType.PASSPORT]: 'Passport',
    [DocumentType.BUSINESS_REGISTRATION]: 'Business Registration Certificate',
    [DocumentType.TAX_ID_CERTIFICATE]: 'Tax Identification Number (TIN)',
    [DocumentType.CERTIFICATE_OF_INCORPORATION]: 'Certificate of Incorporation',
    [DocumentType.FARM_OWNERSHIP_CERTIFICATE]: 'Farm Ownership Certificate',
    [DocumentType.WAREHOUSE_LICENSE]: 'Warehouse Operating License',
    [DocumentType.TRANSPORT_LICENSE]: 'Transport Operating License',
    [DocumentType.PROCESSING_LICENSE]: 'Food Processing License',
    // Add more as needed
  };
  return names[docType] || docType.replace(/_/g, ' ');
}

/**
 * Check verification completeness
 */
export async function checkVerificationStatus(
  userId: string,
  entityType: 'INDIVIDUAL' | 'COMPANY',
  userRole: string,
  prisma: any
): Promise<{
  isComplete: boolean;
  missing: string[];
  pending: string[];
  approved: string[];
  rejected: string[];
}> {
  const required = getRequiredDocuments(entityType, userRole);
  
  const userDocuments = await prisma.document.findMany({
    where: {
      userId,
      type: { in: required },
    },
    select: {
      type: true,
      status: true,
    },
  });

  const submitted = new Set(userDocuments.map((d: any) => d.type));
  const missing = required.filter(r => !submitted.has(r));
  
  const approved = userDocuments
    .filter((d: any) => d.status === 'APPROVED')
    .map((d: any) => d.type);
  
  const pending = userDocuments
    .filter((d: any) => d.status === 'PENDING_REVIEW')
    .map((d: any) => d.type);
  
  const rejected = userDocuments
    .filter((d: any) => d.status === 'REJECTED')
    .map((d: any) => d.type);

  return {
    isComplete: missing.length === 0 && pending.length === 0 && rejected.length === 0,
    missing,
    pending,
    approved,
    rejected,
  };
}

// ========================================
// API VALIDATION
// ========================================

/**
 * Validate document upload
 */
export function validateDocumentUpload(
  docType: string,
  entityType: 'INDIVIDUAL' | 'COMPANY',
  userRole: string
): { valid: boolean; error?: string } {
  // Check if document type is valid for entity type
  if (!isValidDocumentForEntityType(docType, entityType)) {
    return {
      valid: false,
      error: `${docType} is not valid for ${entityType.toLowerCase()} accounts`,
    };
  }

  // Check if document type is required for this role
  const required = getRequiredDocuments(entityType, userRole);
  const optional = true; // Allow optional documents

  if (!required.includes(docType) && !optional) {
    return {
      valid: false,
      error: `${docType} is not required for ${userRole} role`,
    };
  }

  return { valid: true };
}

// ========================================
// USAGE EXAMPLES
// ========================================

/*
// In your registration form:
const [entityType, setEntityType] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');

// Show appropriate document upload fields
const requiredDocs = getRequiredDocuments(entityType, userRole);

requiredDocs.forEach(docType => {
  // Show upload field for each document
  <DocumentUploadField 
    docType={docType}
    label={getDocumentDisplayName(docType)}
    required
  />
});

// In your API route:
const validation = validateDocumentUpload(docType, user.entityType, user.role);
if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}

// Check verification status:
const status = await checkVerificationStatus(
  userId,
  user.entityType,
  user.role,
  prisma
);

if (status.isComplete) {
  // User is fully verified
  await prisma.user.update({
    where: { id: userId },
    data: { 
      isVerified: true,
      verificationStatus: 'VERIFIED',
    },
  });
}
*/