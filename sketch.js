let capture;
let capturedImage;
let processedImage;
let state = 'camera'; // 'camera', 'countdown', 'captured', 'processed'
let countdown = 0;
let countdownStartTime = 0;

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
        
    } else if (state === 'countdown') {
        // Toon live camera feed met countdown
        image(capture, 0, 0, width, height);
        
        // Bereken huidige countdown nummer
        let elapsed = (millis() - countdownStartTime) / 1000;
        let currentCount = ceil(countdown - elapsed);
        
        if (currentCount > 0) {
            // Toon countdown nummer
            fill(255, 255, 0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(200);
            textStyle(BOLD);
            
            // Pulse effect
            let scaleAmount = 1 + (1 - (elapsed % 1)) * 0.3;
            push();
            translate(width/2, height/2);
            scale(scaleAmount);
            text(currentCount, 0, 0);
            pop();
            
            // Outer glow
            fill(255, 255, 0, 100);
            textSize(220);
            push();
            translate(width/2, height/2);
            scale(scaleAmount);
            text(currentCount, 0, 0);
            pop();
            
        } else {
            // Countdown klaar - maak foto
            takePicture();
        }
        
    } else if (state === 'captured') {
        // Toon captured foto
        image(capturedImage, 0, 0, width, height);
        
    } else if (state === 'processed') {
        // Toon verwerkte foto
        image(processedImage, 0, 0, width, height);
    }
}

function capturePhoto() {
    // Start countdown
    countdown = 3;
    countdownStartTime = millis();
    state = 'countdown';
    
    // Disable buttons tijdens countdown
    document.getElementById('captureBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;
}

function takePicture() {
    // Maak snapshot van camera
    capturedImage = createImage(capture.width, capture.height);
    capturedImage.copy(capture, 0, 0, capture.width, capture.height, 
                       0, 0, capture.width, capture.height);
    
    state = 'captured';
    
    // Update buttons
    document.getElementById('captureBtn').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    document.getElementById('applyBtn').disabled = false;
    document.getElementById('saveBtn').disabled = true;
}

function applyVanGoghStyle() {
    if (!capturedImage) return;
    
    // Maak graphics buffer voor painting
    let pg = createGraphics(capturedImage.width, capturedImage.height);
    pg.background(0);
    
    capturedImage.loadPixels();
    
    // Oil painting effect met directional brushstrokes
    const brushLength = 12;
    const brushDensity = 4;
    
    pg.noStroke();
    
    // Meerdere layers voor depth
    for (let layer = 0; layer < 3; layer++) {
        let density = brushDensity + layer * 2;
        
        for (let y = density; y < capturedImage.height - density; y += density) {
            for (let x = density; x < capturedImage.width - density; x += density) {
                
                // Sample kleur
                let idx = (y * capturedImage.width + x) * 4;
                let r = capturedImage.pixels[idx];
                let g = capturedImage.pixels[idx + 1];
                let b = capturedImage.pixels[idx + 2];
                
                // Van Gogh kleur palette
                let hsb = rgbToHsb(r, g, b);
                
                // Shift naar Van Gogh kleuren (meer geel, blauw, warmte)
                if (hsb.h > 0.08 && hsb.h < 0.18) { // Geel/oranje boost
                    hsb.h = constrain(hsb.h + 0.02, 0, 1);
                    hsb.s = constrain(hsb.s * 1.5, 0, 1);
                }
                if (hsb.h > 0.5 && hsb.h < 0.7) { // Blauw boost
                    hsb.s = constrain(hsb.s * 1.3, 0, 1);
                }
                
                // Algemene saturatie en brightness boost
                hsb.s = constrain(hsb.s * 1.6, 0, 1);
                hsb.b = constrain(hsb.b * 1.15, 0, 1);
                
                // Variatie per layer
                hsb.h += random(-0.03, 0.03);
                hsb.s += random(-0.1, 0.1);
                hsb.b += random(-0.1, 0.1);
                
                hsb.h = constrain(hsb.h, 0, 1);
                hsb.s = constrain(hsb.s, 0, 1);
                hsb.b = constrain(hsb.b, 0, 1);
                
                let rgb = hsbToRgb(hsb.h, hsb.s, hsb.b);
                
                // Bereken brushstroke richting (simplified edge detection)
                let angle = calculateBrushAngle(x, y, capturedImage);
                
                // Teken brushstroke
                pg.push();
                pg.translate(x, y);
                pg.rotate(angle);
                
                // Alpha based on layer
                let alpha = map(layer, 0, 2, 180, 255);
                pg.fill(rgb.r, rgb.g, rgb.b, alpha);
                
                // Elliptische brushstroke
                let w = brushLength + random(-2, 2);
                let h = brushLength * 0.4 + random(-1, 1);
                pg.ellipse(0, 0, w, h);
                
                pg.pop();
            }
        }
    }
    
    // Converteer graphics buffer naar image
    processedImage = pg.get();
    
    // Post-processing: impasto texture
    processedImage.loadPixels();
    for (let i = 0; i < processedImage.pixels.length; i += 4) {
        let texNoise = noise(i * 0.01) * 15 - 7.5;
        processedImage.pixels[i] = constrain(processedImage.pixels[i] + texNoise, 0, 255);
        processedImage.pixels[i+1] = constrain(processedImage.pixels[i+1] + texNoise, 0, 255);
        processedImage.pixels[i+2] = constrain(processedImage.pixels[i+2] + texNoise, 0, 255);
    }
    processedImage.updatePixels();
    
    state = 'processed';
    
    // Update buttons
    document.getElementById('saveBtn').disabled = false;
}

function calculateBrushAngle(x, y, img) {
    // Simplified gradient-based angle calculation
    let radius = 3;
    let sumX = 0;
    let sumY = 0;
    
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            let nx = constrain(x + dx, 0, img.width - 1);
            let ny = constrain(y + dy, 0, img.height - 1);
            let idx = (ny * img.width + nx) * 4;
            
            let brightness = (img.pixels[idx] + img.pixels[idx+1] + img.pixels[idx+2]) / 3;
            
            sumX += dx * brightness;
            sumY += dy * brightness;
        }
    }
    
    // Angle perpendicular to gradient (for brushstroke along edges)
    return atan2(sumY, sumX) + HALF_PI + random(-0.3, 0.3);
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
