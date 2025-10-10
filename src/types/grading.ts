// Grading-related type definitions
import { GradingCompany } from './card';

export interface GradingSubmission {
  id: string;
  userId: string;
  gradingCompany: GradingCompany;
  certNumber?: string;
  submissionDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  status: SubmissionStatus;
  cards: SubmittedCard[];
  totalCost: number;
  trackingNumber?: string;
}

export type SubmissionStatus = 
  | 'pending' 
  | 'received' 
  | 'grading' 
  | 'completed' 
  | 'shipped' 
  | 'delivered';

export interface SubmittedCard {
  id: string;
  cardDetails: string;
  declaredValue: number;
  serviceLevel: string;
  grade?: number;
  subgrades?: Subgrades;
  gradingNotes?: string;
}

export interface Subgrades {
  centering?: number;
  corners?: number;
  edges?: number;
  surface?: number;
}

export interface GradingHistory {
  certNumber: string;
  gradingCompany: GradingCompany;
  grade: number;
  subgrades?: Subgrades;
  cardDetails: string;
  gradedDate: Date;
  population?: PopulationData;
}

export interface PopulationData {
  totalGraded: number;
  higherGrades: number;
  sameGrade: number;
  lowerGrades: number;
  grade10Count?: number;
  grade9Count?: number;
}

export interface AIGradingResult {
  predictedGrade: number;
  confidence: number; // 0-1
  centering: {
    score: number;
    leftRight: string; // e.g., "55/45"
    topBottom: string; // e.g., "50/50"
  };
  corners: {
    score: number;
    issues: string[];
  };
  edges: {
    score: number;
    issues: string[];
  };
  surface: {
    score: number;
    issues: string[];
  };
  overallAnalysis: string;
  recommendations: string[];
  imageQuality: 'excellent' | 'good' | 'fair' | 'poor';
}