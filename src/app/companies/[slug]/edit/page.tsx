import { notFound } from 'next/navigation';

const mockCompanies: Record<
  string,
  { name: string; fund: string; managers: string[] }
> = {
  tesla: {
    name: 'Tesla Inc.',
    fund: 'Growth Fund II',
    managers: ['Elon Musk', 'Jane Doe'],
  },
  spacex: {
    name: 'SpaceX',
    fund: 'Innovation Fund I',
    managers: ['Elon Musk', 'John Smith'],
  },
};

export default function EditCompanyPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug.toLowerCase(); // safer against case mismatch
  const company = mockCompanies[slug];

  if (!company) return notFound();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit: {company.name}</h1>
      <form className="space-y-4">
        <input
          className="w-full border p-2"
          type="text"
          defaultValue={company.name}
          placeholder="Company Name"
        />
        <input
          className="w-full border p-2"
          type="text"
          defaultValue={company.fund}
          placeholder="Fund"
        />
        <input
          className="w-full border p-2"
          type="text"
          defaultValue={company.managers.join(', ')}
          placeholder="Managers"
        />
        <textarea className="w-full border p-2" placeholder="Notes" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}
