from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
from core.dxf_reader import leer_dxf
from core.optimizer import shelf_pack, generar_version_con_giro
from core.layout_draw import dibujar_marcador, dibujar_marcador_png

app = FastAPI(title="Motor de Optimización Textil - Sole Sueñitos")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/optimize")
async def optimize(
    archivo: UploadFile = File(...),
    producto: str = Form(...),
    talla: str = Form(...),
    cantidad: int = Form(...),
    ancho_rollo_mm: float = Form(...),
    largo_rollo_mm: float = Form(...),
    giro_permitido: str = Form("0"),
    orientacion_pieza: str = Form("libre"),
    version: str = Form("v1")
):
    os.makedirs("output/temp", exist_ok=True)
    os.makedirs("output/markers", exist_ok=True)

    # Guardar archivo temporal
    path_temp = f"output/temp/{archivo.filename}"
    with open(path_temp, "wb") as buffer:
        buffer.write(await archivo.read())

    # Leer piezas desde DXF
    data = leer_dxf(path_temp)
    piezas = data["piezas"]

    # Calcular disposición inicial (layout)
    colocadas, kpis = shelf_pack(piezas, ancho_rollo_mm, largo_rollo_mm)

    # Directorio y nombre de versión
    output_dir = f"output/markers/{producto}_{talla}"
    os.makedirs(output_dir, exist_ok=True)

    version_name = f"{producto}_{talla}_{version}"
    dxf_path = os.path.join(output_dir, f"{version_name}.dxf")
    png_path = os.path.join(output_dir, f"{version_name}.png")

    # Generar marcador DXF + PNG
    dibujar_marcador(colocadas, dxf_path)
    dibujar_marcador_png(colocadas, png_path, ancho_rollo_mm, largo_rollo_mm)

    return {
        "message": f"Marcador {version} generado correctamente",
        "paths": {
            "dxf": dxf_path,
            "png": png_path
        },
        "kpis": kpis,
        "version": version
    }


@app.post("/generate-version")
async def generate_version(
    archivo: UploadFile = File(...),
    producto: str = Form(...),
    talla: str = Form(...),
    ancho_rollo_mm: float = Form(...),
    largo_rollo_mm: float = Form(...),
    angulo_giro: int = Form(90),
    version: str = Form("v2")
):
    os.makedirs("output/temp", exist_ok=True)
    os.makedirs("output/markers", exist_ok=True)

    path_temp = f"output/temp/{archivo.filename}"
    with open(path_temp, "wb") as buffer:
        buffer.write(await archivo.read())

    data = leer_dxf(path_temp)
    piezas = data["piezas"]

    # Generar versión con giro diferente
    colocadas, kpis = generar_version_con_giro(
        piezas, ancho_rollo_mm, largo_rollo_mm, angulo_giro
    )

    output_dir = f"output/markers/{producto}_{talla}"
    os.makedirs(output_dir, exist_ok=True)

    version_name = f"{producto}_{talla}_{version}"
    dxf_path = os.path.join(output_dir, f"{version_name}.dxf")
    png_path = os.path.join(output_dir, f"{version_name}.png")

    dibujar_marcador(colocadas, dxf_path)
    dibujar_marcador_png(colocadas, png_path, ancho_rollo_mm, largo_rollo_mm)

    return {
        "message": f"Versión {version} generada correctamente con giro {angulo_giro}°",
        "paths": {"dxf": dxf_path, "png": png_path},
        "kpis": kpis,
        "version": version
    }
