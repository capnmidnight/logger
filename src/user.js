import wrap from "./wrap";

export default function user(target, redirects) {
  if (!(target instanceof Function)) {
    console.warn("The target parameter was expected to be a function, but it was", target);
  }
  else {
    return wrap(target, redirects);
  }
}