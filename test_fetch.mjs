const secret = 'donna-bot-secret-2026-cambiar-en-produccion';
const url = 'https://cesar-crm.onrender.com/api/health';

console.log('--- FETCH TEST START ---');
console.log('URL:', url);
console.log('Secret:', secret);

try {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${secret}`
        }
    });

    console.log('Status Code:', response.status);
    console.log('Status Text:', response.statusText);
    const text = await response.text();
    console.log('Response Body:', text);
} catch (error) {
    console.error('Fetch Error:', error);
}
console.log('--- FETCH TEST END ---');
