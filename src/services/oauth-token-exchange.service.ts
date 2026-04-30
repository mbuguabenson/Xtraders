export const exchangeCodeForToken = async (code: string) => {
    const codeVerifier = sessionStorage.getItem('oauth_code_verifier');
    if (!codeVerifier) {
        console.error('No code verifier found in session storage.');
        return null;
    }

    const clientId = process.env.CLIENT_ID || '121856';
    const redirectUrl = process.env.REDIRECT_URI || `${window.location.origin}/`;
    
    // Check if hostname implies production
    const isProd = !/^staging\./.test(window.location.hostname) && window.location.hostname.includes('deriv.com');
    const tokenEndpoint = isProd ? 'https://auth.deriv.com/oauth2/token' : 'https://staging-auth.deriv.com/oauth2/token';

    const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId as string,
        redirect_uri: redirectUrl,
        code_verifier: codeVerifier,
    });

    try {
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: requestBody.toString(),
        });

        const data = await response.json();
        if (data.access_token) {
            sessionStorage.setItem('auth_info', JSON.stringify(data));
            sessionStorage.removeItem('oauth_code_verifier');
        } else {
            console.error('Token exchange failed:', data);
        }
        
        return data;
    } catch (err) {
        console.error('Network error during token exchange:', err);
        return null;
    }
};
