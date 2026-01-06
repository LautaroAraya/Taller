'use client';

import { useEffect, useRef, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

export default function SessionTimeout() {
  const { data: session } = useSession();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (!session) return;

    // Limpiar el timer anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Establecer un nuevo timer
    timeoutRef.current = setTimeout(() => {
      signOut({ redirect: true, callbackUrl: '/' });
    }, INACTIVITY_TIMEOUT);
  }, [session]);

  useEffect(() => {
    if (!session) return;

    // Eventos que detectan actividad del usuario
    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ];

    // Agregar listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Inicializar el timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, resetTimer]);

  return null;
}
