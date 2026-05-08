import API_BASE_URL from './config';

async function debugLoans() {
    const headers = { 
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` 
    };
    try {
      const resp = await fetch(`${API_BASE_URL}/Analytics/recent-applications`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        console.log("Recent Applications Sample:", data.slice(0, 5));
        const goldLoans = data.filter(app => app.loanType && app.loanType.toLowerCase().includes('gold'));
        console.log("Gold Loans Found:", goldLoans.length);
        if (goldLoans.length > 0) {
            console.log("First Gold Loan:", goldLoans[0]);
            console.log("Loan Type string:", `"${goldLoans[0].loanType}"`);
        }
      } else {
          console.error("Fetch failed", resp.status);
      }
    } catch (err) {
      console.error("Debug Error:", err);
    }
}

// exposing to window for easy browser console run
window.debugLoans = debugLoans;
console.log("Debug tool window.debugLoans is ready");
