'use client';
import { Suspense } from 'react';
import AssistantEditor from './editor';

export default function Page() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <AssistantEditor />
    </Suspense>
  );
}
