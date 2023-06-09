// import "./common";
import { createApp,provide,h } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/base.css";
import '@progress/kendo-ui/js/kendo.editor'
import "@progress/kendo-theme-default/dist/all.css";
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from "@/graphql/apolloClient";
import { createPinia } from "pinia";
// import TwicPics vue3 plugin
import TwicPics from '@twicpics/components/vue3'
// import TwicPics components css
import '@twicpics/components/style.css'



const app = createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.use(router).use(createPinia()).use(TwicPics, {
   domain:`${import.meta.env.VITE_TWICPICS_URL}` ,
});

app.mount("#app");

