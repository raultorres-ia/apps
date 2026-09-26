## Instrucciones para Codex

- Habla siempre en el idioma en el que se dirijan a ti.
- El sistema operativo del usuario es Windows.
- Cuando depures un programa, ignora este aviso: `cdn.tailwindcss.com should not be used in production`.
- Para futuras peticiones de GitHub sobre este portfolio, usa como repo canonico:
  - GitHub: `https://github.com/raultorres-ia/apps/tree/main/raul-torres-ai-portfolio`
  - Checkout local: `C:\Users\berni\Desktop\apps_repo`
  - Subcarpeta del proyecto: `C:\Users\berni\Desktop\apps_repo\raul-torres-ai-portfolio`
  - Rama principal: `main`
- La carpeta `C:\Users\berni\Desktop\raul-torres-ai-portfolio` es una copia local suelta y no es un repositorio Git. Siempre que acabes de editar este portfolio, aplica tambien los cambios en `apps_repo\raul-torres-ai-portfolio`, haz commit y push a `origin main`.
- GitHub Pages publica el repositorio desde la rama `gh-pages`, carpeta `/ (root)`, no directamente desde `main`. Tras cada actualización del portfolio, sincroniza también `main` con `gh-pages` mediante un avance rápido (por ejemplo, `git push origin main:gh-pages`), espera a que finalice correctamente el workflow `pages build and deployment` y verifica la web pública: `https://raultorres-ia.github.io/apps/raul-torres-ai-portfolio/`.
- No des por publicada una actualización solo porque el archivo aparezca en `main`: confirma que `origin/gh-pages` apunta al commit esperado y que la web pública sirve el contenido nuevo.
