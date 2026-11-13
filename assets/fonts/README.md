# Tipografías locales

Se conservan Barlow (500/600/700), Inter (400/500/600), IBM Plex Mono (400/500) y Atkinson Hyperlegible (400/700). Los ocho WOFF2 sin modificar proceden de la API oficial de Google Fonts; las tres reglas Inter comparten un binario. Se incluye el subconjunto latino para español e inglés. Otros caracteres pueden usar las fuentes de sistema.

`sources.json` registra URL, tamaño, fecha y SHA-256. Los cuatro archivos `*-OFL.txt` conservan copyright, nombres reservados y licencia SIL OFL 1.1 de cada familia. El CSS mantiene `font-display: swap`: el texto permanece disponible durante la carga y con errores de fuente.

La aplicación solicita estos archivos a su propio origen, sin llamadas a Google Fonts durante el uso. No se instalaron fuentes en Windows. Verifica las copias con `python scripts/verify_fonts.py`; `--download` recupera las mismas versiones y exige la huella registrada. Una actualización de versión requiere revisar el manifiesto y las licencias expresamente.

Referencias: [repositorio oficial Google Fonts](https://github.com/google/fonts) y [optimización de fuentes, web.dev](https://web.dev/learn/performance/optimize-web-fonts).
