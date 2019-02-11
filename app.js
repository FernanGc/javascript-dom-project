// How to use the module pattern.
// Private an public data, encapsulation and sepration of concerns.

/** 
 * Notes
 *  We use modules to keep pices of code that are related to one and other together
 *  inside of separatem, indipendent and organize units. And will only accesible within the module.
 * 
 *  To don't let other code overwrite the data and keep this data safe.
 * 
**/

/**
 * This module handle' the budget data.
 * This is an immediately invoke functon expression that return and object
 * 
 * Budget Controller
*/ 
var budgetController = (function() {

    // Gastos
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    } // End function constructor

    Expense.prototype.calculatePercentages = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // Ingresos
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; // End function constructor

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    // Public method
    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // Create new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            // Create a new item on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push the item into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income nd expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate te budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage  = -1;
            }

            // Expense = 100 and income 200, spent 50% = 100/200 = 0.5 * 100

        },

        calculatePercentages: function() {
            /* 
                a = 20
                b = 10
                c = 40
                income = 100
                a=20/100 = 20%
                b=10/100 = 10%
                c=40/100 = 40%
            */
            data.allItems.exp.forEach(function(cur) {
                cur.calculatePercentages(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };


})(); // End budgetController


/**
 * UI Controller
 */
var uiController = (function() {

    // This object holds the DOM strings
    var domStrings = {
        // This value comes from the option field and it gets the values: inc and exp.
        inputType: '.add__type', 
        // This value comesfrom the input type text field and it gets the description of the budget
        inputDescription: '.add__description',
        // This value comes from the input type number and it gets the $ quantity
        inputValue: '.add__value',
        // Value from the button
        inputBtn: '.add__btn',
        // Selecionael contenedor los items
        incomeContainer: '.income__list',
        espensesContainer: '.expenses__list',

        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands

            2310.4567 -> + 2,310.46
            2000 -> + 2,000.00
            */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // returns and object with the data from the input fields
        getInput: function() {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value )
            };
        }, // End method getInput

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create a HTML, string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">' +
                            '<div class="item__description">%description%</div>' +
                            '<div class="right clearfix">' +
                                '<div class="item__value">%value%</div>' +
                                '<div class="item__delete">' +
                                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            } else if (type === 'exp') {
                element = domStrings.espensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                        '<div class="item__description">%description%</div>' +
                            '<div class="right clearfix">' +
                                '<div class="item__value">%value%</div>' +
                                '<div class="item__percentage">21%</div>' +
                                '<div class="item__delete">' +
                                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Inset  the HTMl into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function() {
            var fields, fieldArr;

            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function(current, index, array) {
                current.value = "";
            });  

            fieldArr[0].focus();
        },

        deleteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '--';
            }
        },

        displayPercentages: function(percenages) {
            var fields = document.querySelectorAll(domStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {
                if (percenages[index] > 0) {
                    current.textContent = percenages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, month, months, year;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function() {
            var fields = document.querySelectorAll(
                domStrings.inputType + ',' +
                domStrings.inputDescription + ',' +
                domStrings.inputValue
            );
            
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(domStrings.inputBtn).classList.toggle('red');
        },

        // With this method we make public the domStrings object.
        getDOMStrings: function() {
            return domStrings;
        } // End getDOMStrings()
    };


})();

/**
 * Global App Controller
 * 
 * budgetCtrl stands for budgetController
 * uiCtrl stands for uiController
 */
var controller = (function(budgetCtrl, uiCtrl) {

    var setupEventListens = function() {
        // Obtine el objeto con los valores obtenidos en uiController
        var dom = uiCtrl.getDOMStrings();

        // Lister for the user to hit the button with the class .add__btn to execue the action function expression
        document.querySelector(dom.inputBtn).addEventListener('click', addItem);

        // Listen for the Enter key when is pressed
        document.addEventListener('keypress', function(event) {
            // If the Enter key is pressed execute the action function expression
            if (event.keyCode === 13 || event.which === 13) {
                addItem();
            }
        });

        document.querySelector(dom.container).addEventListener('click', deleteItems);
        document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetController.getBudget();

        // 3. Display the budget on the UI
        uiCtrl.displayBudget(budget);

    };

    var updatePercentages = function() {
        // 1. Calculate pecentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percenages
        uiCtrl.displayPercentages(percentages);
    };


    var addItem = function() {
        /**
         * 1. Get the filed input data
         * 2. Add the item to the budget controller
         * 3. Add the item to the UI
         * 4. Clearfileds
         * 5. Calculate and update the budget
        */

        var input, newItem;

        // 1. Get the filed input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            uiCtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Calculae and update the budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        } // End if
    }; // End addItem() function

    var deleteItems = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete item from the user interface
            uiCtrl.deleteListItem(itemID);

            // 3. Updae the new budget
            updateBudget();

            // 4. Calculate and update the percentages
            updatePercentages();

        }
    };
    
    return {
        init: function() {
            console.log('Aplication has started.');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListens();
        }
    };

})(budgetController, uiController);

controller.init();