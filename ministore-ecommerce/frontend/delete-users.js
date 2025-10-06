// Script to delete users with ID 2 and 7
console.log('🔍 Deleting users with ID 2 and 7...');

async function deleteUsers() {
    try {
        // First, list current users
        console.log('📋 Current users:');
        const listResponse = await fetch('http://localhost:8080/api/temp/users');
        if (listResponse.ok) {
            const users = await listResponse.text();
            console.log(users);
        } else {
            console.error('❌ Failed to list users:', listResponse.status);
        }

        // Delete users with ID 2 and 7
        console.log('\n🗑️ Deleting users with ID 2 and 7...');
        const deleteResponse = await fetch('http://localhost:8080/api/temp/users/2,7', {
            method: 'DELETE'
        });

        if (deleteResponse.ok) {
            const result = await deleteResponse.text();
            console.log('✅ Success:', result);
        } else {
            const error = await deleteResponse.text();
            console.error('❌ Failed to delete users:', deleteResponse.status, error);
        }

        // List users again to verify deletion
        console.log('\n📋 Users after deletion:');
        const finalListResponse = await fetch('http://localhost:8080/api/temp/users');
        if (finalListResponse.ok) {
            const users = await finalListResponse.text();
            console.log(users);
        } else {
            console.error('❌ Failed to list users after deletion:', finalListResponse.status);
        }

    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Run the deletion
deleteUsers();
