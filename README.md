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
| **Frontend (React)** | React + Vite · TailwindCSS | Interfaz visual moderna para cargar moldes, visualizar resultados y gestionar procesos de producción. |

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

