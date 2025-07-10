import Link from 'next/link';
import { BadgeDollarSign, BarChart, Settings, LogOut } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: BarChart },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: BadgeDollarSign },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function SidebarNav() {
  return (
    <aside className="w-64 bg-white border-r p-4 space-y-6">
      <h2 className="text-lg font-bold">PortScope</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 text-sm hover:text-primary">
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <button className="flex items-center gap-2 text-sm text-red-500 mt-auto">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </aside>
  );
}