# Catálogo de impactos y decisión musical

La fuente canónica es `data/impacts.v1.json`. El build incluye su contenido en el HTML y copia el JSON al paquete público. No hay una consulta a un servicio durante la reproducción. Cada registro conserva episodio, territorio, periodo mensual, fecha del hecho cuando está documentada, corte de la evaluación, unidad, categoría y enlace con localizador de la fuente.

Los cinco registros tienen alcances diferentes y no se agregan entre sí.

| Contexto | Hecho conservado | Fuente y límite |
| --- | --- | --- |
| Santa Lucía, diciembre de 2010 | 4821 personas y 964 familias en el corte municipal del COE | [Gobernación del Atlántico, 7 dic 2010](https://www.atlantico.gov.co/index.php/noticias/gobernadora/450-informe-oficial-coe). La nota no desglosa por municipio afectados y damnificados. Personas y familias permanecen separadas. |
| Paita, marzo de 2016 | Registro de lluvia 75628, del 7 de marzo | [Plan municipal, cuadro 13, página 13 impresa](https://sigrid.cenepred.gob.pe/sigridv3/storage/biblioteca/6187_plan-de-prevencion-y-reduccion-del-riesgo-de-desastres-de-la-provincia-de-paita-2019-2021.pdf#page=14). El código es un identificador. Es posterior al disco julio–diciembre de 2015 y queda como contexto sin regla musical. |
| Bajo Piura y Catacaos, marzo de 2017 | Desborde del 27 de marzo; máxima avenida reportada del río de 3800 m³/s | [INDECI, compendio 2017, página 28](https://portal.indeci.gob.pe/wp-content/uploads/2019/01/201802271714541.pdf#page=28). El caudal no es una cifra de población de Catacaos. |
| Pacora, marzo de 2023 | 29 viviendas y 110 personas afectadas, corte del 8 de marzo a las 19:00 | [COEN-INDECI, reporte 2529, página 2](https://portal.indeci.gob.pe/wp-content/uploads/2023/03/REPORTE-COMPLEMENTARIO-N%C2%BA-2529-8MAR2023-INUNDACI%C3%93N-EN-EL-DISTRITO-DE-PACORA-LAMBAYEQUE-1.pdf#page=2). Evaluación rápida en proceso. No se infieren damnificados ni fallecidos. |
| Tumbes, diciembre de 2023 | 14 viviendas afectadas en el departamento, corte del 27 de diciembre | [COEN-INDECI, reporte 12356, página 2](https://portal.indeci.gob.pe/wp-content/uploads/2023/12/REPORTE-COMPLEMENTARIO-N.%C2%BA-12356-27DIC2023-LLUVIAS-INTENSAS-EN-EL-DEPARTAMENTO-DE-TUMBES-1.pdf#page=2). No se añaden registros de febrero de 2024 al disco que termina en 2023. |

La regla `memoria-pacora-v1` solo se aplica en Melodía al perfil de Yaku, en el disco `yaku2023` y en marzo de 2023, cuando el registro conserva viviendas afectadas documentadas. Resta diez pulsaciones por minuto al tempo base. La cantidad de viviendas no determina el tamaño del cambio. No modifica las notas, escala, progresión ni el criterio existente de Yaku cálido, que sigue siendo `warm - cold > 0.9`.

Así, el perfil mayor pasa de 96 a 86 ppm y el perfil cálido menor de 76 a 66 ppm. Los demás meses, el modo Datos y los protagonistas sin regla aplicable conservan su base. Los perfiles base no se mutan. La selección exige identificador de disco y mes; coincidir solo en «El Niño» no basta.

La regla es editorial. No se inventaron pesos, normalización de tristeza ni resultados objetivos de melancolía, tensión o incertidumbre. El registro local aporta contexto mensual y no demuestra que una imagen particular causara ese daño. Las fuentes meteorológicas y de impacto cumplen papeles distintos. [SENAMHI, boletín de marzo de 2023](https://www.gob.pe/institucion/senamhi/informes-publicaciones/4112500-boletin-climatico-nacional-marzo-2023) documenta el contexto atmosférico del periodo.

Las pruebas de lógica verifican catálogo, unidades, coincidencia temporal, ausencia de aplicación posterior, perfiles y temporizador. `node scripts/verify_impacts.cjs _site _work/impacts/browser` también comprueba la interfaz bilingüe y registra intervalos con el reloj de Web Audio. En la imagen de marzo, el perfil cálido tuvo 66 ppm y un paso nominal de 455 ms; la mediana observada fue de 450,7 ms sin limitación artificial de CPU. No es una prueba de continuidad bajo carga ni escucha humana.
