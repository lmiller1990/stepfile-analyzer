import { mount } from "@cypress/vue";
import App from "./App.vue";
import { setActivePinia, createPinia } from "pinia";
import { compileSSC } from "../sscParser";
import { useChartStore } from "../store/chart";
import { charts } from "../chart";

describe("App", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  beforeEach(() => {
    cy.viewport(1000, 600);
  });

  it("renders", () => {
    mount(App, {
      global: {
        plugins: [pinia],
      },
    });
  });
  
  it.only("correctly highlights pattern in 4th measure", () => {
    const sscData = `//----- song ID: acef -----//
#VERSION:0.83;
#TITLE:ACE FOR ACES;
#ARTIST:TAG×U1;
#BANNER:ACE FOR ACES.png;
#BACKGROUND:ACE FOR ACES-bg.png;
#CDTITLE:./CDTitles/DDR A.png;
#MUSIC:ACE FOR ACES.ogg;
#SAMPLESTART:73.655;
#SAMPLELENGTH:15;
#DISPLAYBPM:200;
#BPMS:0=200;

#NOTEDATA:;
#STEPSTYPE:dance-single;
#DIFFICULTY:Beginner;
#METER:4;
#NOTES:
1000
0100
0010
0001
,
1000
0100
0010
0001
1000
0100
0010
0001
,
1000
0100
0010
0001
;`
    const chart = compileSSC(sscData);
    const chartStore = useChartStore()
    chartStore.setSong(chart)

    mount(App, {
      global: {
        plugins: [pinia],
      },
    });

    cy.get("[data-cy='select-chart']").select("Beginner (4)")
    // cy.get("[data-cy='quantization-q-4']").click()
    // cy.get('label').contains("LDUR Sweep").click()
  });

  it("correctly highlights pattern in 48th measure", () => {
    const sscData = `//----- song ID: acef -----//
#VERSION:0.83;
#TITLE:ACE FOR ACES;
#ARTIST:TAG×U1;
#BANNER:ACE FOR ACES.png;
#BACKGROUND:ACE FOR ACES-bg.png;
#CDTITLE:./CDTitles/DDR A.png;
#MUSIC:ACE FOR ACES.ogg;
#SAMPLESTART:73.655;
#SAMPLELENGTH:15;
#DISPLAYBPM:200;
#BPMS:0=200;

#NOTEDATA:;
#STEPSTYPE:dance-single;
#DIFFICULTY:Beginner;
#METER:4;
#NOTES:
1000
0000
0000
0100
0000
0000
0001
0000
0000
0100
0000
0000
0010
0000
0100
0000
1000
0000
0010
0000
0001
0000
1000
0000
0100
0000
0000
0000
0000
0000
0001
0000
0000
0000
0000
0000
1000
0000
0000
0010
0000
0000
0100
0000
0000
0001
0000
0000
;`
    const chart = compileSSC(sscData);
    const chartStore = useChartStore()
    chartStore.setSong(chart)

    mount(App, {
      global: {
        plugins: [pinia],
      },
    });

    cy.get("[data-cy='select-chart']").select("Beginner (4)")
    cy.get("[data-cy='quantization-q-16']").click()
    cy.get('label').contains("LDR Crossover").click()
  });
});
