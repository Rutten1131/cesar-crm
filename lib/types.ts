export interface Prospect {
    id: string;
    businessName: string;
    contactName: string;
    phone?: string;
    email?: string;
    city?: string;
    province?: string;
    businessType?: string;
    outreachStatus: 'new' | 'contacted' | 'responded' | 'interested' | 'not_interested' | 'converted_to_lead';
    whatsappStatus: 'pending' | 'sent' | 'failed';
    whatsappSentAt?: string;
    emailSequenceStep: number;
    lastEmailSentAt?: string;
    nextFollowUp?: string;
    isNewsletterSubscriber: boolean;
    notes?: string;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    id: string;
    businessName: string;
    contactName: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
    businessType?: string;
    businessActivity?: string;
    interestedProduct?: string | string[];
    businessLocation?: string;
    verbalAgreements?: string;
    personalityType?: string;
    communicationStyle?: string;
    keyPhrases?: string;
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    threats?: string;
    relationshipType?: string;
    quantifiedProblem?: string;
    conservativeGoal?: string;
    yearsInBusiness?: number;
    numberOfEmployees?: number;
    numberOfBranches?: number;
    currentClientsPerMonth?: number;
    averageTicket?: number;
    knownCompetition?: string;
    highSeason?: string;
    criticalDates?: string;
    facebookFollowers?: number;
    otherAchievements?: string;
    specificRecognitions?: string;
    status: 'sin_contacto' | 'primer_contacto' | 'segundo_contacto' | 'tercer_contacto' | 'cotizado' | 'convertido';
    phase: number;
    notes?: string;
    source: string;
    discoveryLeadId?: string;
    quotation?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Client {
    id: string;
    leadId?: string;
    businessName: string;
    contactName: string;
    phone?: string;
    email?: string;
    city?: string;
    address?: string;
    businessType?: string;
    businessActivity?: string;
    interestedProduct?: string;
    verbalAgreements?: string;
    personalityType?: string;
    communicationStyle?: string;
    keyPhrases?: string;
    pains?: string;
    goals?: string;
    objections?: string;
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    threats?: string;
    relationshipType?: string;
    quantifiedProblem?: string;
    conservativeGoal?: string;
    yearsInBusiness?: number;
    numberOfEmployees?: number;
    numberOfBranches?: number;
    currentClientsPerMonth?: number;
    averageTicket?: number;
    knownCompetition?: string;
    highSeason?: string;
    criticalDates?: string;
    facebookFollowers?: number;
    otherAchievements?: string;
    specificRecognitions?: string;
    contractValue?: number;
    contractStartDate?: string;
    quotation?: string;
    notes?: string;
    discoveryLeadId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'whatsapp' | 'note' | 'other';
    direction?: 'inbound' | 'outbound';
    content: string;
    outcome?: string;
    duration?: number;
    performedBy?: string;
    performedAt: string;
    relatedClientId?: string;
    relatedLeadId?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assignedTo?: string;
    relatedClientId?: string;
    relatedLeadId?: string;
}

export interface Quotation {
    id: string;
    leadId?: string;
    contactId?: string;
    title: string;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    totalAmount?: number;
    
    // Follow-up
    fechaPrimerContacto?: string;
    proximoSeguimiento?: string;
    intentosRealizados: number;
    estadoSeguimiento: 'PENDIENTE' | 'ENVIADO' | 'EN_SEGUIMIENTO' | 'RESPONDIDO' | 'CERRADO';
    numeroWhatsapp?: string;
    notasSeguimiento?: string;
    
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    amount: number;
    date: string;
    dueDate?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    clientId?: string;
    leadId?: string;
    
    // Collection
    intentosCobro: number;
    proximoRecordatorio?: string;
    estadoCobro: 'PENDIENTE' | 'EN_GESTION' | 'PAGADO' | 'INCOBRABLE';
    numeroWhatsapp?: string;
    logCobranza?: string;
    
    createdAt: string;
    updatedAt: string;
}
