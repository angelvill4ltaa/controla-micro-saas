-- Datos ficticios para la demostración de Controla.
-- Es seguro ejecutar esta consulta más de una vez: no duplica estos IDs ni altera otros registros.
insert into public.actions
  (id, title, description, owner, priority, due_date, status)
values
  ('a1000000-0000-4000-8000-000000000001',
   'Actualizar matriz de riesgos operativos',
   'Revisar controles y asignar responsables para los riesgos críticos.',
   'Lucía Fernández', 'Alta', current_date + 2, 'En progreso'),
  ('a1000000-0000-4000-8000-000000000002',
   'Documentar proceso de altas de clientes',
   'Centralizar pasos y evidencias del proceso comercial.',
   'Diego Salas', 'Media', current_date + 7, 'Pendiente'),
  ('a1000000-0000-4000-8000-000000000003',
   'Cerrar observación de control de accesos',
   'Confirmar revisión trimestral de permisos del equipo.',
   'María Paredes', 'Alta', current_date - 1, 'Completada')
on conflict (id) do nothing;
