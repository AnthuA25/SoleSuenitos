#  Sistema de Optimización Textil – **Sole Sueñitos**

> Plataforma integral para la **gestión y optimización del corte de tela** en procesos de confección.  
> Permite digitalizar moldes, generar marcadores optimizados y minimizar el desperdicio textil mediante un motor de optimización inteligente.


---

##  Arquitectura General
El sistema está conformado por tres módulos principales que trabajan de forma integrada:

| Módulo | Tecnología | Descripción |
|:-------|:------------|:-------------|
| **Backend Principal (.NET 8)** | ASP.NET Core · Entity Framework Core · JWT | Administra usuarios, roles, moldes, autenticación, políticas de autorización y conexión a base de datos. |
| **Motor de Optimización (Python)** | FastAPI · ezdxf · Shapely | Analiza archivos DXF, calcula áreas, orientaciones y genera marcadores digitales optimizados. |
| **Frontend (React)** | React + Vite | Interfaz visual moderna para cargar moldes, visualizar resultados y gestionar procesos de producción. |

---

## 📂 Estructura del Proyecto

```bash
SoleSuenitos/
│
├── back-net/                   # Backend .NET
│   ├── Controllers/            # Endpoints REST
│   ├── Models/                 # Entidades EF Core
│   ├── Configurations/         # JWT, DB, Policies, CORS
│   ├── Migrations/             # Migraciones
│   ├── Program.cs              # Configuración base
│   └── appsettings.json
│
├── motor-optimization/         # Microservicio Python
│   ├── core/                   # Lógica: leer_dxf, optimizer, layout_draw
│   ├── routes/                 # Endpoints FastAPI
│   ├── output/                 # Resultados generados
│   ├── requirements.txt
│   └── app.py
│
├── frontend/                   # Aplicación React
│   ├── src/                    # Componentes, hooks, API
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```


## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <URL-del-repositorio>
cd <project-name>
```

### 2. Backend (.NET 8)

Instalar dependencias
```bash
cd back-net
dotnet restore
```

Crear archivo .env
```bash
DATABASE_URL=
JWT_SECRET=
```


Ejecutar servidor
```bash
dotnet run
```

### 3. Motor de Optimización (Python)

Instalar dependencias
```bash
cd motor-optimization
pip install -r requirements.txt
```

Ejecutar servidor
```bash
uvicorn app:app --reload 
```

### 4. Frontend (React)

Instalar dependencias
```bash
cd frontend
yarn
```

Ejecutar entorno local
```bash
yarn dev
```

##  Funcionalidades principales

    -   Autenticación JWT con roles: Logística, Operario de Corte, Inspector de Calidad.
    -   Gestión de Moldes: registrar, listar, buscar y eliminar moldes.
    -   Lectura de archivos DXF con cálculo geométrico (área, dimensiones, orientación).
    -   Optimización de corte textil y generación de marcador digital.
    -   Interfaz React responsiva con integración al backend.
    -   Base de datos PostgreSQL con control de versiones de moldes.


##  Tecnologías utilizadas

### ⚙️ Backend (.NET)
- **ASP.NET Core 8** – Framework principal para el desarrollo del API REST.  
- **Entity Framework Core** – ORM para la gestión y persistencia de datos en PostgreSQL.  
- **DotNetEnv** – Carga de variables de entorno desde archivo `.env`.  
- **JWT Authentication** – Sistema de autenticación basado en tokens seguros.  
- **Swagger / CORS** – Documentación interactiva y control de acceso entre dominios.

---

### 🐍 Motor de Optimización (Python)
- **FastAPI** – Framework rápido y moderno para la creación de microservicios.  
- **ezdxf** – Librería para lectura y manipulación de archivos DXF (moldes textiles).  
- **Shapely** – Cálculos geométricos y de área para optimización de piezas.  
- **Uvicorn** – Servidor ASGI ligero para ejecutar la aplicación FastAPI.

---

### 💻 Frontend (React)
- **React 18** – Librería principal para la construcción de la interfaz de usuario.  
- **Vite** – Entorno de desarrollo rápido y moderno para React.  
- **Tailwind CSS** – Framework de estilos utilitarios para diseño adaptable.  
- **Axios** – Cliente HTTP para la comunicación con el backend.  
- **React Router DOM** – Gestión de rutas y navegación dentro de la aplicación.

## 👥 Equipo de Desarrollo

| Rol | Integrante | 
|:----|:------------|
| 🎨 **Diseño UI/UX & Frontend Developer 1** | [**Aylin Santa Cruz Vargas**](https://github.com/AnthuA25)
| 👩‍💻 **Frontend Developer 1** | [Nombre] |
| 👨‍💻 **Frontend Developer 2** | [Nombre] |
| 🧠 **Backend Developer 1** | [Nombre] | 
| ⚙️ **Backend Developer 2** | [Nombre] |
| 🧮 **Administrador del Sistema** | [Nombre] | 
| 🧪 **Tester 1** | [Nombre] | 
| 🧪 **Tester 2** | [Nombre] | 


