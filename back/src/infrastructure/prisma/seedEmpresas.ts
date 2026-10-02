import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface EmpresaCSVRow {
  nombre: string
  rubro?: string | null
  barrioNombre?: string | null
  direccion?: string | null
  telefonoOriginal?: string | null
}

const EMPRESAS_DATA: EmpresaCSVRow[] = [
  { nombre: "Liliana", rubro: "Electrodomésticos", barrioNombre: "Zona Suburbana", direccion: "Autopista y Silvestre Begnis", telefonoOriginal: "0341 512-2133" },
  { nombre: "John Deere", rubro: "Maquinaria agrícola", barrioNombre: "San Miguel", direccion: "Juan Orsetti 481", telefonoOriginal: "Contacta Diego Directo" },
  { nombre: "Wander / Norwan Group", rubro: "Lubricantes, refrigerantes", barrioNombre: "Zona Suburbana", direccion: "Juan Orsetti 858", telefonoOriginal: "0341 471-0631" },
  { nombre: "YPF Raul", rubro: "Estación de Servicio", barrioNombre: "Centro", direccion: "Av. San Martín 1300", telefonoOriginal: "Contacta Santi Directo" },
  { nombre: "Rodeo Drive (Grupo Serpro - Colombia)", rubro: "Fabricación de vidrio", barrioNombre: "San Miguel", direccion: "Balcarce 990", telefonoOriginal: "0341 525-8838" },
  { nombre: "Raicos SRL", rubro: "Montaje industrial", barrioNombre: "San Miguel", direccion: "", telefonoOriginal: "Contacta Santi Directo" },
  { nombre: "Plastilux", rubro: "Plásticos", barrioNombre: "Litoral", direccion: "Julio A.Roca 560", telefonoOriginal: "(0341) 4716609" },
  { nombre: "Selema", rubro: "Fabricación de muebles", barrioNombre: "San Miguel", direccion: "Curupaiti 662", telefonoOriginal: "54 0341 471 3150" },
  { nombre: "9 de Oro (Molinos Cañuelas)", rubro: "Industria alimenticia", barrioNombre: "San Fernando", direccion: "Av. San Martín 2809", telefonoOriginal: "-" },
  { nombre: "Crystal Ice", rubro: "Geles Refrigerantes", barrioNombre: "San Miguel", direccion: "Vicente López 1052", telefonoOriginal: "WSP 5493416803999" },
  { nombre: "Criskey SA", rubro: "Alimentos (Papas fritas y snacks)", barrioNombre: "San Fernando", direccion: "Artigas 3369", telefonoOriginal: "WSP 0341152121878" },
  { nombre: "Polimeros Industriales SRL", rubro: "Industria del plástico", barrioNombre: "San Miguel", direccion: "Av. Santa Fe 757", telefonoOriginal: "WSP 3412147317" },
  { nombre: "Tapa 14", rubro: "Alimentos (Tapas de empanadas y tartas)", barrioNombre: "Centro", direccion: "Av. Buenos Aires 938", telefonoOriginal: "WSP 3415857032" },
  { nombre: "El Hornero", rubro: "Materiales para construcción", barrioNombre: "Bon Vivant", direccion: "Av. San Martín 2290", telefonoOriginal: "0341 471-2888" },
  { nombre: "Indulimp", rubro: "Industria química", barrioNombre: "San Miguel", direccion: "Callao 1455", telefonoOriginal: "3413480070" },
  { nombre: "Rinaudo e hijos", rubro: "Maquinaria para fábricas de pastas", barrioNombre: "San Miguel", direccion: "Suipacha 955", telefonoOriginal: "WSP 34142623417" },
  { nombre: "Alvez Maderas", rubro: "Madera / pallets", barrioNombre: "San Miguel", direccion: "Suipacha 962", telefonoOriginal: "0341 471-3892" },
  { nombre: "Cugerone e Hijos SRL", rubro: "Metalúrgica", barrioNombre: "San Miguel", direccion: "Pje. Sargento Cabral 955", telefonoOriginal: "0341 732-1429" },
  { nombre: "Urblok", rubro: "Adoquines y Bloques de Hormigón", barrioNombre: "San Miguel", direccion: "Charcas 911", telefonoOriginal: "WSP 5493412751778" },
  { nombre: "Miriani Maquinados SRL", rubro: "Metalmecánica", barrioNombre: "San Miguel", direccion: "Mitre 650", telefonoOriginal: "WSP +54 0341 644 8095" },
  { nombre: "ALTAC", rubro: "Metalúrgica", barrioNombre: "San Miguel", direccion: "Junín 1033", telefonoOriginal: "wsp 5493413117470" },
  { nombre: "Maderera Funes", rubro: "Madera / pallets", barrioNombre: "San Miguel", direccion: "Pasaje Berutti 992", telefonoOriginal: "3416163999" },
  { nombre: "Construcciones AF (Papa nicol ferraro)", rubro: "Construcción de piscinas", barrioNombre: "Litoral", direccion: "Güemes 278", telefonoOriginal: "Contacta Diego Directo" },
  { nombre: "Grupo Euro Motors", rubro: "Grupos electrógenos", barrioNombre: "San Miguel", direccion: "Maipo 1146", telefonoOriginal: "wsp 5493415829622" },
  { nombre: "IGAL Aceros", rubro: "Aceros", barrioNombre: "San Miguel", direccion: "Pasco 857", telefonoOriginal: "341 7228344" },
  { nombre: "Argental", rubro: "Maquinaria para panificación", barrioNombre: "Paraiso", direccion: "Av. San Martín 1666", telefonoOriginal: "0341 471-2020" },
  { nombre: "Tecnoalim SRL", rubro: "Maquinaria para industria alimenticia", barrioNombre: "San Miguel", direccion: "Charcas 1007", telefonoOriginal: "(+54) 341 4714239" },
  { nombre: "Torresetti", rubro: "Metalúrgica", barrioNombre: "Santa Rita V", direccion: "Av. San Martín 2326", telefonoOriginal: "341 321-9774" },
  { nombre: "Caden SRL", rubro: "Cadenas transportadoras", barrioNombre: "San Fernando", direccion: "Av. San Martín 3041", telefonoOriginal: "3414711166" },
  { nombre: "Werke", rubro: "Metalúrgica", barrioNombre: "San Miguel", direccion: "Balcarce 1046", telefonoOriginal: "wsp 5493413700675" },
  { nombre: "GIR Servicios Industriales", rubro: "Control de calidad, recuperación de piezas, producción de abrasivos vegetales", barrioNombre: "San Miguel", direccion: "Pasco 1078", telefonoOriginal: "5493415636025" },
  { nombre: "Pedemonte materiales", rubro: "Materiales para construcción", barrioNombre: "Zona Suburbana", direccion: "Silvestre Begnis 1050", telefonoOriginal: "3412715050" },
  { nombre: "Fundición Martínez (FSM)", rubro: "Fundición / autopartes", barrioNombre: "Zona Suburbana", direccion: "Silvestre Begnis 1200", telefonoOriginal: "3414710754" },
  { nombre: "Panificadora PAN PAN", rubro: "Panificación industrial", barrioNombre: "Litoral", direccion: "Av. San Martín 3382", telefonoOriginal: "Pedir contacto a Gabote" },
  { nombre: "Rivosecchi Lacteos", rubro: "Lacteos", barrioNombre: "Litoral", direccion: "Av. San Martín 3350", telefonoOriginal: "Pedir contacto a Gabote" },
  { nombre: "Agroquímica Rosario", rubro: "Agroquímicos / fertilizantes", barrioNombre: "Litoral", direccion: "Julio A. Roca 109", telefonoOriginal: "wsp 0341 563-4770" },
  { nombre: "Meli Neobiz", rubro: null, barrioNombre: null, direccion: null, telefonoOriginal: "Viene" },
  { nombre: "Roque papa marian", rubro: null, barrioNombre: null, direccion: null, telefonoOriginal: "Contacta Diego Directo" },
  { nombre: "Arenera Baigorria SRL", rubro: "Arena", barrioNombre: "Los Naranjos", direccion: "Constancio C. Vigil 789", telefonoOriginal: "3412111918" },
  { nombre: "Fabrica de cotillon al lado de abi?", rubro: "Productos de cotillon", barrioNombre: "San Miguel", direccion: "Pje Berutti 1051 al lado", telefonoOriginal: "-" },
  { nombre: "Larrauri?", rubro: null, barrioNombre: null, direccion: null, telefonoOriginal: "Contacta Directo Santi" },
  { nombre: "Plastitec (ema?)", rubro: "Plásticos", barrioNombre: "Santa Rita", direccion: "Las Malvinas 2763", telefonoOriginal: "Contacta Directo Diego" },
  { nombre: "la surfera?", rubro: "Gastronomía", barrioNombre: "Bon Vivant", direccion: "Av. Costanera 2258", telefonoOriginal: "-" },
]

