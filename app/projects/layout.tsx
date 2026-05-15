import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proyectos | Mariano Laura',
  description: 'Explora proyectos destacados de diseño digital, desarrollo web, interfaces, productos y experiencias interactivas creadas por Mariano Laura.',
};

export default function ProjectsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
