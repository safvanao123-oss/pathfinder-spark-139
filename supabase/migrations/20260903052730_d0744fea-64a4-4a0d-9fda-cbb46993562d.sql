CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.students TO anon, authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "students readable" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "students insertable" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "students updatable" ON public.students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  domain text NOT NULL,
  level text NOT NULL CHECK (level IN ('Beginner','Intermediate','Advanced')),
  duration text NOT NULL,
  provider text NOT NULL,
  prerequisite text NOT NULL DEFAULT 'None',
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses readable" ON public.courses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  career_goal text NOT NULL,
  interests text[] NOT NULL DEFAULT '{}',
  skill_level text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.skill_assessments TO anon, authenticated;
GRANT ALL ON public.skill_assessments TO service_role;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments readable" ON public.skill_assessments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "assessments insertable" ON public.skill_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES public.skill_assessments(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.recommendations TO anon, authenticated;
GRANT ALL ON public.recommendations TO service_role;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recommendations readable" ON public.recommendations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "recommendations insertable" ON public.recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX idx_reco_student ON public.recommendations(student_id);
CREATE INDEX idx_assess_student ON public.skill_assessments(student_id);

INSERT INTO public.courses (title, domain, level, duration, provider, prerequisite, description) VALUES
('Responsive Web Design Foundations','Web Development','Beginner','6 weeks','freeCodeCamp','None','Learn HTML, CSS and responsive layouts by building real pages.'),
('JavaScript Essentials','Web Development','Beginner','8 weeks','Udemy','None','Core JavaScript syntax, DOM manipulation and browser APIs.'),
('React & Modern Frontend Engineering','Web Development','Intermediate','10 weeks','Coursera','JavaScript Essentials','Build component-driven single page apps with React and hooks.'),
('Full-Stack Architecture at Scale','Web Development','Advanced','12 weeks','Udemy','React & Modern Frontend Engineering','Design scalable full-stack systems with caching, queues and CI/CD.'),
('Python for Data Analysis','Data Science','Beginner','6 weeks','Coursera','None','Analyse and clean real datasets using pandas and NumPy.'),
('Statistics for Data Science','Data Science','Beginner','5 weeks','Khan Academy','None','Probability, distributions and hypothesis testing for analysts.'),
('Data Visualisation & Storytelling','Data Science','Intermediate','7 weeks','Udemy','Python for Data Analysis','Turn raw datasets into clear dashboards and narrative reports.'),
('Big Data Engineering with Spark','Data Science','Advanced','11 weeks','Coursera','Data Visualisation & Storytelling','Distributed processing pipelines with Spark, Kafka and warehouses.'),
('Introduction to Artificial Intelligence','Artificial Intelligence','Beginner','6 weeks','Coursera','None','Core AI concepts: search, knowledge representation and agents.'),
('Machine Learning Fundamentals','Artificial Intelligence','Beginner','8 weeks','Udemy','None','Supervised and unsupervised learning with scikit-learn.'),
('Deep Learning with Neural Networks','Artificial Intelligence','Intermediate','10 weeks','Coursera','Machine Learning Fundamentals','CNNs, RNNs and training workflows using TensorFlow and PyTorch.'),
('Applied NLP and Transformers','Artificial Intelligence','Advanced','12 weeks','Udemy','Deep Learning with Neural Networks','Build and fine-tune transformer models for language tasks.'),
('Cybersecurity Essentials','Cybersecurity','Beginner','5 weeks','Cisco Networking Academy','None','Threat landscape, security principles and safe system hygiene.'),
('Networking & Protocol Basics','Cybersecurity','Beginner','6 weeks','freeCodeCamp','None','TCP/IP, DNS and firewalls explained for security beginners.'),
('Ethical Hacking and Penetration Testing','Cybersecurity','Intermediate','9 weeks','Udemy','Networking & Protocol Basics','Reconnaissance, exploitation and reporting in controlled labs.'),
('Advanced Threat Detection & Incident Response','Cybersecurity','Advanced','11 weeks','Coursera','Ethical Hacking and Penetration Testing','SIEM tooling, forensics and enterprise incident playbooks.'),
('Cloud Computing Foundations','Cloud Computing','Beginner','4 weeks','AWS Training','None','Cloud service models, regions and core managed services.'),
('AWS Cloud Practitioner Prep','Cloud Computing','Beginner','6 weeks','AWS Training','None','Guided preparation for the AWS Cloud Practitioner certification.'),
('Docker & Kubernetes in Practice','Cloud Computing','Intermediate','8 weeks','Udemy','Cloud Computing Foundations','Containerise apps and orchestrate them with Kubernetes.'),
('Cloud Solutions Architecture','Cloud Computing','Advanced','12 weeks','Coursera','Docker & Kubernetes in Practice','Design highly available, cost-aware multi-region architectures.'),
('Mobile App Development Basics','Mobile Development','Beginner','6 weeks','Udemy','None','Mobile UI patterns and your first cross-platform app.'),
('Dart & Flutter Starter','Mobile Development','Beginner','7 weeks','Google Developers','None','Build your first Flutter screens, widgets and navigation.'),
('React Native for Production Apps','Mobile Development','Intermediate','9 weeks','Coursera','Mobile App Development Basics','State management, native modules and app store deployment.'),
('Advanced Android with Kotlin','Mobile Development','Advanced','11 weeks','Google Developers','React Native for Production Apps','Coroutines, Jetpack Compose and performance tuning on Android.'),
('UI/UX Design Principles','UI/UX Design','Beginner','5 weeks','Coursera','None','Layout, typography, colour and accessibility fundamentals.'),
('Figma for Interface Design','UI/UX Design','Beginner','4 weeks','Udemy','None','Design and prototype interfaces quickly using Figma.'),
('User Research & Usability Testing','UI/UX Design','Intermediate','8 weeks','Interaction Design Foundation','UI/UX Design Principles','Plan interviews, run usability tests and synthesise insights.'),
('Design Systems & Product Strategy','UI/UX Design','Advanced','10 weeks','Interaction Design Foundation','User Research & Usability Testing','Scale design with tokens, component libraries and governance.');