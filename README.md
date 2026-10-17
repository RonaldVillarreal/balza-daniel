# Daniel Balza — Arquitectura

Landing con scroll cinematográfico (Vite + GSAP ScrollTrigger + Lenis).

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173  (con --host para probar en el celular por la red local)
npm run build      # genera /dist listo para Netlify
```

- Sitio: `index.html`
- Manual de marca: `/brand.html` (en dev: http://localhost:5173/brand.html)

## Estructura

```
index.html            secciones del sitio
brand.html            manual de identidad (logo, paleta, tipografía)
src/main.js           todas las animaciones y el scroll
src/style.css         estilos + variables de marca (:root) + responsive
public/brand/         logo-mark / logo-horizontal en versión clara y oscura (SVG)
public/favicon.svg
public/videos/        acá va el render en video del hero
public/img/           acá van las fotos reales
```

## Animaciones / tipos de scroll

| Sección | Desktop | Mobile |
|---|---|---|
| Preloader | el monograma se dibuja + contador 0–100 | igual |
| Hero | video/render a pantalla completa que se recoge en una ventana con arco; las líneas del título se separan | igual, con valores adaptados |
| Manifiesto | las palabras se encienden con el scroll | igual |
| Proyectos | **scroll horizontal fijado** con parallax en cada imagen + cursor "Ver" | tarjetas a ancho completo con revelado por clip |
| Banda | ventana con arco que se abre a pantalla completa | igual |
| Servicios | **tarjetas apiladas sticky** que se achican al taparse | igual (la imagen pasa arriba) |
| Cifras, marquee, proceso, estudio, contacto, footer | contadores, línea de progreso, parallax | igual |

En mobile se mantiene el scroll nativo del dedo (Lenis solo suaviza la rueda del mouse), por eso se siente fluido y no "pesado". Respeta `prefers-reduced-motion`.

## Pendientes antes de publicar

1. **Video del hero**: poné el render en `public/videos/hero.mp4` (y opcional `hero.webm`). Recomendado: 1920×1080, 10–20 s en loop, sin audio, H.264, < 6 MB; y una versión vertical si querés. Si el archivo no existe, se ve la foto con un movimiento de cámara lento y un barrido de luz.
   - Desde Lumion / Twinmotion / D5 Render: un "camera path" lento de fachada al atardecer es ideal.
   - Mientras tanto se puede usar un clip gratis de Pexels o Mixkit ("modern house drone").
2. **Fotos**: hoy son de Unsplash (temporales). Reemplazá cada `src="https://images.unsplash.com/..."` por `/img/tu-foto.jpg`. Usá JPG/WebP de ~1600 px de ancho.
3. **Datos**: WhatsApp (`584140000000`), email, dirección, Instagram, cifras y nombres de proyectos son de ejemplo.
4. **Colores**: cambian todos desde `:root` en `src/style.css`.
