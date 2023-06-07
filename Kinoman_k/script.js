const dbModule = (() => {
  const currencies = [
    { id: 0, name: "PLN", oneUSD: 4.43 },
    { id: 1, name: "EUR", oneUSD: 0.87 },
    { id: 2, name: "USD", oneUSD: 1 },
    { id: 3, name: "GBP", oneUSD: 0.75 },
    { id: 4, name: "UAH", oneUSD: 27.14 },
    { id: 5, name: "JPY", oneUSD: 110.63 }
  ];
  return {
    
    currencies
  };
})();
 
/***
***
/// View
***
***/
const viewModule = (() => {
  let currencies = null; // List of currencies
  // UI elements
  const UI = {
    selectFrom: document.getElementById("selectFrom"),
    selectTo: document.getElementById("selectTo"),
    inputRate: document.getElementById("inputRate"),
    inputConvert: document.getElementById("inputConvert"),
    resultArea: document.getElementById("resultArea"),
    btnClear: document.getElementById("btnClear"),
    btnCount: document.getElementById("btnCount"),
    formExchange: document.getElementById("formExchange"),
    resultPart1: document.getElementById("resultPart1"),
    resultPart2: document.getElementById("resultPart2")
  };
  // Create select options on seted currencies except one id
  const createOptions = (select, except = -1) => {
    select.innerHTML = "";
    for (let i = 0; i < currencies.length; i++) {
      if (currencies[i].id !== parseInt(except)) {
        const option = document.createElement("option");
        option.value = i;
        option.innerText = currencies[i].name;
        select.appendChild(option);
      }
    }
  };
  // Clear UI before start or before new convert
  const clearUI = () => {
    UI.inputConvert.value = "";
    UI.resultPart1.innerText = "";
    UI.resultPart2.innerText = "";
  };
  // Init the first select From
  const createFromSelect = () => {
    createOptions(UI.selectFrom);
  };
  // Init the second select To
  const createToSelect = () => {
    const chosen = UI.selectFrom.value;
    createOptions(UI.selectTo, chosen);
  };
  // Create the first result string
  const createResultPart1 = (id1, id2, rate) => {
    const cur1 = currencies.find(cur => cur.id === id1);
    const cur2 = currencies.find(cur => cur.id === id2);
    return `Exchange: ${cur1.name} - ${cur2.name} Rate ${rate}`;
  };
  // Create the second result string
  const createResultPart2 = result => `Result: ${result}`;
  return {
    // UI elements
    UI,
    // Init UI
    prepareUI: currenciesList => {
      currencies = currenciesList;
      createFromSelect();
      createToSelect();
    },
    // Update select on choose
    updateTo: chosen => {
      createToSelect(UI.selectTo, chosen);
    },
    //Update rate
    updateRate: value => {
      UI.inputRate.value = value.toFixed(2);
    },
    // Clear input and result UI
    clear: () => {
      clearUI();
    },
    // Get value from UI
    getConvert: () => {
      let text = UI.inputConvert.value;
      if (text === "")
        return {
          error: true,
          value: parseFloat("0")
        };
      if (text.endsWith(".")) {
        text = text.slice(0, text.length - 1);
        const value = parseFloat(text);
        return {
          error: isNaN(value),
          value
        };
      }
      const value = parseFloat(text);
      return {
        error: isNaN(value),
        value
      };
    },
    // Show result of exchange
    showConvertResult: (id1, id2, rate, result) => {
      clearUI();
      UI.resultPart1.innerText = createResultPart1(id1, id2, rate.toFixed(2));
      UI.resultPart2.innerText = createResultPart2(result);
    },
    // Add validation error
    validationError: () => {
      UI.inputConvert.classList.add("error");
    },
    // Remove validation error
    validationErrorRemove: () => {
      UI.inputConvert.classList.remove("error");
    }
  };
})();
 
/***
***
/// Model
***
***/
const modelModule = (() => {
  let currencies = null;
  // count rate of id2 to id1
  const countRate = (id1, id2) => {
    const firstCurrency = currencies.find(cur => cur.id === id1);
    const secondCurrency = currencies.find(cur => cur.id === id2);
    if (firstCurrency && secondCurrency) {
      return firstCurrency.oneUSD / secondCurrency.oneUSD;
    }
    return 1;
  };
  return {
    // init model
    init: currenciesList => {
      currencies = currenciesList;
    },
    // return rate
    getRate: (id1, id2) => {
      return countRate(id1, id2);
    },
    // return result
    convert: (id1, id2, value) => {
      const rate = countRate(id1, id2);
      return value / rate;
    }
  };
})();
 
/***
***
/// Controller
***
***/
const controller = ((view, model, DB) => {
  const state = {
    fromId: 0,
    toId: 0,
    rate: 0,
    value: 0
  };
  // Update Rate, fromId and toId in state
  const updateRate = () => {
    state.fromId = parseInt(view.UI.selectFrom.value);
    state.toId = parseInt(view.UI.selectTo.value);
    state.rate = model.getRate(state.fromId, state.toId);
    view.updateRate(state.rate);
  };
  // Update Value in state
  const updateStateValue = () => {
    const { error, value } = view.getConvert();
    if (error) {
      view.validationError();
      return;
    }
    state.value = value;
  };
 
  // Events
  // Select From Change
  view.UI.selectFrom.addEventListener("change", e => {
    view.updateTo(e.target.value);
    updateRate();
  });
  // Select To Change
  view.UI.selectTo.addEventListener("change", () => {
    updateRate();
  });
  // Form Submit
  view.UI.formExchange.addEventListener("submit", e => {
    e.preventDefault();
    if (isNaN(state.value) || state.value === 0) {
      view.validationError();
      return;
    }
    const result = model.convert(state.fromId, state.toId, state.value);
    view.showConvertResult(
      state.fromId,
      state.toId,
      state.rate,
      result.toFixed(2)
    );
  });
  // Input value change
  view.UI.inputConvert.addEventListener("keyup", e => {
    view.validationErrorRemove();
    updateStateValue();
  });
  // Button clear click
  view.UI.btnClear.addEventListener("click", () => {
    state.value = 0;
    state.rate = 0;
    view.clear();
  });
  return {
    // init app
    init: () => {
      model.init(DB.currencies);
      view.prepareUI(DB.currencies);
      updateRate();
    }
  };
})(viewModule, modelModule, dbModule);
 
controller.init();