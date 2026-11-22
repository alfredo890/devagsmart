'use client';
import { useState, useEffect } from 'react';

export default function CurrentDate() {
  const [date, setDate] = useState('');
  useEffect(() => {
    setDate(new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  return <div className="text-sm text-slate-400">{date}</div>;
}
