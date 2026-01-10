import { supabase } from "@/lib/supabase";

// Force dynamic rendering so it fetches fresh data
export const dynamic = 'force-dynamic';

export default async function TerminosPage() {
    // Fetch data server-side
    const { data } = await supabase
        .from('platform_config')
        .select('terms_and_conditions')
        .eq('id', 1)
        .single();

    // Default text if DB is empty or fails
    const content = data?.terms_and_conditions || "Los términos y condiciones se encuentran en actualización. Por favor contacte a soporte.";

    return (
        <article className="prose prose-slate lg:prose-lg max-w-none">
            <h1 className="text-3xl font-black mb-8">Términos y Condiciones</h1>
            <div className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">
                {content}
            </div>
        </article>
    );
}
