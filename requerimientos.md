vamos a crear una aplicación la cual tendrá como nombre soter, esta aplicación tendrá el siguiente stack:
1. backend: Nodejs + express + typeScript
2. Frontend: React vite + typeScript 
3. DB: Postgres con prisma + pgvector para el manejo de la IA

esquema de carpeta tipo monorepo, con un estructura modelo vista controlador con controladores que puedan ser re utilizables utiliza las mejores practicas 


SOTER sera una aplicación la cual se encargara de manejar el departamento de seguridad de una empresa con el fin de proteger la empresa y sus funcionarios

El esquema de seguridad esta conformado por:

1. Centro Seguridad (operadores los cuales se encargan de ingresar todas las incidencias que se presentan en la empresa y asignarla al grupo de resolución)
2. Vigilantes: Personas que están realizando las revistas y que son una fuente de información para informar los incidentes a los operadores del centro de monitoreo
3. Coordinadores: estos son los lideres de los procesos y contamos con 
	a. coordinadores de seguridad física
	b. coordinadores de seguridad electronica
	c. coordinadores de investigaciones
   Cada uno de estos grupos de coordinadores son los encargados de recibir de primera mano las incidencias de seguridad que ocurran importante entender que no todas las    
   incidencias son de seguridad , también hay incidencias que involucran a coordinadores de otras areas, como servicios generales, mantenimiento, etc
4. Escoltas: son los encargados de proteger a ciertos funcionarios y de movilizarlos
5. Gerente Seguridad: Es el perfil mas alto del departamento de seguridad, no es el único gerente que existe ya que el resto de areas también cuentan con gerentes



SOTER deben tener los siguientes módulos:

1. Modulo de minuta: Donde la central de seguridad ingresa el incidente para empezar su debida investigación y tramitología, se maneja como una bitácora ingresando uno a uno los comentarios en forma de timeline que el operador va ingresando y asociando al incidente. una vez se comprueba la veracidad del incidente este debe ser escalado hacia el respectivo coordinador  encargado de darle tramite esto de acuerdo a incidente (cada incidente tiene un coordinador o grupo de personas o area encargados de gestionar la solución del mismo)
2. El modulo de incidentes recibe las incidencias que el centro de seguridad nos enlaza, como factor a tener encuentra en este modulo es:
	a. Este modulo debe permitir cargar un informe final d las acciones realizadas para solucionar el incidente y debe ser obligatorio par cerrar el incidente
	b. en este modulo tendremos conexión con un modelo de IA local, la cual nos estará dando recomendaciones de seguridad analizando casos ocurridos anteriormente o casos 
	abiertos, la idea es que realice análisis predictivo de las incidencias que están sucediendo para la toma de decisiones.
	c. se debe mostrar la traza de información que levanto el centro de monitoreo y el centro de monitoreo puede seguir viendo el incidente abierto para poder agregar información nueva. el incidente se cerrara cuando el coordinador decida cerrarlo y se cumplan con los requisitos exigidos, que en realidad es validad que se cargue el informe de cierre. el incidente debe permitir cargar imágenes , audio, contenido multimedia que sirva como pruebas del incidente y sea material para el coordinador evaluar

3. Modulo de seguridad Electronica: para el manejo del inventario, cronogramas de mantenimientos , de inversion . inventario de equipos sistemas instalados en cada una de las instalaciones creadas. se debe manejar como un tipo sistema de Inventario

4. modulo de Instalaciones: es el modulo principal por que es lo que protegemos, de este modulo se desprenden los siguientes:
	a. modulo de contactos : funcionarios de contacto en caso de emergencia
	b. Modulo de autoridades : Elementos de seguridad cerca de la instalación para llamar en caso de una emergencia, Bomberos policía , ejercito, hospitales etc
	c. Modulo de seguridad electronica: sistemas - equipos instalados con toda la información de los sistemas y los equipos y su respectivo estado
	d. Modulo de estudio de seguridad: es un formulario que después cargare
	e: modulo d IA: donde la IA nos hace una análisis del estado de seguridad de la instalación basado en los incidentes ocurridos y toda la memoria de la IA y los protocolos de seguridad que dbe haber un modulo de configuración donde se le puedan cargar para que ella los estudie
	f: Modulo de Vigilancia Fisica: dond se debe mostar el esquema de vigilante , recorredores y otros funcionarios de la empresa de vigilancia que trabahan protegiendo esa instalación

