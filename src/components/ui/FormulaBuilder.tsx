'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Plus, Save, Code, FileSpreadsheet, Upload, Download, Grid3X3 } from "lucide-react";
import { useState, useEffect } from "react";

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
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" />
                  Import Excel
                </Button>
                <Button variant="outline" size="sm">
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