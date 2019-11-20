// BUDGET CONTROLLER
// Keeps track of all incomes and expenses
var budgetController = ( function() {

    // Create object as function constructor
    // Prototypes and data storage
    var Expense = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };

    // extend expense prototype
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = 1;
        }
    };

    // each function only has 1 specific task
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id, desc, value) {
        this.id = id;
        this.desc = desc;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        // sum over each Expense/Income in the data object
        // type defines if its the total income or expenses
        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });
        // add the totals to the data totals object
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
        // we use -1 to say a value is not existent
        percentage: -1,
        
    }
        
    // Public methods in this return
    return {
        // Storing an item in our data
        addItem: function(type, description, input) {

            var newItem, key;
            // Key needs to be last key + 1;
            // Create new ID if array is NOT empty
            if (data.allItems[type].length > 0) {
                key = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                key = 0;
            }

            // Create new item based on income or excome type
            // Push it into the data structure above
            if (type === 'exp') {
                // Use different names to avoid confusion
                newItem = new Expense(key, description, input);
            } else if (type === 'inc') {
                newItem = new Income(key, description, input);
            }

            data.allItems[type].push(newItem);
            return newItem;

        },

        deleteItem: function(type, id) {
            var ids, index;

            // id = 3;
            // we create an orderend array of all the income or expenses ID's to make sure we delete the correct income/expense
            var ids = data.allItems[type].map(function(item) {
                return item.id;
            });

            index = ids.indexOf(id);

            // if the income or expense exists, delete it
            if (index !== -1) {
                data.allItems[type].splice(index, 1); 
            }

        },

        calculateBudget: function() {
            // 1. calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // 2. calculate available budget (income - expenses)
            data.budget = data.totals.inc - data.totals.exp;
            // 3. calculate percentage of income that we spent (0 is not possible so if)
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach( function(item) {
                item.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map( function(item) {
                return item.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },

        // exposing data object for testing purposes
        testing: function() {
            console.log(data);
        }
    }

})();

// UI CONTROLLER
var UIController = ( function() {

    // create private variable
    // define class strings so not dependable of classnames if ever changed

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    // private function
    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        // + or - before the number
        // exactly 2 decimal points
        // comma seperating thousands

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
        }

        dec = numSplit[1];
        
        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
        
    };

    // Below here we build our own forEach loop for a nodeList
    var nodeListforEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    // return public method/function through object
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be inc or exp
                description: document.querySelector(DOMstrings.inputDesc).value,
                value: parseFloat(document.querySelector(DOMstrings.inputVal).value) // String converted to number
            }
        },

        addListItem: function(obj, type) {

            var html, newHtml, element;

            // 1. Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                // add %id% for example for easier to find
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // 3. Insert the HTML into the DOM
            // beforerend so that the new item will be added add the end of the list
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },

        deleteListItem: function(selectorID) {
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);  
        },

        // Clears the fields after new item has been added
        // Multiple selectors by adding comma
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
            // Use the slice method of the main Array prototype to convert string with commas to array :-D
            var fieldsArr = Array.prototype.slice.call(fields);
            // Loop over all elements and set them all to nothing
            fieldsArr.forEach(function(item, index, array) {
                item.value = "";
            });
            // Set focus on description back after adding an item
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListforEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '';
                }
            });

        },

        displayMonth: function() {
            var now, year, month, months;
            
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + '  ' + year;

        },

        changedType: function() {

            // turn field borders red when expenses is selected
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDesc + ',' + DOMstrings.inputVal);

            nodeListforEach(fields, function(item) {
                item.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputVal).classList.toggle('red');

        },

        // Expose domstrings to public to be used by controller
        getDOMstrings: function() {
            return DOMstrings;
        },

        // showWarning method (variable input)
        showWarning: function(warning) {
            switch(warning) {
                case('fields'):
                    // fields are not filled in properly
                    alert('please fill in all the fields');                   
                    break;
                default:
                    alert('no specific warning');
            }
        },
    };

})();

// GLOBAL APP CONTROLLER
// This controller knows about the other 2 controllers as it receives them as parameters
// The Ctrl is used to not be dependant of the name, if the name changes we only need to change the parameters
var controller = ( function(budgetCtrl, UIctrl) {

    var setupEventListeners = function() {

        // retrieved by UIcontroller
        // each time an item is added the ctrlAddItem function gets fired
        var DOM = UIctrl.getDOMstrings();
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keyup', function(event) {
            if (event.keyCode === 13) ctrlAddItem();
        });
        
        // each time an item gets deleted the ctrlDeleteItem function gets fired
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
        console.log(UIctrl);

    };

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIctrl.displayBudget(budget);

    };

    var updatePercentages = function() {

        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UIctrl.displayPercentages(percentages);

    };

    // executed when event listeners are clicked
    // function expression
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the filed input data from UIController
        input = UIctrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) { // is Not a Number false?

            // 2. Add the item to the budget controller
            // The input.type etc values come from the retrieved input object above
            // addItem returns an object so we need to save it
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UIctrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UIctrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        } else {
            UIctrl.showWarning('fields');
        }
    };

    var ctrlDeleteItem = function(event) {

        var itemID, splitID, type, ID;

        // retrieve the item id by DOM traversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from data
            budgetCtrl.deleteItem(type, ID);

            // 2. delete item from UI
            UIctrl.deleteListItem(itemID);

            // 3. Update and show the new totals
            updateBudget();

        }
    }

    return {
        init: function() {
            console.log('Application has started.');
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            setupEventListeners();
        },
    }

})(budgetController, UIController);

// Start application
// Without this line of code nothing is going to happen
controller.init();