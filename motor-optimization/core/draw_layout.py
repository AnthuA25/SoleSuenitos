import matplotlib.pyplot as plt
from shapely.geometry import Polygon
from matplotlib.patches import Polygon as MplPolygon
from matplotlib.collections import PatchCollection

PALETTE = ["#6CC7BE", "#F7B7C7", "#BEE3A2", "#9CC9FF", "#FFD89E"]

def _poly_to_patch(poly: Polygon) -> MplPolygon:
    """Convierte un polígono shapely en un parche matplotlib."""
    x, y = poly.exterior.xy
    return MplPolygon(list(zip(x, y)), closed=True)

def dibujar_marcador(piezas_colocadas, ancho_rollo, largo_rollo, output_png: str, metricas=None):
    """
    Dibuja el marcador ajustando solo el largo usado del rollo.
    Mantiene el ancho real, recorta la parte vacía al final.
    Ideal para exportación o corte en máquina textil.
    """

    # --- Calcular largo realmente usado ---
    max_y_usado = max(p["polygon"].bounds[3] for p in piezas_colocadas)

    # --- Configurar figura y límites ---
    fig, ax = plt.subplots(figsize=(14, 7))
    ax.set_xlim(0, ancho_rollo)
    ax.set_ylim(0, max_y_usado + 10)  # Solo hasta donde hay piezas

    ax.set_facecolor("#F5F5F5")  # Fondo gris claro, cambia a "white" si prefieres fondo blanco
    ax.invert_yaxis()            # Origen arriba, formato textil

    patches, colors = [], []

    # --- Dibujar piezas ---
    for i, p in enumerate(piezas_colocadas):
        patch = _poly_to_patch(p["polygon"])
        patches.append(patch)
        colors.append(PALETTE[i % len(PALETTE)])

        # Etiquetas centradas limpias
        cx, cy = p["polygon"].centroid.x, p["polygon"].centroid.y
        ax.text(
            cx, cy, p["nombre"].capitalize(),
            ha="center", va="center",
            fontsize=13, color="black", weight="bold"
        )

    pc = PatchCollection(
        patches, facecolor=colors, edgecolor="black", linewidth=1.4, alpha=0.95
    )
    ax.add_collection(pc)

    # --- Borde del rollo ---
    borde = MplPolygon(
        [(0, 0), (ancho_rollo, 0), (ancho_rollo, max_y_usado), (0, max_y_usado)],
        closed=True, fill=False, edgecolor="black", linewidth=1.5
    )
    ax.add_patch(borde)

    # --- Limpieza visual total ---
    ax.axis("off")               # Quita ejes y números
    plt.margins(0, 0)            # Sin márgenes
    plt.tight_layout(pad=0)      # Sin padding
    plt.savefig(output_png, dpi=300, bbox_inches="tight", pad_inches=0)
    plt.close(fig)
