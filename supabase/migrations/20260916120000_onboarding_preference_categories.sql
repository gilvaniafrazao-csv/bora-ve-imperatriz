-- Categorias da tela de preferências (RF03 / onboarding).
-- Pizza, Hambúrguer e Bar já existem no seed inicial.

INSERT INTO categories (slug, name, category_group) VALUES
  ('sushi', 'Sushi', 'gastronomia'),
  ('churrasco', 'Churrasco', 'gastronomia'),
  ('doces', 'Doces', 'gastronomia')
ON CONFLICT (slug) DO NOTHING;
