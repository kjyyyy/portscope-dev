// components/ui/CompanyForm.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function CompanyForm() {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [founded, setFounded] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('sector', sector);
    formData.append('founded', founded);
    formData.append('description', description);
    if (logo) formData.append('logo', logo);

    await fetch('/api/companies', {
      method: 'POST',
      body: formData,
    });

    alert('Company onboarded!');
  };

  return (
    <Card className="max-w-2xl mx-auto p-4">
      <CardHeader>
        <h2 className="text-xl font-semibold">Onboard New Portfolio Company</h2>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Sector</Label>
            <Input value={sector} onChange={(e) => setSector(e.target.value)} />
          </div>
          <div>
            <Label>Year Founded</Label>
            <Input type="number" value={founded} onChange={(e) => setFounded(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Logo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Submit</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
