async function obtenerPokemonDeAPI(nivelReferencia =5) {
  try {
    //Generamos un ID aleatorio para los pokemon de kanto entre 1 y 151
    const idAleatorio = Math.floor(Math.random() * 151) + 1;
    //Llamada a la API
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`,);
    if (!respuesta.ok) throw new Error("No se pudo conectar a la api");
    const datos = await respuesta.json();  
    const nivelFinal = Math.max(1,nivelReferencia + (Math.floor(Math.random()*5)-2));
    const movimientos = await obtenerMovimientos(datos.moves);
    const objetoAleatorio =OBJETOS_EQUIPABLES[Math.floor(Math.random() * OBJETOS_EQUIPABLES.length)];


    return {
      nombre: datos.name.toUpperCase(),
      nivel: nivelFinal,
      // Escalamos stats: Stat base + (progreso por nivel)
      vida: Math.floor(datos.stats[0].base_stat + (nivelFinal * 2.5)),
      vidaMaxima: Math.floor(datos.stats[0].base_stat + (nivelFinal * 2.5)),
      ataque: Math.floor(datos.stats[1].base_stat + (nivelFinal * 1.5)),
      defensa: Math.floor(datos.stats[2].base_stat + (nivelFinal * 1.2)),
      defensaEspecial: Math.floor(datos.stats[4].base_stat + (nivelFinal * 1.2)),
      ataqueEspecial: Math.floor(datos.stats[3].base_stat + (nivelFinal * 1.4)),
      velocidad: Math.floor(datos.stats[5].base_stat + (nivelFinal * 1.3)),
      tipo: datos.types[0].type.name.toUpperCase(),
      experiencia_base: datos.base_experience || 64,
      expActual: 0,
      expSiguienteNivel: Math.floor(100 * Math.pow(1.2, nivelFinal)),

      sprite:
        datos.sprites.other["official-artwork"].front_default ||
        datos.sprites.front_default ||
        "https://via.placeholder.com/100",

      grito: datos.cries.latest || datos.cries.legacy,
      movimientos,
      objetoEquipado: objetoAleatorio,
    };
  } catch (error) {
    console.error("Error al traer pokimons de la API:", error);
    return {
      nombre: "PIKACHU", nivel: 5, vida: 35, vidaMaxima: 35, ataque: 55, ataqueEspecial: 45,
      defensa: 40, defensaEspecial: 35, velocidad: 55, 
      expActual: 0, expSiguienteNivel: 75,
      objetoEquipado: OBJETOS_EQUIPABLES[0],
      sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      tipo: "ELECTRIC",
      movimientos: [
        { nombre: "PLACAJE", tipo: "NORMAL", potencia: 40, precision: 100, categoria: "physical" },
        { nombre: "IMPACTRUENO", tipo: "ELECTRIC", potencia: 40, precision: 100, categoria: "special" }
      ],
    };
  }
}

//Añadiendo pokemon al array para formar el equipo
async function prepararListaPokemon() {
  escribirEnLog("Conectando con la PokeAPI...");
  const promesas = Array.from({ length: 6 }, () => obtenerPokemonDeAPI());
  const heroe = await Promise.all(promesas);
  LISTA_POKEMON.push(...heroe);

  console.log(LISTA_POKEMON);

  escribirEnLog("¡Equipo listo!");
}

async function obtenerMovimientos(listaMovimientos) {
  const movimientosAleatorios = listaMovimientos
    .sort(() => Math.random() - 0.5) //Mezcla el array
    .slice(0, 4); //Coge los 4 primeros movimientos.

  const promesas = movimientosAleatorios.map(async (m) => {
    try {
      const respuesta = await fetch(m.move.url);
      const datos = await respuesta.json();

      const nombreEs =
        datos.names.find((n) => n.language.name === "es")?.name ||
        datos.name.toUpperCase().replace("-", " ");
      return {
        nombre: nombreEs.toUpperCase(),
        tipo: datos.type.name.toUpperCase(),
        potencia: datos.power || 40,
        precision: datos.accuracy || 100,
        categoria: datos.damage_class.name,
      };
    } catch {
      //Si falla un movimiento, le ponemos uno generico
      return {
        nombre: "PLACAJE",
        tipo: "NORMAL",
        potencia: 40,
        precision: 100,
        categoria: "physical",
      };
    }
  });

  return await Promise.all(promesas);
}
