# Grill House Jac — Paleta y tipografía

> Estado: **aprobada** (14 oct 2026). Si cambia, actualiza este archivo.

Colores sacados del logo (`logo-grillhousejac-original.jpeg`): oro metálico, negro
carbón y crema. La idea es que se sienta como un steakhouse texano: oscuro, cálido y con
detalles dorados. **No es** el verde olivo de BarJac.

## Colores

| Token | Hex | Uso |
|---|---|---|
| `carbon` | `#14110F` | Fondo principal (modo oscuro) y texto sobre fondos claros |
| `carbon-2` | `#221C17` | Tarjetas, secciones alternas y barra de navegación |
| `cuero` | `#5C4A38` | Bordes, divisores y texto secundario sobre crema |
| `oro` | `#C9A15A` | Color de marca: botones, títulos destacados, íconos |
| `oro-claro` | `#E2C48B` | Hover de botones dorados y brillos |
| `oro-oscuro` | `#7A5C26` | Texto o enlaces dorados **sobre fondo crema** |
| `hueso` | `#F3EEE3` | Fondo claro (menú y secciones de lectura) y texto sobre oscuro |
| `arena` | `#BFB3A3` | Texto secundario sobre fondo oscuro |
| `brasa` | `#A63D24` | Acento opcional, muy poco: etiquetas tipo "Nuevo" o "Picante" |

## Contraste verificado (WCAG)

| Texto sobre fondo | Ratio | Uso permitido |
|---|---|---|
| `hueso` sobre `carbon` | 16.3 | Todo |
| `oro` sobre `carbon` | 7.8 | Todo |
| `oro` sobre `carbon-2` | 7.0 | Todo |
| `arena` sobre `carbon` | 9.1 | Todo |
| `carbon` sobre `oro` (botón) | 7.8 | Todo |
| `carbon` sobre `oro-claro` (hover) | 11.2 | Todo |
| `oro-oscuro` sobre `hueso` | 5.4 | Todo |
| `cuero` sobre `hueso` | 7.3 | Todo |
| `hueso` sobre `brasa` | 5.5 | Todo |
| `oro` sobre `hueso` | **2.1** | **Nunca para texto**; solo líneas o íconos decorativos |

## Tipografía (Google Fonts)

- **Títulos:** `Alfa Slab One` o `Roboto Slab` (700). Es slab serif, como "GRILL HOUSE" en el logo.
- **Acentos cortos** (lema, "Sabor que se siente"): `Oswald`, en mayúsculas y con letras espaciadas.
- **Texto:** `Inter`, igual que BarJac.
- No imites la letra cursiva de "JAC". Para eso usa el logo como imagen.

## Reglas

- El sitio es **oscuro por defecto** (`carbon`), con el menú sobre `hueso` para que se lea fácil.
- El dorado es el acento: no pongas bloques grandes de `oro` de fondo, salvo botones.
- Botón principal: fondo `oro`, texto `carbon`, hover `oro-claro`.
- Botón secundario: borde `oro`, texto `oro`, fondo transparente.
- El logo trae fondo blanco. Sobre fondos oscuros hay que usar una versión PNG sin fondo
  (está pendiente) o ponerlo dentro de un círculo `hueso`.

## Tailwind (referencia)

```js
colors: {
  carbon: { DEFAULT: "#14110F", 2: "#221C17" },
  cuero: "#5C4A38",
  oro: { DEFAULT: "#C9A15A", claro: "#E2C48B", oscuro: "#7A5C26" },
  hueso: "#F3EEE3",
  arena: "#BFB3A3",
  brasa: "#A63D24",
}
```
