import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function PrivacidadPage() {
    const { data } = await supabase
        .from('platform_config')
        .select('privacy_policy')
        .eq('id', 1)
        .single();

    const content = data?.privacy_policy || "La política de privacidad se encuentra en actualización.";

    return (
        <article className="prose prose-slate lg:prose-lg max-w-none">
            <h1 className="text-3xl font-black mb-8">Política de Privacidad</h1>
            <div className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">
                {content}
            </div>
        </article>
    );
}
