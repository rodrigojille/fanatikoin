import React from 'react';
import Layout from '../../components/Layout';

export default function TermsOfService() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Términos de Servicio</h1>
        <p className="mb-4">
          Estos Términos de Servicio regulan el uso del sitio web Fanatikoin, operado por Tecnologías Avanzadas Centrales SAPI de CV ("la Compañía"). Al acceder o utilizar el sitio, usted acepta estos términos y condiciones.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">1. Uso del sitio</h2>
        <p className="mb-4">Debe tener al menos 18 años para utilizar este sitio. Usted se compromete a utilizar el sitio de conformidad con la ley mexicana y a no realizar actividades ilícitas.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">2. Propiedad intelectual</h2>
        <p className="mb-4">Todo el contenido del sitio es propiedad de la Compañía o sus licenciantes. No puede copiar, distribuir o modificar el contenido sin autorización expresa.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">3. Protección de datos</h2>
        <p className="mb-4">El tratamiento de datos personales se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y nuestra Política de Privacidad.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">4. Limitación de responsabilidad</h2>
        <p className="mb-4">La Compañía no será responsable por daños derivados del uso o imposibilidad de uso del sitio.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">5. Modificaciones</h2>
        <p className="mb-4">La Compañía puede modificar estos términos en cualquier momento. Los cambios serán publicados en esta página.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">6. Ley aplicable y jurisdicción</h2>
        <p className="mb-4">Estos términos se rigen por la legislación mexicana. Cualquier controversia será resuelta ante los tribunales competentes de la Ciudad de México.</p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Contacto</h2>
        <p>Para cualquier duda sobre estos términos, contáctenos en legal@fanatikoin.com.</p>
      </div>
    </Layout>
  );
}
