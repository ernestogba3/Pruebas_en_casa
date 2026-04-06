const LISTA_POKEMON = [];
let enemigo;
let jugadorActual;

//Musica
const musicaFondo = new Audio(
  "/pruebas_en_casa/Ejercicio_Juego/assets/audio/musica-fondo.mp3",
);
musicaFondo.loop = true;
musicaFondo.volume = 0.3;
let musicaIniciada = false;

function iniciarMusica() {
  if (musicaIniciada) return;
  musicaFondo.play().catch((err) => console.warn("Audio bloqueado", err));
  musicaIniciada = true;
}

function reproducirSonidoClick() {
  const ctx = new AudioContext();
  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();

  oscilador.connect(ganancia);
  ganancia.connect(ctx.destination);

  oscilador.frequency.setValueAtTime(600, ctx.currentTime);
  oscilador.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
  ganancia.gain.setValueAtTime(0.3, ctx.currentTime);
  ganancia.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  oscilador.start(ctx.currentTime);
  oscilador.stop(ctx.currentTime + 0.1);
}

//Añadiendo gritos de los pokemon
function reproducirGrito(pokemon) {
  return new Promise((resolve) => {
    if (!pokemon?.grito) return resolve();
    musicaFondo.volume = 0.05;
    const audio = new Audio(pokemon.grito);
    audio.volume = 0.5;
    audio.onended = () => {
      musicaFondo.volume = 0.3;
      resolve();
    };
    audio.onerror = resolve;
    audio.play().catch(resolve);
  });
}

//Inicio de partida
async function iniciarCombate() {
  jugadorActual = { ...LISTA_POKEMON[0] };
  enemigo = await obtenerPokemonDeAPI();

  if (jugadorActual && enemigo) {
    actualizarInterfaz();

    escribirEnLog(`!Un ${enemigo.nombre} salvaje aparece!`);
    await reproducirGrito(enemigo);
    await esperar(200);

    escribirEnLog(`¡Ve, ${jugadorActual.nombre}!`);
    await reproducirGrito(jugadorActual);

    toggleBotones(false);
  }
}

async function arrancarJuego() {
  await prepararListaPokemon();
  await iniciarCombate();
}

function seleccionarPokemon(pokemon) {
  // Guarda la vida actual del jugador antes de cambiar
  const indiceActual = LISTA_POKEMON.findIndex(p => p.nombre === jugadorActual.nombre);
  if (indiceActual !== -1) LISTA_POKEMON[indiceActual].vida = jugadorActual.vida;

  jugadorActual = { ...pokemon };
  actualizarInterfaz();
  escribirEnLog(`¡Vuelve! ¡Adelante, ${jugadorActual.nombre}!`);
  reproducirGrito(jugadorActual);
}

//4.---------------------------------Eventos-------------------------------------------
document.querySelectorAll(".btn, .btn-pokemon-equipo, #btn-volver-cambio").forEach((btn) => {
  btn.addEventListener("click", () => {
    iniciarMusica();
    reproducirSonidoClick();
  });
});

document.getElementById("btn-cambio").addEventListener("click", () => {
  mostrarMenuCambio();
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
  mostrarMenuMovimientos();
});

document.getElementById("btn-volver-cambio").addEventListener("click", () => {
  ocultarMenuCambio();
});

//Boton para volver al menu principal
document.getElementById("btn-volver").addEventListener("click", () =>{
  ocultarMenuMovimientos();
})

document.getElementById("levelUp").addEventListener("click", () => {
  subirNivel(jugadorActual);
});

document.getElementById("btn-bolsa").addEventListener("click", () => {
  escribirEnLog("🎒 La bolsa está vacía. (Próximamente)");
});

//Los 4 botones de movimiento
document.querySelectorAll(".btn-movimiento").forEach((btn,i)=>{
  btn.addEventListener("click", () =>{
    const movimiento = jugadorActual.movimientos[i];
    ocultarMenuMovimientos();
    atacar(jugadorActual,enemigo,movimiento);
  })
})

//5. Iniciamos todo
arrancarJuego();
