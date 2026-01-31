"use client";
import Link from "next/link";

interface FooterProps {
    dark?: boolean;
}

export function Footer({ dark = true }: FooterProps) {
    return (
        <footer className={`w-full py-12 border-t ${dark ? 'border-[#234836] bg-[#102219]' : 'border-gray-100 bg-gray-50'}`}>
            <div className="w-full max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-background-dark font-black text-sm">storefront</span>
                            </div>
                            <span className={`font-black text-lg tracking-tighter ${dark ? 'text-white' : 'text-slate-900'}`}>DonTendero</span>
                        </Link>
                        <p className={`text-sm max-w-xs leading-relaxed ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Empoderando a los tenderos de Colombia con tecnología de clase mundial para el control de sus negocios.
                        </p>
                    </div>

                    <div>
                        <h4 className={`font-bold text-sm uppercase tracking-widest mb-6 ${dark ? 'text-white' : 'text-slate-900'}`}>Producto</h4>
                        <ul className="space-y-4">
                            <li><Link href="/beneficios" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Beneficios</Link></li>
                            <li><Link href="/asesoria" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Asesoría Financiera</Link></li>
                            <li><Link href="/planes" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Planes y Precios</Link></li>
                            <li><a href="https://dontendero.com/register" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Crear Cuenta</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={`font-bold text-sm uppercase tracking-widest mb-6 ${dark ? 'text-white' : 'text-slate-900'}`}>Ayuda</h4>
                        <ul className="space-y-4">
                            <li><a href="https://wa.me/573107146415" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Soporte WhatsApp</a></li>
                            <li><Link href="/planes#faq" className={`${dark ? 'text-gray-400 hover:text-primary' : 'text-gray-500 hover:text-primary'} text-sm transition-colors`}>Preguntas Frecuentes</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={`pt-8 border-t ${dark ? 'border-[#234836]' : 'border-gray-200'} flex flex-col md:flex-row items-center justify-between gap-4`}>
                    <p className="text-gray-500 text-xs">
                        © 2026 DonTendero. Hecho con <span className="text-red-500">❤</span> para Colombia.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-500 hover:text-primary transition-colors text-xs uppercase font-bold tracking-widest">Privacidad</a>
                        <a href="#" className="text-gray-500 hover:text-primary transition-colors text-xs uppercase font-bold tracking-widest">Términos</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
