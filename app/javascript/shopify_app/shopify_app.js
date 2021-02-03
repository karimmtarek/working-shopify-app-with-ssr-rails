import { getSessionToken } from "@shopify/app-bridge-utils";
import $ from "jquery";

const SESSION_TOKEN_REFRESH_INTERVAL = 2000; // Request a new token every 2s

async function retrieveToken(app) {
  window.sessionToken = await getSessionToken(app);
}

function keepRetrievingToken(app) {
  setInterval(() => {
    retrieveToken(app);
  }, SESSION_TOKEN_REFRESH_INTERVAL);
}

function redirectThroughTurbolinks(isInitialRedirect = false) {
  var data = document.getElementById("shopify-app-init").dataset;
  console.log('🚧 DATA: ', data)
  var validLoadPath = data && data.loadPath;
  var shouldRedirect = false;

  switch(isInitialRedirect) {
    case true: shouldRedirect = validLoadPath; break;
    case false: shouldRedirect = validLoadPath && data.loadPath !== '/home'; break;
  }

  if (shouldRedirect) Turbolinks.visit(data.loadPath);
}

document.addEventListener("turbolinks:request-start", function (event) {
  var xhr = event.data.xhr;
  xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
});

document.addEventListener("turbolinks:render", function () {
  $("form, a[data-method=delete]").on("ajax:beforeSend", function (event) {
    const xhr = event.detail[0];
    xhr.setRequestHeader("Authorization", "Bearer " + window.sessionToken);
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  var data = document.getElementById("shopify-app-init").dataset;
  var AppBridge = window["app-bridge"];
  var createApp = AppBridge.default;
  window.app = createApp({
    apiKey: data.apiKey,
    shopOrigin: data.shopOrigin,
    forceRedirect: true
  });

  var actions = AppBridge.actions;
  var TitleBar = actions.TitleBar;
  TitleBar.create(app, {
    title: data.page,
  });

  // Wait for a session token before trying to load an authenticated page
  await retrieveToken(app);

  // Keep retrieving a session token periodically
  keepRetrievingToken(app);

  // Redirect to the requested page when DOM loads
  var isInitialRedirect = true;
  redirectThroughTurbolinks(isInitialRedirect);

  document.addEventListener("turbolinks:load", function (event) {
    redirectThroughTurbolinks();
  });
});
