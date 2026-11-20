# ASCII Studio Pro

<div align="center">

**Turn images, video, text, and live camera footage into expressive ASCII art.**

[Open ASCII Studio Pro](https://nannndev.github.io/ascii-studio/)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=1a1a1a)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

</div>

ASCII Studio Pro is a polished, browser-based creative tool for transforming visual media into text-based art. Everything runs locally in your browser—no account, build step, or server required.

## Features

### Five Creative Modes

| Mode | What you can do |
| --- | --- |
| **Image** | Upload PNG, JPG, WebP, or GIF files, or start with a built-in sphere, sunset, wave, or cyber portrait |
| **Text** | Generate ASCII artwork from custom text banners with multiple typefaces and fill styles |
| **Animate** | Explore procedural 3D and particle scenes, or convert uploaded video into a live ASCII animation |
| **Webcam** | Stream your camera directly into the studio with mirroring and freeze controls |
| **Paint** | Draw with ASCII characters using brush, eraser, line, box, and flood-fill tools |

### Powerful Rendering

- Convert images at widths from 24 to 260 characters
- Choose standard ASCII, Braille, half-block, grayscale, colored, or custom character sets
- Fine-tune contrast, brightness, aspect ratio, and sharpening
- Add edge sketching, Bayer dithering, inversion, CRT scanlines, and frame styles
- Apply color palettes and animated mouse or automatic visual effects
- Flip, rotate, and square-crop source images
- Undo, redo, clear, and import content in Paint mode

### Flexible Export

- Copy plain ASCII or formatted code blocks
- Export `.TXT`, `.PNG`, `.SVG`, and standalone `.HTML`
- Record `.GIF` and `.WebM` animations
- Toggle zen mode, adjust preview zoom, fit to screen, and switch themes

## Run Locally

ASCII Studio Pro is a dependency-free static application.

```bash
git clone https://github.com/nannndev/ascii-studio.git
cd ascii-studio
```

Open `index.html` directly in a browser, or serve the folder for a more consistent experience:

```bash
# Python 3
python3 -m http.server 8000

# Then visit
http://localhost:8000
```

> Webcam access requires HTTPS or `localhost` and browser camera permission.

## Quick Start

1. Select **Image**, **Text**, **Animate**, **Webcam**, or **Paint** from the top navigation.
2. Add an image, video, text, camera feed, or starting canvas.
3. Adjust the detail mode and character set in the settings panel.
4. Fine-tune width, tone, color, effects, and frame presentation.
5. Copy or export the result in your preferred format.

### Image Presets

The image workspace includes three one-click presets:

- **HD ASCII** — Detailed tonal output for general photos
- **Braille 2×4** — High-density character rendering
- **Photo HD ▀** — A half-block style optimized for visual fidelity

### Animation

Choose a procedural animation or upload a video. Adjust playback FPS, then use the preview controls to record an animated GIF or WebM file.

### Export Formats

| Format | Best for |
| --- | --- |
| `.TXT` | Source text and universal compatibility |
| Code block | WhatsApp, Discord, and other chat platforms |
| `.PNG` | Static raster images |
| `.SVG` | Scalable vector artwork |
| `.HTML` | A portable, standalone artwork page |
| `.GIF` | Shareable animated images |
| `.WebM` | Efficient browser-native animation |

## Privacy

Image processing, rendering, animation, webcam capture, and exports happen locally in the browser. ASCII Studio does not send your media to an application server.

## Browser Support

Use a current desktop browser such as Chrome, Edge, Firefox, or Safari. Camera access and GIF/WebM recording depend on browser feature support and may require secure context permissions.

## Project Structure

```text
ascii-studio/
├── index.html  # Application UI, styles, and JavaScript
└── README.md
```

## Contributing

Contributions are welcome. Before submitting a change:

1. Fork the repository.
2. Create a descriptive feature branch.
3. Test the interface in multiple viewport sizes.
4. Verify relevant image, text, paint, webcam, and export paths.
5. Open a pull request with a clear summary and screenshots when useful.
