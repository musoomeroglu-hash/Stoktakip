// Face ID / Biyometrik kimlik kaydı
export async function registerBiometric(userId: string): Promise<boolean> {
    try {
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                rp: { name: 'Stok Takip', id: window.location.hostname },
                user: {
                    id: new TextEncoder().encode(userId),
                    name: userId,
                    displayName: 'Kullanıcı',
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                authenticatorSelection: {
                    authenticatorAttachment: 'platform', // Face ID / Touch ID
                    userVerification: 'required',
                },
                timeout: 60000,
            },
        });

        if (credential) {
            localStorage.setItem('biometric_registered', 'true');
            localStorage.setItem('biometric_user_id', userId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Biyometrik kayıt hatası:', error);
        return false;
    }
}

// Face ID ile doğrulama
export async function authenticateWithBiometric(): Promise<boolean> {
    try {
        const credential = await navigator.credentials.get({
            publicKey: {
                challenge: crypto.getRandomValues(new Uint8Array(32)),
                timeout: 60000,
                userVerification: 'required',
                rpId: window.location.hostname,
            },
        });

        return !!credential;
    } catch (error) {
        console.error('Biyometrik doğrulama hatası:', error);
        return false;
    }
}

// WebAuthn desteklenip desteklenmediğini kontrol et
export function isBiometricAvailable(): boolean {
    return (
        typeof window !== 'undefined' &&
        window.PublicKeyCredential !== undefined &&
        typeof window.PublicKeyCredential === 'function'
    );
}

export function isBiometricRegistered(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem('biometric_registered') === 'true';
}
