import matplotlib.pyplot as plt
from shapely.geometry import Polygon
import random
import matplotlib.patches as patches

def draw_marker_from_dxf(piezas, ancho_rollo, largo_rollo, out_png):
    """
    Dibuja las piezas con sus curvas originales del DXF
    dentro de un rollo textil (rectángulo gris).
    """

    plt.figure(figsize=(12, 6))
    ax = plt.gca()
    ax.set_facecolor("#d9d9d9")

    # Filtrar solo piezas válidas
    validas = [p for p in piezas if p.get("puntos") and len(p["puntos"]) >= 3]

    if not validas:
        raise ValueError("❌ No hay piezas válidas para dibujar el marcador.")

    # --- Cálculo de límites de las piezas ---
    min_x = min(min(pt[0] for pt in p["puntos"]) for p in validas)
    min_y = min(min(pt[1] for pt in p["puntos"]) for p in validas)
    max_x = max(max(pt[0] for pt in p["puntos"]) for p in validas)
    max_y = max(max(pt[1] for pt in p["puntos"]) for p in validas)

    # --- Ajustar márgenes de visualización ---
    margen = max(ancho_rollo, largo_rollo) * 0.05
    ax.set_xlim(0 - margen, ancho_rollo + margen)
    ax.set_ylim(0 - margen, largo_rollo + margen)
    ax.set_aspect("equal")

    # --- Dibujar el rollo textil de fondo ---
    rollo = patches.Rectangle(
        (0, 0),
        ancho_rollo,
        largo_rollo,
        linewidth=2,
        edgecolor="#555555",
        facecolor="#f0f0f0",
        alpha=0.9,
        zorder=0
    )
    ax.add_patch(rollo)

    # --- Colores agradables tipo textil ---
    colores = ["#70AF85", "#F28482", "#84A59D", "#F6BD60", "#A3C4F3", "#CDB4DB"]

    # --- Dibujar cada pieza sobre la tela ---
    for i, pieza in enumerate(validas):
        puntos = pieza["puntos"]
        nombre = pieza.get("nombre", f"Pieza_{i+1}")
        color = random.choice(colores)

        try:
            poly = Polygon(puntos)
            if not poly.is_valid:
                continue

            x, y = poly.exterior.xy
            ax.fill(x, y, color=color, alpha=0.85, edgecolor="black", linewidth=1.2, zorder=1)

            # Nombre centrado
            cx, cy = poly.centroid.x, poly.centroid.y
            ax.text(cx, cy, nombre, ha="center", va="center", fontsize=9, weight="bold", zorder=2)

        except Exception as ex:
            print(f"⚠️ Error al dibujar {nombre}: {ex}")
            continue

    # --- Títulos y etiquetas ---
    plt.title("Marcador Digital Textil", fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Ancho (mm)")
    plt.ylabel("Largo (mm)")
    plt.grid(False)

    # --- Guardar ---
    plt.savefig(out_png, dpi=200, bbox_inches="tight")
    plt.close()
