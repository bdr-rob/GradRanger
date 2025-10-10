import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload } from 'lucide-react';

export default function CardScanner() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);
        await analyzeCard(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeCard = async (imageData: string) => {
    setScanning(true);
    setResults(null);
    
    try {
      // Remove data URL prefix to get base64
      const base64 = imageData.split(',')[1];
      
      const { data, error } = await supabase.functions.invoke('ai-card-scanner', {
        body: { imageBase64: base64 }
      });

      if (error) throw error;
      
      if (data?.success && data?.data) {
        setResults(data.data);
        toast({
          title: "Analysis Complete",
          description: "Card has been successfully analyzed",
        });
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Card analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze card. Please try again.",
        variant: "destructive",
      });
      // Set mock results as fallback
      setResults({
        centering: 92,
        corners: 88,
        edges: 90,
        surface: 95,
        predictedGrade: { PSA: 9, Beckett: 9.5, CGC: 9 },
        confidence: 85,
        dealScore: 4.2,
        notes: "Analysis unavailable - showing example data"
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-8 h-8 text-[#47682d]" />
        <h2 className="text-3xl font-bold text-[#14314F]">AI Card Scanner</h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="border-4 border-dashed border-[#47682d] rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
            {!uploadedImage ? (
              <label className="cursor-pointer block">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <Upload className="w-16 h-16 mx-auto mb-4 text-[#47682d]" />
                <p className="text-lg text-gray-700">Click to upload or drag & drop</p>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, HEIC</p>
              </label>
            ) : (
              <div>
                <img src={uploadedImage} alt="Uploaded card" className="max-h-96 mx-auto rounded-lg shadow-md" />
                <button 
                  onClick={() => { setUploadedImage(null); setResults(null); }}
                  className="mt-4 text-[#47682d] hover:underline"
                >
                  Upload Different Card
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          {scanning && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 animate-spin text-[#47682d] mx-auto mb-4" />
              <p className="text-lg text-gray-700">AI is analyzing your card...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
            </div>
          )}

          {results && !scanning && (
            <div className="space-y-4">
              <div className="bg-[#14314F] text-white p-4 rounded-lg">
                <h3 className="font-bold mb-2">Predicted Grades</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <span className="text-2xl font-bold text-[#47682d]">{results.predictedGrade?.PSA || 'N/A'}</span>
                    <br/>PSA
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#47682d]">{results.predictedGrade?.Beckett || 'N/A'}</span>
                    <br/>BGS
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#47682d]">{results.predictedGrade?.CGC || 'N/A'}</span>
                    <br/>CGC
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Centering</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#47682d] h-2 rounded-full"
                        style={{ width: `${results.centering}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#47682d]">{results.centering}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Corners</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#47682d] h-2 rounded-full"
                        style={{ width: `${results.corners}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#47682d]">{results.corners}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Edges</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#47682d] h-2 rounded-full"
                        style={{ width: `${results.edges}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#47682d]">{results.edges}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Surface</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#47682d] h-2 rounded-full"
                        style={{ width: `${results.surface}%` }}
                      />
                    </div>
                    <span className="font-bold text-[#47682d]">{results.surface}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">Deal Score</p>
                <p className="text-3xl font-bold text-green-600">{results.dealScore}/5</p>
                <p className="text-xs text-gray-500 mt-1">{results.confidence}% Confidence</p>
              </div>

              {results.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">{results.notes}</p>
                </div>
              )}

              {results.cardDetails && (
                <div className="text-sm text-gray-600 space-y-1">
                  {results.cardDetails.player !== 'Unknown' && (
                    <p><strong>Player:</strong> {results.cardDetails.player}</p>
                  )}
                  {results.cardDetails.year !== 'Unknown' && (
                    <p><strong>Year:</strong> {results.cardDetails.year}</p>
                  )}
                  {results.cardDetails.set !== 'Unknown' && (
                    <p><strong>Set:</strong> {results.cardDetails.set}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}