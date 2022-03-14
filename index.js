import { render, createState, $, $component } from 'zepton';

export function RouterView ({ pages }) {
  const state = createState({
    page: window.location.pathname 
  });

  const pageTree = {};

  for(let path in pages) {
    const tokens = path.split('/').slice(1).filter(item => !!item);
    let currentNode = pageTree;
    for(let i=0; i<tokens.length; i++) {
      const token = tokens[i];
      if(!currentNode[token]) {
        currentNode[token] = {};
      }
      currentNode = currentNode[token];
    }
    currentNode.index = pages[path];
  }

  const resolve = _ => {
    const location = state.page;
    let component = '';
    const tokens = location.split('/').slice(1).filter(item => !!item);
    const params = {};
    let currentNode = pageTree;

    for(let i=0; i<tokens.length; i++) {
      const token = tokens[i];
      if(currentNode[token]) {
        currentNode = currentNode[token]; 
      } else {
        let found = false;
        for(const key in currentNode) {
          if(key !=='index' && key[0] === ':') {
            params[key.slice(1)] = token;
            currentNode = currentNode[key];
            found = true;
            break;
          }
        }
        
        if(!found) {
          currentNode = null;
        }
      }
    }
    if(currentNode && currentNode.index) {
      component = currentNode.index;
    } else if(pages['404']) {
      component = pages['404'];
    } else {
      throw new Error('Route not found and no 404 component defined.');
    }
    return component;
  }

  const template = $component(_ => resolve());

  const pushState = window.history.pushState;

  window.history.pushState = function() {
    pushState.apply(history, arguments);
    state.page = window.location.pathname;
  }

  window.onpopstate = function() {
    state.page = window.location.pathname;
  }

  return render({ state, template });
}

export function RouterLink({ href, text }) {
  const template = $('a', text, {
    href,
    $click: ev => {
      window.history.pushState({}, null, href);
      ev.stopPropagation();
      ev.preventDefault();
    }
  });

  return render({ template });
}

export function push(path) {
  window.history.pushState({}, null, path);
}

export function replace(path) {
  window.history.replaceState({}, null, path);
}

export function go(num) {
  window.history.go(num);
}

export function back() {
  window.history.back();
}

export function forward() {
  window.history.forward();
}
