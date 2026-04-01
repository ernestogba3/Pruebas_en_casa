// 1. El Jugador: Un objeto para agrupar toda su información
const jugador = {
  nombre: "Héroe",
  nivel: 5,
  vida: 100,
  vidaMaxima: 100,
  ataque: 15,
  pociones: 3,
  clase: "Guerrero",

  caracteristicas: function () {
    console.log(
      `| Nombre: ${this.nombre} | Clase: ${this.clase} |
         |Ataque: ${this.ataque} | Vida: ${this.vida} |`,
    );
  },

  //Funcion para cambiar datos del personaje
  subirNivel: function () {
    this.ataque += 5;
    console.log(`Subiste de nivel por tanto has ganado: ${this.ataque}`);

    escribirEnLog(`${jugador.nombre} ha subido ${jugador.nivel} niveles`);
  },


  atacar: function (enemigo) {
    //Restamos vida al enemigo
    enemigo.vida -= this.ataque;

    if (enemigo.vida <= 0) {
      enemigo.vida = 0;

      escribirEnLog(`¡${jugador.nombre} ha derrotado a ${enemigo.nombre}! 🏆`);
      const vidaEnemigoTexto = document.getElementById("vida-enemigo");
      vidaEnemigoTexto.innerText = enemigo.vida;

    } else {

      const vidaEnemigoTexto = document.getElementById("vida-enemigo");
      vidaEnemigoTexto.innerText = enemigo.vida;
      escribirEnLog(`Al slime le quedan: ${enemigo.vida} puntos de vida`);
    }

  }
}

//Objeto enemigo
const enemigo = {
  nombre: "slime",
  nivel: 5,
  vida: 70,
  vidaMaxima: 70,
  ataque: 7,
  tipo: "bestia",
}

const btnLuchar = document.getElementById("btn-lucha");
btnLuchar.addEventListener("click", () => {
  jugador.atacar(enemigo);
})

const btnSubirNivel = document.getElementById("levelUp");
btnSubirNivel.addEventListener("click", () => {
  jugador.subirNivel();
});

//Nombre del jugador que aparece en la parte de abajo a la izquierda
function actualizarNombre() {
  const nombreJugadorContenedor = document.getElementById("nombre-jugador");

  nombreJugadorContenedor.innerText = jugador.nombre.toUpperCase();

  escribirEnLog(`Esta combatiendo el ${jugador.nombre}`);
}

//Actualizar la vida del enemigo
function actualizarVidaEnemigo() {
  const vidaEnemigoContenedor = document.getElementById("vida-enemigo");

  vidaEnemigoContenedor.innerText = enemigo.vida;

  escribirEnLog(`Vida de ${enemigo.nombre} : ${enemigo.vida}`);
}


//Nombre del Enemigo que aparece en la parte superior a la izquierda
function actualizarNombreEnemigo() {
  const nombreEnemigoContenedor = document.getElementById("nombre-enemigo");

  nombreEnemigoContenedor.innerText = enemigo.nombre.toUpperCase();

  escribirEnLog(`Esta combatiendo el ${enemigo.nombre}`);
}
const btnCambiarJugador = document.getElementById("btn-cambio");
btnCambiarJugador.addEventListener("click", () => {
  actualizarNombre();
});

//Texto de encima del HUD
const log = document.getElementById("registro-combate");

function escribirEnLog(mensaje) {
  log.innerHTML += `<p style="color:white"> ${mensaje}</p>`;
  log.scrollTop = log.scrollHeight;
}

actualizarNombre(jugador);
actualizarNombreEnemigo(enemigo);
actualizarVidaEnemigo(enemigo);
