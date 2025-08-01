
      document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('url-input');
    const shortenBtn = document.getElementById('shorten-btn');
    const resultContainer = document.querySelector('.result-container');
    const originalUrlText = document.getElementById('original-url-text');
    const shortenedUrl = document.getElementById('shortened-url');
    const copyBtn = document.getElementById('copy-btn');
    const shareBtns = document.querySelectorAll('.share-btn');
    const qrBtn = document.getElementById('qr-btn');
    const qrModal = document.querySelector('.qr-modal');
    const closeBtn = document.querySelector('.close-btn');
    const qrCode = document.getElementById('qr-code');
    const downloadPng = document.getElementById('download-png');
    const downloadSvg = document.getElementById('download-svg');
    const notification = document.querySelector('.notification');

    // API Configuration
    const API_URL = 'https://url-shortener-service.p.rapidapi.com/shorten';
    const API_KEY = '5432b8c48dmsh8788b7ecc760657p1563c6jsn15fe60d22fd7';
    const API_HOST = 'url-shortener-service.p.rapidapi.com';

    // Shorten URL function
    async function shortenUrl(longUrl) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-rapidapi-host': API_HOST,
                    'x-rapidapi-key': API_KEY
                },
                body: `url=${encodeURIComponent(longUrl)}`
            });

            if (!response.ok) {
                throw new Error('Failed to shorten URL');
            }

            const data = await response.json();
            return data.result_url;
        } catch (error) {
            console.error('Error shortening URL:', error);
            showNotification('Error shortening URL. Please try again.', true);
            return null;
        }
    }

    // Event Listeners
    shortenBtn.addEventListener('click', handleShorten);
    urlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleShorten();
        }
    });

    copyBtn.addEventListener('click', function() {
        shortenedUrl.select();
        document.execCommand('copy');
        showNotification('URL copied to clipboard!');
    });

    shareBtns.forEach(btn => {
        if (btn.id !== 'qr-btn') {
            btn.addEventListener('click', function() {
                shareUrl(btn.dataset.platform);
            });
        }
    });

    qrBtn.addEventListener('click', showQRCode);
    closeBtn.addEventListener('click', hideQRCode);
    downloadPng.addEventListener('click', downloadQRCodePNG);
    downloadSvg.addEventListener('click', downloadQRCodeSVG);

    // Click outside modal to close
    window.addEventListener('click', function(event) {
        if (event.target === qrModal) {
            hideQRCode();
        }
    });

    // Functions
    async function handleShorten() {
        const longUrl = urlInput.value.trim();
        
        if (!longUrl) {
            showNotification('Please enter a URL', true);
            return;
        }

        // Validate URL format
        try {
            new URL(longUrl);
        } catch (e) {
            showNotification('Please enter a valid URL', true);
            return;
        }

        // Show loading state
        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Shortening...';

        const shortUrl = await shortenUrl(longUrl);

        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten';

        if (shortUrl) {
            originalUrlText.textContent = longUrl;
            shortenedUrl.value = shortUrl;
            resultContainer.classList.remove('hidden');
            urlInput.value = '';
            showNotification('URL shortened successfully!');
        }
    }

    function shareUrl(platform) {
        const url = encodeURIComponent(shortenedUrl.value);
        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${url}`;
                break;
            default:
                return;
        }

        window.open(shareUrl, '_blank', 'width=600,height=400');
    }

    function showQRCode() {
        const url = shortenedUrl.value;
        if (!url) return;

        qrCode.innerHTML = '';
        QRCode.toCanvas(url, { width: 200 }, function(error, canvas) {
            if (error) {
                console.error('QR code generation error:', error);
                showNotification('Error generating QR code', true);
                return;
            }
            qrCode.appendChild(canvas);
        });

        qrModal.classList.add('show');
    }

    function hideQRCode() {
        qrModal.classList.remove('show');
    }

    function downloadQRCodePNG() {
        const canvas = qrCode.querySelector('canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'shorturl-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function downloadQRCodeSVG() {
        const url = shortenedUrl.value;
        if (!url) return;

        QRCode.toString(url, { type: 'svg' }, function(error, svg) {
            if (error) {
                console.error('SVG QR code generation error:', error);
                showNotification('Error generating SVG QR code', true);
                return;
            }

            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = 'shorturl-qr.svg';
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    }

    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.classList.remove('error');
        
        if (isError) {
            notification.classList.add('error');
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
    
