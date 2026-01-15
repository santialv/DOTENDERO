const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('.env.local not found');
            process.exit(1);
        }

        const envContent = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/"/g, '');
                env[key] = value;
            }
        });

        const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing Supabase URL or Service Role Key');
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const email = 'admin@dontendero.com';
        const password = 'admin123';

        console.log(`Setting up admin user: ${email}`);

        // Try to delete first to ensure fresh state
        // We need to find the user ID first.
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            console.log('User already exists. Updating password...');
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: password, user_metadata: { full_name: 'Don Tendero Admin' } }
            );
            if (updateError) throw updateError;
            console.log('User password updated.');
        } else {
            console.log('Creating new user...');
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: 'Don Tendero Admin'
                }
            });
            if (createError) throw createError;
            console.log('User created.');
        }

        console.log('SUCCESS: Admin user is ready.');
        console.log('Login with: admin@dontendero.com / admin123');

    } catch (err) {
        console.error('Script failed:', err);
    }
}

main();
