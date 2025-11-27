import { h as head } from "../../chunks/index2.js";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  head("1srsm2d", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Ludo</title>`);
    });
    $$renderer2.push(`<meta charset="UTF-8"/> <meta name="viewport" content="width=device-width, initial-scale=1.0"/> <link rel="shortcut icon" href="logo.png" type="image/x-icon"/>`);
  });
  children($$renderer);
  $$renderer.push(`<!---->`);
}
export {
  _layout as default
};
