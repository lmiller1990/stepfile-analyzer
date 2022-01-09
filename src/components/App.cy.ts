import { mount } from "@cypress/vue";
import App from "./App.vue";
import { setActivePinia, createPinia } from "pinia";

describe("App", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  before(() => {
    cy.viewport(1000, 600);
  });

  it("renders", () => {
    mount(App, {
      global: {
        plugins: [pinia],
      },
    });
  });
});
