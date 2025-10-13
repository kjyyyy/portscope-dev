// components/ui/CompanyForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Building2, DollarSign, Users, TrendingUp } from 'lucide-react';
import { portfolioService, type Contact } from '@/lib/supabase';

interface CompanyFormData {
  // Basic Information
  company_name: string;
  legal_entity_name: string;
  headquarters: string;
  website: string;
  
  // Investment Details
  sector: string;
  subsector: string;
  investment_theme: string;
  stage: string;
  ownership_percentage: number;
  investment_type: string;
  
  // Investment Timeline
  initial_investment_date: string;
  latest_valuation_date: string;
  deal_lead: string;
  board_representative: string;
  
  // Financial Metrics
  initial_investment_amount: number;
  total_invested: number;
  current_fair_value: number;
  realized_value: number;
  nav_percentage: number;
  valuation_method: string;
  revenue: number;
  ebitda: number;
  leverage_ratio: number;
  
  // Performance Metrics
  irr: number;
  moic: number;
  dpi: number;
  quarterly_growth_rate: number;
  headcount: number;
  esg_score: number;
  
  // Additional
  tags: string[];
  notes: string;
}

export default function CompanyForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [showContactForm, setShowContactForm] = useState(false);
  
  const [formData, setFormData] = useState<CompanyFormData>({
    company_name: '',
    legal_entity_name: '',
    headquarters: '',
    website: '',
    sector: '',
    subsector: '',
    investment_theme: '',
    stage: '',
    ownership_percentage: 0,
    investment_type: '',
    initial_investment_date: '',
    latest_valuation_date: '',
    deal_lead: '',
    board_representative: '',
    initial_investment_amount: 0,
    total_invested: 0,
    current_fair_value: 0,
    realized_value: 0,
    nav_percentage: 0,
    valuation_method: '',
    revenue: 0,
    ebitda: 0,
    leverage_ratio: 0,
    irr: 0,
    moic: 0,
    dpi: 0,
    quarterly_growth_rate: 0,
    headcount: 0,
    esg_score: 0,
    tags: [],
    notes: ''
  });

  const handleInputChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddContact = () => {
    if (newContact.name) {
      setContacts(prev => [...prev, newContact as Contact]);
      setNewContact({});
      setShowContactForm(false);
    }
  };

  const handleRemoveContact = (index: number) => {
    setContacts(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const companyData = {
        ...formData,
        key_contacts: contacts,
        created_by: 'user-id' // This should come from auth context
      };
      
      await portfolioService.createCompany(companyData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: Building2 },
    { id: 2, title: 'Investment Details', icon: DollarSign },
    { id: 3, title: 'Financial Metrics', icon: TrendingUp },
    { id: 4, title: 'Contacts & Notes', icon: Users }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Onboard New Portfolio Company</CardTitle>
          <p className="text-muted-foreground">Complete the form to add a new company to your portfolio</p>
        </CardHeader>
        
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-blue-600 bg-blue-600 text-white' :
                    isCompleted ? 'border-green-600 bg-green-600 text-white' :
                    'border-gray-300 bg-white text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="1">Basic Info</TabsTrigger>
                <TabsTrigger value="2">Investment</TabsTrigger>
                <TabsTrigger value="3">Financials</TabsTrigger>
                <TabsTrigger value="4">Contacts</TabsTrigger>
              </TabsList>

              {/* Step 1: Basic Information */}
              <TabsContent value="1" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange('company_name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="legal_entity_name">Legal Entity Name</Label>
                    <Input
                      id="legal_entity_name"
                      value={formData.legal_entity_name}
                      onChange={(e) => handleInputChange('legal_entity_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="financial_services">Financial Services</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="consumer">Consumer</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subsector">Subsector</Label>
                    <Input
                      id="subsector"
                      value={formData.subsector}
                      onChange={(e) => handleInputChange('subsector', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="investment_theme">Investment Theme</Label>
                  <Textarea
                    id="investment_theme"
                    value={formData.investment_theme}
                    onChange={(e) => handleInputChange('investment_theme', e.target.value)}
                    placeholder="Describe the investment thesis and key themes..."
                  />
                </div>
              </TabsContent>

              {/* Step 2: Investment Details */}
              <TabsContent value="2" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="stage">Investment Stage</Label>
                    <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series_a">Series A</SelectItem>
                        <SelectItem value="series_b">Series B</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="late_stage">Late Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="investment_type">Investment Type</Label>
                    <Select value={formData.investment_type} onValueChange={(value) => handleInputChange('investment_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="debt">Debt</SelectItem>
                        <SelectItem value="convertible">Convertible</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ownership_percentage">Ownership %</Label>
                    <Input
                      id="ownership_percentage"
                      type="number"
                      step="0.01"
                      value={formData.ownership_percentage}
                      onChange={(e) => handleInputChange('ownership_percentage', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="initial_investment_date">Initial Investment Date</Label>
                    <Input
                      id="initial_investment_date"
                      type="date"
                      value={formData.initial_investment_date}
                      onChange={(e) => handleInputChange('initial_investment_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="latest_valuation_date">Latest Valuation Date</Label>
                    <Input
                      id="latest_valuation_date"
                      type="date"
                      value={formData.latest_valuation_date}
                      onChange={(e) => handleInputChange('latest_valuation_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deal_lead">Deal Lead</Label>
                    <Input
                      id="deal_lead"
                      value={formData.deal_lead}
                      onChange={(e) => handleInputChange('deal_lead', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="board_representative">Board Representative</Label>
                    <Input
                      id="board_representative"
                      value={formData.board_representative}
                      onChange={(e) => handleInputChange('board_representative', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Step 3: Financial Metrics */}
              <TabsContent value="3" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="initial_investment_amount">Initial Investment Amount ($)</Label>
                    <Input
                      id="initial_investment_amount"
                      type="number"
                      step="0.01"
                      value={formData.initial_investment_amount}
                      onChange={(e) => handleInputChange('initial_investment_amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_invested">Total Invested ($)</Label>
                    <Input
                      id="total_invested"
                      type="number"
                      step="0.01"
                      value={formData.total_invested}
                      onChange={(e) => handleInputChange('total_invested', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_fair_value">Current Fair Value ($)</Label>
                    <Input
                      id="current_fair_value"
                      type="number"
                      step="0.01"
                      value={formData.current_fair_value}
                      onChange={(e) => handleInputChange('current_fair_value', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="realized_value">Realized Value ($)</Label>
                    <Input
                      id="realized_value"
                      type="number"
                      step="0.01"
                      value={formData.realized_value}
                      onChange={(e) => handleInputChange('realized_value', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue">Revenue ($)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      step="0.01"
                      value={formData.revenue}
                      onChange={(e) => handleInputChange('revenue', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ebitda">EBITDA ($)</Label>
                    <Input
                      id="ebitda"
                      type="number"
                      step="0.01"
                      value={formData.ebitda}
                      onChange={(e) => handleInputChange('ebitda', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="irr">IRR (%)</Label>
                    <Input
                      id="irr"
                      type="number"
                      step="0.01"
                      value={formData.irr}
                      onChange={(e) => handleInputChange('irr', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moic">MOIC</Label>
                    <Input
                      id="moic"
                      type="number"
                      step="0.01"
                      value={formData.moic}
                      onChange={(e) => handleInputChange('moic', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="headcount">Headcount</Label>
                    <Input
                      id="headcount"
                      type="number"
                      value={formData.headcount}
                      onChange={(e) => handleInputChange('headcount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="esg_score">ESG Score (0-100)</Label>
                    <Input
                      id="esg_score"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.esg_score}
                      onChange={(e) => handleInputChange('esg_score', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Step 4: Contacts & Notes */}
              <TabsContent value="4" className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Key Contacts</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContactForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Contact
                    </Button>
                  </div>
                  
                  {contacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded mb-2">
                    <div>
                      <span className="font-medium">{contact.name}</span>
                      {contact.title && <span className="text-sm text-muted-foreground ml-2">({contact.title})</span>}
                      <span className="text-sm text-muted-foreground ml-2 capitalize">{contact.role}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveContact(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  ))}
                  
                  {showContactForm && (
                    <Card className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newContact.name || ''}
                            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={newContact.title || ''}
                            onChange={(e) => setNewContact(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={newContact.email || ''}
                            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newContact.phone || ''}
                            onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Select value={newContact.role || ''} onValueChange={(value) => setNewContact(prev => ({ ...prev, role: value as any }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ceo">CEO</SelectItem>
                              <SelectItem value="cfo">CFO</SelectItem>
                              <SelectItem value="board_member">Board Member</SelectItem>
                              <SelectItem value="key_employee">Key Employee</SelectItem>
                              <SelectItem value="advisor">Advisor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button type="button" onClick={handleAddContact}>Add Contact</Button>
                        <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>Cancel</Button>
                      </div>
                    </Card>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tag = e.currentTarget.value.trim();
                        if (tag) {
                          handleAddTag(tag);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about the company..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <div className="flex gap-2">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating Company...' : 'Create Company'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
