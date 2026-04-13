# BuildersMTY — Platform Pipeline & Verification Strategy

## Idea Central

Lanzar la plataforma con varios cursos buenos (ej. Claude Code) + sistema de verificación estudiantil que da acceso premium gratis por un mes, como mecanismo de adquisición y boost a la comunidad.

---

## Stack de Beneficios

| Tier | Requisito | Beneficio |
|---|---|---|
| **Regio Builder** | Escuela en MTY verificada + unirse al Discord + correr verificación del bot | 1 mes premium **sin CC** + rol especial en Discord + canal exclusivo MTY |
| **Student Builder** | Estudiante general verificado (cualquier .edu / .edu.mx) | 1 mes premium **con CC required** |
| **Free** | Nada | Free tier con cursos básicos, puede comprar premium normal |

---

## Flujo Técnico de Verificación

### Opciones para verificación de escuela

**SheerID / UNiDAYS / Student Beans**
- SheerID es el más robusto para LATAM
- Verifica con email institucional o documentos
- Tienen SDK
- Costo: por verificación o revenue share, depende del plan — para early stage se puede negociar un deal

**Email institucional con OTP (v1 recomendado)**
- El user mete su correo `.edu.mx` o `.uanl.mx`, se manda un OTP
- No verifica inscripción activa pero es 80% del valor con 10% del esfuerzo
- Para v1 es suficiente

**Verificación de escuelas MTY específicamente**
- Allowlist de dominios de instituciones regias: UANL, Tec, UDEM, UP, etc.
- No se puede verificar ubicación geográfica de forma confiable sin ser invasivo — los dominios institucionales son el proxy correcto

### Flujo en Discord

1. User llega al Discord
2. Corre un comando del bot
3. Bot pide email institucional
4. Verifica contra el backend (SheerID o flujo OTP propio)
5. Si pasa → asigna rol correspondiente + manda código de acceso a la plataforma
6. Todo automatizado, extendido del bot de GitHub scanning ya existente

---

## Consideraciones de Infra — Runners

- La plataforma **no usa Judge0** — los runners son propios
- Sin dependencia de terceros ni costo por ejecución
- En caso de spike de usuarios free en trial: escalar o throttlear los runners directamente
- Implementar límites de recursos por usuario (CPU time, memoria, ejecuciones concurrentes) para evitar que un usuario trabe el server para todos

---

## Diferenciadores vs Codecrafters (pain points vividos como usuario)

| Problema en Codecrafters | Solución en BuildersMTY |
|---|---|
| Entorno no es browser-based, requiere setup local | Runners propios = todo browser-based, zero setup |
| Git crudo que el usuario tiene que manejar manualmente | Git automatizado en background, la plat hace commit/push, el estudiante solo ve "progreso guardado" |
| Sistema tedioso para obtener el repo para el CV | Al terminar un curso, se genera automáticamente un repo presentable en el GitHub del estudiante: README bien escrito, descripción del proyecto, qué aprendió, badges de completion — listo para poner en el CV ese mismo día |

---

## Riesgos

- **Fraude de verificación:** gente compartiendo emails institucionales. Mitigación: una verificación por email + fraud layer de SheerID si se usa ese servicio.
- **Churn post-mes:** el free trial debe terminar en el momento más motivador. Diseñar el onboarding para que el usuario termine el mes habiendo completado un curso y a mitad de otro.

---

## Notas de Launch

- Lanzar con 2-3 cursos completos y pulidos, no 8 a medias
- La mecánica de verificación MTY como launch mechanic es fuerte porque la comunidad local ya existe en Discord
- Ángulo de prensa local natural: "plataforma de devs de Monterrey da cursos gratis a estudiantes regios"
- Los primeros 200-300 usuarios verificados = social proof para pitch a estudiantes fuera de MTY