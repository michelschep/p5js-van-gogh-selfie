# 🎨 Van Gogh Selfie

Transformeer je selfie naar een kunstwerk in de stijl van Vincent van Gogh met behulp van p5.js en pixel manipulatie.

## 🖼️ Features

- **Webcam Capture**: Maak een selfie rechtstreeks vanuit je browser
- **Van Gogh Stijl Filter**: 
  - Brushstroke effect met circular patterns
  - Verhoogde kleur saturatie en levendigheid
  - Textuur overlay voor canvas effect
  - Swirl patterns zoals in Van Gogh's werk
- **Opslaan**: Download je kunstwerk als PNG bestand
- **Responsive**: Werkt op desktop en mobiele apparaten

## 🚀 Live Demo

**Probeer het online: [https://michelschep.github.io/p5js-van-gogh-selfie/](https://michelschep.github.io/p5js-van-gogh-selfie/)**

## 🎯 Hoe te gebruiken

1. Sta webcam toegang toe in je browser
2. Positioneer jezelf in het kader
3. Klik op **"📸 Maak Foto"** om een snapshot te maken
4. Klik op **"🖌️ Van Gogh Stijl"** om het filter toe te passen
5. Klik op **"💾 Opslaan"** om je kunstwerk te downloaden
6. Gebruik **"🔄 Reset"** om opnieuw te beginnen

## 🎨 Technische Details

Het Van Gogh effect wordt bereikt door:
- **Brushstroke Sampling**: Pixels worden gegroepeerd in brush-sized blokken
- **HSB Color Enhancement**: Saturatie wordt verhoogd met 40%, brightness met 10%
- **Circular Brush Pattern**: Elk brush blok krijgt een circulaire vorm voor organische strokes
- **Color Variation**: Kleine random variaties in hue, saturatie en brightness
- **Texture Noise**: Subtiele noise overlay voor canvas textuur

## 🛠️ Technologie

- [p5.js](https://p5js.org/) - Creative coding library
- HTML5 Canvas
- WebRTC (getUserMedia API voor webcam)
- JavaScript

## 📱 Browser Compatibiliteit

- Chrome/Edge (aanbevolen)
- Firefox
- Safari (iOS 11+)

**Note**: Webcam toegang werkt alleen over HTTPS of localhost

## 📝 Licentie

MIT License - Vrij te gebruiken en aan te passen

## 🎭 Inspiratie

Geïnspireerd door de post-impressionistische stijl van Vincent van Gogh, met zijn karakteristieke dikke, expressieve brushstrokes en levendige kleuren.
