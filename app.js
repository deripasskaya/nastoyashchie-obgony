(function () {
  "use strict";

  /* Закрытый режим: материал не показываем (см. класс mode-closed у <html>),
     скрипты не инициализируем, чтобы не работать по скрытой разметке. */
  if (document.documentElement.classList.contains("mode-closed")) return;

  /* ============================================================
     Данные
     ============================================================ */

  var STEP_DETAILS = [
    "<b>Шаг 1. Что на встречке?</b> Смотрим на встречную полосу прямо сейчас — сколько там машин, с какой скоростью они идут, где разрывы. И до этого момента поворотник ещё даже не включаем.",
    "<b>Шаг 2. Кто впереди и позади меня?</b> Впереди: не обгоняет ли, не объезжает, не повернул ли налево. Позади: не начал ли обгон кто-то другой — если да, свой обгон откладываем.",
    "<b>Шаг 3. Куда я вернусь?</b> Смотрим со своей полосы: есть ли мне куда вернуться, есть ли пространство перед обгоняемым и хватит ли мне места. Если вернуться некуда — сзади подожмут, а вы просто не сможете завершить манёвр. Прижимаемся к середине, увеличиваем дистанцию и набираем скорость в своей полосе. Только теперь включаем поворотник."
  ];

  var TASKS = [
    {
      img: "pictures/slides/reguliruemy.jpg",
      alt: "Регулируемый перекрёсток со светофором",
      q: "Регулируемый перекрёсток. Можно ли здесь обгонять?",
      a: "no",
      exp: "На регулируемых перекрёстках обгон запрещён: встречные автомобили будут ускоряться на зелёный, это опасно лобовым столкновением."
    },
    {
      img: "pictures/slides/nereguliruemy.jpg",
      alt: "Нерегулируемый перекрёсток, грунтовая дорога",
      q: "Нерегулируемый перекрёсток, вы едете по грунтовой дороге. Можно обгонять?",
      a: "no",
      exp: "Нет. Если ваша дорога не главная — обгон запрещён."
    },
    {
      img: "pictures/slides/glavnaya.jpg",
      alt: "Неравнозначный перекрёсток, вы на главной дороге",
      q: "Неравнозначный перекрёсток, вы на главной дороге. Можно обгонять?",
      a: "yes",
      exp: "Можно. Это единственный перекрёсток, где обгон разрешён, потому что вы на главной дороге."
    },
    {
      img: "pictures/slides/glavnaya-povorot.jpg",
      alt: "Перекрёсток со знаком «Главная дорога» и табличкой «Направление главной дороги»",
      q: "Главная дорога меняет направление (табличка 8.13). Можно обгонять?",
      a: "no",
      exp: "Нет. Если главная дорога меняет направление, значит на главной не только вы: с поперечной дороги на перекрёсток тоже может выехать авто с главными правами."
    },
    {
      img: "pictures/slides/peshehodny.jpg",
      alt: "Пешеходный переход",
      q: "Пешеходный переход. Опередить можно?",
      a: "yes",
      exp: "Да, опередить можно — а вот обгонять нельзя."
    },
    {
      img: "pictures/slides/zheleznodorozhny.jpg",
      alt: "Железнодорожный переезд",
      q: "Вы только что проехали ж/д переезд. Можно ли начать обгон сразу после переезда?",
      a: "yes",
      exp: "Да. Запрет действует только на переезде и за 100 метров перед ним."
    },
    {
      img: "pictures/slides/most.jpg",
      alt: "Мост",
      q: "Мост (а также под ним). Можно обгонять?",
      a: "no",
      exp: "Нет. На мостах, эстакадах, путепроводах и под ними обгон запрещён."
    },
    {
      img: "pictures/slides/tonnel.jpg",
      alt: "Тоннель",
      q: "Тоннель. Можно обгонять?",
      a: "no",
      exp: "Нет. В тоннелях обгон запрещён."
    },
    {
      img: "pictures/slides/ogranichennaya-vidimost.jpg",
      alt: "Опасный поворот с ограниченной видимостью",
      q: "Опасный поворот с ограниченной видимостью. Можно обгонять?",
      a: "no",
      exp: "Нет. На участках с ограниченной видимостью, в конце подъёма и на опасных поворотах обгон запрещён."
    },
    {
      img: "pictures/slides/zadacha-sploshnaya.jpg",
      alt: "Дорога в конце подъёма",
      q: "Конец подъёма. Можно обгонять?",
      a: "no",
      exp: "Нет. В конце подъёма обгон запрещён — там видимость встречной полосы ограничена."
    },
    {
      img: "pictures/slides/zadacha-spusk.jpg",
      alt: "Крутой подъём",
      q: "Можно ли совершить обгон на крутом подъёме?",
      a: "yes",
      exp: "Можно! На протяжении подъёма обгон не запрещён: хорошо просматривается встречка и пространство перед обгоняемым. Главное — завершить обгон до конца подъёма."
    }
  ];

  var TEST = [
    { q: "Что такое обгон?", o: [
        "Любое опережение попутного транспортного средства",
        "Опережение, связанное с выездом на встречку и последующим возвращением в свою полосу",
        "Движение быстрее общего потока"
      ], c: 1,
      exp: "Обгон — это опережение с выездом из занимаемой полосы на встречку и последующим возвращением." },
    { q: "Опережение без выезда из занимаемой полосы — это обгон?", o: [
        "Да", "Нет", "Только на трассе"
      ], c: 1,
      exp: "Нет. Опережение можно совершить даже без перестроений, тогда как обгон подразумевает перестроение на встречку и обратно." },
    { q: "Путь обгона — это…", o: [
        "Расстояние, пройденное на встречной полосе",
        "Расстояние до обгоняемой машины",
        "Время, за которое выполняется манёвр"
      ], c: 0,
      exp: "Путь обгона — расстояние, которое вы проходите на встречной полосе." },
    { q: "Как путь обгона зависит от вашей скорости?", o: [
        "Чем выше ваша скорость, тем больше путь на встречке",
        "Чем выше ваша скорость, тем меньше путь на встречке",
        "Никак не зависит"
      ], c: 0,
      exp: "Чем выше ваша скорость, тем больше расстояние, которое вы проходите на встречке." },
    { q: "С чего начинается подготовка обгона?", o: [
        "С включения поворотника",
        "С оценки того, что происходит на встречной полосе",
        "С резкого ускорения"
      ], c: 1,
      exp: "Сначала смотрим, что на встречке, затем на машины впереди и позади нас, потом проверяем, есть ли место, куда можно вернуться. И уже затем включаем поворотник." },
    { q: "Машина впереди включила левый поворотник. Встречка свободна. Можно обгонять?", o: [
        "Да, если встречная полоса свободна",
        "Нет, обгон запрещён",
        "Да, если быстро ускориться"
      ], c: 1,
      exp: "Нет. ТС подало сигнал поворота налево — обгонять его нельзя." },
    { q: "Идущая сзади машина уже начала обгон. Ваши действия?", o: [
        "Всё равно начинаем свой обгон",
        "Откладываем свой обгон",
        "Сигналим и ускоряемся"
      ], c: 1,
      exp: "Если следующее за вами ТС начало обгон — свой обгон откладываем." },
    { q: "На каком перекрёстке обгон разрешён?", o: [
        "На регулируемом",
        "На неравнозначном, когда вы на главной дороге",
        "На нерегулируемом, когда ваша дорога не главная"
      ], c: 1,
      exp: "Единственный перекрёсток, где обгон разрешён, — неравнозначный, когда вся ваша дорога главная." },
    { q: "За сколько метров до железнодорожного переезда обгон запрещён?", o: [
        "За 50 метров", "За 100 метров", "Обгон там не запрещён"
      ], c: 1,
      exp: "Обгон запрещён на переезде и ближе чем за 100 метров перед ним." },
    { q: "Что запрещено водителю обгоняемого транспортного средства?", o: [
        "Препятствовать обгону",
        "Уступать дорогу",
        "Снижать скорость"
      ], c: 0,
      exp: "Водителю обгоняемого ТС запрещается препятствовать обгону." },
    { q: "По знаку 3.20 «Обгон запрещён» кого обгонять МОЖНО?", o: [
        "Всех, кроме грузовиков",
        "Тихоходные ТС, гужевые повозки, двухколёсные",
        "Никого"
      ], c: 1,
      exp: "Исключения знака 3.20: тихоходные ТС, гужевые повозки, мопеды и двухколёсные мотоциклы без бокового прицепа." },
    { q: "Можно ли совершить опережение в конце подъёма?", o: [
        "Да", "Нет"
      ], c: 0,
      exp: "Опережение совершается без выезда на встречку, поэтому его не запрещено выполнять в условиях ограниченной видимости." }
  ];

  /* ============================================================
     Хелперы
     ============================================================ */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var store = {
    get: function (key, def) {
      try { var v = localStorage.getItem("obgony." + key); return v === null ? def : JSON.parse(v); }
      catch (e) { return def; }
    },
    set: function (key, val) {
      try { localStorage.setItem("obgony." + key, JSON.stringify(val)); } catch (e) {}
    }
  };

  var RU = function (n) { return String(n).replace(".", ","); };

  /* ============================================================
     Навигация + прогресс
     ============================================================ */

  var sections = $$(".section");
  var navEl = $("#nav");
  var progressFill = $("#progress-fill");
  var progressText = $("#progress-text");
  var sidebarMeta = $("#sidebar-meta");
  var visited = store.get("visited", []);
  var testDone = store.get("lastTest", null);

  function isVisited(id) { return visited.indexOf(id) !== -1; }

  function buildNav() {
    sections.forEach(function (sec, i) {
      var id = sec.id;
      var title = sec.dataset.title || ("Раздел " + (i + 1));
      var btn = document.createElement("a");
      btn.href = "#" + id;
      btn.className = "nav-item";
      btn.dataset.target = id;
      btn.innerHTML = '<span class="nav-item__dot">' + (i + 1) + "</span><span>" + title + "</span>";
      navEl.appendChild(btn);
    });
  }

  function updateProgress() {
    var total = sections.length;
    var done = sections.filter(function (s) { return isVisited(s.id); }).length;
    var pct = Math.round((done / total) * 100);
    progressFill.style.width = pct + "%";
    progressText.textContent = pct + "%";
    updateMeta(done, total);
  }

  function updateMeta(done, total) {
    var html = "<b>Изучено:</b> " + done + " из " + total + " разделов";
    if (testDone) {
      html += "<br><b>Последний тест:</b> " + testDone.score + " / " + testDone.total;
    } else {
      html += "<br>Тест ещё не пройден";
    }
    sidebarMeta.innerHTML = html;
  }

  function setActive(id) {
    $$(".nav-item").forEach(function (n) {
      n.classList.toggle("is-active", n.dataset.target === id);
    });
  }

  function markVisited(id) {
    if (!isVisited(id)) {
      visited.push(id);
      store.set("visited", visited);
      var item = $('.nav-item[data-target="' + id + '"]');
      if (item) item.classList.add("is-done");
      updateProgress();
    }
  }

  function initNav() {
    buildNav();
    visited.forEach(function (id) {
      var item = $('.nav-item[data-target="' + id + '"]');
      if (item) item.classList.add("is-done");
    });
    updateProgress();

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            markVisited(e.target.id);
          }
        });
      }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
      sections.forEach(function (s) { obs.observe(s); });
    }
  }

  /* ============================================================
     Самопроверка (details)
     ============================================================ */

  $$(".check__reveal").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var a = btn.parentElement.querySelector(".check__a");
      a.hidden = false;
      btn.hidden = true;
    });
  });

  /* ============================================================
     Шаги алгоритма
     ============================================================ */

  (function initSteps() {
    var detail = $("#step-detail");
    if (!detail) return;
    var steps = $$(".step");
    function show(i) {
      steps.forEach(function (s) { s.classList.toggle("is-active", +s.dataset.step === i); });
      detail.innerHTML = STEP_DETAILS[i];
    }
    steps.forEach(function (s) {
      s.addEventListener("click", function () { show(+s.dataset.step); });
    });
    show(0);
  })();

  /* ============================================================
     Калькулятор пути обгона
     ============================================================ */

  (function initCalc() {
    var calc = $("#calc");
    if (!calc) return;

    var vMine = $("#v-mine"), vThem = $("#v-them"), len = $("#len");
    var outV = $("#v-mine-out"), outT = $("#v-them-out"), outL = $("#len-out");
    var distEl = $("#calc-dist"), timeEl = $("#calc-time"), deltaEl = $("#calc-delta");
    var warnEl = $("#calc-warn");
    var truck = $("#calc-truck"), me = $("#calc-me"), trace = $("#calc-trace");

    var GAP = 15;                         // м, запас спереди и сзади
    var LANE_MY = 118, LANE_ONC = 32;     // y позиции кузова в SVG
    var X_START = 70, X_END = 560;
    var state = { t: 0, dur: 6, dist: 0, hold: 0 };

    function compute() {
      var v1 = +vMine.value / 3.6;
      var v2 = +vThem.value / 3.6;
      var L2 = +len.value;
      var deltaKmh = +vMine.value - +vThem.value;
      var sum = L2 + 2 * GAP;
      var delta = v1 - v2;

      outV.textContent = vMine.value;
      outT.textContent = vThem.value > +vMine.value ? vMine.value : vThem.value;
      outL.textContent = RU(len.value);

      if (delta <= 0.1) {
        distEl.textContent = "∞";
        timeEl.textContent = "∞";
        deltaEl.textContent = "0";
        warnEl.hidden = false;
        warnEl.textContent = "Разница скоростей нулевая — обгон невозможен: вы не приблизитесь к машине впереди.";
        state.dur = 9; state.dist = 3000;
        return;
      }
      var t = sum / delta;
      var dist = v1 * t;

      distEl.textContent = Math.round(dist);
      timeEl.textContent = RU(t.toFixed(1));
      deltaEl.textContent = deltaKmh;

      if (t > 10 || dist > 350) {
        warnEl.hidden = false;
        warnEl.textContent = "Путь обгона очень длинный. Разница скоростей мала — такой обгон рискован, лучше подождать.";
      } else if (t > 7 || dist > 220) {
        warnEl.hidden = false;
        warnEl.textContent = "Путь обгона длинный. Нужен большой запас свободной встречки и хороший обзор.";
      } else {
        warnEl.hidden = true;
      }
      state.dist = dist;
      state.dur = Math.max(3, Math.min(9, t));
    }

    function draw() {
      var p = state.t;
      // кузов моего авто: сначала в своей полосе, затем на встречке, затем возврат
      var oncoming = 0;
      if (p > 0.12 && p < 0.82) oncoming = 1;
      var yMy = LANE_MY + 4, yOnc = LANE_ONC + 4;
      var y = oncoming ? yOnc : yMy;
      var x = X_START + p * (X_END - X_START);
      me.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y + ")");

      var truckX = 330;
      truck.setAttribute("transform", "translate(" + truckX + ",114)");

      // путь обгона — след на встречной полосе
      var x0 = X_START + 0.14 * (X_END - X_START);
      var x1 = Math.max(x0, x - 30);
      trace.setAttribute("x1", x0);
      trace.setAttribute("y1", LANE_ONC + 20);
      trace.setAttribute("x2", x1);
      trace.setAttribute("y2", LANE_ONC + 20);
    }

    var raf = null, last = 0;
    function loop(ts) {
      if (!last) last = ts;
      var dt = (ts - last) / 1000;
      last = ts;
      state.t += dt / state.dur;
      if (state.t >= 1) {
        state.t = 1;
        state.hold += dt;
        if (state.hold > 0.9) { state.t = 0; state.hold = 0; } // короткая пауза и повтор
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

    function update() { compute(); }
    [vMine, vThem, len].forEach(function (el) {
      el.addEventListener("input", function () {
        if (+vMine.value <= +vThem.value) vMine.value = +vThem.value + 5;
        update();
      });
    });

    compute();
    draw();
    if (!window.matchMedia || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raf = requestAnimationFrame(loop);
    }
  })();

  /* ============================================================
     Задачи «Здесь можно?»
     ============================================================ */

  (function initTasks() {
    var box = $("#tasks");
    if (!box) return;

    TASKS.forEach(function (task) {
      var el = document.createElement("div");
      el.className = "task";
      el.innerHTML =
        '<img class="task__img" loading="lazy" src="' + task.img + '" alt="' + task.alt + '">' +
        '<div class="task__body">' +
          '<p class="task__q">' + task.q + "</p>" +
          '<div class="task__btns">' +
            '<button class="task__btn task__btn--yes" data-v="yes">Можно</button>' +
            '<button class="task__btn task__btn--no" data-v="no">Нельзя</button>' +
          "</div>" +
          '<p class="task__exp" hidden></p>' +
        "</div>";

      var exp = el.querySelector(".task__exp");
      var btns = $$(".task__btn", el);
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.disabled = true; });
          var correct = task.a;
          var chosen = b.dataset.v;
          var correctBtn = el.querySelector('.task__btn[data-v="' + correct + '"]');
          correctBtn.classList.add("is-chosen-right");
          if (chosen !== correct) b.classList.add("is-wrong");
          exp.hidden = false;
          exp.innerHTML = (chosen === correct ? "✅ Верно. " : "❌ Неверно. ") + task.exp;
        });
      });
      box.appendChild(el);
    });
  })();

  /* ============================================================
     Итоговый тест
     ============================================================ */

  (function initTest() {
    var startBox = $("#test-start");
    var runBox = $("#test-run");
    var resultBox = $("#test-result");
    if (!startBox) return;

    var beginBtn = $("#test-begin");
    var lastEl = $("#test-last");
    var qEl = $("#test-q");
    var optsEl = $("#test-options");
    var feedbackEl = $("#test-feedback");
    var fillEl = $("#test-fill");
    var counterEl = $("#test-counter");
    var prevBtn = $("#test-prev");
    var nextBtn = $("#test-next");
    var scoreEl = $("#result-score");
    var verdictEl = $("#result-verdict");
    var listEl = $("#result-list");
    var retryBtn = $("#test-retry");

    var answers = [];
    var idx = 0;

    if (testDone) {
      lastEl.textContent = "В прошлый раз: " + testDone.score + " / " + testDone.total + ". Можно пройти заново.";
    }

    function render() {
      var q = TEST[idx];
      qEl.textContent = (idx + 1) + ". " + q.q;
      counterEl.textContent = (idx + 1) + " / " + TEST.length;
      fillEl.style.width = (((idx + 1) / TEST.length) * 100) + "%";
      optsEl.innerHTML = "";
      feedbackEl.hidden = true;
      feedbackEl.className = "test__feedback";

      var letters = ["А", "Б", "В", "Г"];
      q.o.forEach(function (text, i) {
        var b = document.createElement("button");
        b.className = "opt";
        b.dataset.i = i;
        b.innerHTML = '<span class="opt__key">' + letters[i] + "</span><span>" + text + "</span>";
        b.addEventListener("click", function () { pick(i); });
        optsEl.appendChild(b);
      });

      if (answers[idx] !== undefined) applyPicked(answers[idx]);

      prevBtn.disabled = idx === 0;
      nextBtn.textContent = idx === TEST.length - 1 ? "Завершить" : "Далее →";
      nextBtn.disabled = answers[idx] === undefined;
    }

    function pick(i) {
      answers[idx] = i;
      applyPicked(i);
      nextBtn.disabled = false;
    }

    function applyPicked(i) {
      var q = TEST[idx];
      $$(".opt", optsEl).forEach(function (b) {
        var bi = +b.dataset.i;
        b.classList.remove("is-picked", "is-correct", "is-wrong");
        if (bi === i) b.classList.add("is-picked");
      });
      var chosen = optsEl.querySelector('.opt[data-i="' + i + '"]');
      var correct = optsEl.querySelector('.opt[data-i="' + q.c + '"]');
      if (i === q.c) {
        chosen.classList.add("is-correct");
        feedbackEl.textContent = "✅ Верно. " + q.exp;
        feedbackEl.className = "test__feedback ok";
      } else {
        chosen.classList.add("is-wrong");
        correct.classList.add("is-correct");
        feedbackEl.textContent = "❌ Неверно. " + q.exp;
        feedbackEl.className = "test__feedback no";
      }
      feedbackEl.hidden = false;
    }

    function finish() {
      var score = 0;
      TEST.forEach(function (q, i) { if (answers[i] === q.c) score++; });
      var total = TEST.length;
      var pct = Math.round((score / total) * 100);

      runBox.hidden = true;
      resultBox.hidden = false;
      scoreEl.textContent = score + " / " + total;

      var verdict;
      if (pct >= 85) verdict = "Отлично! Материал усвоен — можно переходить к практике.";
      else if (pct >= 60) verdict = "Хорошо, но есть пробелы. Загляните в разделы, где ошиблись.";
      else verdict = "Стоит повторить материал и пройти тест снова.";
      verdictEl.textContent = verdict;

      listEl.innerHTML = "";
      TEST.forEach(function (q, i) {
        var ok = answers[i] === q.c;
        var li = document.createElement("li");
        li.className = ok ? "ok" : "no";
        li.innerHTML =
          '<span class="rl-q">' + (ok ? "✅" : "❌") + " " + (i + 1) + ". " + q.q + "</span>" +
          '<span class="rl-a">Верный ответ: ' + q.o[q.c] + ". " + q.exp + "</span>";
        listEl.appendChild(li);
      });

      testDone = { score: score, total: total };
      store.set("lastTest", testDone);
      markVisited("test");
      updateProgress();

      resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    nextBtn.addEventListener("click", function () {
      if (idx < TEST.length - 1) { idx++; render(); }
      else finish();
    });
    prevBtn.addEventListener("click", function () {
      if (idx > 0) { idx--; render(); }
    });

    beginBtn.addEventListener("click", function () {
      answers = [];
      idx = 0;
      startBox.hidden = true;
      resultBox.hidden = true;
      runBox.hidden = false;
      render();
      runBox.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    retryBtn.addEventListener("click", function () { beginBtn.click(); });
  })();

  /* ============================================================
     Старт
     ============================================================ */

  initNav();
})();
