/**
 * Herramientas de desarrollo para pruebas
 * ¡IMPORTANTE! Este archivo debe ser eliminado en producción
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Cargando herramientas de desarrollo...");

  // Esperar un momento para asegurar que PremiumManager esté disponible
  setTimeout(() => {
    setupDevTools();
  }, 1000);

  function setupDevTools() {
    // Agregar botón para borrar token premium
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.left = "20px";
    container.style.zIndex = "9999";
    container.style.background = "rgba(0, 0, 0, 0.8)";
    container.style.padding = "10px";
    container.style.borderRadius = "5px";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";

    // Botón para borrar token premium
    const resetButton = document.createElement("button");
    resetButton.textContent = "Borrar token premium";
    resetButton.style.padding = "5px 10px";
    resetButton.style.backgroundColor = "#e74c3c";
    resetButton.style.color = "white";
    resetButton.style.border = "none";
    resetButton.style.borderRadius = "3px";
    resetButton.style.cursor = "pointer";

    resetButton.addEventListener("click", function () {
      localStorage.removeItem("premiumToken");
      localStorage.removeItem("deviceId"); // Opcional: también borrar deviceId para pruebas completas
      localStorage.removeItem("timerRemaining"); // Borrar tiempo restante
      localStorage.removeItem("timerExpired"); // Borrar estado de expiración
      alert(
        "Token premium borrado. Recarga la página para ver el temporizador."
      );
      location.reload(); // Recargar automáticamente
    });

    container.appendChild(resetButton);
    document.body.appendChild(container);

    console.log("Herramientas de desarrollo inicializadas");
  }
});
