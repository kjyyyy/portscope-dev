export default function NewCompanyPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add New Portfolio Company</h1>
      <form className="space-y-4">
        <input className="w-full border p-2" type="text" placeholder="Company Name" />
        <input className="w-full border p-2" type="text" placeholder="Fund Name" />
        <input className="w-full border p-2" type="text" placeholder="Manager(s)" />
        <textarea className="w-full border p-2" placeholder="Notes" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Create Company
        </button>
      </form>
    </div>
  );
}
