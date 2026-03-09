# Calculadora Rota

"Calculadora Rota" es un divertido y desafiante juego web donde tu objetivo es alcanzar un número objetivo generado aleatoriamente usando una calculadora "rota". ¿La trampa? ¡Algunos de los botones de la calculadora estarán deshabilitados al azar al inicio de cada partida nueva!

---

## Tabla de Contenidos

- [Calculadora Rota](#calculadora-rota)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Acerca del Juego](#acerca-del-juego)
  - [Características](#características)
  - [Cómo Jugar](#cómo-jugar)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Instalación](#instalación)
  - [Uso](#uso)
  - [Contribuciones](#contribuciones)
  - [Licencia](#licencia)
  - [Autor](#autor)

---

## Acerca del Juego

Este proyecto es un giro único a una calculadora estándar, transformándola en un juego de puzles. Cada ronda presenta un nuevo número objetivo y un nuevo conjunto de botones deshabilitados, lo que obliga a los jugadores a pensar de forma creativa sobre cómo alcanzar su meta con herramientas limitadas. Está diseñado para ser un rompecabezas rápido y atractivo.

---

## Características

* **Números Objetivo Aleatorios**: Se genera un nuevo número objetivo (entre 20 y 250) para cada partida.
* **Botones Rotos**: Una selección aleatoria de 2 a 5 botones de la calculadora (números u operadores) se deshabilitan al inicio de cada ronda, añadiendo un desafío estratégico.
* **Operaciones Aritméticas Básicas**: Soporta suma, resta, multiplicación y división.
* **Funcionalidad de Borrado**: Reinicia tu entrada actual.
* **Soporte Multi-idioma**: Juega en catalán (CAT) o español (ESP).
* **Diseño Responsivo**: Construido con Tailwind CSS para una excelente experiencia en varios tamaños de pantalla.
* **Feedback Claro**: Los mensajes indican éxito, respuestas incorrectas o errores de división por cero.
* **Soporte de Modo Oscuro**: Se adapta a la configuración de modo oscuro de tu sistema.

---

## Cómo Jugar

1.  **Objetivo**: Tu meta principal es manipular los números en la calculadora para que la **pantalla** muestre el número **OBJETIVO**.
2.  **Iniciar una Nueva Partida**: Haz clic en el botón "Nueva Partida" para establecer un nuevo objetivo y aleatorizar los botones "rotos".
3.  **Introducir Números**: Haz clic en los botones numéricos para introducir los valores deseados.
4.  **Realizar Operaciones**: Haz clic en los botones de operador (+, -, ×, ÷) para realizar cálculos.
5.  **Calcular Resultado**: Pulsa el botón "=" para ver si tu resultado actual coincide con el número objetivo.
6.  **Manejar Botones Rotos**: Si un botón aparece en gris, significa que está deshabilitado para la ronda actual y no puede usarse.
7.  **Borrar Entrada**: Usa el botón "C" para reiniciar la entrada actual en la pantalla.
8.  **Mensajes**: Presta atención a los mensajes debajo de la pantalla, que te indicarán si has ganado, si la respuesta es incorrecta o si has cometido un error de cálculo (como dividir por cero).

---

## Tecnologías Utilizadas

* **HTML5**: Para la estructura básica de la página web.
* **CSS3 (Tailwind CSS)**: Para un estilo rápido y responsivo, incluyendo soporte para modo oscuro.
* **JavaScript (ES6+)**: Para la lógica del juego, la interacción con el usuario y el contenido dinámico.

---

## Instalación

Para ejecutar este proyecto localmente:

1.  **Clona el repositorio** (si estuviera en uno):
    ```bash
    git clone <url-del-repositorio>
    cd calculadora-rota
    ```
    *(Nota: Como esto se proporciona como un único archivo HTML, normalmente solo tendrías que guardar el contenido como `index.html`.)*

2.  **Guarda el archivo**: Copia el código HTML proporcionado y guárdalo como `index.html` en tu ordenador.

---

## Uso

Simplemente abre el archivo `index.html` en tu navegador web. No se requiere un servidor especial ni un proceso de compilación.

```bash
# Ejemplo de comando si lo abrieras desde la terminal (macOS/Linux)
open index.html