/* Custom Dragula JS */
dragula([
    document.getElementById("to-do"),
    document.getElementById("doing"),
    document.getElementById("done"),
    document.getElementById("trash")
  ]);
  
  removeOnSpill: false
    .on("drag", function (el) {
      el.className.replace("ex-moved", "");
    })
    .on("drop", function (el) {
      el.className += "ex-moved";
    })
    .on("over", function (el, container) {
      container.className += "ex-over";
    })
    .on("out", function (el, container) {
      container.className.replace("ex-over", "");
    });
  
  /* Adicionar a task */
  function addTask() {
    /* Dar input em tarefa nova */
    var inputTask = document.getElementById("taskText").value;
    /* Adicionar a tarefa nova na coluna to-do */
    document.getElementById("to-do").innerHTML +=
      "<li class='task'><p>" + inputTask + "</p></li>";
    /* Tirar o texto depois de dar */
    document.getElementById("taskText").value = "";
  }
  
  /* Apagar as tarefas da lixeira */
  function emptyTrash() {
    document.getElementById("trash").innerHTML = "";
  }
  