function generateBarrioCode(nombre: string): string {
  const words = nombre.trim().split(/\s+/)
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase()
  }
  if (words.length === 2) {
    return (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase()
  }
  return nombre.slice(0, 3).toUpperCase()
}

async function findOrCreateBarrio(nombreRaw: string | null | undefined): Promise<number> {
  const nombre = (nombreRaw && nombreRaw !== "-") ? nombreRaw.trim() : "General"
  
  // 1. Buscar coincidencia exacta o case-insensitive por nombre
  let barrio = await prisma.barrio.findFirst({
    where: { nombre: { equals: nombre, mode: "insensitive" } },
  })

  // 2. Si no encontró y tiene un código de 3 letras, buscar por código
  if (!barrio) {
    const code = generateBarrioCode(nombre)
    barrio = await prisma.barrio.findFirst({
      where: { codigo: { equals: code, mode: "insensitive" } },
    })
  }

  // 3. Si aún no existe, crearlo para asegurar integridad referencial
  if (!barrio) {
    const codigo = generateBarrioCode(nombre)
    barrio = await prisma.barrio.create({
      data: {
        nombre,
        codigo,
        prioridad: "MEDIA",
        activo: true,
      },
    })
    console.log(`[seed:empresas] Barrio creado: ${barrio.nombre} (código: ${barrio.codigo})`)
  }

  return barrio.id
}

