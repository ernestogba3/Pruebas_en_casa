async function obtenerPokemonDeAPI() {
  try {
    //Generamos un ID aleatorio para los pokemon de kanto entre 1 y 151
    const idAleatorio = Math.floor(Math.random() * 151) + 1;

    //Llamada a la API
    const respuesta = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${idAleatorio}`,
    );

    if (!respuesta.ok) throw new Error("No se pudo conectar a la api");

    const datos = await respuesta.json();

    //Con los datos de la API creamos nuevo personaje

    const movimientos = await obtenerMovimientos(datos.moves);

    return {
      nombre: datos.name.toUpperCase(),
      nivel: 5,
      //Adaptamos las stats a mi juego
      vida: datos.stats[0].base_stat,
      vidaMaxima: datos.stats[0].base_stat,
      defensa: datos.stats[2].base_stat,
      defensaEspecial: datos.stats[4].base_stat,

      ataque: datos.stats[1].base_stat,
      ataqueEspecial: datos.stats[3].base_stat,

      velocidad: datos.stats[5].base_stat,
      tipo: datos.types[0].type.name.toUpperCase(),
      experiencia_base: datos.base_experience,

      sprite:
        datos.sprites.other["official-artwork"].front_default ||
        datos.sprites.front_default ||
        "https://via.placeholder.com/100",

      grito: datos.cries.latest || datos.cries.legacy,
      movimientos,
    };
  } catch (error) {
    console.error("Error al traer pokimons de la API:", error);
    return {
      nombre: "PIKACHU",
      nivel: 5,
      vida: 35,
      vidaMaxima: 35,
      ataque: 55,
      ataqueEspecial: 45,
      defensa: 40,
      defensaEspecial: 35,
      velocidad: 55,
      sprite:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
      tipo: "Eléctrico",
      movimientos:[
        { nombre: "PLACAJE", tipo: "NORMAL", potencia: 40, precision: 100, categoria: "physical" },
        { nombre: "GRUÑIDO", tipo: "NORMAL", potencia: 40, precision: 100, categoria: "physical" },
        { nombre: "IMPACTRUENO", tipo: "ELECTRIC", potencia: 40, precision: 100, categoria: "special" },
        { nombre: "RAYO", tipo: "ELECTRIC", potencia: 90, precision: 100, categoria: "special" },
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
  .slice(0,4);//Coge los 4 primeros movimientos.


  const promesas = movimientosAleatorios.map(async (m) =>{
    try{
      const respuesta = await fetch(m.move.url);
      const datos= await respuesta.json();

      const nombreEs = datos.names.find(n => n.language.name==="es")?.name || datos.name.toUpperCase().replace("-"," ");
      return {
        nombre: nombreEs.toUpperCase(),
        tipo: datos.type.name.toUpperCase(),
        potencia: datos.power || 40,
        precision:datos.accuracy || 100,
        categoria:datos.damage_class.name
      };
    }catch{
      //Si falla un movimiento, le ponemos uno generico
      return{
        nombre: "PLACAJE",
        tipo: "NORMAL",
        potencia:40,
        precision:100,
        categoria:"physical"
      };
    }
  });

  return await Promise.all(promesas);
}


