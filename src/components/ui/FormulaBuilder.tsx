'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Plus, Save, Code, FileSpreadsheet, Upload, Download, Grid3X3, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { portfolioService } from "@/lib/supabase";

const formulaTemplates = [
  { name: "IRR", formula: "=IRR(cashflows, [guess])", description: "Internal Rate of Return" },
  { name: "NPV", formula: "=NPV(rate, cashflows)", description: "Net Present Value" },
  { name: "XIRR", formula: "=XIRR(values, dates)", description: "Irregular IRR" },
  { name: "MOIC", formula: "=SUM(distributions)/SUM(contributions)", description: "Multiple on Invested Capital" }
];

export default function FormulaBuilder() {
  const [selectedFormula, setSelectedFormula] = useState("");
  const [formulaName, setFormulaName] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [savedFormulas, setSavedFormulas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("formula");
  const [excelData, setExcelData] = useState<Array<Array<string>>>([]);
  const [selectedCell, setSelectedCell] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, url: string, size: number}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const demoMode = document.cookie.includes('demoMode=true');
    setIsDemoMode(demoMode);
    
    // Initialize Excel-like grid
    if (excelData.length === 0) {
      setExcelData(Array(10).fill(null).map(() => Array(6).fill("")));
    }
  }, []);

  const handleNewFormula = () => {
    setFormulaName("");
    setSelectedFormula("");
    setActiveTab("formula");
  };

  const handleSaveFormula = () => {
    if (formulaName && selectedFormula) {
      setSavedFormulas(prev => [...prev, `${formulaName}: ${selectedFormula}`]);
      if (isDemoMode) {
        alert(`Demo Mode: Formula "${formulaName}" saved successfully!`);
      }
      setFormulaName("");
      setSelectedFormula("");
    }
  };

  const handleTestFormula = () => {
    if (selectedFormula) {
      if (isDemoMode) {
        alert(`Demo Mode: Testing formula "${selectedFormula}"\n\nResult: Formula syntax is valid!`);
      } else {
        console.log('Testing formula:', selectedFormula);
      }
    }
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    const newData = [...excelData];
    newData[row][col] = value;
    setExcelData(newData);
  };

  const getColumnLetter = (col: number) => {
    return String.fromCharCode(65 + col);
  };

  const getCellReference = (row: number, col: number) => {
    return `${getColumnLetter(col)}${row + 1}`;
  };

  const insertCellReference = (cellRef: string) => {
    setSelectedFormula(prev => prev + cellRef);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const allowedTypes = [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
          'application/csv'
        ];
        
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const allowedExtensions = ['xls', 'xlsx', 'csv'];
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
          throw new Error(`Unsupported file type: ${file.name}. Please upload .xls, .xlsx, or .csv files.`);
        }

        // Create a mock company ID for formula builder uploads
        const mockCompanyId = 'formula-builder-' + Date.now();
        
        // Upload to Supabase
        const documentData = {
          portfolio_company_id: mockCompanyId,
          file: file,
          document_type: 'financial_model' as const,
          as_of_date: new Date().toISOString().split('T')[0],
          description: `Formula Builder Upload: ${file.name}`,
          confidentiality_level: 'internal' as const,
          prepared_by: 'formula-builder-user',
          tags: ['formula-builder', 'excel-import']
        };

        const uploadedDocument = await portfolioService.uploadDocument(file, documentData);
        
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          url: uploadedDocument.file_url,
          size: file.size
        }]);

        // Parse CSV/Excel data if possible
        if (file.type === 'text/csv' || fileExtension === 'csv') {
          const text = await file.text();
          const rows = text.split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/"/g, '')));
          setExcelData(rows.slice(0, 10).map(row => [...row, ...Array(6 - row.length).fill('')]));
        }
      }
      
      if (isDemoMode) {
        alert(`Demo Mode: ${files.length} file(s) uploaded successfully to Supabase!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportClick = () => {
    if (isDemoMode) {
      alert('Demo Mode: Export functionality would download the current spreadsheet data as Excel file.');
      return;
    }
    
    // TODO: Implement actual Excel export
    console.log('Exporting Excel data:', excelData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Formula Builder
          {isDemoMode && (
            <Badge variant="secondary" className="ml-auto">
              Demo Mode
            </Badge>
          )}
          <Button variant="outline" size="sm" className="ml-auto" onClick={handleNewFormula}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="formula">Formula Builder</TabsTrigger>
            <TabsTrigger value="excel">Excel Interface</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="formula" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Formula Name</label>
              <Input 
                placeholder="e.g., Portfolio IRR Q3 2024"
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Formula</label>
              <div className="relative">
                <Textarea 
                  placeholder="Enter your formula here..."
                  value={selectedFormula}
                  onChange={(e) => setSelectedFormula(e.target.value)}
                  className="font-mono text-sm h-20 resize-none"
                />
                <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                  {selectedFormula.length} chars
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveFormula}>
                <Save className="h-4 w-4 mr-2" />
                Save Formula
              </Button>
              <Button variant="outline" onClick={handleTestFormula}>
                <Code className="h-4 w-4 mr-2" />
                Test
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Excel-like Interface</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleImportClick}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {isUploading ? 'Uploading...' : 'Import Excel'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportClick}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">
                <Grid3X3 className="h-4 w-4 inline mr-2" />
                Spreadsheet Grid
              </div>
              <div className="overflow-auto max-h-96">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="w-12 h-8 border border-border text-xs"></th>
                      {Array.from({ length: 6 }, (_, i) => (
                        <th key={i} className="w-20 h-8 border border-border text-xs font-medium">
                          {getColumnLetter(i)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td className="w-12 h-8 border border-border text-xs text-center font-medium bg-muted">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="w-20 h-8 border border-border">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                              className="w-full h-full px-1 text-xs border-0 focus:ring-1 focus:ring-blue-500"
                              placeholder={getCellReference(rowIndex, colIndex)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => insertCellReference(getColumnLetter(i) + "1")}
                  className="text-xs"
                >
                  {getColumnLetter(i)}1
                </Button>
              ))}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload status and error display */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{uploadError}</span>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Uploaded Files:</h4>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <span className="text-green-700">{file.name}</span>
                        <span className="text-green-600">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                        className="text-green-600 hover:text-green-700"
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Formula Templates</label>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {formulaTemplates.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    onClick={() => setSelectedFormula(template.formula)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {isDemoMode && savedFormulas.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Saved Formulas:</h4>
                <div className="space-y-1">
                  {savedFormulas.map((formula, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {formula}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 