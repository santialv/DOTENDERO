const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createOrganizationForUser(email, storeName) {
    try {
        // 1. Get User ID
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

        if (userError) throw userError;

        const user = users.find(u => u.email === email);

        if (!user) {
            console.error(`User with email ${email} not found.`);
            return;
        }

        console.log(`User found: ${user.id}`);

        // 2. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: storeName,
                email: email,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error creating organization:', orgError);
            return;
        }

        console.log(`Organization created: ${org.id} (${org.name})`);

        // 3. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ organization_id: org.id })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            return;
        }

        console.log(`Successfully linked organization to user ${email}`);

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

const args = process.argv.slice(2);
const email = args[0] || 'admin@dontendero.com';
const storeName = args[1] || 'Admin Store';

createOrganizationForUser(email, storeName);
