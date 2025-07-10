import Link from 'next/link';

export default function CompaniesPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Portfolio Companies</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/companies/tesla" className="text-blue-600 hover:underline">
            Tesla Inc.
          </Link>
        </li>
        <li>
          <Link href="/companies/spacex" className="text-blue-600 hover:underline">
            SpaceX
          </Link>
        </li>
      </ul>
      <div className="mt-6">
        <Link href="/companies/new" className="bg-green-600 text-white px-4 py-2 rounded">
          Add New Company
        </Link>
      </div>
    </div>
  );
}