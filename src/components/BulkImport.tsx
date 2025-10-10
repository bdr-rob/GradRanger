import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Download, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ImportError {
  row?: number;
  error: string;
}

export function BulkImport({ onImportComplete }: { onImportComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = `player,year,set,card_number,grade,grading_company,purchase_price,purchase_date,quantity,notes
"Michael Jordan","1986","Fleer","57","9","PSA","5000","2024-01-15","1","Rookie Card"
"LeBron James","2003","Topps Chrome","111","10","BGS","3500","2024-02-20","1","Refractor"
"Ken Griffey Jr","1989","Upper Deck","1","9.5","BGS","1200","2024-03-10","2","Rookie"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const cards = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
      const card: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, '') || '';
        card[header] = value;
      });

      if (card.player || card.year || card.set) {
        cards.push(card);
      }
    }

    return cards;
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV file',
        variant: 'destructive'
      });
      return;
    }

    setIsImporting(true);
    setErrors([]);
    setProgress(0);
    setImportResults(null);

    try {
      const text = await file.text();
      const cards = parseCSV(text);

      if (cards.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      setProgress(25);

      const { data, error } = await supabase.functions.invoke('bulk-import-cards', {
        body: { cards, source: 'csv' }
      });

      if (error) throw error;

      setProgress(100);
      setImportResults(data);

      if (data.errors && data.errors.length > 0) {
        setErrors(data.errors);
      }

      toast({
        title: 'Import completed',
        description: `Successfully imported ${data.imported} of ${data.total} cards`,
        variant: data.imported === data.total ? 'default' : 'destructive'
      });

      if (data.imported > 0) {
        onImportComplete();
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error.message,
        variant: 'destructive'
      });
      setErrors([{ error: error.message }]);
    } finally {
      setIsImporting(false);
    }
  }, [onImportComplete, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Cards</CardTitle>
        <CardDescription>
          Import multiple cards at once from CSV files or external databases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="csv">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
            <TabsTrigger value="database">External Database</TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <span className="text-lg font-medium">Drop CSV file here or click to browse</span>
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-muted-foreground">
                  Maximum 1000 cards per import
                </p>
              </div>
            </div>

            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Importing cards and looking up values...
                </p>
              </div>
            )}

            {importResults && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully imported {importResults.imported} of {importResults.total} cards
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p>Import errors:</p>
                    <ul className="text-sm list-disc pl-5">
                      {errors.slice(0, 5).map((error, i) => (
                        <li key={i}>
                          {error.row ? `Row ${error.row}: ` : ''}{error.error}
                        </li>
                      ))}
                      {errors.length > 5 && (
                        <li>...and {errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                Connect to popular card databases to import your collection automatically
              </AlertDescription>
            </Alert>

            <div className="grid gap-4">
              <Button variant="outline" className="justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                COMC Portfolio (Coming Soon)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                TCDB Collection (Coming Soon)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <FileText className="mr-2 h-4 w-4" />
                PSA Set Registry (Coming Soon)
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}