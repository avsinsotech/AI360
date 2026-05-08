
const fetch = require('node-fetch');

async function test() {
    const token = 'YOUR_TEST_TOKEN'; // I need a real token or I need to bypass auth for testing
    const payload = {
        arjdarNaav: "Test Applicant",
        karjRakkam: 50000,
        shakha: "Main Branch"
    };

    try {
        const resp = await fetch('http://localhost:5202/api/PersonalLoan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
