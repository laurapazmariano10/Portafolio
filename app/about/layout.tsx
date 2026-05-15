import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acerca de | Mariano Laura',
  description: 'Conoce a Mariano Laura, diseñador digital y desarrollador enfocado en experiencias web, UI/UX, 3D y soluciones digitales funcionales.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
