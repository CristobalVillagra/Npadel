# Brief de cambios — N Padel (repo: CristobalVillagra/Npadel)

Contexto: Supabase ya tiene las tablas `canchas`, `tarifas`, `reservas`,
`resenas_google` y la vista `estado_reserva` (proyecto `N-Padel Reserva`).
No cambies el esquema — estos cambios son de frontend.

## 1. Validación visible en el formulario de reserva

Hoy el botón de avanzar se bloquea si falta información, pero no indica
dónde. Corrige esto:
- Cada campo obligatorio sin completar debe mostrar un borde rojo y un
  texto de error corto debajo (ej. "Campo obligatorio") apenas el usuario
  intenta avanzar o sale del campo (`onBlur`).
- Al hacer scroll/foco automático al primer campo con error si el usuario
  presiona "Siguiente" con errores pendientes.
- El botón "Siguiente" puede quedar habilitado siempre; que sea el intento
  de avanzar el que dispare la validación visible (mejor UX que un botón
  deshabilitado sin explicación).

## 2. Selección de cancha

Mostrar cada cancha como "Cancha N — Exterior" o "Cancha N — Techada"
(4 canchas: Cancha 1 exterior, Cancha 2/3/4 techada). Usa el campo `tipo`
de la tabla `canchas`, no lo hardcodees.

## 3. Horarios: bloques de 90 min con quiebre al mediodía y tarifa por bloque

Los turnos son siempre de 90 minutos. Genera los horarios disponibles así
(no un loop continuo simple — hay una excepción):

**Lunes a viernes** (abre 07:00, cierra 23:00):
07:00, 08:30, 10:00, 11:30, 13:00, **[salto — NO existe bloque 14:30]**,
15:30, 17:00, 18:30, 20:00, 21:30 (cierre 23:00)

**Sábado y domingo** (abre 09:00, cierra 22:30, sin quiebre al mediodía):
09:00, 10:30, 12:00, 13:30, 15:00, 16:30, 18:00, 19:30, 21:00 (cierre 22:30)

El precio de cada bloque se determina por la **hora de inicio** contra la
tabla `tarifas` (columnas `dia_tipo`, `hora_inicio`, `hora_fin`, `monto`):
si la hora de inicio del bloque cae dentro de `[hora_inicio, hora_fin)` de
una fila con el `dia_tipo` correspondiente, ese es el precio del bloque
completo (aunque el bloque termine después de que cambie la tarifa — por
ejemplo el bloque de 15:30 a 17:00 entre semana se cobra al precio bajo
porque *empieza* antes de las 17:00).

## 4. Destacar visualmente la tarifa alta (desde las 17:00)

En la grilla/lista de horarios, los bloques con tarifa alta (los que
consultan la fila de `tarifas` con `hora_inicio >= '17:00'`) deben verse
distintos a los de tarifa baja — por ejemplo un badge o borde de otro color
("Tarifa alta") junto al precio. No hace falta explicar por qué, solo que
se note de un vistazo.

## Verificación antes de terminar

- Prueba que un bloque a las 14:30 nunca aparezca entre semana.
- Prueba que el bloque 15:30-17:00 entre semana muestre el precio bajo
  ($14.000), no el alto.
- Prueba que en fin de semana no haya ningún salto de horario.
- Prueba que el primer campo con error reciba foco al intentar avanzar sin
  completarlo.
