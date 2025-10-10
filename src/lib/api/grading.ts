import { APIResponse, GradingHistory, GradingCompany, PopulationData } from '@/types';

class GradingAPI {
  /**
   * Verify PSA certification
   */
  async verifyPSA(certNumber: string): Promise<APIResponse<GradingHistory>> {
    try {
      // PSA Cert Verification API
      const response = await fetch(
        `https://www.psacard.com/cert/${certNumber}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('PSA verification failed');
      }

      const data = await response.json();

      const gradingHistory: GradingHistory = {
        certNumber,
        gradingCompany: 'PSA',
        grade: data.Grade,
        cardDetails: `${data.Year} ${data.Brand} ${data.Variety} #${data.CardNumber} ${data.Subject}`,
        gradedDate: new Date(data.GradeDate),
        population: data.Population ? {
          totalGraded: data.Population.TotalGraded,
          higherGrades: data.Population.Higher,
          sameGrade: data.Population.Same,
          lowerGrades: data.Population.Lower,
        } : undefined,
      };

      return {
        success: true,
        data: gradingHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PSA_VERIFY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Verify BGS/Beckett certification
   */
  async verifyBGS(certNumber: string): Promise<APIResponse<GradingHistory>> {
    try {
      // BGS doesn't have a public API - use web scraping via Edge Function
      const response = await fetch('/api/grading/bgs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certNumber }),
      });

      if (!response.ok) {
        throw new Error('BGS verification failed');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.gradingHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BGS_VERIFY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Verify CGC certification
   */
  async verifyCGC(certNumber: string): Promise<APIResponse<GradingHistory>> {
    try {
      const response = await fetch('/api/grading/cgc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certNumber }),
      });

      if (!response.ok) {
        throw new Error('CGC verification failed');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.gradingHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CGC_VERIFY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Universal grading verification
   */
  async verifyGrade(
    certNumber: string, 
    company: GradingCompany
  ): Promise<APIResponse<GradingHistory>> {
    switch (company) {
      case 'PSA':
        return this.verifyPSA(certNumber);
      case 'BGS':
        return this.verifyBGS(certNumber);
      case 'CGC':
        return this.verifyCGC(certNumber);
      default:
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_GRADING_COMPANY',
            message: `Grading company ${company} is not supported`,
          },
        };
    }
  }

  /**
   * Get population report for a card
   */
  async getPopulationReport(
    cardDetails: string,
    company: GradingCompany
  ): Promise<APIResponse<PopulationData>> {
    try {
      const response = await fetch('/api/grading/population', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardDetails, company }),
      });

      if (!response.ok) {
        throw new Error('Population report failed');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.population,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'POPULATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

export const gradingAPI = new GradingAPI();
export default gradingAPI;