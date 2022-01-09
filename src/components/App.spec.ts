import { mount } from "@cypress/vue";
import App from "./App.vue";

describe("App", () => {
  before(() => {
    cy.viewport(1000, 600)
  })

  it("renders", () => {
    mount(App);
  });
});
