# Controla - micro SaaS para seguimiento de acciones correctivas

MVP B2B para que equipos de operaciones, calidad y control interno registren hallazgos, asignen responsables y fechas límite y den seguimiento hasta el cierre.

## Propuesta de producto

- **Problema:** los compromisos de auditorías y revisiones internas suelen quedar repartidos entre hojas de cálculo, correos y chats. Esto dificulta saber quién es responsable, qué vence primero y qué ya se cerró.
- **Usuario objetivo:** analistas y líderes de operaciones, calidad y control interno de pequeñas y medianas empresas y consultoras.
- **MVP:** tablero con indicadores, alta/edición/eliminación de acciones, prioridad, responsable, vencimiento, estado, búsqueda y filtro.
- **Datos guardados:** título, descripción, responsable, prioridad, fecha límite, estado y fecha de creación.
- **IA dentro del producto (siguiente etapa):** resumir una observación y proponer un borrador de acciones y evidencias requeridas, siempre sujeto a revisión humana. Esa integración no está habilitada en este MVP.
- **Monetización:** suscripción por organización y cantidad de usuarios; plan inicial con límite de acciones y plan de equipo con reportes, historial e integraciones.
- **Para producción:** autenticación, aislamiento por organización, auditoría de cambios, notificaciones, permisos por rol, pruebas, monitoreo, copias de seguridad y revisión de seguridad.

## Ejecutar y probar

1. Abre `index.html` con un servidor estático local. Por ejemplo, en VS Code instala/usa la extensión **Live Server** y elige **Open with Live Server**. También puedes ejecutar `npx serve .` en esta carpeta si tienes Node.js.
2. El modo demostración incluye tres registros de ejemplo. Crea, edita, cambia el estado y elimina registros; en este modo los cambios persisten en el almacenamiento local del navegador.
3. Para usar Supabase, sigue la sección siguiente. Al detectar `config.js` con valores válidos, la aplicación carga y guarda desde la tabla remota.

## Conectar Supabase

1. Crea un proyecto gratuito de Supabase.
2. En **SQL Editor**, ejecuta `supabase/schema.sql`. Esta configuración permite lectura y escritura anónima para una demostración y, por eso, los datos no son privados.
3. Copia `config.example.js` como `config.js` y completa `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` desde **Connect** o **Project Settings > API Keys**. Para este MVP estático, `config.js` se incluye en el repositorio y contiene solo la clave pública publishable, diseñada para uso desde el navegador. Nunca incluyas `service_role` ni una secret key en el navegador ni en GitHub. La clave no es un secreto, pero el SQL de demostración permite acceso anónimo a los registros: utiliza únicamente datos ficticios.
4. Sirve de nuevo el sitio con Live Server. El indicador superior debe mostrar **Supabase conectado**. La tabla empezará vacía; crea una acción para comprobar el guardado remoto.
5. No uses políticas anónimas con información real. Para producción activa Supabase Auth y aplica políticas RLS que limiten cada operación a filas de la organización autenticada.

## Publicar en GitHub y Vercel

Desde la carpeta `micro-saas-controla`, crea un repositorio vacío en GitHub y ejecuta:

```bash
git init
git add .
git commit -m "feat: crear MVP de Controla"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/controla.git
git push -u origin main
```

En Vercel importa ese repositorio. Selecciona **Other** como framework, deja vacíos el comando de build y el directorio de salida (`.`), y despliega. La aplicación necesita `config.js` en el directorio publicado para conectarse a Supabase. Verifica el link público y el CRUD después del deploy.

## Estructura

```text
index.html              Interfaz y formulario
styles.css              Estilos responsivos
app.js                  Renderizado y operaciones CRUD
config.example.js       Plantilla de configuración de Supabase
supabase/schema.sql     Tabla, índice y políticas para demo
```

## Qué hace el código

- `render()` filtra registros y actualiza tabla e indicadores.
- `openDialog()` usa un mismo formulario para crear y editar.
- `changeStatus()` cambia el estado en la base configurada.
- `deleteAction()` solicita confirmación y elimina el registro.
- `connectDatabase()` intenta iniciar Supabase; si no hay configuración, el MVP usa `localStorage`.
- Las entradas de usuario se insertan con `textContent` o se escapan antes de construir etiquetas para evitar interpretar texto como HTML.

## Explicación de uso de IA

Completa estos puntos con lo que efectivamente ocurra en tu sesión de examen:

- **Herramienta:** ChatGPT (OpenAI), como apoyo para estructurar la propuesta, generar un primer borrador de interfaz y código CRUD, y documentar decisiones.
- **Prompts principales:** “Propón un micro SaaS B2B para seguimiento de hallazgos de auditoría con alcance MVP y monetización”; “Construye una aplicación estática en JavaScript legible con CRUD, filtros y Supabase”; “Revisa el flujo de datos, la configuración segura y redacta instrucciones de despliegue”.
- **Código con apoyo de IA:** estructura HTML, estilos, lógica de renderizado y CRUD, y SQL inicial.
- **Decisiones propias a defender:** elegir un problema empresarial concreto; mantener el alcance en seguimiento de acciones; usar Supabase para persistencia; separar la configuración; usar estados y prioridades controlados; dejar claro que las políticas abiertas solo sirven para datos ficticios de demo.
- **Errores encontrados y resolución:** anota aquí solo problemas que observes al ejecutar y cómo los resolviste. No afirmes pruebas que no hayas hecho.

## Guion de presentación (hasta 5 minutos)

> Controla ayuda a equipos de operaciones y control interno a cerrar hallazgos sin perder responsables ni fechas. El MVP muestra un tablero con acciones, prioridades, responsables, vencimientos y estados. Se puede buscar, filtrar, crear, editar, cambiar estado y eliminar. La app funciona en modo local para demostración y conecta a Supabase cuando se configura el proyecto; la tabla se define con SQL y guarda los registros. El sitio está preparado para publicarse como estático en Vercel y el código para subirse a GitHub. Usé ChatGPT para acelerar el primer borrador de interfaz, CRUD, SQL y documentación, y revisé las decisiones de alcance y configuración. Para convertirlo en producto incorporaría autenticación, separación de datos por empresa, permisos, historial, notificaciones, reportes, pruebas y monitoreo; luego evaluaría sugerencias de IA con aprobación humana.

Antes de presentarlo, configura Supabase, publica el repositorio y despliega el sitio; reemplaza cualquier detalle del guion que no coincida con lo que hiciste realmente.
