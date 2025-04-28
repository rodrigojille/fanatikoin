import React from 'react';
import Layout from '../../components/Layout';

export default function CookiesPolicy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
        <p className="mb-4">
          Esta Política de Cookies describe cómo Tecnologías Avanzadas Centrales SAPI de CV ("nosotros", "nuestro" o "la Compañía") utiliza cookies y tecnologías similares en el sitio web Fanatikoin.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Qué son las cookies?</h2>
        <p className="mb-4">
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Se utilizan para asegurar el funcionamiento adecuado del sitio, mejorar su experiencia, analizar el uso y personalizar el contenido.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Qué tipos de cookies utilizamos?</h2>
        <ul className="list-disc ml-6 mb-4">
          <li><b>Cookies necesarias</b>: Esenciales para el funcionamiento básico del sitio.</li>
          <li><b>Cookies de análisis</b>: Nos ayudan a entender cómo se utiliza el sitio para mejorarlo.</li>
          <li><b>Cookies de funcionalidad</b>: Permiten recordar sus preferencias.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">Gestión de cookies</h2>
        <p className="mb-4">
          Puede configurar su navegador para rechazar o eliminar cookies. Sin embargo, esto puede afectar la funcionalidad del sitio.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Cumplimiento con la ley mexicana</h2>
        <p className="mb-4">
          Esta política cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y otras regulaciones mexicanas aplicables.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Contacto</h2>
        <p>
          Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en legal@fanatikoin.com.
        </p>
      </div>
    </Layout>
  );
}
