// src/app/companies/[slug]/edit/page.tsx
import { notFound } from 'next/navigation';
import React from 'react';

const mockCompanies: Record<string, {
  name: string;
  fund: string;
  managers: string[];
}> = {
  tesla: {
    name: "Tesla Inc.",
    fund: "Growth Fund II",
    managers: ["Elon Musk", "Jane Doe"],
  },
  spacex: {
    name: "SpaceX",
    fund: "Innovation Fund I",
    managers: ["Elon Musk", "John Smith"],
  },
};

export default async function EditCompanyPage({ params }: { params: { slug: string } }) {
  const company = mockCompanies[params.slug];

  if (!company) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit: {company.name}</h1>
      <p className="mb-2"><strong>Fund:</strong> {company.fund}</p>
      <p className="mb-2"><strong>Managers:</strong> {company.managers.join(', ')}</p>

      <form className="mt-4 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Company Name"
          defaultValue={company.name}
          className="border p-2"
        />
        <input
          type="text"
          placeholder="Fund"
          defaultValue={company.fund}
          className="border p-2"
        />
        <textarea
          placeholder="Manager Notes"
          className="border p-2"
        ></textarea>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
