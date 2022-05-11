// ==UserScript==
// @name         Filtrador de hilos ForoCoches by RBEDev
// @namespace    https://github.com/rbedev/filtrador-hilos-forocoches/
// @description  Filtra los hilos no deseados por su ID y por su título
// @match        https://forocoches.com/*
// @icon         https://forocoches.com/favicon-32x32.png
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// @run-at       document-end
// @version      1.0
// ==/UserScript==

// API Key. Reemplazar esta clave para que funcione el script.
const API_KEY = 'REPLACE_API_KEY';

// Palabras a filtrar. En este array puedes añadir cualquiera palabra que quieras filtrar.
// Por ejemplo, para evitar comerte spoilers, para ver hilos cansinos de política, de antivacunas etc etc...
const words = ['Texto a filtrar para no mostrar', 'Langostas', 'Cunetas', 'dos vasos de agua'];

// Este array contiene los IDs de los hilos que se quieren ocultar expresamente mediante su ID.
// Se rellena en el método getThreadIds().
let threadIds = [];

// Cuando el documento está listo, se realizan las acciones
$(document).ready(function () {
  // Obtiene IDs de los hilos ocultados mediante el botón, usando su ID y no el título.
  getThreadIds();

  // Obtiene todos los <a> con HREF a "showthread.php" y que tienen title.
  const aElements = document.querySelectorAll('a[href*="showthread.php"][title]');

  // Bucle que recorre todos los elementos encontrados
  for (let a of aElements) {
    checkATag(a);
  }

  /**
   * Comprueba el tag HTML <a> y sus atributos para comprobar si se debe ocultar el hilo o no.
   * @param a Elemento <a> que contiene la información para ser filtrado
   */
  function checkATag(a) {
    const threadId = a.search.replace('?t=', '').trim();
    if (threadIds.includes(threadId)) {
      hideA(a);
    } else {
      const textContent = a.textContent;
      for (const word of words) {
        if (textContent.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
          hideA(a);
          break;
        }
      }
    }
  }

  /**
   * Oculta el elemento que no se quiere
   */
  function hideA(a) {
    a.closest('tr').style.display = 'none';
  }

  /**
   * Obtiene los IDs de los hilos que se quieren ocultar y los añade al array threadIds.
   */
  function getThreadIds() {
    const response = $.ajax({
      type: 'GET',
      url: 'https://www.rbedev.com/API/Forocoches/V1/getThreads.php?key=' + API_KEY,
      async: false,
    }).responseText;

    threadIds = JSON.parse(response);
  }
});
