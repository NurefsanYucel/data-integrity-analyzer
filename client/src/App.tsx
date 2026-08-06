export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-10 w-[700px]">
        <h1 className="text-4xl font-bold text-slate-900">
          📊 Data Integrity Analyzer
        </h1>

        <p className="mt-4 text-slate-600">
          Welcome to your portfolio project.
        </p>

        <button className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Upload CSV
        </button>
      </div>
    </main>
  );
}