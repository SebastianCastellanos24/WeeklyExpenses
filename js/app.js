const form = document.querySelector("#add-expense");
const expenseList = document.querySelector("#expenses ul");

eventListeners();
function eventListeners() {
    document.addEventListener("DOMContentLoaded", askBudget);

    form.addEventListener("submit", addExpense);
}

class Budget {
    constructor(budget) {
        this.budget = Number(budget);
        this.remaining = Number(budget);
        this.expenses = [];
    }

    newExpense(expense) {
        this.expenses = [...this.expenses, expense];
        this.calcRemaining();
    }

    calcRemaining() {
        const spent = this.expenses.reduce( (total, expense) => total + expense.quantity, 0);
        this.remaining = this.budget - spent;
    }

    deletExpense(id) {
        this.expenses = this.expenses.filter( expense => expense.id !== id );
        this.calcRemaining();
    }
}

class UI {

    addBudget(quantity) {
        const {budget, remaining} = quantity;
        document.querySelector("#total").textContent = budget;
        document.querySelector("#remaining").textContent = remaining;
    }

    showAlert(message, type) {
        const divAlert = document.createElement("div");
        divAlert.classList.add("text-center", "alert");

        if(type === "ERROR") {
            divAlert.classList.add("alert-danger");
        } else {
            divAlert.classList.add("alert-success");
        }

        divAlert.textContent = message;
        
        document.querySelector(".primary").insertBefore(divAlert, form);

        setTimeout(() => {
            divAlert.remove();
        }, 3000)

    }

    showExpenseList(expenses) {

        this.cleanHTML();

        expenses.map((expense) => {
            const { quantity, name, id} = expense;

            const newExpense = document.createElement("li");
            newExpense.className = "list-group-item d-flex justify-content-between align-items-center";
            newExpense.dataset.id = id;

            newExpense.innerHTML = `
                ${name} <span class="badge badge-primary badge-pill">$ ${quantity}</span>
            `;

            const btnDelete = document.createElement("buttom");
            btnDelete.classList.add("btn", "btn-danger", "delete-btn");
            btnDelete.innerHTML = "&times"
            btnDelete.onclick = (() => {
                deletExpense(id);
            })

            newExpense.appendChild(btnDelete);

            expenseList.appendChild(newExpense);

        })
    }

    cleanHTML() {
        while( expenseList.firstChild ) {
            expenseList.removeChild(expenseList.firstChild);
        }
    }

    updateRemaining(remaining) {
        document.querySelector("#remaining").textContent = remaining;
    }

    checkBudget(budgetObj) {
        const { budget, remaining } = budgetObj;

        const remainingDiv = document.querySelector(".remaining");

        // 25% remaining
        if(( budget / 4 ) >= remaining) {
            remainingDiv.classList.remove("alert-success", "alert-warning");
            remainingDiv.classList.add("alert-danger");
            Swal.fire({
                icon: 'warning',
                title: 'Be careful',
                text: 'Lets take care of our money',
                showConfirmButton: false,
                timer: 2000,
            })
        } else if (( budget / 2 ) >= remaining) {  //50% remaining
            remainingDiv.classList.remove("alert-success");
            remainingDiv.classList.add("alert-warning");
            Swal.fire({
                icon: 'info',
                title: 'Be smart',
                text: 'We have spent half the money!',
                showConfirmButton: false,
                timer: 2000,
            })
        } else {
            remainingDiv.classList.remove("alert-danger", "alert-warning");
            remainingDiv.classList.add("alert-success");
        }

        if(remaining <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'We no longer have a budget!',
                showConfirmButton: false,
                timer: 2000,
            })
            form.querySelector("button[type='submit']").disabled = true;
        }
    }

}

const ui = new UI();
let inputValue;

function askBudget () {
    Swal.fire({
        title: 'Submit your budget',
        input: 'number',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showDenyButton: true,
        denyButtonText: 'I dont have budget',
        confirmButtonText: 'Add expense',
        confirmButtonColor: 'rgb(0 102 255)',
        }).then((result) => {
            if(result.value === "" || result.isDenied || result.value <= 0 || result.value === undefined) {
                window.location.reload();
            }
            inputValue = new Budget(result.value);
            ui.addBudget(inputValue);
        }
    )
    
}


function addExpense(e) {
    e.preventDefault();

    const name = document.querySelector("#expense").value;
    const quantity = Number(document.querySelector("#quantity").value);

    if( name === "" || quantity === "" ) {
        ui.showAlert("Both fields are required", "ERROR");
        return;
    } else if ( quantity <= 0 || isNaN(quantity) ) {
        ui.showAlert("That quantity is not valid", "ERROR");
        return;
    }

    const expense = {name, quantity, id: Date.now()};
    inputValue.newExpense(expense);

    ui.showAlert("Expense added successfully", "");

    const { expenses, remaining } =  inputValue;
    ui.showExpenseList(expenses);

    ui.updateRemaining(remaining);

    ui.checkBudget(inputValue);

    form.reset();

}

function deletExpense(id) {
    //Delete expenses of the obj
    inputValue.deletExpense(id);

    //Delete expenses of the HTML
    const { expenses, remaining } = inputValue;
    ui.showExpenseList(expenses);

    ui.updateRemaining(remaining);

    ui.checkBudget(inputValue);
}