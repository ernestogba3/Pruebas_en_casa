//Texto de encima del HUD
function escribirEnLog(mensaje) {
  const log = document.getElementById("registro-combate");
  log.innerHTML += `<p style="color:white; margin:5px 0; font-family:monospace;">> ${mensaje}</p>`;
  log.scrollTop = log.scrollHeight;
}
function toggleBotones(desactivar) {
  const botones = document.querySelectorAll(".btn");
  botones.forEach((boton) => {
    boton.disabled = desactivar;
    boton.style.opacity = desactivar ? "0.5" : "1";
    boton.style.cursor = desactivar ? "not-allowed" : "pointer";
  });
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

function mostrarMenuMovimientos() {
  
  jugadorActual.movimientos.forEach((mov, i) => {
    const btn = document.getElementById(`mov-${i}`);
    btn.innerText = `${mov.nombre} (${mov.tipo}) | POT: ${mov.potencia}`;
    btn.dataset.tipo = mov.tipo;
  });

  const menuPrincipal = document.getElementById("menu-principal").style.display="none";
  const menuMovimientos = document.getElementById("menu-movimientos").style.display="grid";

}

function ocultarMenuMovimientos() {
  const menuPrincipal = document.getElementById("menu-principal").style.display="grid";
  const menuMovimientos = document.getElementById("menu-movimientos").style.display="none";
}

function mostrarMenuCambio() {
  const contenedor = document.getElementById("lista-pokemon-equipo");
  contenedor.innerHTML = "";
  
  LISTA_POKEMON.forEach((pokemon,i)=>{
  const btn = document.createElement("button");
  btn.classList.add("btn-pokemon-equipo");

  if(pokemon.nombre === jugadorActual.nombre)btn.classList.add("activo");
  if(pokemon.vida<=0){
    btn.classList.add("debilitado");
    btn.disabled= true;
  }
 btn.innerHTML = `
      <span>${pokemon.nombre}</span>
      <span>${pokemon.tipo}</span>
      <span>${pokemon.vida}/${pokemon.vidaMaxima} HP</span>`;

      btn.addEventListener("click",()=>{
        if(pokemon.nombre === jugadorActual.nombre){
          escribirEnLog("⚠️ Este Pokémon ya está en combate.");
          return;
        }
        seleccionarPokemon(pokemon);
        ocultarMenuCambio();
      });
      contenedor.appendChild(btn);
    });

  document.getElementById("menu-principal").style.display = "none";
  document.getElementById("menu-movimientos").style.display = "none";
  document.getElementById("menu-cambio").style.display = "flex";
}

function ocultarMenuCambio(){
  document.getElementById("menu-cambio").style.display = "none";
  document.getElementById("menu-principal").style.display = "grid";
}
