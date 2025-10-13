'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileText, 
  Calendar, 
  Tag, 
  User, 
  Shield, 
  Search, 
  Filter,
  Download,
  Eye,
  Trash2,
  X,
  Plus
} from 'lucide-react';
import { portfolioService, type Document } from '@/lib/supabase';

interface DocumentUploadProps {
  companyId: string;
  onUploadComplete?: (document: Document) => void;
}

interface DocumentMetadata {
  document_type: string;
  as_of_date: string;
  quarter: string;
  valuation_method: string;
  prepared_by: string;
  confidentiality_level: string;
  description: string;
  tags: string[];
}

export default function DocumentUpload({ companyId, onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterQuarter, setFilterQuarter] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    document_type: '',
    as_of_date: '',
    quarter: '',
    valuation_method: '',
    prepared_by: '',
    confidentiality_level: 'internal',
    description: '',
    tags: []
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
    setShowUploadForm(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const documentData = {
          ...metadata,
          portfolio_company_id: companyId,
          uploaded_by: 'user-id' // This should come from auth context
        };
        
        const uploadedDocument = await portfolioService.uploadDocument(file, documentData);
        setDocuments(prev => [uploadedDocument, ...prev]);
        
        if (onUploadComplete) {
          onUploadComplete(uploadedDocument);
        }
        
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }
      
      setSelectedFiles([]);
      setShowUploadForm(false);
      setMetadata({
        document_type: '',
        as_of_date: '',
        quarter: '',
        valuation_method: '',
        prepared_by: '',
        confidentiality_level: 'internal',
        description: '',
        tags: []
      });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading documents. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !metadata.tags.includes(tag)) {
      setMetadata(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleRemoveTag = (tag: string) => {
    setMetadata(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || doc.document_type === filterType;
    const matchesQuarter = !filterQuarter || doc.quarter === filterQuarter;
    
    return matchesSearch && matchesType && matchesQuarter;
  });

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'investment_memo': return '📄';
      case 'financials': return '📊';
      case 'valuation_report': return '💰';
      case 'board_materials': return '👥';
      case 'legal': return '⚖️';
      default: return '📁';
    }
  };

  const getConfidentialityColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="browse">Browse Documents</TabsTrigger>
              <TabsTrigger value="search">Search & Filter</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p className="text-lg">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
                    <p className="text-sm text-gray-500">
                      Supports PDF, Excel, Word, CSV, and image files
                    </p>
                  </div>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Files ({selectedFiles.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {showUploadForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="document_type">Document Type *</Label>
                        <Select 
                          value={metadata.document_type} 
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, document_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="investment_memo">Investment Memo</SelectItem>
                            <SelectItem value="financials">Financial Statements</SelectItem>
                            <SelectItem value="valuation_report">Valuation Report</SelectItem>
                            <SelectItem value="board_materials">Board Materials</SelectItem>
                            <SelectItem value="legal">Legal Documents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="as_of_date">As of Date</Label>
                        <Input
                          id="as_of_date"
                          type="date"
                          value={metadata.as_of_date}
                          onChange={(e) => setMetadata(prev => ({ ...prev, as_of_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="quarter">Quarter</Label>
                        <Select 
                          value={metadata.quarter} 
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, quarter: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select quarter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                            <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                            <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                            <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                            <SelectItem value="Q1 2025">Q1 2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="valuation_method">Valuation Method</Label>
                        <Select 
                          value={metadata.valuation_method} 
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, valuation_method: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dcf">DCF</SelectItem>
                            <SelectItem value="market_comps">Market Comps</SelectItem>
                            <SelectItem value="revenue_multiple">Revenue Multiple</SelectItem>
                            <SelectItem value="ebitda_multiple">EBITDA Multiple</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="prepared_by">Prepared By</Label>
                        <Input
                          id="prepared_by"
                          value={metadata.prepared_by}
                          onChange={(e) => setMetadata(prev => ({ ...prev, prepared_by: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confidentiality_level">Confidentiality Level</Label>
                        <Select 
                          value={metadata.confidentiality_level} 
                          onValueChange={(value) => setMetadata(prev => ({ ...prev, confidentiality_level: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="internal">Internal</SelectItem>
                            <SelectItem value="confidential">Confidential</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the document..."
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {metadata.tags.map((tag, index) => (
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
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || !metadata.document_type}
                        className="flex-1"
                      >
                        {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload Documents'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowUploadForm(false);
                          setSelectedFiles([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="investment_memo">Investment Memo</SelectItem>
                    <SelectItem value="financials">Financials</SelectItem>
                    <SelectItem value="valuation_report">Valuation Report</SelectItem>
                    <SelectItem value="board_materials">Board Materials</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Quarters</SelectItem>
                    <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                    <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                    <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                    <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Confidentiality</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getDocumentTypeIcon(doc.document_type)}</span>
                          <div>
                            <p className="font-medium">{doc.file_name}</p>
                            {doc.description && (
                              <p className="text-sm text-gray-500">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.as_of_date || '-'}</TableCell>
                      <TableCell>{doc.quarter || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getConfidentialityColor(doc.confidentiality_level || 'internal')}>
                          {doc.confidentiality_level || 'internal'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Search Term</Label>
                  <Input
                    placeholder="Search in documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Document Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="investment_memo">Investment Memo</SelectItem>
                      <SelectItem value="financials">Financials</SelectItem>
                      <SelectItem value="valuation_report">Valuation Report</SelectItem>
                      <SelectItem value="board_materials">Board Materials</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quarter</Label>
                  <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All quarters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Quarters</SelectItem>
                      <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                      <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                      <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                      <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Advanced search and filtering capabilities</p>
                <p className="text-sm">Search by content, metadata, tags, and more</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
