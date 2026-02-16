let capture;
let capturedImage;
let processedImage;
let state = 'camera'; // 'camera', 'captured', 'processed'

function setup() {
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas-container');
    
    // Start webcam
    capture = createCapture(VIDEO);
    capture.size(640, 480);
    capture.hide();
    
    // Button event listeners
    document.getElementById('captureBtn').addEventListener('click', capturePhoto);
    document.getElementById('applyBtn').addEventListener('click', applyVanGoghStyle);
    document.getElementById('saveBtn').addEventListener('click', saveImage);
    document.getElementById('resetBtn').addEventListener('click', resetCamera);
}

function draw() {
    if (state === 'camera') {
        // Toon live camera feed
        image(capture, 0, 0, width, height);
        
        // Toon crosshair voor framing
        stroke(255, 255, 0, 150);
        strokeWeight(2);
        noFill();
        rect(width/2 - 150, height/2 - 150, 300, 300);
        line(width/2, height/2 - 160, width/2, height/2 + 160);
        line(width/2 - 160, height/2, width/2 + 160, height/2);
        
    } else if (state === 'captured') {
        // Toon captured foto
        image(capturedImage, 0, 0, width, height);
        
    } else if (state === 'processed') {
        // Toon verwerkte foto
        image(processedImage, 0, 0, width, height);
    }
}

function capturePhoto() {
    // Maak snapshot van camera
    capturedImage = createImage(capture.width, capture.height);
    capturedImage.copy(capture, 0, 0, capture.width, capture.height, 
                       0, 0, capture.width, capture.height);
    
    state = 'captured';
    
    // Update buttons
    document.getElementById('applyBtn').disabled = false;
    document.getElementById('saveBtn').disabled = true;
}

function applyVanGoghStyle() {
    if (!capturedImage) return;
    
    // Maak kopie voor processing
    processedImage = createImage(capturedImage.width, capturedImage.height);
    processedImage.copy(capturedImage, 0, 0, capturedImage.width, capturedImage.height,
                        0, 0, capturedImage.width, capturedImage.height);
    
    processedImage.loadPixels();
    capturedImage.loadPixels();
    
    // Van Gogh effect: brushstroke + color enhancement
    const brushSize = 8;
    
    for (let y = 0; y < processedImage.height; y += brushSize) {
        for (let x = 0; x < processedImage.width; x += brushSize) {
            
            // Sample kleur uit gebied
            let idx = (y * processedImage.width + x) * 4;
            let r = capturedImage.pixels[idx];
            let g = capturedImage.pixels[idx + 1];
            let b = capturedImage.pixels[idx + 2];
            
            // Van Gogh kleur transformatie: verhoog saturatie en levendigheid
            let hsb = rgbToHsb(r, g, b);
            hsb.s = constrain(hsb.s * 1.4, 0, 1); // Meer saturatie
            hsb.b = constrain(hsb.b * 1.1, 0, 1); // Meer brightness
            
            // Voeg variatie toe (brushstroke effect)
            hsb.h += random(-0.02, 0.02);
            hsb.s += random(-0.05, 0.05);
            hsb.b += random(-0.05, 0.05);
            
            let rgb = hsbToRgb(hsb.h, hsb.s, hsb.b);
            
            // Pas toe op brush area met swirl pattern
            for (let by = 0; by < brushSize; by++) {
                for (let bx = 0; bx < brushSize; bx++) {
                    let px = x + bx;
                    let py = y + by;
                    
                    if (px < processedImage.width && py < processedImage.height) {
                        // Circular brushstroke pattern
                        let dx = bx - brushSize/2;
                        let dy = by - brushSize/2;
                        let dist = sqrt(dx*dx + dy*dy);
                        
                        if (dist < brushSize/2) {
                            let pIdx = (py * processedImage.width + px) * 4;
                            
                            // Blend met origineel op basis van afstand tot centrum
                            let blend = 1 - (dist / (brushSize/2)) * 0.3;
                            
                            processedImage.pixels[pIdx] = rgb.r * blend + processedImage.pixels[pIdx] * (1-blend);
                            processedImage.pixels[pIdx + 1] = rgb.g * blend + processedImage.pixels[pIdx + 1] * (1-blend);
                            processedImage.pixels[pIdx + 2] = rgb.b * blend + processedImage.pixels[pIdx + 2] * (1-blend);
                        }
                    }
                }
            }
        }
    }
    
    // Apply subtle texture overlay
    for (let i = 0; i < processedImage.pixels.length; i += 4) {
        let noise = random(-10, 10);
        processedImage.pixels[i] = constrain(processedImage.pixels[i] + noise, 0, 255);
        processedImage.pixels[i+1] = constrain(processedImage.pixels[i+1] + noise, 0, 255);
        processedImage.pixels[i+2] = constrain(processedImage.pixels[i+2] + noise, 0, 255);
    }
    
    processedImage.updatePixels();
    
    state = 'processed';
    
    // Update buttons
    document.getElementById('saveBtn').disabled = false;
}

function saveImage() {
    if (processedImage) {
        let timestamp = year() + nf(month(), 2) + nf(day(), 2) + '_' + 
                       nf(hour(), 2) + nf(minute(), 2) + nf(second(), 2);
        saveCanvas('vangogh_selfie_' + timestamp, 'png');
    }
}

function resetCamera() {
    state = 'camera';
    capturedImage = null;
    processedImage = null;
    
    // Reset buttons
    document.getElementById('applyBtn').disabled = true;
    document.getElementById('saveBtn').disabled = true;
}

// Helper functions voor kleur conversie
function rgbToHsb(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;
    
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
            h = ((b - r) / delta + 2) / 6;
        } else {
            h = ((r - g) / delta + 4) / 6;
        }
    }
    
    return { h: h, s: s, b: v };
}

function hsbToRgb(h, s, b) {
    let r, g, bl;
    
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = b * (1 - s);
    let q = b * (1 - f * s);
    let t = b * (1 - (1 - f) * s);
    
    switch (i % 6) {
        case 0: r = b; g = t; bl = p; break;
        case 1: r = q; g = b; bl = p; break;
        case 2: r = p; g = b; bl = t; break;
        case 3: r = p; g = q; bl = b; break;
        case 4: r = t; g = p; bl = b; break;
        case 5: r = b; g = p; bl = q; break;
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(bl * 255)
    };
}
