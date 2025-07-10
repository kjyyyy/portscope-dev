import { notFound } from 'next/navigation';

const mockCompanies: Record<
  string,
  {
    name: string;
    fund: string;
    valuation: string;
    managers: string[];
  }
> = {
  tesla: {
    name: 'Tesla Inc.',
    fund: 'Growth Fund II',
    valuation: '$780M',
    managers: ['Elon Musk', 'Jane Doe'],
  },
  spacex: {
    name: 'SpaceX',
    fund: 'Innovation Fund I',
    valuation: '$900M',
    managers: ['Elon Musk', 'John Smith'],
  },
};

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const slug = params.slug.toLowerCase(); // Optional: normalize slug for safety
  const company = mockCompanies[slug];

  if (!company) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{company.name}</h1>
      <p className="mt-2 text-gray-700">Fund: {company.fund}</p>
      <p className="mt-1 text-gray-700">Valuation: {company.valuation}</p>
      <p className="mt-1 text-gray-700">Managers: {company.managers.join(', ')}</p>
    </div>
  );
}
