const TABLA_TIPOS = {
  NORMAL: { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE: {
    FIRE: 0.5,
    WATER: 0.5,
    GRASS: 2,
    ICE: 2,
    BUG: 2,
    ROCK: 0.5,
    DRAGON: 0.5,
    STEEL: 2,
  },
  WATER: { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  GRASS: {
    FIRE: 0.5,
    WATER: 2,
    GRASS: 0.5,
    POISON: 0.5,
    GROUND: 2,
    FLYING: 0.5,
    BUG: 0.5,
    ROCK: 2,
    DRAGON: 0.5,
    STEEL: 0.5,
  },
  ELECTRIC: {
    WATER: 2,
    ELECTRIC: 0.5,
    GRASS: 0.5,
    GROUND: 0,
    FLYING: 2,
    DRAGON: 0.5,
  },
  ICE: {
    FIRE: 0.5,
    WATER: 0.5,
    GRASS: 2,
    ICE: 0.5,
    GROUND: 2,
    FLYING: 2,
    DRAGON: 2,
    STEEL: 0.5,
  },
  FIGHTING: {
    NORMAL: 2,
    ICE: 2,
    POISON: 0.5,
    FLYING: 0.5,
    PSYCHIC: 0.5,
    BUG: 0.5,
    ROCK: 2,
    GHOST: 0,
    DARK: 2,
    STEEL: 2,
    FAIRY: 0.5,
  },
  POISON: {
    GRASS: 2,
    POISON: 0.5,
    GROUND: 0.5,
    ROCK: 0.5,
    GHOST: 0.5,
    STEEL: 0,
    FAIRY: 2,
  },
  GROUND: {
    FIRE: 2,
    ELECTRIC: 2,
    GRASS: 0.5,
    POISON: 2,
    FLYING: 0,
    BUG: 0.5,
    ROCK: 2,
    STEEL: 2,
  },
  FLYING: {
    ELECTRIC: 0.5,
    GRASS: 2,
    FIGHTING: 2,
    BUG: 2,
    ROCK: 0.5,
    STEEL: 0.5,
  },
  PSYCHIC: { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG: {
    FIRE: 0.5,
    GRASS: 2,
    FIGHTING: 0.5,
    POISON: 0.5,
    FLYING: 0.5,
    PSYCHIC: 2,
    GHOST: 0.5,
    DARK: 2,
    STEEL: 0.5,
    FAIRY: 0.5,
  },
  ROCK: {
    FIRE: 2,
    ICE: 2,
    FIGHTING: 0.5,
    GROUND: 0.5,
    FLYING: 2,
    BUG: 2,
    STEEL: 0.5,
  },
  GHOST: { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON: { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK: { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL: {
    FIRE: 0.5,
    WATER: 0.5,
    ELECTRIC: 0.5,
    ICE: 2,
    ROCK: 2,
    STEEL: 0.5,
    FAIRY: 2,
  },
  FAIRY: {
    FIRE: 0.5,
    FIGHTING: 2,
    POISON: 0.5,
    DRAGON: 2,
    DARK: 2,
    STEEL: 0.5,
  },
};

function calcularMultiplicador(tipoAtaque, tipoDefensor) {
  //Si el tipo del atacante existe en la tabla y tiene una entrada para el defensor
  //devuelve ese multiplicador,si no devuelve 1 que es neutro
  return TABLA_TIPOS[tipoAtaque]?.[tipoDefensor] ?? 1;
}

//Funcion auxiliar para que no salte de forma instantea un nuevo combate
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function darRecompensa(enemigo) {
  let itemDrop;
  if (enemigo.nivel >= 40) {
    itemDrop = INVENTARIO.hiperpocion;
  } else if (enemigo.nivel >= 20) {
    itemDrop = INVENTARIO.superpocion;
  } else {
    itemDrop = INVENTARIO.pocion;
  }
  if (itemDrop.cantidad < itemDrop.max) {
    itemDrop.cantidad++;
    escribirEnLog(`🎁 ¡Has recibido una ${itemDrop.nombre}! (${itemDrop.cantidad}/${itemDrop.max})`);
    return;
  }
}

// --- NUEVO SISTEMA DE EXPERIENCIA ---
async function repartirExperiencia(enemigoDerrotado) {
  // Fórmula clásica simplificada
  const expGanada = Math.floor((enemigoDerrotado.experiencia_base * enemigoDerrotado.nivel) / 7);
  escribirEnLog(`¡${jugadorActual.nombre} ganó ${expGanada} puntos de EXP!`);

  //Al que esta en juego
  await ganarExp(jugadorActual, expGanada);

  // AL resto del equipo
  const expPasiva = Math.floor(expGanada * 0.2);
  // 2. Dar EXP al resto del equipo vivo en la mochila (Repartir Experiencia)
  for (let p of LISTA_POKEMON) {
    if (p !== jugadorActual && p.vida > 0) {
      await ganarExp(p, expPasiva);
      escribirEnLog(`${p.nombre} recibió ${expPasiva} EXP pasiva.`);
    }
  }
}
async function ganarExp(poke, cantidad) {
  poke.expActual += cantidad;
  while (poke.expActual >= poke.expSiguienteNivel) {
    poke.expActual -= poke.expSiguienteNivel;
    poke.nivel++;
    poke.expSiguienteNivel = Math.floor(poke.expSiguienteNivel * 1.3);
    // Subida de stats básica
    poke.vidaMaxima += 5;
    poke.ataque += 2;
    poke.defensa += 2;
    escribirEnLog(`¡${poke.nombre} subió al nivel ${poke.nivel}!`);
  }
}

async function subirNivel(pokemon) {
  pokemon.nivel += 1;
  pokemon.ataque += 3;
  pokemon.defensa += 2;
  pokemon.vidaMaxima += 5;
  pokemon.vida += 5; // Le cura la vida máxima que acaba de ganar
  pokemon.experienciaMax = Math.floor(pokemon.experienciaMax * 1.5); // Escala para el siguiente nivel

  // Sincronizar con el equipo general si no es el activo
  const indice = LISTA_POKEMON.findIndex((p) => p.nombre === pokemon.nombre);
  if (indice !== -1) LISTA_POKEMON[indice] = { ...pokemon };

  await esperar(500);
  escribirEnLog(`¡🎉 ${pokemon.nombre} ha subido al nivel ${pokemon.nivel}!`);
  actualizarStatsUI();
}

async function nuevoCombate() {
  // enemigo = await obtenerPokemonDeAPI(jugadorActual.nivel); // <--- Le pasamos true para que le dé nivel aleatorio
   const btnLucha = document.getElementById("btn-lucha");
  toggleBotones(true);

  // Mensajes progresivos con pausa entre ellos
  await esperar(1000);
  escribirEnLog("──────────────────────────");
  await esperar(800);
  escribirEnLog("🌿 El enemigo ha sido derrotado...");
  await esperar(1000);
  escribirEnLog("Buscando nuevo rival...");

  jugadorActual.vida = jugadorActual.vidaMaxima;
  enemigo = await obtenerPokemonDeAPI();

  await esperar(800);
  escribirEnLog(`¡Un ${enemigo.nombre} salvaje aparece!`);
  await reproducirGrito(enemigo);
  await esperar(300);
  escribirEnLog(`¡Ve, ${jugadorActual.nombre}!`);
  await reproducirGrito(jugadorActual);

  btnLucha.innerText = "LUCHAR";
  toggleBotones(false);

  actualizarInterfaz();
}

//funcion para que los heroes hagan daño a el enemigo
async function atacar(jugadorActual, enemigo, movimiento) {
  try {
    if (!movimiento) {
      console.log("⚠️ Error: movimiento no definido");
    return;
    }

    //1.Calculamos el multiplicador
    const multiplicador = calcularMultiplicador(movimiento.tipo, enemigo.tipo);

    //2.Calculamos el daño base con la potencia del movimiento
    let danio = Math.max(5,jugadorActual.ataque + movimiento.potencia / 10 - enemigo.defensa);

    // 3. Aplicamos el multiplicador
    danio = Math.round(danio * multiplicador);
    danio = Math.max(1, danio); //Ponemos como minimo 1 de daño salvo que sea inmune.

    escribirEnLog(`${jugadorActual.nombre} usa ${movimiento.nombre}!`);
// 4. Mensaje según el multiplicador
    if (multiplicador === 0) {
      escribirEnLog(`No afecta a ${enemigo.nombre}...`);
      // Turno del enemigo igualmente
      turnoEnemigo();
      return;
    } else if (multiplicador >= 2) {
      escribirEnLog(`¡Es superefectivo! x${multiplicador}`);
    } else if (multiplicador <= 0.5) {
      escribirEnLog("No es muy efectivo");
    }

    enemigo.vida -= danio;

    if (enemigo.vida <= 0) {
      enemigo.vida = 0;
      actualizarInterfaz();
      escribirEnLog(`¡${jugadorActual.nombre} ha derrotado a ${enemigo.nombre}! 🏆`);

      await repartirExperiencia(enemigo);
      darRecompensa(enemigo);

      toggleBotones(true);
      await nuevoCombate();

    } else {
      escribirEnLog(`${jugadorActual.nombre} ataca! a ${enemigo.nombre} le quedan ${enemigo.vida} HP`);

      actualizarInterfaz();
      //Turno del enemigo
      turnoEnemigo();
    }
  } catch(error) {
    escribirEnLog(`⚠️ Error en combate: ${error.message}`);
  }
}

//TurnoEnemigo
function turnoEnemigo() {
  if (enemigo.vida <= 0) return;
  toggleBotones(true); //bloquea los botones mientras el enemigo ataca.
  escribirEnLog(
    `${enemigo.nombre.toUpperCase()} se prepara para contraatacar...`,
  );

  setTimeout(async () => {
    let damage = Math.max(5, enemigo.ataque - jugadorActual.defensa);
    jugadorActual.vida -= damage;

    if (jugadorActual.vida <= 0) {
      jugadorActual.vida = 0;
      actualizarInterfaz();
      escribirEnLog(`¡${jugadorActual.nombre} ha caído en combate! 💀`);
      await nuevoCombate();
    } else {
      escribirEnLog(
        `${enemigo.nombre} ataca a ${jugadorActual.nombre}!. Pierdes ${damage} HP.`,
      );
      actualizarInterfaz();
      toggleBotones(false);
    }
  }, 1000);
}
