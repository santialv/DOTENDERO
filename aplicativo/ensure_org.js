const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rlvoybmexdylkwpbpnla.supabase.co';
const supabaseKey = 'sb_secret_LppOhCDT1ZPKyIP3unA0hA_9h1XIEoX';

const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureOrganization() {
    console.log('Checking for organization...');
    const { data: orgs, error } = await supabase.from('organizations').select('id').limit(1);

    if (error) {
        console.error('Error fetching orgs:', error);
        return;
    }

    if (!orgs || orgs.length === 0) {
        console.log('No organization found. Creating Demo Organization...');
        const { data: newOrg, error: insertError } = await supabase
            .from('organizations')
            .insert({
                name: 'Don Tendero Demo',
                nit: '900000000-1',
                plan: 'free',
                subscription_status: 'active'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating organization:', insertError);
        } else {
            console.log('Created organization:', newOrg.id);
        }
    } else {
        console.log('Organization exists:', orgs[0].id);
    }
}

ensureOrganization();
