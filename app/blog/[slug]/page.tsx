import { Navbar } from '@/components/navbar';
import { FooterOnly } from '@/components/ContactAndFooter';
import Image from 'next/image';
import Link from 'next/link';

// Base de datos simulada de artículos de blog
const BLOG_DATABASE: Record<string, any> = {
  'el-futuro-de-la-ia': {
    tag: 'Tutoriales',
    date: '27 de abril de 2025',
    title: 'EL FUTURO DE LA INTELIGENCIA ARTIFICIAL EN EL DESARROLLO DE SOFTWARE',
    description: 'La era de escribir código de forma manual está llegando a su fin. Descubre cómo los agentes autónomos no solo están acelerando la producción, sino redefiniendo lo que significa ser ingeniero.',
    mainImage: '/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/portada.webp',
    points: [
      {
        title: '1. MÁS ALLÁ DEL AUTOCOMPLETADO: EL DESPERTAR DE LOS AGENTES',
        text: 'Hubo un tiempo en el que nos maravillaba que un editor adivinara la siguiente variable. Hoy, eso es historia antigua. Los agentes autónomos actuales no solo predicen texto; interpretan el contexto completo de arquitecturas complejas, proponiendo soluciones sistémicas antes de que te des cuenta de que había un problema. Ya no estamos tecleando instrucciones; estamos teniendo conversaciones de alto nivel sobre la lógica de negocio con entidades digitales.',
        type: 'single',
        images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/1.webp']
      },
      {
        title: '2. EL OCASO DE LA DEUDA TÉCNICA Y EL CÓDIGO LEGACY',
        text: 'Todos hemos sentido ese escalofrío al heredar un proyecto indocumentado y caótico. La Inteligencia Artificial está cambiando esa narrativa por completo. Al analizar millones de patrones, los modelos actuales pueden desenredar años de "código espagueti" en cuestión de minutos, refactorizando módulos enteros en tiempo real. La deuda técnica, ese monstruo que consumía el tiempo de los equipos, está siendo erradicada gradualmente.',
        type: 'single',
        images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/2.webp']
      },
      {
        title: '3. EL INGENIERO COMO DIRECTOR DE ORQUESTA',
        text: 'La sintaxis dejó de ser la barrera. A medida que las máquinas asumen la carga bruta de la codificación, el rol del desarrollador muta hacia algo mucho más profundo. Nos estamos convirtiendo en arquitectos visuales, en directores de orquesta que coordinan diferentes agentes especializados. La pregunta ya no es "¿cómo lo programo?", sino "¿qué problema fundamental estoy intentando resolver y con qué impacto?"',
        type: 'single',
        images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/3.webp']
      },
      {
        title: '4. SEGURIDAD PROACTIVA: EL FIN DEL BUG EN PRODUCCIÓN',
        text: 'Imagina un revisor implacable, infatigable y capaz de prever vectores de ataque que aún no han sido documentados formalmente. Las nuevas IA escanean el código en tiempo real, inyectan casos de prueba extremos y simulan entornos de caos total. La seguridad ha dejado de ser la última fase del ciclo de desarrollo para convertirse en un guardián silencioso incrustado en cada línea de código que aprobamos y subimos.',
        type: 'dual',
        images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/4.1.webp', '/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/4.2.webp']
      },
      {
        title: '5. EL ELEMENTO HUMANO: LO ÚNICO IRREMPLAZABLE',
        text: 'Frente a este avance vertiginoso, surge una certeza absoluta: la inteligencia artificial es una herramienta de amplificación, no de sustitución. La empatía para entender la frustración de un usuario, el criterio ético para diseñar algoritmos justos y la creatividad para soñar productos que rompan moldes son y seguirán siendo un territorio exclusivamente humano. El ingeniero del mañana no escribirá código más rápido; pensará más profundo.',
        type: 'single',
        images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/5.webp']
      }
    ]
  },
  'computacion-cuantica': {
    tag: 'Perspectivas',
    date: '30 de abril de 2025',
    title: 'COMPUTACIÓN CUÁNTICA: ¿ESTAMOS CERCA DE LA SUPREMACÍA?',
    description: 'Olvida todo lo que sabes sobre unos y ceros. La revolución cuántica no es solo una actualización de hardware, es un salto hacia una nueva dimensión de posibilidades físicas y matemáticas.',
    mainImage: '/imgBlogsWebp/ComputacionCuantica/portada.webp',
    points: [
      {
        title: '1. LA MUERTE DEL BIT Y EL NACIMIENTO DEL CAOS CONTROLADO',
        text: 'Durante décadas, nuestro mundo digital ha vivido en blanco y negro: ceros y unos, encendido y apagado. La computación cuántica introduce la superposición, permitiendo que un qubit explore todas las posibilidades simultáneamente. Es como intentar salir de un laberinto; mientras una computadora normal probaría cada camino uno por uno, la máquina cuántica inunda el laberinto por completo, encontrando la salida de manera instantánea.',
        type: 'single',
        images: ['/imgBlogsWebp/ComputacionCuantica/1.webp']
      },
      {
        title: '2. EL INVIERNO CUÁNTICO: DECOHERENCIA Y RUIDO',
        text: 'Pero dominar este poder infinito no es sencillo. Los qubits son entidades extremadamente frágiles, asustadizos ante el menor cambio de temperatura o radiación cósmica. Este fenómeno, conocido como decoherencia, ha sido el gran villano de nuestra historia. Sin embargo, estamos presenciando avances monumentales en algoritmos de corrección de errores, creando escudos invisibles que protegen la frágil danza cuántica del caos del universo exterior.',
        type: 'single',
        images: ['/imgBlogsWebp/ComputacionCuantica/2.webp']
      },
      {
        title: '3. LA CUENTA REGRESIVA PARA LA CRIPTOGRAFÍA MUNDIAL',
        text: 'Hay un reloj invisible haciendo tic-tac en el fondo de internet. Algoritmos cuánticos, como el de Shor, poseen el potencial teórico de destrozar los protocolos de seguridad que protegen desde tus mensajes hasta los sistemas bancarios globales. La transición hacia la criptografía post-cuántica no es una medida preventiva exagerada de unos cuantos paranoicos; es la carrera armamentista y de ciberseguridad silenciosa más importante de nuestra década.',
        type: 'single',
        images: ['/imgBlogsWebp/ComputacionCuantica/3.webp']
      },
      {
        title: '4. REDISEÑANDO LA NATURALEZA A ESCALA MOLECULAR',
        text: 'Romper contraseñas y encriptaciones es el truco barato de la física cuántica. Su verdadero propósito es simular la naturaleza en su propio idioma indescifrable. Al mapear interacciones moleculares con una precisión que desafía a los supercomputadores clásicos, estamos a las puertas de sintetizar medicamentos a medida en días y descubrir nuevos materiales para revertir la crisis climática. Es el hackeo definitivo a las leyes mismas de la química.',
        type: 'dual',
        images: ['/imgBlogsWebp/ComputacionCuantica/4.1.webp', '/imgBlogsWebp/ComputacionCuantica/4.2.webp']
      },
      {
        title: '5. EL LARGO CAMINO HACIA LA COMERCIALIZACIÓN MASIVA',
        text: 'Aunque los gigantes tecnológicos presuman de hitos en laboratorios helados, la verdadera democratización ocurre en la nube. Hoy, cualquier soñador puede acceder a una infraestructura cuántica desde su laptop, enviando instrucciones a un procesador que opera bajo leyes que desafían la intuición. No estamos creando una herramienta; estamos abriendo una puerta a una nueva realidad donde lo imposible se vuelve computable.',
        type: 'single',
        images: ['/imgBlogsWebp/ComputacionCuantica/5.webp']
      }
    ]
  },
  'realidad-mixta': {
    tag: 'Perspectivas',
    date: '2 de mayo de 2025',
    title: 'LA REVOLUCIÓN DE LA REALIDAD MIXTA Y EL CÓMPUTO ESPACIAL',
    description: 'El cómputo espacial no es usar unas gafas para ver pantallas flotantes; es disolver por completo la barrera entre el mundo físico y nuestra imaginación. El software acaba de romper la pantalla bidimensional.',
    mainImage: '/imgBlogsWebp/larevoluciondelarealidad/portada.webp',
    points: [
      {
        title: '1. EL FIN DE LOS RECTÁNGULOS DE CRISTAL',
        text: 'Llevamos décadas atrapados mirando pequeños rectángulos brillantes. La Realidad Mixta (MR) destruye esta limitación, convirtiendo tu habitación, tu escritorio y el mundo entero en un lienzo infinito. Las interfaces ya no están limitadas por biseles de aluminio; ahora respiran y ocupan espacio volumétrico a tu alrededor, respondiendo a la profundidad y a la iluminación física de tu entorno.',
        type: 'single',
        images: ['/imgBlogsWebp/larevoluciondelarealidad/1.webp']
      },
      {
        title: '2. INTERACCIÓN ORGÁNICA: TUS OJOS SON EL MOUSE',
        text: 'Al eliminar el teclado y el ratón, el cómputo espacial exige un nuevo paradigma de diseño. El seguimiento ocular preciso y el reconocimiento de gestos a nivel milimétrico significan que la interacción se vuelve casi telepática. Miras un elemento, juntas tus dedos, y la acción ocurre de manera instantánea y natural, devolviendo la interacción digital a nuestras raíces físicas.',
        type: 'single',
        images: ['/imgBlogsWebp/larevoluciondelarealidad/2.webp']
      },
      {
        title: '3. PRESENCIA Y COLABORACIÓN A DISTANCIA',
        text: 'Las videollamadas planas nunca lograron simular la verdadera presencia humana. Con el cómputo espacial, estamos viendo el surgimiento de avatares fotorealistas y reuniones volumétricas. Ya no estás viendo un video de tus colegas; estás compartiendo un modelo 3D de un motor espacial en medio de tu sala, con un sentido de escala, profundidad y audio espacial que engaña a tu cerebro haciéndole creer que están realmente ahí.',
        type: 'single',
        images: ['/imgBlogsWebp/larevoluciondelarealidad/3.webp']
      },
      {
        title: '4. REDEFINIENDO LA PRODUCTIVIDAD Y EL ENTRETENIMIENTO',
        text: 'La capacidad de anclar herramientas de software en el espacio físico reescribe cómo trabajamos. Imagina tener tus líneas de código flotando sobre tu teclado, tu diseño 3D a tu derecha, y un cine inmersivo de 100 pulgadas frente a ti. La oficina del futuro es portátil, infinita y completamente personalizable a nivel subatómico.',
        type: 'dual',
        images: ['/imgBlogsWebp/larevoluciondelarealidad/4.1.webp', '/imgBlogsWebp/larevoluciondelarealidad/4.2.webp']
      },
      {
        title: '5. LOS DESAFÍOS DE UN MUNDO AUMENTADO',
        text: 'Esta utopía tecnológica trae consigo dilemas masivos. La cantidad de cámaras y sensores necesarios para mapear tu entorno en tiempo real levanta banderas rojas sobre la privacidad absoluta. El desafío para la próxima década no será solo construir hardware más liviano, sino diseñar sistemas operativos éticos que protejan nuestros santuarios físicos de la hiper-vigilancia corporativa.',
        type: 'single',
        images: ['/imgBlogsWebp/larevoluciondelarealidad/5.webp']
      }
    ]
  },
  'arquitecturas-serverless': {
    tag: 'Perspectivas',
    date: '22 de abril de 2025',
    title: 'ARQUITECTURAS SERVERLESS: ESCALABILIDAD SIN LÍMITES',
    description: 'El mito de mantener servidores ha colapsado. La nube moderna escala tu código desde cero hasta millones de peticiones por segundo sin inmutarse, cobrándote solo por el milisegundo exacto de cálculo bruto.',
    mainImage: '/imgBlogsWebp/ARQUITECTURAS SERVERLESS/portada.webp',
    points: [
      {
        title: '1. EL OCASO DEL SERVIDOR TRADICIONAL',
        text: 'La idea de comprar hierro, configurar sistemas operativos y adivinar picos de tráfico se siente hoy como usar una máquina de escribir. Serverless no significa que no existan servidores, significa que ya no son tu problema. Te conviertes en un puro desarrollador de lógica; subes tu código y un ejército de máquinas invisibles se encarga de ejecutarlo.',
        type: 'single',
        images: ['/imgBlogsWebp/ARQUITECTURAS SERVERLESS/1.webp']
      },
      {
        title: '2. ELASTICIDAD INFINITA, FACTURACIÓN MICROSCÓPICA',
        text: 'El modelo económico de Serverless es una maravilla de la eficiencia moderna. Si tu aplicación recibe cero visitas durante la noche, pagas cero centavos. Pero si un evento viral te envía un millón de usuarios en un minuto, la infraestructura se clona mágicamente para absorber el impacto. Pagar por milisegundos de ejecución en lugar de servidores inactivos está democratizando la innovación global.',
        type: 'single',
        images: ['/imgBlogsWebp/ARQUITECTURAS SERVERLESS/2.webp']
      },
      {
        title: '3. EL ARTE DE LAS FUNCIONES EFÍMERAS',
        text: 'En este nuevo mundo, las aplicaciones monolíticas son desmembradas en cientos de microfunciones autónomas (FaaS). Cada función despierta, ejecuta su tarea específica y muere en fracciones de segundo. Este paradigma obliga a los ingenieros a diseñar sistemas verdaderamente modulares, resilientes y sin estado, donde un fallo en un engranaje no derriba el motor completo.',
        type: 'single',
        images: ['/imgBlogsWebp/ARQUITECTURAS SERVERLESS/3.webp']
      },
      {
        title: '4. BASES DE DATOS SIN FRICCIÓN',
        text: 'El talón de Aquiles histórico del Serverless era el estado: las bases de datos no estaban diseñadas para conexiones efímeras. Hoy, el surgimiento de bases de datos serverless ha cerrado esa brecha. Escalan horizontalmente junto con el código, distribuyendo la información globalmente y resolviendo el complejo puzzle de mantener la coherencia a la velocidad de la luz.',
        type: 'dual',
        images: ['/imgBlogsWebp/ARQUITECTURAS SERVERLESS/4.1.webp', '/imgBlogsWebp/ARQUITECTURAS SERVERLESS/4.2.webp']
      },
      {
        title: '5. LA EVOLUCIÓN: DEL CÓDIGO AL EDGE',
        text: 'No nos detuvimos en la nube central. La nueva frontera es el "Edge Computing", donde tu código Serverless corre en nodos situados físicamente a unos pocos kilómetros del usuario final. Al eliminar la latencia continental, las aplicaciones reaccionan instantáneamente, borrando la diferencia entre un software instalado localmente y una aplicación web distribuida mundialmente.',
        type: 'single',
        images: ['/imgBlogsWebp/ARQUITECTURAS SERVERLESS/5.webp']
      }
    ]
  },
  'ciberseguridad-iot': {
    tag: 'Recursos',
    date: '30 de marzo de 2025',
    title: 'CIBERSEGURIDAD EN LA ERA DEL INTERNET DE LAS COSAS (IOT)',
    description: 'Cada dispositivo conectado es un soldado potencial en un ejército botnet global. La seguridad moderna no es proteger un servidor central, es blindar millones de terminales expuestas a la intemperie digital.',
    mainImage: '/imgBlogsWebp/CIBERSEGURIDAD/portada.webp',
    points: [
      {
        title: '1. EL CRECIMIENTO EXPLOSIVO Y EL CAOS',
        text: 'Hemos conectado de todo a internet: focos de luz, marcapasos médicos, turbinas de aviones y cafeteras. Pero en la carrera por hacer que todo sea "inteligente", la seguridad fue una idea de último minuto. Hoy vivimos con miles de millones de microcomputadoras conectadas a redes globales, muchas de las cuales ejecutan firmware desactualizado con contraseñas por defecto.',
        type: 'single',
        images: ['/imgBlogsWebp/CIBERSEGURIDAD/1.webp']
      },
      {
        title: '2. CUANDO TU REFRIGERADOR ATACA UN BANCO',
        text: 'La amenaza del IoT no es que un hacker apague tu luz; es que utilicen tus electrodomésticos como zombis en un ataque DDoS masivo. Botnets históricas demostraron que ejércitos de dispositivos débiles pueden derribar infraestructuras críticas completas de un país, alterando drásticamente el concepto tradicional de "guerra cibernética".',
        type: 'single',
        images: ['/imgBlogsWebp/CIBERSEGURIDAD/2.webp']
      },
      {
        title: '3. EL RETO DE ASEGURAR LO INVISIBLE',
        text: 'A diferencia de una computadora donde puedes instalar un antivirus, los dispositivos IoT operan en la sombra, a menudo sin una interfaz de usuario. Administrar certificados criptográficos y asegurar actualizaciones automáticas en sensores minúsculos con baterías de bajo consumo requiere una ingeniería de seguridad radicalmente nueva y eficiente.',
        type: 'single',
        images: ['/imgBlogsWebp/CIBERSEGURIDAD/3.webp']
      },
      {
        title: '4. REDES ZERO-TRUST Y SEGMENTACIÓN',
        text: 'El antiguo modelo de "seguridad perimetral" (un muro duro con un interior suave) está completamente obsoleto. En su lugar surge la arquitectura "Zero Trust" (Confianza Cero). Bajo este paradigma, el hecho de que tu termostato esté en la red Wi-Fi de tu oficina no significa que deba tener acceso a los servidores de recursos humanos. La segmentación extrema es la nueva norma.',
        type: 'dual',
        images: ['/imgBlogsWebp/CIBERSEGURIDAD/4.1.webp', '/imgBlogsWebp/CIBERSEGURIDAD/4.2.webp']
      },
      {
        title: '5. REGULACIÓN Y DISEÑO SEGURO POR DEFECTO',
        text: 'El mercado demostró no estar dispuesto a pagar el costo extra de la ciberseguridad sin presión externa. Ahora, las legislaciones globales están forzando un enfoque de "Seguro por Diseño". Se acabaron las contraseñas "admin". El futuro requiere que los fabricantes asuman responsabilidad penal si sus dispositivos se vuelven armas cibernéticas debido a negligencias básicas de cifrado.',
        type: 'single',
        images: ['/imgBlogsWebp/CIBERSEGURIDAD/5.webp']
      }
    ]
  },
  'impacto-web3': {
    tag: 'Perspectivas',
    date: '5 de abril de 2025',
    title: 'EL IMPACTO DE WEB3 Y BLOCKCHAIN EN LA DESCENTRALIZACIÓN',
    description: 'Más allá de la especulación febril y las criptomonedas, yace una revolución arquitectónica pura: código inmutable, contratos auto-ejecutables y una web donde la confianza no es humana, es rigurosamente matemática.',
    mainImage: '/imgBlogsWebp/WEB3 y blockchain/portada.webp',
    points: [
      {
        title: '1. LA MUERTE DE LOS INTERMEDIARIOS',
        text: 'La promesa fundamental de Web3 no es un token especulativo, es la eliminación absoluta del "árbitro central". Durante la Web2, cedimos todo el poder y nuestros datos a cinco grandes corporaciones tecnológicas. La Blockchain rompe ese monopolio al distribuir la base de datos entre miles de nodos independientes, devolviendo la propiedad digital directamente a las manos del creador y del usuario.',
        type: 'single',
        images: ['/imgBlogsWebp/WEB3 y blockchain/1.webp']
      },
      {
        title: '2. CONTRATOS INTELIGENTES: LEYES HECHAS DE CÓDIGO',
        text: 'La idea de un contrato que no requiere abogados para ejecutarse parecía ciencia ficción. Los Smart Contracts son piezas de software inmutables que mueven activos y ejecutan lógica de negocios de forma autónoma, sin fallos ni corrupción. Si X sucede, entonces Y se ejecuta instantáneamente. Es la burocracia humana destilada en funciones matemáticas puras e inalterables.',
        type: 'single',
        images: ['/imgBlogsWebp/WEB3 y blockchain/2.webp']
      },
      {
        title: '3. FINANZAS DESCENTRALIZADAS (DEFI)',
        text: 'El sistema financiero tradicional, lento, excluyente y lleno de fricciones, está siendo reimaginado. DeFi permite la creación de mercados de préstamos globales, intercambios instantáneos y rendimientos algorítmicos accesibles para cualquier persona con un teléfono móvil y conexión a internet. Es la reprogramación total del dinero y el crédito a escala verdaderamente global.',
        type: 'single',
        images: ['/imgBlogsWebp/WEB3 y blockchain/3.webp']
      },
      {
        title: '4. IDENTIDAD SOBERANA Y PRIVACIDAD ZERO-KNOWLEDGE',
        text: '¿Por qué necesitas dar tu fecha de nacimiento completa a una web para demostrar que eres mayor de edad? Con las pruebas de Conocimiento Cero (Zero-Knowledge Proofs), Web3 permite que verifiques tu identidad y credenciales criptográficamente sin revelar los datos subyacentes. Eres dueño absoluto de tu identidad y compartes solo la prueba matemática, preservando tu privacidad por completo.',
        type: 'dual',
        images: ['/imgBlogsWebp/WEB3 y blockchain/4.1.webp', '/imgBlogsWebp/WEB3 y blockchain/4.2.webp']
      },
      {
        title: '5. EL FIN DEL INVIERNO Y EL FUTURO CONSTRUCTIVO',
        text: 'Después de las tormentas especulativas y las caídas masivas de mercados inflados, la verdadera utilidad de Web3 está emergiendo. Superada la barrera de los costos de transacción masivos mediante soluciones avanzadas de Capa 2 (Layer 2), la adopción silenciosa continúa. No estamos construyendo casinos digitales, estamos forjando una arquitectura de internet in-censurable, abierta y profundamente democrática.',
        type: 'single',
        images: ['/imgBlogsWebp/WEB3 y blockchain/5.webp']
      }
    ]
  }
};

