const TABLA_TIPOS = {
  NORMAL:   { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:     { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:    { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  GRASS:    { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  ICE:      { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2, FAIRY: 0.5 },
  POISON:   { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0, FAIRY: 2 },
  GROUND:   { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:   { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:  { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:      { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5, FAIRY: 0.5 },
  ROCK:     { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:    { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5 },
  DRAGON:   { DRAGON: 2, STEEL: 0.5, FAIRY: 0 },
  DARK:     { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, FAIRY: 0.5 },
  STEEL:    { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5, FAIRY: 2 },
  FAIRY:    { FIRE: 0.5, FIGHTING: 2, POISON: 0.5, DRAGON: 2, DARK: 2, STEEL: 0.5 },
};


function calcularMultiplicador(tipoAtaque,tipoDefensor){
//Si el tipo del atacante existe en la tabla y tiene una entrada para el defensor
//devuelve ese multiplicador,si no devuelve 1 que es neutro
return TABLA_TIPOS[tipoAtaque]?.[tipoDefensor]?? 1;
}


//Funcion auxiliar para que no salte de forma instantea un nuevo combate
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


//Funcion para subida de nivel
function subirNivel(jg) {
  jg.nivel += 1;
  jg.ataque += 5;
  jg.defensa += 1;

  const indice = LISTA_POKEMON.findIndex((p) => p.nombre === jg.nombre);
  if (indice !== -1) {
    LISTA_POKEMON[indice].nivel = jg.nivel;
    LISTA_POKEMON[indice].ataque = jg.nivel;
    LISTA_POKEMON[indice].defensa = jg.nivel;
  }
  escribirEnLog(`¡ ${jg.nombre} ha subido al nivel!`);
  actualizarStatsUI();
}

async function nuevoCombate() {
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
async function atacar(jugadorActual, enemigo,movimiento) {

  try{
    if(!movimiento){
      escribirEnLog("⚠️ Error: movimiento no definido");
      return;
    }
  

  //1.Calculamos el multiplicador
  const multiplicador = calcularMultiplicador(movimiento.tipo,enemigo.tipo);

  //2.Calculamos el daño base con la potencia del movimiento

  let danio = Math.max(5, (jugadorActual.ataque + movimiento.potencia/10)- enemigo.defensa);
  
  // 3. Aplicamos el multiplicador
  danio = Math.round(danio * multiplicador);
  danio = Math.max(1,danio);//Ponemos como minimo 1 de daño salvo que sea inmune.

  // 4. Mensaje según el multiplicador
  escribirEnLog(`${jugadorActual.nombre} usa ${movimiento.nombre}!`);

  if(multiplicador===0){
     escribirEnLog(`No afecta a ${enemigo.nombre}...`);
    // Turno del enemigo igualmente
    turnoEnemigo();
    return;
  }else if(multiplicador>=2){
    escribirEnLog(`¡Es superefectivo! x${multiplicador}`);
  }else if(multiplicador <=0.5){
    escribirEnLog("No es muy efectivo");
  }

  enemigo.vida -=danio;


  if (enemigo.vida <= 0) {
    enemigo.vida = 0;
    actualizarInterfaz();
    escribirEnLog(`¡${jugadorActual.nombre} ha derrotado a ${enemigo.nombre}! 🏆`);
    toggleBotones(true);
    await nuevoCombate();
  } else {
    escribirEnLog(
      `${jugadorActual.nombre} ataca! a ${enemigo.nombre} le quedan ${enemigo.vida} HP`,
    );
    actualizarInterfaz();
    //Turno del enemigo
    turnoEnemigo();
  }
}catch{
    escribirEnLog(`⚠️ Error en combate: ${error.message}`);
    console.error("Error en atacar:", error);
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

// combate.js — añade esto al principio del archivo



