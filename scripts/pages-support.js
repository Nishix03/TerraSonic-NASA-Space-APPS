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
    if (tag === "sc-if" || tag === "sc-for") {
      const list = tag === "sc-for";
      const alias = node.getAttribute("as");
      const binding = node.getAttribute(list ? "list" : "value");
      const template = document.createElement("template");
      template.content.append(...node.childNodes);
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
      } else if (name === "disabled" || name === "hidden" || name === "checked") {
        updates.push(scope => node.toggleAttribute(name, !!direct(value, scope)));
      } else if (name === "value" && tag === "select") {
        updates.push(scope => { const selected = interpolate(value, scope); if (node.value !== selected) node.value = selected; });
      } else {
        updates.push(scope => {
          const result = interpolate(value, scope);
          if ((name === "src" || name === "href") && result === "") node.removeAttribute(name);
          else if (node.getAttribute(name) !== result) node.setAttribute(name, result);
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
    }
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", render);
    window.addEventListener("pagehide", () => component.componentWillUnmount?.(), { once: true });
  };
  document.addEventListener("DOMContentLoaded", () => {
    const source = document.querySelector("script[data-dc-script]");
    const runtime = document.createElement("script");
    runtime.textContent = source.textContent + "\nmountTerrasonic(Component);";
    document.body.append(runtime);
  });
})();