5. modulo de Seguridad Fisica: donde tendremos un inventario de personas asociadas al esquema de seguridad de la instalación y que pertenecen a una empresa de vigilancia

6. Modulo de movimiento o movilidad: que es para darle seguimiento a los escoltas y sus rutas de transporte diaria para tener el control, tambine se pueden agregar movilidad de funcionarios

7. debe haber un gran dashboard donde se muestre según el perfil:
	casos abiertos
	estadísticas de incidentes
	componentes que de acuerdo el perfil se deben ir mostrando o ocultando. como el modulo de movimientos de escoltas que solo le importa al 


8. Debe tener un modulo de administración para la creación de usuario, perfiles, y otra información relevante para mostrar, todos los tipos estados deben ser sacados de base datos y se de crear su respectivo Crud para administrarlos no se puede tipar nada por código

debes crear el schema de base datos y el script inicial con la configuración inicial base para que la app se ejecute

el esquema de Login debe ser por medio de un correo y una contraseña utilizar un esquema de seguridad robusto, con secretos predefinidos en el .env

el agente de IA a utilizar sera ollama con modelo llama3, pero tambine seria interesante poder configurar los modelos desde el modulo de configuración.

# .env
DATABASE_URL="postgresql://postgres:Juanjose@1825@192.168.1.51:5432/soter?schema=public"

OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"


## Architecture Notes

- Frontend state: Redux Toolkit (`src/redux/store.js`)
- Routing: React Router v6 (`src/appRoutes.jsx`)
- Forms: React Hook Form + Zod/Yup (dual validation libraries)
- API calls: axios (`src/config/axios.jsx`)
- UI components: shadcn/ui via Radix primitives (`src/components/ui/`)
- Backend routes: `src/routes/`, controllers: `src/controller/`
- Auth: JWT with `verify.ts` middleware

**pnpm workspaces monorepo** with two packages:

- `soterFront/` — React 18 + Vite + Tailwind + shadcn/ui frontend
- `soterBack/` — Express + TypeScript + Prisma (PostgreSQL) backend



Flujo de incidentes:

MInuta: Crea Incidente, lo valida y lo escala a cordinador
Incidentes: Se gestiona incidente con informacin inicial que se viene del modulo de minuta y espacio para que el cordinador agrege su diagnositico. cada comentario de ciere y el respectivo informe de cierre. en  este modulo se puede pasar escalar a gerencia y cierrar 

Minuta:
1. abierto 
2. Verificado
3. Escalo a cordinacion

Incidente:
3. En investigacion
4. Escalado a gerencia ( no es obligacion )
5. Cerrar

en la munuta una vez escale ya no lo vere mas, pasa automaticamente para coordinador.

Revisar este flujo para definir las acciones por reles.


Roles:

1. Operador Centro Seguridad
2. Gerente Seguridad
3. Cordinadores (Grupos)
	a. Cordinador Seguridad Fisica
	b. Cordinador Seguridad Electronica
	c. Cordinador Investigaciones
	d. Cordinador Administrativo
	e. Cordinador Acciones Locativas
	f. entro Otros

Cuando desde minuta enlazo un indicente , me debe salir a quien se lo quiero enlazar y eso hace referencia  a esos distintos grupos de coordinadores quea tienden riesgos y casos especificos 
 un grupo cordinador muchos  tipos de incidentes asociados para atender


Crear un usuario generico para cada grupo de roles, y lo agregas al archivo seed.d.ts, adicioanalmente a modo de pruebas los muestas en la pantalla de iniciar session para hacer las pruebas mas rapido


Modulos por role:

1. operdor:
	Dashboard ( de su informacion de interes, de sus modulos)
	minuta
	seguridad Fisica solo ver
	Instalaciones Solo Ver

Cordinadores Seguridad:
	Dashboard ( de su informacion de interes, de sus modulos)
	incidentes (solo peude ver los incidentes que le fueron enlazados)
	Instalaciones
	Estudios de Seguridad
	Seguridad Fisica
	

