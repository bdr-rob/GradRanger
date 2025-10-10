import { AIGradingResult } from '@/types';

class CardGradingAI {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  }

  /**
   * Analyze card image and predict grade
   */
  async analyzeCard(imageFile: File): Promise<AIGradingResult> {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);

      // Call OpenAI Vision API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(),
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this sports card and provide a detailed grading assessment.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);

      return this.formatGradingResult(analysis);
    } catch (error) {
      console.error('Card grading error:', error);
      throw error;
    }
  }

  /**
   * System prompt for AI grading
   */
  private getSystemPrompt(): string {
    return `You are an expert sports card grader with deep knowledge of PSA, BGS, and CGC grading standards.

Analyze the card image and provide a detailed assessment in JSON format:

{
  "predictedGrade": <number 1-10>,
  "confidence": <number 0-1>,
  "centering": {
    "score": <number 1-10>,
    "leftRight": "<percentage>/<percentage>",
    "topBottom": "<percentage>/<percentage>"
  },
  "corners": {
    "score": <number 1-10>,
    "issues": ["<issue1>", "<issue2>"]
  },
  "edges": {
    "score": <number 1-10>,
    "issues": ["<issue1>", "<issue2>"]
  },
  "surface": {
    "score": <number 1-10>,
    "issues": ["<issue1>", "<issue2>"]
  },
  "overallAnalysis": "<detailed analysis>",
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "imageQuality": "<excellent|good|fair|poor>"
}

Grading criteria:
- Centering: 60/40 or better for PSA 10, 55/45 for PSA 9
- Corners: Sharp, no wear for PSA 10
- Edges: No chipping, whitening, or wear
- Surface: No scratches, print defects, or staining`;
  }

  /**
   * Format AI response to AIGradingResult
   */
  private formatGradingResult(analysis: any): AIGradingResult {
    return {
      predictedGrade: analysis.predictedGrade,
      confidence: analysis.confidence,
      centering: analysis.centering,
      corners: analysis.corners,
      edges: analysis.edges,
      surface: analysis.surface,
      overallAnalysis: analysis.overallAnalysis,
      recommendations: analysis.recommendations,
      imageQuality: analysis.imageQuality,
    };
  }

  /**
   * Convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }
}

export const cardGradingAI = new CardGradingAI();
export default cardGradingAI;