// ==UserScript==
// @name         Filtrador de posts ForoCoches by RBEDev
// @namespace    https://github.com/rbedev/filtrador-hilos-forocoches/
// @description  Filtra los posts no deseados por usuarios
// @match        https://forocoches.com/foro/showthread.php*
// @icon         https://forocoches.com/favicon-32x32.png
// @grant        none
// @require      https://code.jquery.com/jquery-latest.js
// @run-at       document-end
// @version      1.0
// ==/UserScript==

// API Key
// Reemplazar esta clave para que funcione el script.
const API_KEY = 'REPLACE_API_KEY';

const URL_IGNORE_USER = 'https://www.forocoches.com/foro/profile.php?do=addlist&userlist=ignore&u=';

// Usuarios a filtrar. En este array estarán aquellos usuarios que están en tu lista de ignorados
// Por ejemplo, los que crear hilos de las pajas y vasos de agua, trolls a sueldo de IOS y que reparten pizzas etc...
// Se rellena en el método getUserIds().
let userIds = [];

// Cuando el documento está listo, se realizan las acciones
$(document).ready(function () {
  // Solo se comprueba el ID del usuario OP si es la primera página (No existe page)
  const page = new URLSearchParams(window.location.search).get('page');
  if (page == null) {
    // Se insertan los botones para ignorar a usuario o para ignorar tema.
    insertCSS();
    insertButtonToHidePost();
    insertButtonToIgnoreUser();

    // Obtiene IDs de los usuarios ignorados
    getUserIds();

    // Obtiene todos los <a> con HREF a "showthread.php" y que tienen title.
    const aElements = document.querySelectorAll('a[href*="member.php"]');

    // Los aElements[0] Y aElements[1] son del perfil del usuario en sesión
    const aElementOp = aElements[2];
    const opUserId = aElements[2].search.replace('?u=', '').trim();

    if (userIds.includes(opUserId)) {
      getAndSaveThreadId();
    } else {
      // Si el usuario no están en la lista pero está ignorado,
      // se realiza la petición para añadir su ID en la base de datos de ignorados.
      if (aElementOp.parentElement.innerHTML.includes('Quitar usuario de tu lista de ignorados')) {
        ignoreUserById();
      }
    }
  }

  /**
   * Obtiene y guarda el ID del hilo.
   */
  function getAndSaveThreadId() {
    // Obtiene el primer <a> con HREF a "showthread.php" y obtiene el id del hilo
    const firstThreadA = document.querySelector('a[href*="showthread.php"]');
    const threadId = firstThreadA.href.split('?t=')[1];
    ajaxRequestThread(threadId);
    window.location.href = 'https://www.forocoches.com/';
  }

  /**
   * Obtiene y guarda el ID del OP.
   */
  function ignoreUserById() {
    //Ignora también el hilo
    getAndSaveThreadId();
    // Obtiene todos los <a> con HREF a "showthread.php" y que tienen title.
    const aElements = document.querySelectorAll('a[href*="member.php"]');
    const opUserId = aElements[2].search.replace('?u=', '').trim();
    ajaxRequestUser(opUserId);
    window.location.href = URL_IGNORE_USER + opUserId;
  }

  /**
   * Inserta el botón para ocultar el hilo.
   */
  function insertButtonToHidePost() {
    const parent = $("img[src$='/foro/images/buttons/reply.gif'][title='Respuesta']").parent().parent();
    const button = $('<input type="button" value="Ocultar hilo" id="hideThread"/>');
    button.click(function () {
      getAndSaveThreadId();
    });
    parent.append(button);
  }

  /**
   * Inserta el botón para ignorar usuario.
   */
  function insertButtonToIgnoreUser() {
    const parent = $("img[src$='/foro/images/buttons/reply.gif'][title='Respuesta']").parent().parent();
    const button = $('<input type="button" value="Ignorar usuario" id="ignoreUser"/>');
    button.click(function () {
      ignoreUserById();
    });
    parent.append(button);
  }

  /**
   * Realiza la petición AJAX para guardar el ID del hilo a ignorar.
   * @param threadId ID del hilo a ignorar
   */
  function ajaxRequestThread(threadId) {
    $.ajax({
      url: 'https://www.rbedev.com/API/Forocoches/V1/saveThread.php',
      type: 'POST',
      data: jQuery.param({
        key: API_KEY,
        thread: threadId,
      }),
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      success: function () {
        // Se ha añadido en la base de datos
      },
    });
  }
  /**
   * Realiza la petición AJAX para guardar el ID del hilo a ignorar.
   * @param userId ID del hilo a ignorar
   */
  function ajaxRequestUser(userId) {
    $.ajax({
      url: 'https://www.rbedev.com/API/Forocoches/V1/saveUser.php',
      type: 'POST',
      data: jQuery.param({
        key: API_KEY,
        user: userId,
      }),
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      success: function () {
        // Se ha añadido en la base de datos
      },
    });
  }

  /**
   * Obtiene los IDs de los usuarios que se quieren ocultar y los añade al array userIds.
   */
  function getUserIds() {
    const response = $.ajax({
      type: 'GET',
      url: 'https://www.rbedev.com/API/Forocoches/V1/getUsers.php?key=' + API_KEY,
      async: false,
    }).responseText;

    userIds = JSON.parse(response);
  }

  /**
   * Inserta el CSS de los botones para ignorar tema y usuario.
   */
  function insertCSS() {
    const css = [
      '#hideThread, #ignoreUser {',
      '  display: inline-block;',
      '  outline: none;',
      '  cursor: pointer;',
      '  font-weight: 500;',
      '  border-radius: 3px;',
      '  padding: 0 16px;',
      '  border-radius: 4px;',
      '  color: #fff;',
      '  background: #23466a;',
      '  margin-left: 20px;',
      '  height: 30px;',
      '  margin-top: -23px;',
      '  word-spacing: 0px;',
      '  letter-spacing: .0892857143em;',
      '  text-decoration: none;',
      '  text-transform: uppercase;',
      '  min-width: 64px;',
      '  border: none;',
      '  text-align: center;',
      '  box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%);',
      '  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);',
      '}',
    ].join('\n');
    const node = document.createElement('style');
    node.id = 'filtrado_css';
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    const heads = document.getElementsByTagName('head');
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      // Si no hay <head> insertar en cualquier sitio
      document.documentElement.appendChild(node);
    }
  }
});
