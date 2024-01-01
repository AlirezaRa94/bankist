'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements, sorted = false) {
  // Empty the container
  containerMovements.innerHTML = '';

  // Sort movements if needed
  const movs = !sorted ? movements : [...movements].sort((a, b) => a - b);

  // Display movements
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
          </div>
          <div class="movements__value">${mov.toFixed(2)}€</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUserName = function (accs) {
  accs.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(w => w[0])
        .join(''))
  );
};

const calcDisplayBalance = function (acc) {
  // Calculate the balance
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);

  // Display the balance
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  // Create arrays of deposits and withdrawals
  const deposits = acc.movements.filter(mov => mov > 0);
  const withdrawals = acc.movements.filter(mov => mov < 0);

  // Calculate and display the income
  const income = deposits.reduce((sum, cur) => sum + cur, 0);
  labelSumIn.textContent = `${income.toFixed(2)}€`;

  // Calculate and display the outcome
  const outcome = withdrawals.reduce((sum, cur) => sum - cur, 0);
  labelSumOut.textContent = `${outcome.toFixed(2)}€`;

  // Calculate and display the interest
  const interest = deposits
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(cur => cur > 1)
    .reduce((sum, cur) => sum + cur, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

createUserName(accounts);

// Event Handlers
let currentAccount;

// FAKE always logged in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

// Display current date
const now = new Date();
const day = `${now.getDate()}`.padStart(2, 0);
const month = `${now.getMonth() + 1}`.padStart(2, 0);
const year = now.getFullYear();
const hour = `${now.getHours()}`.padStart(2, 0);
const min = `${now.getMinutes()}`.padStart(2, 0);

labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

btnLogin.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username == inputLoginUsername.value
  );

  if (currentAccount?.pin == Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  // Extract input data
  const amount = Number(inputTransferAmount.value);
  const targetAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Empty the input fields
  inputTransferTo.value = inputTransferAmount.value = '';

  // Transfer money if the conditions are passed
  if (
    amount > 0 &&
    targetAccount &&
    amount <= currentAccount.balance &&
    targetAccount.username !== currentAccount.username
  ) {
    targetAccount.movements.push(amount);
    currentAccount.movements.push(-amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= 0.1 * amount)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }

  // Empty the input field
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => currentAccount.username === acc.username
    );

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;

    // Empty the input fields
    inputTransferTo.value = inputTransferAmount.value = '';
  }
});

let isSorted = false;

btnSort.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  // Display the movements
  displayMovements(currentAccount.movements, !isSorted);

  // Toggle the isSorted variable
  isSorted = !isSorted;
});
