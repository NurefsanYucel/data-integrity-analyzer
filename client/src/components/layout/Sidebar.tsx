import { LayoutDashboard, Upload, Database, FileText } from "lucide-react";

const items = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Upload, label: "Upload" },
  { icon: Database, label: "Datasets" },
  { icon: FileText, label: "Reports" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white">
      <div className="p-6 text-xl font-bold">
        📊 Data Integrity
      </div>

      <nav className="space-y-2 p-3">
        {items.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 hover:bg-slate-100"
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}