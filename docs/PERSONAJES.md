# Personajes, episodios y referencias

La ficha pública de cada músico distingue cuatro capas: personalidad y frase del equipo, historia propuesta, comportamiento real del sintetizador y referencias documentadas. Los personajes son ficción. Las nuevas historias no se presentan como testimonios de personas afectadas.

`data/characters.v1.json` es el catálogo canónico. El build lo incorpora al HTML y publica una copia estática; las fichas funcionan sin nuevas consultas a servicios. Los hechos de los episodios proceden de `data/impacts.v1.json`, con territorio, corte, unidades y límites. Las referencias culturales no activan reglas musicales.

| Músico | Historia propuesta | Referencia documentada y alcance |
| --- | --- | --- |
| Mamacocha | Memoria del agua en Santa Lucía, Atlántico, durante La Niña 2010–2011. | El COE informa un corte municipal del 7 de diciembre de 2010. La iraca corresponde a Usiacurí, otro municipio. El arpa y el medallón son propuestas del proyecto. |
| Inti | Una jornada imaginada junto al puerto de Paita, episodio 2015–2016. | El plan municipal registra lluvia en marzo de 2016, después del disco julio–diciembre de 2015: no modifica esa música. La marimba documentada por UNESCO pertenece al Pacífico sur colombiano y Esmeraldas; no se atribuye esa tradición a Paita. Chaqueta y sombrero son ficción de faena. |
| Silbo | Un narrador que visita Catacaos durante El Niño Costero 2017. | INDECI describe la inundación del Bajo Piura, sin convertir cifras regionales en cifras del distrito. El sombrero de paja de Catacaos es patrimonio vivo contemporáneo; no es un tocado moche. El modelo conserva el tocado curvo de la referencia del equipo, sin añadir una nueva copia de sombrero pendiente de referencia visual. |
| Yaku | Un recorrido imaginado por Pacora en marzo de 2023. | El corte INDECI del 8 de marzo registra 29 viviendas y 110 personas afectadas. El tejido de algodón nativo corresponde a Mórrope, otro distrito; el parche del modelo es una propuesta. |
| Illapa | Un guardián que escucha antes de golpear el tambor en Tumbes. | La fuente de diciembre de 2023 registra 14 viviendas afectadas en el departamento. PROMPERÚ documenta artesanía de pasalla, no un poncho de esa fibra. No se traslada un impacto de febrero de 2024 al disco de 2023. |

## Conservación y correcciones

Las personalidades, frases e inspiraciones originales siguen en `BAND` y `BAND_EN` del prototipo canónico. Se muestran con la etiqueta «Personaje de ficción del equipo» y «Inspiración original del equipo». Esto incluye frases poéticas sobre lluvia o calma, que no son pronósticos ni una descripción científica.

Las explicaciones operativas de las fichas proceden ahora del catálogo nuevo. Corrigen diferencias entre el concepto inicial y el motor: Inti sube una octava en columnas muy cálidas; Mamacocha sostiene acordes aun en mapas cálidos; Silbo también compone una línea a partir de celdas intensas en Melodía; Illapa tiene pulsos periódicos además del refuerzo de extremos. El arpa representa bajo y colchón sintéticos, no una grabación de arpa. La quena visual y la vasija moche se explican como inspiraciones distintas.

## Cuidado cultural y material pendiente

Se consultaron los [principios éticos de UNESCO](https://ich.unesco.org/es/principios-eticos-y-pci-00866), particularmente el protagonismo de las comunidades, el diálogo y consentimiento, y su papel ante representaciones descontextualizadas. La página directa devolvió una comprobación humana; el texto de los principios también pudo consultarse en la indexación oficial y en los [Textos fundamentales de la Convención, edición española de 2020](https://ich.unesco.org/doc/src/2003_Convention_Basic_Texts-_2020_version-SP.pdf). No se resolvió ni eludió esa comprobación.

Las citas no equivalen a consulta ni consentimiento de portadores del patrimonio. No se ha contactado a personas o instituciones. No se afirma validación cultural, indumentaria típica certificada, autenticidad acústica ni que una localidad haya sido «la más afectada». La presentación de las propuestas mantiene esa distinción y las fuentes accesibles.

Las tres imágenes históricas citadas en el encargo no están disponibles. Se conservaron las ilustraciones y prompts existentes del equipo. Brisa usa su nombre y un símbolo de ayuda; no se inventó una apariencia a partir de imágenes ausentes. Faltan aprobación del equipo, revisión de portadores culturales y referencias visuales para decidir una adaptación nueva del sombrero de Silbo.

Las fuentes culturales de las fichas son [Ministerio de Cultura, Catacaos](https://transparencia.cultura.gob.pe/rvm-ndeg-033-2013-vmpcic-mc), [Arqueológicas 31](https://museos.cultura.pe/sites/default/files/publicaciones/pdf/arqueologicas31_2022%20%281%29.pdf), [UNESCO, marimba](https://ich.unesco.org/en/RL/marimba-music-traditional-chants-and-dances-from-the-colombia-south-pacific-region-and-esmeraldas-province-of-ecuador-01099), [Artesanías de Colombia, Usiacurí](https://repositorio.artesaniasdecolombia.com.co/items/ad4424f8-ba9a-4b58-93d3-f8a65cd9f159), [MINCETUR, Mórrope](https://consultasenlinea.mincetur.gob.pe/fichaInventario/index.aspx?cod_Ficha=13353) y [PROMPERÚ, Tumbes](https://repositorio.promperu.gob.pe/server/api/core/bitstreams/354822f2-1e01-450c-93a2-ee46f6076285/content#page=6).

## Verificación

114 pruebas de producto pasan tras esta integración. Las regresiones comprueban cinco fichas, fuente de impacto existente, unidades y periodos, textos del equipo conservados, traducción sin cambiar posición/archivo/mezcla y separación de fuentes culturales y reglas musicales.

`node scripts/verify_characters.cjs _site _work/characters/browser` recorre las cinco fichas en español e inglés a 320, 390, 768, 1366 y 1920 píxeles. Comprueba las secciones desplegables, enlaces de fuentes y ausencia de desbordamiento horizontal. Leer las referencias no inicia audio. La prueba usa Chromium con WebGL por software y movimiento reducido; no equivale a un teléfono físico ni a una prueba con lector de pantalla. Las cinco muestras con Web Audio se documentan en `REPRODUCTOR.md`.