async function main(): Promise<void> {
  console.log(`[seed:empresas] Iniciando procesamiento de ${EMPRESAS_DATA.length} empresas...`)

  let procesadas = 0

  for (const item of EMPRESAS_DATA) {
    const barrioId = await findOrCreateBarrio(item.barrioNombre)
    
    // Tratamiento de teléfono y observaciones
    const telRaw = item.telefonoOriginal?.trim() || ""
    const isContactDirecto = /contacta.*directo/i.test(telRaw)
    
    let telefono: string | null = null
    let observaciones: string | null = null

    if (isContactDirecto) {
      telefono = null
      observaciones = telRaw // Mantiene exactamente el texto original tal como se pidió
    } else if (telRaw === "-" || telRaw === "") {
      telefono = null
    } else {
      telefono = telRaw
    }

    const direccion = (item.direccion && item.direccion !== "-") ? item.direccion.trim() : "Sin especificar"
    const rubro = (item.rubro && item.rubro !== "-") ? item.rubro.trim() : null

    // Upsert por nombre de empresa (o crear si no existe)
    const existing = await prisma.empresa.findFirst({
      where: { nombre: { equals: item.nombre.trim(), mode: "insensitive" } },
    })

    if (existing) {
      await prisma.empresa.update({
        where: { id: existing.id },
        data: {
          rubro,
          direccion,
          barrioId,
          telefono,
          observaciones,
          email: null,
          cuit: null,
          tamano: null,
          contactoPrincipal: null,
          activa: true,
        },
      })
    } else {
      await prisma.empresa.create({
        data: {
          nombre: item.nombre.trim(),
          rubro,
          direccion,
          barrioId,
          telefono,
          observaciones,
          email: null,
          cuit: null,
          tamano: null,
          contactoPrincipal: null,
          activa: true,
        },
      })
    }
    procesadas++
  }

  console.log(`[seed:empresas] Éxito: ${procesadas} empresas sembradas en la base de datos.`)
}

main()
  .catch((e) => {
    console.error("[seed:empresas] Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
