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
  document.getElementById("nivel-enemigo").innerText = enemigo.nivel;


  //Incluyendo imagenes en el HUD
  document.getElementById("poke-img-enemigo").src = enemigo.sprite;
  document.getElementById("poke-img-jugador").src = jugadorActual.sprite;

  if (jugadorActual && enemigo) {
    actualizarBarraVida("barra-vida-enemigo", enemigo.vida, enemigo.vidaMaxima);
    actualizarBarraVida("barra-vida-jugador",jugadorActual.vida,jugadorActual.vidaMaxima);

    const barraExp = document.getElementById("barra-exp-jugador");

    if (barraExp && jugadorActual.expSiguienteNivel) {
      const porcExp = Math.max(0,Math.min(100,(jugadorActual.expActual / jugadorActual.expSiguienteNivel)*100,));
      barraExp.style.width = `${porcExp}%`;
      console.log(`EXP: ${jugadorActual.expActual} / ${jugadorActual.expSiguienteNivel} (${porcExp}%)`);
    }
   
  }

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

  document.getElementById(
    "menu-principal",
  ).style.display = "none";
  document.getElementById(
    "menu-movimientos",
  ).style.display = "grid";
}

function ocultarMenuMovimientos() {
  document.getElementById(
    "menu-principal",
  ).style.display = "grid";
  const menuMovimientos = (document.getElementById(
    "menu-movimientos",
  ).style.display = "none");
}

function mostrarMenuCambio() {
  const contenedor = document.getElementById("lista-pokemon-equipo");
  contenedor.innerHTML = "";

  LISTA_POKEMON.forEach((pokemon, i) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-pokemon-equipo");

    if (pokemon.nombre === jugadorActual.nombre) btn.classList.add("activo");
    if (pokemon.vida <= 0) {
      btn.classList.add("debilitado");
      btn.disabled = true;
    }
    btn.innerHTML = `
      <span>${pokemon.nombre}</span>
      <span>${pokemon.tipo}</span>
      <span>${pokemon.vida}/${pokemon.vidaMaxima} HP</span>`;

    btn.addEventListener("click", () => {
      if (pokemon.nombre === jugadorActual.nombre) {
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

function ocultarMenuCambio() {
  document.getElementById("menu-cambio").style.display = "none";
  document.getElementById("menu-principal").style.display = "grid";
}

function mostrarMenuBolsa() {
  const contenedor = document.getElementById("lista-objetos-bolsa");
  contenedor.innerHTML = "";

  // Recorremos los valores del objeto INVENTARIO
  Object.values(INVENTARIO).forEach((objeto) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-objeto-bolsa");

    if (objeto.cantidad <= 0) {
      btn.classList.add("vacio");
      btn.disabled = true;
    }

    btn.innerHTML = `
      <span>${objeto.nombre}</span>
      <span>x${objeto.cantidad}</span>
      <span>Cura: ${objeto.curacion}HP</span>`;

    btn.addEventListener("click", () => {
      // Lógica inicial para usar el objeto basándonos en tu código
      if (objeto.cantidad > 0) {
        objeto.cantidad--;
        jugadorActual.vida += objeto.curacion;

        // Evitar curar por encima de la vida máxima
        if (jugadorActual.vida > jugadorActual.vidaMaxima) {
          jugadorActual.vida = jugadorActual.vidaMaxima;
        }

        escribirEnLog(
          `🎒 Has usado ${objeto.nombre}. ${jugadorActual.nombre} recupera ${objeto.curacion} HP.`,
        );
        actualizarInterfaz();
        ocultarMenuBolsa();

        // Al usar un objeto, consumes el turno, por lo que ataca el enemigo
        turnoEnemigo();
      }
    });

    contenedor.appendChild(btn);
  });

  // Ocultamos el resto de menús y mostramos la bolsa
  document.getElementById("menu-principal").style.display = "none";
  document.getElementById("menu-movimientos").style.display = "none";
  document.getElementById("menu-cambio").style.display = "none";
  document.getElementById("menu-bolsa").style.display = "flex";
}

function ocultarMenuBolsa() {
  document.getElementById("menu-bolsa").style.display = "none";
  document.getElementById("menu-principal").style.display = "grid";
}
