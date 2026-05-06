
async function testLogin() {
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@foodstore.vn',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User Role:', data.user.role);
    } else {
      console.log('❌ Login failed!');
      console.log('Status:', response.status);
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('❌ Error Message:', error.message);
  }
}

testLogin();
