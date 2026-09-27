# Nexora Design System (approved by Brand, v1.0)

All UI must use only the tokens below. Anything else needs Brand sign-off.

## Typography
- **Font family:** `Geist` (UI and headings), `Geist Mono` (code only)
- **Type scale (px):** 14, 16, 20, 24, 32, 48
- **Line height:** 1.5 body, 1.2 headings
- **Letter spacing:** 0 body, -0.01em headings

## Color
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0d12` | page background |
| `--surface` | `#141821` | cards, panels |
| `--text` | `#e6e8ee` | body text |
| `--text-muted` | `#a3a9b7` | secondary text (min 4.5:1 on `--bg`) |
| `--brand` | `#3b82f6` | primary actions, links |
| `--success` | `#16a34a` | success states |
| `--danger` | `#dc2626` | destructive actions, errors |

## Radius
- **Scale (px):** 4, 8, 12, pill (`999px`, buttons only)

## Spacing
- **Scale (px):** 4, 8, 12, 16, 24, 32, 48, 64

## Motion
- Duration 150–250ms, easing `cubic-bezier(.2,0,0,1)`. No infinite animations. Respect `prefers-reduced-motion`.
