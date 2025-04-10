// Barcode scanning functionality using QuaggaJS

let scannerActive = false;

// Initialize barcode scanner
function initBarcodeScanner() {
    const scannerContainer = document.getElementById('barcode-scanner');
    if (!scannerContainer) return;
    
    // Create a button to toggle scanner
    const toggleButton = document.getElementById('toggle-scanner');
    
    toggleButton.addEventListener('click', function() {
        if (scannerActive) {
            stopScanner();
            toggleButton.textContent = 'Start Scanner';
            toggleButton.classList.replace('btn-danger', 'btn-primary');
        } else {
            startScanner();
            toggleButton.textContent = 'Stop Scanner';
            toggleButton.classList.replace('btn-primary', 'btn-danger');
        }
    });
}

// Start the barcode scanner
function startScanner() {
    const scannerContainer = document.getElementById('barcode-scanner');
    scannerContainer.innerHTML = '<div id="scanner-viewport"></div>';
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-viewport'),
            constraints: {
                width: 640,
                height: 480,
                facingMode: "environment"
            },
        },
        locator: {
            patchSize: "medium",
            halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        decoder: {
            readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error("Error initializing Quagga:", err);
            showScannerError("Camera access denied or not supported by your browser.");
            return;
        }
        
        scannerActive = true;
        Quagga.start();
    });
    
    // When a barcode is detected
    Quagga.onDetected(function(result) {
        const code = result.codeResult.code;
        console.log("Barcode detected:", code);
        
        // Play a success sound
        const beepSound = new Audio('https://cdn.jsdelivr.net/gh/LazarSoft/jsqrcode@master/beep.mp3');
        beepSound.play();
        
        processBarcodeResult(code);
    });
    
    // Draw detection result
    Quagga.onProcessed(function(result) {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        
        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function(box) {
                    return box !== result.box;
                }).forEach(function(box) {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "yellow", lineWidth: 2 });
                });
            }
            
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
            }
            
            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: "red", lineWidth: 3 });
            }
        }
    });
}

// Process barcode detection result
function processBarcodeResult(barcode) {
    // Fetch products
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            const product = products.find(p => p.barcode === barcode);
            
            if (product) {
                // Add product to cart
                addToCart(product);
                showScanResult(`Added ${product.name} to cart`);
                
                // Pause scanner briefly to prevent multiple scans
                Quagga.pause();
                setTimeout(() => {
                    if (scannerActive) {
                        Quagga.start();
                    }
                }, 2000);
            } else {
                showScanResult(`Product with barcode ${barcode} not found`, false);
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            showScanResult('Error processing barcode', false);
        });
}

// Stop the barcode scanner
function stopScanner() {
    if (scannerActive) {
        Quagga.stop();
        scannerActive = false;
        
        const scannerContainer = document.getElementById('barcode-scanner');
        scannerContainer.innerHTML = '<div class="text-center p-4"><p>Scanner is currently inactive</p></div>';
    }
}

// Show barcode scanning result
function showScanResult(message, success = true) {
    const resultElement = document.getElementById('scan-result');
    if (resultElement) {
        resultElement.textContent = message;
        resultElement.className = success ? 'alert alert-success' : 'alert alert-danger';
        resultElement.style.display = 'block';
        
        // Hide the message after 3 seconds
        setTimeout(() => {
            resultElement.style.display = 'none';
        }, 3000);
    }
}

// Show error when scanner fails to initialize
function showScannerError(message) {
    const scannerContainer = document.getElementById('barcode-scanner');
    scannerContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            <h5>Scanner Error</h5>
            <p>${message}</p>
            <p>Please make sure your camera is enabled and try again, or use manual product selection.</p>
        </div>
    `;
    
    const toggleButton = document.getElementById('toggle-scanner');
    if (toggleButton) {
        toggleButton.textContent = 'Try Again';
        toggleButton.classList.replace('btn-danger', 'btn-primary');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('barcode-scanner')) {
        initBarcodeScanner();
    }
});
