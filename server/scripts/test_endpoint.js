
const axios = require('axios');

async function testEndpoint() {
    try {
        const response = await axios.post('http://localhost:5000/api/rental/products/generate-kit', {
            description: "musical show for 100 audience"
        }, {
            headers: {
                // I need a JWT token if it's protected
                'Authorization': 'Bearer ...' // Wait, I don't have a token
            }
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.log("Status:", err.response?.status);
        console.log("Data:", JSON.stringify(err.response?.data, null, 2));
    }
}

testEndpoint();
