//localizo el boton del html
const boton = document.getElementById("botoncito");

// Añado un listener para el evento del raton

boton.addEventListener("mouseenter", () => {
  boton.style.transform = "none";

  const anchoMax = window.innerWidth - boton.offsetWidth;
  const altoMax = window.innerHeight - boton.offsetHeight;

  const randomX = Math.floor(Math.random() * anchoMax);
  const randomY = Math.floor(Math.random() * altoMax);
  //Creamos las coordenadas aleatorias

  boton.style.left = randomX + "px";
  boton.style.top = randomY + "px";
});

const mostrarTiempo = document.getElementById("cronometro");
let tiempoRestante = 60;
let juegoTerminado = false;

const cuentaAtras = setInterval(() => {
  tiempoRestante--;
  mostrarTiempo.innerText = `Tiempo: ${tiempoRestante}s`;

  if (tiempoRestante <= 0) {
    clearInterval(cuentaAtras);
    juegoTerminado = true;
    boton.style.display = "none";
    alert("Se acabo el juego");
  }
}, 1000);

boton.addEventListener("mouseenter", () => {
  if (juegoTerminado) return;
  boton.style.transform = "none";
});

boton.addEventListener("click", () => {
  if (!juegoTerminado) {
    clearInterval(cuentaAtras);
    alert("Lo atrapaste y te han sobrado " + tiempoRestante + "segundos");
    location.reload();
  }
});
