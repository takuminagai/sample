app.boot("/view/history.html", function() {
  var $content, $table, $view, NUMBER_OF_DATA_IN_ONCE, isInLoadArea, isLoadedEnd, isOnlyUnique, load, loadAddCount, onClickUnique, threadList;
  $view = document.documentElement;
  $content = $$.C("content")[0];
  new app.view.TabContentView($view);
  $table = $__("table");
  threadList = new UI.ThreadList($table, {
    th: ["title", "boardTitle", "viewedDate"],
    searchbox: $view.C("searchbox")[0]
  });
  app.DOMData.set($view, "threadList", threadList);
  app.DOMData.set($view, "selectableItemList", threadList);
  $content.addLast($table);
  isOnlyUnique = true;
  NUMBER_OF_DATA_IN_ONCE = 500;
  loadAddCount = 0;
  isLoadedEnd = false;
  load = async function({ignoreLoading = false, add = false} = {}) {
    var data, offset;
    if ($view.hasClass("loading")) {
      return;
    }
    if ($view.C("button_reload")[0].hasClass("disabled") && !(ignoreLoading || add)) {
      return;
    }
    if (add && isLoadedEnd) {
      return;
    }
    $view.addClass("loading");
    if (add) {
      offset = loadAddCount * NUMBER_OF_DATA_IN_ONCE;
    } else {
      offset = void 0;
    }
    if (isOnlyUnique) {
      data = (await app.History.getUnique(offset, NUMBER_OF_DATA_IN_ONCE));
    } else {
      data = (await app.History.get(offset, NUMBER_OF_DATA_IN_ONCE));
    }
    if (add) {
      loadAddCount++;
    } else {
      threadList.empty();
      loadAddCount = 1;
      isLoadedEnd = false;
    }
    if (data.length < NUMBER_OF_DATA_IN_ONCE) {
      isLoadedEnd = true;
    }
    threadList.addItem(data);
    $view.removeClass("loading");
    if (add && data.length === 0) {
      return;
    }
    $view.emit(new Event("view_loaded"));
    $view.C("button_reload")[0].addClass("disabled");
    await app.wait5s();
    $view.C("button_reload")[0].removeClass("disabled");
  };
  $view.on("request_reload", load);
  load();
  isInLoadArea = false;
  $content.on("scroll", function() {
    var offsetHeight, scrollHeight, scrollPosition, scrollTop;
    ({offsetHeight, scrollHeight, scrollTop} = $content);
    scrollPosition = offsetHeight + scrollTop;
    if (scrollHeight - scrollPosition < 100) {
      if (isInLoadArea) {
        return;
      }
      isInLoadArea = true;
      return load({
        add: true
      });
    } else {
      return isInLoadArea = false;
    }
  }, {
    passive: true
  });
  $view.C("button_history_clear")[0].on("click", async function() {
    if ((await UI.Dialog("confirm", {
      message: "履歴を削除しますか？"
    }))) {
      try {
        await app.History.clear();
        load();
      } catch (error) {}
    }
  });
  onClickUnique = function() {
    isOnlyUnique = !isOnlyUnique;
    $view.C("button_show_unique")[0].toggleClass("hidden");
    $view.C("button_show_all")[0].toggleClass("hidden");
    load({
      ignoreLoading: true
    });
  };
  $view.C("button_show_unique")[0].on("click", onClickUnique);
  $view.C("button_show_all")[0].on("click", onClickUnique);
});