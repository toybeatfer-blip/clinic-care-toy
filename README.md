# 🩺 CLINIC CARE TOY

> **Copiloto Operativo y Redactor Clínico Inteligente para el Sistema Administrador de Consultorios (SAC)**  
> *Cumplimiento estricto con la NOM-004-SSA3-2012 y lineamientos de auditoría médica institucional.*

---

## 🌟 Características Principales

1. **Módulos Clínicos para SAC (Listos para Copiar y Pegar):**
   - **Módulo 1: Alta y Ficha de Identificación:** Prevención de duplicidad de expedientes, desglose de código postal y autocompletado de antecedentes.
   - **Módulo 2: Historia Clínica General / Checkup:** Padecimiento actual cronológico, interrogatorio por sistemas con terminación normativa obligatoria (`"...resto del interrogatorio negado."`), somatometría con SpO2 y cálculo de IMC automático, validación estricta de estatura en metros, catálogo **CIE-10** interactivo y prescripción institucional (**ALMUS** / Genéricos).
   - **Módulo 3: Nota de Evolución y Seguimiento:** Revaloración del cuadro clínico, exploración física dirigida y ajuste terapéutico.
   - **Módulo 4: Procedimientos y Consentimientos Informados:** Registro de inyecciones intramusculares (fármaco, dosis, presentación y zona), curaciones, retiro de puntos y leyendas oficiales de testigos.

2. **✨ Procesador de Dictado y Notas en Bruto (IA):**
   - Pega notas médicas libres o dictados rápidos y el sistema las estructura automáticamente en los campos requeridos por la NOM-004.

3. **🛡️ Validador de Auditoría NOM-004 en Tiempo Real:**
   - Detección activa de siglas prohibidas (`NP`, `SDP`, `NA`, `S/S`, `Tx`, `Dx`, etc.) con botón de **"Corregir Todo Automáticamente"** en 1 clic.

4. **⚙️ Personalización e Identidad Médica:**
   - Configura el nombre del médico, cédula profesional general y de especialidad, universidad, teléfono y correo.
   - Configura nombre de la clínica, sucursal y dirección completa.
   - Carga de **logotipo institucional** personalizado (PNG, JPG, SVG).
   - Paleta de colores personalizable (Azul SAC, Verde Médico, Azul ALMUS, Índigo, Morado, Turquesa, Carmesí).

5. **📄 Receta y Nota Médica Imprimible (PDF):**
   - Generación de nota médica y receta oficial con membrete profesional, logotipo, datos del médico, cédulas, dirección y líneas de firma.

6. **🔑 Copiloto Operativo del SAC:**
   - Generador de contraseñas de Windows de consultorio (`X[3 dígitos].[3 dígitos]`).
   - Guía de contingencia para tickets no encontrados y reporte en HELIX.
   - Flujo de asistencia y checado biométrico ADS (turno corrido vs mixto).

---

## 🚀 Despliegue Rápido en la Nube (Gratis)

Este proyecto está construido con **React + Vite + Tailwind CSS**, por lo que es 100% estático, ultra rápido y compatible con cualquier servicio de hosting en la nube.

### Opción A: Despliegue en Vercel (Recomendado)
1. Sube este repositorio a tu cuenta de **GitHub**.
2. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. Haz clic en **"Add New Project"** y selecciona este repositorio.
4. Vercel detectará automáticamente la configuración de Vite. Haz clic en **"Deploy"**.
5. ¡Listo! Tendrás un enlace público `https://tu-proyecto.vercel.app` para acceder desde cualquier dispositivo o consultorio.

### Opción B: Despliegue en Netlify
1. Ingresa a [netlify.com](https://netlify.com).
2. Selecciona **"Add new site" -> "Import an existing project" -> "GitHub"**.
3. Selecciona el repositorio y presiona **"Deploy site"**.

---

## 💻 Comandos para Subir a GitHub

Abre tu terminal en la carpeta del proyecto y ejecuta los siguientes comandos:

```bash
# 1. Verificar archivos preparados
git status

# 2. Agregar todos los archivos al commit
git add .

# 3. Crear el commit de lanzamiento
git commit -m "feat: Lanzamiento inicial de CLINIC CARE TOY para SAC y NOM-004"

# 4. Conectar con tu repositorio remoto de GitHub (sustituye TU_USUARIO y TU_REPOSITORIO)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git

# 5. Subir a la rama principal
git branch -M main
git push -u origin main
```

---

## 🛠️ Ejecución Local

Para ejecutar el proyecto en tu computadora:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📜 Normativa y Auditoría
- **NOM-004-SSA3-2012:** Del expediente clínico.
- **NOM-024-SSA3-2012:** Sistemas de información de registro electrónico para la salud.
- **SAC (Sistema Administrador de Consultorios):** Reglas operativas y de auditoría interna de consultorios de primer contacto.
