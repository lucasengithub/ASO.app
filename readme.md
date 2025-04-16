# aso.app

La app de la (aso)ciación de Alumnos de Diseño de Madrid (aadm).

## Ejecutar

1. Clona el repo
2. Instala las dependencias ``npm install .``
3. Construye `` npm run build``
4. Crea un .env con:

   ```
   NOTION_KEY=*
   AADM_DATABASE_ID=*
   ESCUELA_DATABASE_ID=*
   INICIO_DATABASE_ID=*
   URL_ASO_FEED=https://asoaadm.substack.com/feed
   URL_ESD_FEED=https://admin-dev.esdmadrid.es/rss
   TOKEN_CACHE=*
   SITE=*
   CANAL="estable"
   ```
5. Ejecuta `` npm start``

## Info

Usa Notion API para obtener los datos. Es una PWA y en iOS permite instalar el correo de EducaMadrid
