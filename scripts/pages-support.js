(() => {
  "use strict";
  const expression = /\{\{\s*([\w.]+)\s*\}\}/g;
  const read = (scope, path) => path.split(".").reduce((value, key) => value?.[key], scope);
  const direct = (value, scope) => read(scope, value.match(/^\{\{\s*([\w.]+)\s*\}\}$/)?.[1] ?? "");
  const interpolate = (value, scope) => value.replace(expression, (_, path) => read(scope, path) ?? "");
  const dynamic = value => value.includes("{{");
  const compile = nodes => Array.from(nodes).flatMap(compileNode);

  function compileNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.data;
      return dynamic(text) ? [scope => {
        const value = interpolate(text, scope);
        if (node.data !== value) node.data = value;
      }] : [];
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return [];
    const tag = node.localName;
    const nativeList = tag === "template" && node.hasAttribute("data-sc-for");
    if (tag === "sc-if" || tag === "sc-for" || nativeList) {
      const list = tag === "sc-for" || nativeList;
      const alias = node.getAttribute(nativeList ? "data-sc-as" : "as");
      const binding = node.getAttribute(nativeList ? "data-sc-for" : list ? "list" : "value");
      const template = document.createElement("template");
      template.content.append(...(nativeList ? node.content.childNodes : node.childNodes));
      const anchor = document.createComment(tag);
      node.replaceWith(anchor);
      const entries = [];
      return [scope => {
        const value = direct(binding, scope);
        const items = list ? value ?? [] : value ? [null] : [];
        while (entries.length > items.length) {
          const { start, end } = entries.pop();
          while (start.nextSibling !== end) start.nextSibling.remove();
          start.remove();
          end.remove();
        }
        items.forEach((item, i) => {
          const next = list ? Object.assign(Object.create(scope), { [alias]: item }) : scope;
          let entry = entries[i];
          if (!entry) {
            const fragment = template.content.cloneNode(true);
            const updates = compile(fragment.childNodes);
            const start = document.createComment("");
            const end = document.createComment("");
            fragment.prepend(start);
            fragment.append(end);
            entry = { start, end, updates };
            entries.push(entry);
            entry.updates.forEach(update => update(next));
            anchor.before(fragment);
          } else {
            entry.updates.forEach(update => update(next));
          }
        });
      }];
    }
    const updates = compile(node.childNodes);
    for (const { name, value } of Array.from(node.attributes)) {
      if (!dynamic(value)) continue;
      if (name.startsWith("on")) {
        node.removeAttribute(name);
        updates.push(scope => { node[name] = direct(value, scope) ?? null; });
      } else if (name === "disabled" || name === "hidden" || name === "checked" || name === "open") {
        node.removeAttribute(name);
        updates.push(scope => { const on = !!direct(value, scope); node.toggleAttribute(name, on); if (name === "checked") node.checked = on; });
      } else if (name === "value" && ["select", "input", "textarea"].includes(tag) && node.type !== "file") {
        node.removeAttribute(name);
        updates.push(scope => { const selected = interpolate(value, scope); if (node.value !== selected) node.value = selected; });
      } else {
        // Firefox may request unresolved image URLs when cloning a template.
        // The packager keeps those bindings inert until this compilation step.
        const targetName = name === "data-ts-src" ? "src" : name;
        if (name === "data-ts-src") node.removeAttribute(name);
        updates.push(scope => {
          const result = interpolate(value, scope);
          if ((targetName === "src" || targetName === "href") && result === "") node.removeAttribute(targetName);
          else if (node.getAttribute(targetName) !== result) node.setAttribute(targetName, result);
        });
      }
    }
    return updates;
  }

  let component;
  let bindings;
  const render = () => {
    const scope = component.renderVals();
    bindings.forEach(update => update(scope));
  };
  window.DCLogic = class {
    constructor(props) { this.props = props; }
    setState(patch, complete) {
      Object.assign(this.state, patch);
      render();
      complete?.();
    }
  };
  window.mountTerrasonic = Component => {
    const template = document.querySelector("#terrasonic-template");
    const root = template.content.cloneNode(true);
    const helmet = root.querySelector("helmet");
    document.head.append(...helmet.children);
    helmet.remove();
    bindings = compile(root.childNodes);
    component = new Component({});
    render();
    template.replaceWith(root);
    component.componentDidMount?.();
    if (location.hash === "#banda") {
      component.tourEnd();
      component.goTab("band");
    } else if (location.hash === "#escuchar" || location.hash === "#listen") {
      component.goTab("juke");
    }
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", render);
    window.addEventListener("pagehide", event => {
      if (event.persisted) {
        // A history-cache entry can return with the same component and files.
        // Pause transient work without permanently disposing that component.
        component.stopSpeech?.();
        component.stop?.();
        component.cancelBandClip?.();
        component.routeFinish?.();
      } else component.componentWillUnmount?.();
    });
    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        render();
        component.ensureNavVisible?.();
        component.onTourResize?.();
      }
    });
  };
  document.addEventListener("DOMContentLoaded", () => {
    const source = document.querySelector("script[data-dc-script]");
    const runtime = document.createElement("script");
    runtime.textContent = source.textContent + "\nmountTerrasonic(Component);";
    document.body.append(runtime);
  });
})();
