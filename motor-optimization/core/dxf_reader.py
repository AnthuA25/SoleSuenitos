import ezdxf
from collections import defaultdict

def leer_dxf(path):
    try:
        doc = ezdxf.readfile(path)
    except Exception as e:
        raise ValueError(f"No se pudo leer el archivo DXF: {e}")

    piezas_dict = defaultdict(list)

    # 🔹 Buscar piezas tipo polilínea o spline (curvas)
    for e in doc.modelspace().query("LWPOLYLINE SPLINE POLYLINE"):
        try:
            tipo = e.dxftype()
            nombre = e.dxf.layer if e.dxf.layer else "SinNombre"

            # Extraer puntos según tipo
            if tipo in ("LWPOLYLINE", "POLYLINE"):
                puntos = [(p[0], p[1]) for p in e.get_points()]
            elif tipo == "SPLINE" and hasattr(e, "control_points"):
                puntos = [(p[0], p[1]) for p in e.control_points]
            else:
                continue

            if len(puntos) < 3:
                continue

            xs, ys = zip(*puntos)
            ancho = max(xs) - min(xs)
            alto = max(ys) - min(ys)
            area = round(abs(ancho * alto), 2)

            # Determinar orientación
            orientacion = "horizontal" if ancho >= alto else "vertical"

            # Escala automática si el dibujo tiene unidades grandes o pequeñas
            if ancho > 10000 or alto > 10000:
                factor = 0.1
            elif ancho < 10 and alto < 10:
                factor = 100
            else:
                factor = 1.0

            ancho *= factor
            alto *= factor
            area *= factor ** 2

            piezas_dict[nombre].append({
                "nombre": nombre,
                "ancho_mm": round(ancho, 2),
                "alto_mm": round(alto, 2),
                "area_mm2": round(area, 2),
                "orientacion": orientacion,
                "tipo": tipo,
                "puntos": puntos
            })

        except Exception as ex:
            print(f"⚠️ Error leyendo entidad DXF: {ex}")
            continue

    # 🔹 Agrupar repeticiones
    piezas = []
    for nombre, lista in piezas_dict.items():
        if not lista:
            continue
        base = lista[0]
        base["repeticiones"] = len(lista)
        piezas.append(base)

    if not piezas:
        raise ValueError("No se encontraron piezas válidas en el DXF.")

    return {
        "unidades": "milímetros",
        "total_piezas": len(piezas),
        "piezas": piezas
    }
