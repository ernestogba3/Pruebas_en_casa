// 1. El Jugador: Un objeto para agrupar toda su información
const jugador = {
  nombre: "Lancelot",
  nivel: 5,
  vida: 100,
  vidaMaxima: 100,
  ataque: 15,
  pociones: 3,
  clase: "Arquero",
};

const jugador2 = {
  nombre: "Arturo",
  nivel: 5,
  vida: 50,
  vidaMaxima: 50,
  ataque: 20,
  clase: "Guerrero",
};

//Objeto enemigo
const enemigo = {
  nombre: "slime",
  nivel: 5,
  vida: 70,
  vidaMaxima: 70,
  ataque: 7,
  tipo: "bestia",
};

//Variable para saber quien esta peleando
let jugadorActual = jugador;

//Funcion para subida de nivel
function subirNivel(jg) {
  jg.nivel += 1;
  jg.ataque += 5;
  console.log(`Subiste de nivel por tanto has ganado: ${jg.ataque}`);
  escribirEnLog(`${jg.nombre} ha subido al nivel ${jg.nivel} (Ataque +5)`);
  actualizarStatsUI();
}

//funcion para que los heroes hagan daño a el enemigo
function atacar(jugadorActual, enemigo) {
  //Restamos vida al enemigo
  enemigo.vida -= jugadorActual.ataque;

  if (enemigo.vida <= 0) {
    enemigo.vida = 0;

    escribirEnLog(
      `¡${jugadorActual.nombre} ha derrotado a ${enemigo.nombre}! 🏆`,
    );
  } else {
    escribirEnLog(
      `${jugadorActual.nombre} ataca! a ${enemigo.nombre} le quedan ${enemigo.vida} HP`,
    );
  }

  actualizarInterfaz();
}

function caracteristicas() {
  console.log(
    `| Nombre: ${jugadorActual.nombre} | Clase: ${jugadorActual.clase} |
       |Ataque: ${jugadorActual.ataque} | Vida: ${jugadorActual.vida} |`,
  );
}

function actualizarInterfaz() {
  document.getElementById("nombre-jugador").innerText = jugadorActual.nombre;
  document.getElementById("nombre-enemigo").innerText = enemigo.nombre;
  document.getElementById("vida-enemigo").innerText = enemigo.vida;

  //Actualiza la interfaz de estadisticas,Esto te asegura que mientras este abierto si subes de nivel se vera reflejado en la parte derecha al momento
  actualizarStatsUI();
}

function cambiarPersonaje() {
  if (jugadorActual === jugador) {
    jugadorActual = jugador2;
  } else {
    jugadorActual = jugador;
  }

  actualizarInterfaz();
  escribirEnLog(`Has cambiado a ${jugadorActual.nombre}`);
}

//Nombre del jugador que aparece en la parte de abajo a la izquierda
function actualizarNombre() {
  document.getElementById("nombre-jugador").innerText = jugadorActual.nombre;
}

//Actualizar la vida del enemigo
function actualizarVidaEnemigo() {
  document.getElementById("vida-enemigo").innerText = enemigo.vida;
}

//Nombre del Enemigo que aparece en la parte superior a la izquierda
function actualizarNombreEnemigo() {
  document.getElementById("nombre-enemigo").innerText = enemigo.nombre;
}

//Texto de encima del HUD
function escribirEnLog(mensaje) {
  const log = document.getElementById("registro-combate");
  log.innerHTML += `<p style="color:white; margin:5px 0; font-family:monospace;">> ${mensaje}</p>`;
  log.scrollTop = log.scrollHeight;
}

function actualizarStatsUI() {
  document.getElementById("stat-nombre").innerText = jugadorActual.nombre;
  document.getElementById("stat-nivel").innerText = jugadorActual.nivel;
  document.getElementById("stat-ataque").innerText = jugadorActual.ataque;
  document.getElementById("stat-vida").innerText = jugadorActual.vida;
  document.getElementById("stat-max-vida").innerText = jugadorActual.vidaMaxima;
}

//4. Eventos de los botones

document.getElementById("btn-cambio").addEventListener("click", () => {
  cambiarPersonaje();
});

document.getElementById("btn-stat").addEventListener("click", () => {
  const panelStats = document.getElementById("stats-container");

  if(panelStats){
    panelStats.classList.toggle("oculto");

  if (!panelStats.classList.contains("oculto")) {
    actualizarStatsUI();
    escribirEnLog("Abriendo panel de estadisticas...");
  }
}else{
  console.log("Error con el stat-container");
}
});

document.getElementById("btn-lucha").addEventListener("click", () => {
  atacar(jugadorActual, enemigo);
});

document.getElementById("levelUp").addEventListener("click", () => {
  subirNivel(jugadorActual);
});

//5. Iniciamos todo
actualizarInterfaz();

escribirEnLog(`Un ${enemigo.nombre} salvaje apareció`);
