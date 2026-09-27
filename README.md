# Finanzas

PWA de finanzas personales: ingresos y gastos por categoría, múltiples
cuentas/billeteras, presupuestos mensuales y metas de ahorro. Cada usuario
inicia sesión con Google y ve únicamente sus propios datos, guardados en
Firestore.

Stack: **React + Vite + Firebase (Auth + Firestore)**, publicada como PWA
instalable vía GitHub Pages.

## 1. Crear el proyecto de Firebase

1. Andá a https://console.firebase.google.com y creá un proyecto nuevo.
2. **Authentication** → Sign-in method → habilitá **Google**.
3. **Firestore Database** → Crear base de datos → modo producción.
4. **Configuración del proyecto** → Tus apps → agregá una app **Web**.
   Copiá los valores del `firebaseConfig` que te muestra.
5. En **Authentication → Settings → Authorized domains**, agregá el dominio
   donde vas a publicar (ej: `tu-usuario.github.io`).

## 2. Configurar el proyecto localmente

```bash
npm install
cp .env.example .env.local
```

Completá `.env.local` con los valores del paso anterior (las 6 variables
`VITE_FIREBASE_...`).

Desplegá las reglas de seguridad (o pegalas manualmente en la consola de
Firestore → Reglas):

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # elegí el proyecto que creaste
firebase deploy --only firestore:rules
```

Correr en local:

```bash
npm run dev
```

## 3. Publicar en GitHub Pages

1. Creá un repo en GitHub, por ejemplo `finanzas-pwa`.
2. En `vite.config.js`, confirmá que `base: '/finanzas-pwa/'` coincida con
   el nombre real del repo (y actualizá también `start_url`/`scope` del
   manifest si le cambiás el nombre).
3. Subí el código:

```bash
git init
git add .
git commit -m "Primer commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/finanzas-pwa.git
git push -u origin main
```

4. Publicá:

```bash
npm run deploy
```

Esto genera `dist/` y lo sube a la rama `gh-pages` usando `gh-pages`
(ya está en `devDependencies`). En GitHub, andá a **Settings → Pages** y
elegí la rama `gh-pages` como fuente, si no se configuró sola.

5. Entrá a `https://TU-USUARIO.github.io/finanzas-pwa/`. En iPhone, abrí
   esa URL en Safari y usá **Compartir → Agregar a pantalla de inicio**
   para instalarla como app.

**Importante:** como las credenciales de Firebase quedan en el build final
(`dist/`), la seguridad real de los datos la dan las **reglas de
Firestore** (ya incluidas en `firestore.rules`), no el ocultamiento de esas
claves — eso es normal y esperado en apps web con Firebase.

## Estructura de datos en Firestore

```
users/{uid}/accounts/{id}      { name, type, currency, balance, color }
users/{uid}/transactions/{id}  { type, amount, category, accountId, date, note }
users/{uid}/budgets/{id}       { category, monthlyLimit }
users/{uid}/goals/{id}         { name, targetAmount, savedAmount }
```

## Próximos pasos posibles

- Edición de movimientos y cuentas (hoy se puede crear y borrar).
- Filtros y búsqueda en Movimientos, exportar a CSV.
- Gráficos de evolución mensual.
- Reset de presupuestos automático mes a mes con histórico.
