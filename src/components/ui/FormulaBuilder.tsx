'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, Plus, Save, Code } from "lucide-react";
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

  useEffect(() => {
    const demoMode = localStorage.getItem('demoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

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
        // TODO: Implement actual formula testing
        console.log('Testing formula:', selectedFormula);
      }
    }
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Formula Builder
          {isDemoMode && (
            <Badge variant="secondary" className="ml-auto">
              Demo Mode
            </Badge>
          )}
          <Button variant="outline" size="sm" className="ml-auto">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Formula Templates</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {formulaTemplates.map((template) => (
              <Button
                key={template.name}
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormula(template.formula)}
                className="justify-start h-auto p-2"
              >
                <div className="text-left">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

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
          <Textarea 
            placeholder="Enter your formula here..."
            value={selectedFormula}
            onChange={(e) => setSelectedFormula(e.target.value)}
            className="font-mono text-sm"
          />
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

        {isDemoMode && savedFormulas.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Demo Saved Formulas:</h4>
            <div className="space-y-1">
              {savedFormulas.map((formula, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {formula}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 