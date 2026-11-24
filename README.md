# ASCII Studio Pro

A modern React + TypeScript creative studio for transforming images, text banners, procedural animations, video, live camera/screen feeds, ASCII paint flipbooks, and interactive 3D models into expressive ASCII art. Everything runs locally in the browser with no external server required.

## Architecture

Built with **React 19**, **TypeScript**, **React Router 7**, **Vite**, and **Tailwind CSS v4** using a clean separation between pure rendering engines, custom React hooks, context orchestration, routed mode pages, and reusable UI components:

```text
src/
├── types/          # Domain TypeScript types & interfaces
├── constants/      # Charsets, Bayer/Braille tables, presets, route config
├── lib/            # Pure logic modules (ASCII renderer, image processing, artwork generators, paint engine, exporters & GIF89a encoder)
├── hooks/          # Custom hooks (useAudioReactive, useMediaCapture, usePaintFlipbook, useExportActions, usePresets, useTheme, useToast, useKeyboardShortcuts)
├── context/        # StudioContext bridging React state and the 60fps canvas/RAF render loop
├── pages/          # Routed creative modes (/image, /text, /animate, /live, /paint, /3d)
└── components/     # Layout shell, tabbed inspector panels, workspace toolbar, preview stage, modals, and UI primitives
```

## Features

- **Six Routed Studio Modes**:
  - `/image`: Upload PNG/JPG/WebP/GIF or choose built-in procedural artworks, transform (flip, rotate 90°, 1:1 crop), and apply 1-click HD detail presets.
  - `/text`: Generate ASCII text banners with selectable typefaces and fill styles.
  - `/animate`: Play 6 procedural animations or upload local videos with configurable FPS.
  - `/live`: Real-time webcam and screen-share to ASCII with mirror and freeze controls.
  - `/paint`: ASCII Paint canvas (brush, eraser, line, box, flood fill, undo/redo, import) with a multi-frame Flipbook Animator and onion skinning.
  - `/3d`: Interactive 3D ASCII geometry (Donut, Globe, Knot, Pyramid) with drag-to-orbit camera and auto-spin.
- **HD Render Engines & Controls**: Standard ASCII, 70-char Floyd-Steinberg HD Photo, 2×4 Sub-Pixel Braille, and True-Color Half-Block (`▀`), plus custom charsets, Bayer dithering, Sobel edge sketch, unsharp mask sharpening, CRT scanlines, background cutout, color palettes, render/pointer FX, terminal frames, and Web Audio reactive visualizers.
- **Multi-Format Export**: Plain clipboard copy, Markdown code blocks, `.TXT`, 24-bit TrueColor ANSI `.SH`, high-res `.PNG`, vector `.SVG`, standalone `.HTML`, HTML/React embed widgets, `.WebM` video recording, and animated `.GIF` encoding.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