Cordinador Seguridad electronica:
	Dashboard ( de su informacion de interes, de sus modulos)
	Dashboard
	Seguridad electronica
	mantenimientos
	Inventario

Gerente Seguridad:
	Dashboard ( de su informacion de interes, de sus modulos)
	Instalaciones
	Seguridad Fisica
	escolas


Administrador:
	todos los modulos



Modulo de Seguridad Fisica:

1. Empresa de vigilancia
2. Pustos de seguridad 
3. Vigilantes Importante cargar la foto del vigilante y la hoja de vida en formato  pdf

El flujo es el sigueinte:

la empresa tiene un contrato con una empresa de vigilancia, en ese conrtato se pactan unos puestos de seguridad fisica que se deben cumplir , y cada puesto de vigilancia tiene un conjunto de vigilantes que cumplen las funciones y consignas especificas de ese puesto. una instalacion puede contener varios puestos de vigilancia.


Los vigilantes pueden ser rotados entre puestos,
se pueden originar puestos de vigilancia adicionales al contrato, que tienen una fecha de inicio y una tentativa fecha de fin.
los puestos de vigilancia manejan estados para poder activarlo y desactivarlos de acuerdo como se maneje la operativa


Modulo Seguridad electronica e Inventario

el flujo de este modulo es en dos partes:

1. Instalacion: Se le asignan los sistemas
2. Inventario: Aca se crean los equipos , los cuales son suministrados con base a un contrato de inversion o pedido de inversion. una vez creado el equipo es asignado a una instalacion y a un sistema. al asignarsele a un sistema, es cuando se le asigna informacion como la IP,  la ubicacion,  el estado , el resto de informacion se le asigna al crear el dispositivo en el inventario.
los equipos pueden ser movibles entre instalaciones y es importante tener la vitacora de todos esos movimientos y mostrarlos en la historia del equipo un punto importante es la fehca de compra y la fecha de instalacion y la fecha de caada uno de los movimientos.

el modulo de seguridad electronica ese debe ser un componente de la instalacion, tal cual como esta autoridades vigilantes y otros.. y solo debe mostar los datos de la instalacion seleccionada... en cambio en el modulo de inventario debe mostrar toda la informacion de equipos y los KPI como estan ahora en el modulo de seguridad electronica.. es decir seguridad electronica es por instalacion, inventario equipos es el general

con todo lo anterior crea el modulo de inventario de equipos

Actualziacion flujo datos inventario: 
1. Los equipos solo se crean en el inventario y desde la instalacion solo se hace es asignarselo a la instalacion.

2. En la instalacion solo se ven los equipos disponibles segun el tipo de sistema a instalar o modificar

hacer una tabla donde se carguen los tipos de equipos de seguridad electronica, y de paso hacer el administrador para esta tabla


Modulo de Inventario:
desde este modulo se van a cargar todos los equipos que ingresan o que pasaran a ser instalados en cada una de las instalaciones, estos equipos dependen de un contrato a un contratista bajo el cual se compran esos equipos y se instalan. los equipos se clasifican por tipos de equipo, fecha de entrega, el costo del equipo segun contrato, serial, marca, y otros datos que puenda ser identificados antes de ser instalado, estos equipos entran en un estado de standby o bodega o estado disponible mientras son instalados. 

Instalaciones:

En la seccion de segiridad electronica, aca se crean los diferentes subsistemas del sistema de seguridad electronica, una vez creado los subsistemas, no permitira agregar equipos a cada uno de esos subsistemas. y seran esos equipos qeu estan en el inventario y no tienen instalacion asignada o se encuentran disponibles, al asignar el equipo se le debe proporcionar informacion especifica de la instlacion como la ubicacion(latitud, longitud) la ip del equiopo si es posible, la mac, un detalle por si es necesario , la version del firmware , se debe guardar la fecha de la instalacion y automaticamente cambiar el estado de este equipo.  en esta seccion solo se deben listar los sistemas asociados a la instalacion y solo se deben mostar los equipos asocuiados al subsistema de la instalacion seleccionada. es importante guardar la vitacora de movimintos de los equipos, desde su fecha de compra, fecha de instalacion y las posibles fechas de los cambios de instlacion o cambios de ubicacion que a suflido cada equipo.

