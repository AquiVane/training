# Plantilla PASTOR — ficha larga de producto (COSMART Training)

Esta es la estructura que usa la ficha de producto completa del sitio (la que se ve en `/tienda/{slug}`, ej. `/tienda/iaprincipiantes`). Se llama PASTOR por las iniciales de sus bloques: **P**roblema, **A**mplificación, **S**olución/historia, **T**ransformación, **O**ferta, **R**espuesta (a quién es para).

Usá este documento para pedirle a otra sesión de Claude (o escribir vos misma) el copy de un ebook/curso nuevo. Lo que devuelva esa sesión se pega directo en el código como el campo `pastor` de ese producto, y automáticamente aparece con este mismo diseño en el sitio — en mobile y en escritorio, sin tocar nada más.

**Ejemplo real ya escrito y en producción**: IA para Emprendedores (`/tienda/iaprincipiantes`). Cuando le pidas copy a otra sesión, decile que mire esa página para el tono y el nivel de detalle esperado.

---

## Antes de escribir: datos que hacen falta sí o sí

- **Nombre del producto** y una bajada corta (1-2 líneas) de qué es.
- **Precio** (y si tiene variantes tipo "E-book" vs "Campus + E-book", precio de cada una).
- **Imágenes**: una por cada bloque de abajo que diga "Imagen". No se inventan — si todavía no existen, se deja el bloque de texto y la imagen se agrega después.
- **Temario real** si es un curso con módulos (nombre de cada módulo + lista de lecciones). Nunca se inventa un temario que no existe.

## La estructura, bloque por bloque

### 1. Problema (P)
**Qué va acá**: el problema que tiene la persona ANTES de conocer el producto. Un dolor concreto, cotidiano, que se reconozca fácil.
- Título (una frase con gancho, tipo titular)
- 2-3 párrafos cortos contando el problema
- Imagen ilustrativa del "antes" o del problema

### 2. Amplificación (A)
**Qué va acá**: por qué ese problema es peor de lo que parece si no se resuelve — el costo de no actuar.
- Título
- 1-2 párrafos
- 4 bullets cortos (título + 1 línea cada uno) con las consecuencias concretas
- Una frase destacada/cita que resuma el problema real (no el síntoma)
- Imagen de apoyo

### 3. Solución / historia (S)
**Qué va acá**: cómo se les ocurrió resolverlo y en qué consiste el método, en términos generales (todavía no es el detalle del temario).
- Título
- 3-4 párrafos contando el método
- Dos columnas cortas tipo "Lo que protege / Lo que te ahorra" (o el par que tenga sentido para ese producto) con 4 bullets cada una
- Un link/botón que dice algo como "Ver todo lo que incluye"
- Imagen del producto/mockup

### 4. Transformación (T)
**Qué va acá**: cómo queda la persona DESPUÉS de aplicar el método. El "cómo se siente/qué logra" — el contraste con el bloque 1.
- Título
- 1 párrafo
- Lista de 4-5 resultados concretos
- Una aclaración honesta si aplica (ej. "la revisión humana sigue siendo parte del proceso") — nunca prometer magia
- Imagen

### 5. Oferta (O)
**Qué va acá**: qué se lleva la persona exactamente, sin vueltas.
- Título
- 1 párrafo de contexto
- Lista completa de "Todo lo que incluye" (todo lo que es verdad, sin inflar)
- Imagen

### Qué vas a aprender
6 bullets (título corto + 1-2 líneas) con los temas/habilidades concretas que se llevan. Esto arma una lista numerada, no cards.

### Temario (si es un curso)
Nombre de cada módulo + lista de lecciones de cada uno. Real, verificado, nunca inventado.

### Extra (opcional)
Si hay un bonus o tema aparte que no encaja en el temario principal (ej. "cómo hacer tus primeros envíos de email"), va acá con la misma lógica: título, contexto, lista de pasos, nota, imagen. Este bloque es opcional — si no aplica, se omite.

### Cómo vas a cursar
Si el producto tiene más de un formato (ej. solo e-book vs. campus completo), acá se explica cada uno en 1-2 párrafos, más una imagen.

### Comparación (si hay variantes)
Dos opciones lado a lado, cada una con:
- Imagen representativa
- Nombre
- Lista de lo que incluye (con una marca de "no incluye" si corresponde)
- Una marcada como "recomendada"

### Respuesta — para quién es (R)
**Qué va acá**: el filtro de "esto es para vos si...". Ayuda a que la persona correcta se sienta identificada y a que la persona equivocada no compre algo que no le sirve.
- Título
- 1 párrafo
- 4 bullets de "para quién es"
- Imagen

### Cierre
Un resumen final corto + un botón grande de compra + una línea de tranquilidad (forma de pago, acceso permanente, etc.)

### Preguntas frecuentes
Lista de preguntas reales que la gente pregunta (dudas de pago, devoluciones, si hace falta experiencia previa, diferencias entre variantes, etc.) — no se inventan objeciones que nadie tiene. Termina con un botón de compra.

---

## Reglas de tono (no negociables)

- Nada de promesas exageradas ni "magia". Siempre se puede prometer un sistema/método, nunca un resultado garantizado.
- No inventar datos: ni temario, ni certificaciones, ni cifras que no estén confirmadas.
- Se puede repetir la idea central del producto en distintas palabras a lo largo de la ficha — es parte de la estructura, no es un error.
- El copy se escribe para una persona (dueño de pyme, emprendedor, profesional independiente), no para una empresa grande.

## Formato de entrega esperado

Cuando le pidas esto a otra sesión, pedile que te devuelva:
1. El texto de cada bloque, en el orden de arriba, con las imágenes que hacen falta descriptas (para poder pedirlas o generarlas después).
2. Si esa sesión tiene acceso al código del repo, puede escribirlo directo en la forma del campo `pastor` de `PRODUCT_DB` en `404.html` (mostrale la entrada de `iaprincipiantes` como ejemplo exacto de la forma que tiene que tener). Si no tiene acceso al código, con el texto en este orden alcanza — se lo paso yo al campo `pastor` después.
