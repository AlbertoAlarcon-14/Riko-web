-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','manager','staff');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_all" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CUSTOMERS
CREATE TYPE public.customer_status AS ENUM ('nuevo','recurrente','frecuente','inactivo');
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  birthday date,
  source text,
  marketing_consent boolean NOT NULL DEFAULT false,
  status public.customer_status NOT NULL DEFAULT 'nuevo',
  last_interaction timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (phone)
);
GRANT INSERT ON public.customers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_public_insert" ON public.customers FOR INSERT WITH CHECK (marketing_consent = true);
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FEEDBACK
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 4),
  comment text,
  source text,
  status text NOT NULL DEFAULT 'nueva',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_public_insert" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "feedback_admin_all" ON public.feedback FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- QR SOURCES
CREATE TABLE public.qr_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qr_sources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qr_sources TO authenticated;
GRANT ALL ON public.qr_sources TO service_role;
ALTER TABLE public.qr_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_sources_public_read" ON public.qr_sources FOR SELECT USING (active = true);
CREATE POLICY "qr_sources_admin_all" ON public.qr_sources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.qr_scans TO anon;
GRANT SELECT, INSERT ON public.qr_scans TO authenticated;
GRANT ALL ON public.qr_scans TO service_role;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qr_scans_public_insert" ON public.qr_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "qr_scans_admin_read" ON public.qr_scans FOR SELECT TO authenticated USING (public.is_admin());

-- CAMPAIGNS
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  segment text NOT NULL DEFAULT 'todos',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'borrador',
  target_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_admin_all" ON public.campaigns FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, customer_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_recipients TO authenticated;
GRANT ALL ON public.campaign_recipients TO service_role;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_recipients_admin_all" ON public.campaign_recipients FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SETTINGS
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DEMO / SEED DATA
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Hamburguesas','hamburguesas',1),
  ('Parrilla','parrilla',2),
  ('Acompañamientos','acompanamientos',3),
  ('Bebidas','bebidas',4);

INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'La Trikolor','DEMO · Carne de res, queso costeño, cebolla caramelizada y salsa de la casa.',28000, c.id, true, true, true FROM public.categories c WHERE c.slug='hamburguesas';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Riko Doble Fuego','DEMO · Doble carne, doble queso, tocineta y salsa picante ahumada.',34000, c.id, true, true, true FROM public.categories c WHERE c.slug='hamburguesas';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Clásica Riko','DEMO · Carne 150g, queso, lechuga, tomate y salsa Riko.',22000, c.id, false, true, true FROM public.categories c WHERE c.slug='hamburguesas';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Costillas BBQ','DEMO · Costillas de cerdo a la parrilla con salsa BBQ de la casa.',45000, c.id, true, true, true FROM public.categories c WHERE c.slug='parrilla';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Punta de Anca','DEMO · 300g de punta de anca a la parrilla con papa criolla.',48000, c.id, false, true, true FROM public.categories c WHERE c.slug='parrilla';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Papas Riko','DEMO · Papas a la francesa con queso fundido y tocineta.',16000, c.id, false, true, true FROM public.categories c WHERE c.slug='acompanamientos';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Aros de Cebolla','DEMO · Aros crocantes con salsa ranch.',14000, c.id, false, true, true FROM public.categories c WHERE c.slug='acompanamientos';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Cerveza Artesanal','DEMO · Cerveza artesanal local 330ml.',12000, c.id, false, true, true FROM public.categories c WHERE c.slug='bebidas';
INSERT INTO public.products (name, description, price, category_id, featured, available, is_demo)
SELECT 'Limonada de Coco','DEMO · Limonada de coco natural.',10000, c.id, false, true, true FROM public.categories c WHERE c.slug='bebidas';

INSERT INTO public.qr_sources (name, code) VALUES
  ('Mesa 01','mesa_01'),
  ('Mesa 02','mesa_02'),
  ('Mesa 03','mesa_03'),
  ('Mesa 04','mesa_04'),
  ('Caja','caja'),
  ('Empaque','empaque'),
  ('Instagram','instagram'),
  ('Facebook','facebook');

INSERT INTO public.settings (key, value) VALUES
  ('brand_tagline','El sabor que te hace volver.'),
  ('whatsapp_number','573001112233'),
  ('address','Duitama, Boyacá, Colombia (DEMO · validar dirección exacta)'),
  ('hours','Lun a Dom · 12:00 m a 10:00 pm (DEMO)'),
  ('instagram_url','https://instagram.com/'),
  ('facebook_url','https://facebook.com/'),
  ('maps_url','https://www.google.com/maps?q=Duitama+Boyaca'),
  ('google_reviews_url','https://search.google.com/local/writereview?placeid=DEMO');