const LISTA_POKEMON = [];

//Probamos api de pokemon
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
    };
  }
}

//Añadiendo sonidos
function reproducirGrito(pokemon) {
  return new Promise((resolve) => {
    if (!pokemon?.grito) return resolve();
      const audio = new Audio(pokemon.grito);
      audio.volume = 0.5;
      audio.onended = resolve;
      audio.onerror = resolve;
      audio.play().catch(resolve);
  });


  
}
function reproducirSonidoClick() {
  const ctx = new AudioContext();
  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();

  oscilador.connect(ganancia);
  oscilador.connect(ctx.destination);

  oscilador.frequency.setValueAtTime(600, ctx.currentTime);
  oscilador.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
  ganancia.gain.setValueAtTime(0.3, ctx.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  oscilador.start(ctx.currentTime);
  oscilador.stop(ctx.currentTime + 0.1);
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

//Funcion para elegir de forma aleatoria el personaje
// function obtenerPersonajeAleatorio(lista) {
//   const indice = Math.floor(Math.random() * lista.length);

//   return { ...lista[indice] };
// }

//Inicio de partida
let enemigo;
let jugadorActual;

async function iniciarCombate() {
  jugadorActual = { ...LISTA_POKEMON[0] };
  enemigo = await obtenerPokemonDeAPI();

  if (jugadorActual && enemigo) {
    actualizarInterfaz();


    escribirEnLog(`!Un ${enemigo.nombre} salvaje aparece!`);
    await reproducirGrito(enemigo);

    await esperar(1500);
    escribirEnLog(`¡Ve, ${jugadorActual.nombre}!`);
    await reproducirGrito(jugadorActual);

    toggleBotones(false);
  }
}

async function arrancarJuego() {
  await prepararListaPokemon();
  await iniciarCombate();
  let musicaIniciada =false;

  function iniciarMusica(){
    if(musicaIniciada)return;
    musicaFondo.play().catch(err => console.warn("audio bloqueado",err));
    musicaIniciada =true;
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

function toggleBotones(desactivar) {
  const botones = document.querySelectorAll(".btn");
  botones.forEach((boton) => {
    boton.disabled = desactivar;
    boton.style.opacity = desactivar ? "0.5" : "1";
    boton.style.cursor = desactivar ? "not-allowed" : "pointer";
  });
}
//Funcion auxiliar para que no salte de forma instantea un nuevo combate
function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

const musicaFondo = new Audio("/pruebas_en_casa/Ejercicio_Juego/assets/audio/musica-fondo.mp3");
musicaFondo.loop = true;
musicaFondo.volume = 0.3;
musicaFondo.play();

//funcion para que los heroes hagan daño a el enemigo
async function atacar(jugadorActual, enemigo) {
  //Restamos vida al enemigo
  let danio = Math.max(5, jugadorActual.ataque - enemigo.defensa);
  enemigo.vida -= danio;

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
}

function actualizarInterfaz() {
  if (!jugadorActual || !enemigo) return;
  document.getElementById("nombre-jugador").innerText = jugadorActual.nombre;
  document.getElementById("nombre-enemigo").innerText = enemigo.nombre;
  document.getElementById("vida-enemigo").innerText = enemigo.vida;
  document.getElementById("vida-max-enemigo").innerText = enemigo.vidaMaxima;

  //Incluyendo imagenes en el HUD
  document.getElementById("poke-img-enemigo").src = enemigo.sprite;
  document.getElementById("poke-img-jugador").src = jugadorActual.sprite;

  actualizarBarraVida("barra-vida-enemigo", enemigo.vida, enemigo.vidaMaxima);
  actualizarBarraVida(
    "barra-vida-jugador",
    jugadorActual.vida,
    jugadorActual.vidaMaxima,
  );

  //Actualiza la interfaz de estadisticas,Esto te asegura que mientras este abierto si subes de nivel se vera reflejado en la parte derecha al momento
  actualizarStatsUI();
}

function cambiarPersonaje() {
  if (LISTA_POKEMON.length === 0) {
    escribirEnLog("Introduciendo pokemon todavia.");
    return;
  }

  const indiceActual = LISTA_POKEMON.findIndex(
    (p) => p.nombre === jugadorActual.nombre,
  );
  if (indiceActual !== -1)
    LISTA_POKEMON[indiceActual].vida = jugadorActual.vida;

  let candidato;
  do {
    candidato = LISTA_POKEMON[Math.floor(Math.random() * LISTA_POKEMON.length)];
  } while (
    candidato.nombre === jugadorActual.nombre &&
    LISTA_POKEMON.length > 1
  );

  jugadorActual = { ...candidato };
  actualizarInterfaz();
  escribirEnLog(`¡Vuelve! ¡Adelante, ${jugadorActual.nombre}!`);
}

function actualizarBarraVida(idBarra, vida, vidaMaxima) {
  const barra = document.getElementById(idBarra);
  if (!barra) return;

  const porcentaje = Math.max(0, (vida / vidaMaxima) * 100);
  barra.style.width = `${porcentaje}%`;
  if (porcentaje > 50) {
    barra.style.backgroundColor = "#60e080"; // Color Verde de la barra al si tiene vida >50%
  } else if (porcentaje > 25) {
    barra.style.backgroundColor = "#ffd700"; //Color Amarillo de la barra si tiene vida >25%
  } else {
    barra.style.backgroundColor = "#e03030"; //Color Rojo de la barra si tiene vida <25%
  }
}

//Texto de encima del HUD
function escribirEnLog(mensaje) {
  const log = document.getElementById("registro-combate");
  log.innerHTML += `<p style="color:white; margin:5px 0; font-family:monospace;">> ${mensaje}</p>`;
  log.scrollTop = log.scrollHeight;
}

function actualizarStatsUI() {
  if (!jugadorActual) return;

  document.getElementById("stat-nombre").innerText = jugadorActual.nombre;
  document.getElementById("stat-nivel").innerText = jugadorActual.nivel;
  document.getElementById("stat-tipo").innerText = jugadorActual.tipo;
  document.getElementById("stat-exp").innerText =
    jugadorActual.experiencia_base;

  document.getElementById("stat-vida").innerText = jugadorActual.vida;
  document.getElementById("stat-max-vida").innerText = jugadorActual.vidaMaxima;
  document.getElementById("stat-defensa").innerText = jugadorActual.defensa;
  document.getElementById("stat-defensa-especial").innerText =
    jugadorActual.defensaEspecial;

  document.getElementById("stat-ataque-especial").innerText =
    jugadorActual.ataqueEspecial;
  document.getElementById("stat-ataque").innerText = jugadorActual.ataque;
  document.getElementById("stat-velocidad").innerText = jugadorActual.velocidad;

  //actualizamos la foto
  document.getElementById("poke-img").src = jugadorActual.sprite;
}

//4. Eventos de los botones
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", () =>{
    iniciarMusica();
    reproducirSonidoClick();
  }); 
});

document.getElementById("btn-cambio").addEventListener("click", () => {
  cambiarPersonaje();
});

document.getElementById("btn-stat").addEventListener("click", () => {
  const panelStats = document.getElementById("stats-container");

  if (panelStats) {
    panelStats.classList.toggle("oculto");

    if (!panelStats.classList.contains("oculto")) {
      actualizarStatsUI();
      escribirEnLog("Abriendo panel de estadisticas...");
    }
  } else {
    console.log("Error con el stat-container");
  }
});

document.getElementById("btn-lucha").addEventListener("click", () => {
  atacar(jugadorActual, enemigo);
});

document.getElementById("levelUp").addEventListener("click", () => {
  subirNivel(jugadorActual);
});

document.getElementById("btn-bolsa").addEventListener("click", () => {
  escribirEnLog("🎒 La bolsa está vacía. (Próximamente)");
});

//5. Iniciamos todo
arrancarJuego();
