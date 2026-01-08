import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
    collapsed: boolean;
}

export function NavItem({ href, icon, label, collapsed }: NavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium relative overflow-hidden group ${isActive
                ? 'bg-[#13ec80]/10 text-[#0eb562]'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : ''}
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#13ec80] rounded-r-full"></div>}
            <span className={`material-symbols-outlined transition-colors ${isActive ? 'fill-1' : 'group-hover:text-[#0eb562]'}`}>{icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
        </Link>
    );
}