const FALLBACK_BLOG = {
  tag: 'Tendencias',
  date: 'Mayo 2025',
  title: 'LA REVOLUCIÓN TECNOLÓGICA: REESCRIBIENDO LAS REGLAS DEL JUEGO',
  description: 'No estamos presenciando un simple cambio de herramientas, sino una metamorfosis completa en la forma en que interactuamos, trabajamos y existimos en el plano digital inmersivo.',
  mainImage: '/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/portada.webp',
  points: [
    {
      title: '1. LA ERA DE LA CONVERGENCIA INEVITABLE',
      text: 'La verdadera magia no reside en un avance aislado, sino en la brutal colisión de múltiples disciplinas. Cuando la inteligencia artificial, el cómputo espacial y la conectividad ultrarrápida convergen, el resultado es un tejido tecnológico que deja de ser una simple herramienta utilitaria para convertirse en un ecosistema vivo e innegablemente interconectado.',
      type: 'single',
      images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/1.webp']
    },
    {
      title: '2. EXPERIENCIAS FLUIDAS Y DISEÑO INVISIBLE',
      text: 'El mejor diseño es el que no se nota. Las interfaces rígidas y estructuradas están muriendo para dar paso a sistemas predictivos que entienden el contexto y las emociones del usuario antes de que este siquiera formule una petición mental. La fricción se desvanece de manera absoluta, y el software pasa a ser una extensión natural y telepática de nuestro propio movimiento.',
      type: 'single',
      images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/2.webp']
    },
    {
      title: '3. DESCIFRANDO LA COMPLEJIDAD A ESCALA GLOBAL',
      text: 'Los desafíos modernos no pueden resolverse encerrados en silos de información. Las plataformas actuales procesan billones de datos fragmentados en fracciones de milisegundos, permitiendo a los creadores e ingenieros anticiparse a las tendencias de manera casi profética, moldeando los recursos antes de que sean siquiera necesitados.',
      type: 'single',
      images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/3.webp']
    },
    {
      title: '4. LA PRIVACIDAD COMO EL NUEVO LUJO DIGITAL',
      text: 'En un mundo perpetuamente conectado y vigilado, la verdadera innovación radical radica en saber proteger lo invisible. La criptografía avanzada y las redes descentralizadas no son solo escudos de seguridad anticuados; son la bóveda fundacional de confianza inquebrantable sobre la cual levantaremos todas nuestras interacciones valiosas en los años venideros.',
      type: 'dual',
      images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/4.1.webp', '/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/4.2.webp']
    },
    {
      title: '5. CONSTRUYENDO UN FUTURO SOSTENIBLE',
      text: 'Finalmente, la innovación debe ir de la mano con la responsabilidad. Reducir la huella de carbono digital y fomentar prácticas éticas será el mayor legado de la actual generación de tecnólogos.',
      type: 'single',
      images: ['/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/5.webp']
    }
  ]
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = BLOG_DATABASE[slug] || FALLBACK_BLOG;

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <Navbar />

      <article className="mx-auto max-w-[1120px] px-6 pt-[18vh] pb-24 md:px-10">
        {/* Header Section */}
        <header className="mb-14 flex flex-col gap-5">
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="rounded-full border border-[#6872F2] px-4 py-1.5 text-[#6872F2]">
              {blog.tag}
            </span>
            <span className="text-[#303030]/50">{blog.date}</span>
          </div>

          <h1 className="font-[family-name:var(--font-antonio)] text-[clamp(3.5rem,7vw,6.5rem)] font-bold uppercase leading-[1.1] tracking-[-0.04em] text-[#303030]">
            {blog.title}
          </h1>

          <p className="body-medium mt-4 max-w-[850px] text-[#303030]/68">
            {blog.description}
          </p>
        </header>

        {/* Main Hero Image */}
        <div className="relative aspect-[1120/600] w-full overflow-hidden rounded-[24px] bg-[#f0f0f0] mb-20">
          <Image 
            src={blog.mainImage}
            alt="Hero blog image"
            fill
            className="object-cover"
          />
        </div>

        {/* Blog Content Points */}
        <div className="flex flex-col gap-20">
          {blog.points.map((point: any, index: number) => (
            <section key={index} className="flex flex-col gap-6">
              <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(2rem,3vw,2.5rem)] font-bold uppercase leading-[1.2] tracking-[-0.02em] text-[#303030]">
                {point.title}
              </h2>
              <p className="body-medium text-[#303030]/70">
                {point.text}
              </p>

              {point.type === 'single' && point.images[0] && (
                <div className="relative mt-4 aspect-[1120/450] w-full overflow-hidden rounded-[20px] bg-[#f0f0f0]">
                  <Image 
                    src={point.images[0]}
                    alt={`Illustrating ${point.title}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {point.type === 'dual' && point.images.length === 2 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-[480/400] w-full overflow-hidden rounded-[20px] bg-[#f0f0f0]">
                    <Image src={point.images[0]} alt="Supporting illustration 1" fill className="object-cover" />
                  </div>
                  <div className="relative aspect-[480/400] w-full overflow-hidden rounded-[20px] bg-[#f0f0f0]">
                    <Image src={point.images[1]} alt="Supporting illustration 2" fill className="object-cover" />
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Divider */}
      </article>

      <article className="mx-auto max-w-[1120px] px-6 pb-24 md:px-10 pt-10">
        {/* Recommendations Section */}
        <section className="mb-24">
          <div className="mb-16 flex items-center gap-6">
            <h3 className="whitespace-nowrap font-[family-name:var(--font-antonio)] text-[clamp(1.5rem,2.5vw,2rem)] font-bold uppercase leading-[1.1] tracking-[0.02em] text-[#303030]">
              HAY MUCHO MÁS POR DESCUBRIR
            </h3>
            <div className="h-[1px] w-full bg-[#303030]/20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
            {Object.entries(BLOG_DATABASE)
              .filter(([key]) => key !== slug)
              .slice(0, 2)
              .map(([key, recBlog]) => (
                <Link href={`/blog/${key}`} key={key} className="group block">
                  <article className="w-full">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                      <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                        <Image src={recBlog.mainImage} alt={recBlog.title} fill className="object-cover" />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-4">
                      <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                        {recBlog.tag}
                      </span>
                      <span className="body-small text-[#303030]/48">{recBlog.date}</span>
                    </div>
                    <h4 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                      {recBlog.title}
                    </h4>
                    <p className="body-small mt-5 text-[#303030]/62">
                      {recBlog.description}
                    </p>
                  </article>
                </Link>
              ))}
          </div>
        </section>
      </article>

      <FooterOnly />
    </main>
  );
}
