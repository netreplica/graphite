nx.define("ActionPanel", nx.ui.Component, {
  view: {
    content: [
      {
        tag: "button",
        content: "Horizontal Layout",
        events: {
          click: "{#onHorizontalLayout}"
        }
      },
      {
        tag: "button",
        content: "Vertical Layout",
        events: {
          click: "{#onVertivalLayout}"
        }
      }
    ]
  },
  methods: {
    "onHorizontalLayout": function(sender, events){
      horizontal();
    },
    "onVertivalLayout": function(sender, events){
      vertical();
    }
  }
});