# Borrador para revisar y copiar al formulario NSAC

Este archivo prepara los campos que aparecen vacíos en `Spanish NSAC.pdf`. No guarda, acepta términos ni envía el proyecto. El formulario de la captura usa «Project EarthBeat», mientras el producto se llama TerraSonic: el equipo debe confirmar su nombre final antes de presentar.

## Summary · English draft

TerraSonic is a bilingual Earth jukebox that turns Pacific sea-surface temperature anomaly visualizations into real-time music. Users select dated NASA frames, explore their colors and hear five synthesized musical voices. Warm and cool image-derived levels influence notes, intensity and musical texture. Keyboard controls, readable text, contrast options, reduced motion, written playback descriptions and optional speech provide several ways to explore the same material. An illustrated space journey introduces the experience, while clearly labelled artistic soundscapes remain separate from NASA-based sonification. The prototype runs locally in the browser, without an AI service generating music at runtime. It is an educational interpretation of visual data, not a calibrated scientific measurement or a warning system.

## Project details · English draft

TerraSonic connects Earth observation, music and an original five-character ensemble. Users choose a dated Pacific map from a bundled set of Earth Information Center frames or a historical NASA GIBS collection. Canvas reduces the image to a 28×16 grid and interprets its colors with the corresponding product palette. The raw-data mode maps derived warm/cool levels to synthesized tones; the melody mode adds artist-designed scales, chords and rhythm. Written descriptions, a labelled legend and playback controls remain available without relying solely on sound or color.

The prototype uses HTML, CSS, JavaScript, Canvas, Web Audio and Web Animations. Maps and fonts are bundled locally. Optional speech depends on voices available on the device; optional haptics depend on Vibration API support and user consent. Background astros provide illustrated journey shortcuts directly to winter and summer map episodes. The journey is artistic; the selected episode retains its actual NASA map source. No audio plays on entry. Reduced motion opens the same discs without a journey animation.

Important limits: color-based interpretation and downsampling lose precision; the two map products are not physically interchangeable. This prototype is not live monitoring, an early-warning service or an accessibility-certified product. Automated browser tests complement, and do not replace, evaluation with assistive technologies, disabled participants and physical mobile devices.

## NASA data/resources · full links

| Link text | Link URL |
|---|---|
| NASA SVS 5176 · Sea Surface Temperature Anomaly | https://svs.gsfc.nasa.gov/5176/ |
| JPL MUR sea-surface temperature analysis · source of the visualization | https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1 |
| NASA GIBS · historical visualization service | https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-standard-products/gibs |
| GIBS GHRSST anomaly color map | https://gitc.earthdata.nasa.gov/colormaps/v1.0/output/GHRSST_Sea_Surface_Temperature_Anomalies.html |
| NASA POWER · bundled Chiclayo monthly climate reference | https://power.larc.nasa.gov/ |

List external cultural sources, original team illustrations, typefaces and their licenses using [CREDITOS.md](CREDITOS.md), [PERSONAJES.md](PERSONAJES.md) and `data/characters.v1.json`. Listing a source does not itself establish authorization or cultural approval.

## SI / AI disclosure · draft

The repository records Claude Design/Code for earlier planning and prototypes, Whisper for a local transcription, and OpenAI Codex for code, testing, procedural SVG illustrations and procedural ambient-audio design. AI-assisted scene illustrations carry a visible label, and the HTML includes attribution metadata. The audio is generated procedurally by browser code; it is not a recorded planetary sound or an AI service response. Original team character illustrations are preserved; their generation and editing history must be confirmed by the team before selecting the image-use categories. Rejected Blender studies are archived and excluded from the public 2D application. See `docs/USO_DE_IA.md` for the detailed record and pending reviews.

Do not check a category or claim that all provenance and rights have been confirmed until the team has reviewed those materials. Do not add NASA logos or mission insignia to generated imagery.

## Demo storyboard · maximum 30 seconds

| Time | Screen | Suggested English caption |
|---|---|---|
| 0–4 s | Pacific map and project name | “Hear the Pacific through NASA visual data.” |
| 4–10 s | Select a dated EIC map and press Play | “Colors become five musical voices in real time.” |
| 10–16 s | Legend, written playback and controls | “Explore by sound, text, keyboard or optional speech.” |
| 16–21 s | Original band, one automatic dance | “An original ensemble gives each voice an identity.” |
| 21–26 s | Motion, contrast and reading settings | “Choose the experience that works for you.” |
| 26–30 s | Sources, limitations and public link | “Educational sonification. Public prototype. Sources included.” |

This is a storyboard, not an uploaded final demo. A video must have English captions if required by the current submission guide, clear AI indicators where applicable, verified duration and a public link without login. Technical QA videos can exceed the submission limit and should not be substituted without checking.

## Outstanding submission actions

Confirm the final team/project name, review wording and original asset provenance, publish the final demo, complete all fields, verify links anonymously, review the current official guide, then save and submit for judging from the team’s account. The PDF alone does not prove that any of those form actions have occurred.
