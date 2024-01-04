'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-11-18T21:31:17.178Z',
    '2023-12-23T07:42:02.383Z',
    '2024-01-01T09:15:04.904Z',
    '2024-01-01T10:17:24.185Z',
    '2024-01-02T14:11:59.604Z',
    '2024-01-02T17:01:17.194Z',
    '2024-01-02T23:36:17.929Z',
    '2024-01-03T10:51:36.790Z',
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
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2023-12-28T14:18:46.235Z',
    '2024-01-01T16:33:06.386Z',
    '2024-01-02T14:43:26.374Z',
    '2024-01-02T18:49:59.371Z',
    '2024-01-03T12:01:20.894Z',
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

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (24 * 60 * 60 * 1000)));

  const targetDate = new Date(date);
  const daysPassed = calcDaysPassed(new Date(), targetDate);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(targetDate);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sorted = false) {
  // Empty the container
  containerMovements.innerHTML = '';

  // Sort movements if needed
  const movs = !sorted
    ? acc.movements
    : [...acc.movements].sort((a, b) => a - b);

  // Display movements
  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
          </div>
          <div class="movements__date">${formatMovementDate(
            acc.movementsDates[i],
            acc.locale
          )}</div>
          <div class="movements__value">${formatCur(
            mov,
            acc.locale,
            acc.currency
          )}</div>
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
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  // Create arrays of deposits and withdrawals
  const deposits = acc.movements.filter(mov => mov > 0);
  const withdrawals = acc.movements.filter(mov => mov < 0);

  // Calculate and display the income
  const income = deposits.reduce((sum, cur) => sum + cur, 0);
  labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);

  // Calculate and display the outcome
  const outcome = withdrawals.reduce((sum, cur) => sum - cur, 0);
  labelSumOut.textContent = formatCur(outcome, acc.locale, acc.currency);

  // Calculate and display the interest
  const interest = deposits
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(cur => cur > 1)
    .reduce((sum, cur) => sum + cur, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out the user
    if (time === 0) {
      clearInterval(timer);
      // Display UI and message
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 10 minutes
  let time = 10 * 60;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

createUserName(accounts);

// Event Handlers
let currentAccount, timer;

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

    // Display current date and time
    const now = new Date();
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

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
    const curDate = new Date().toISOString();
    targetAccount.movements.push(amount);
    targetAccount.movementsDates.push(curDate);
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(curDate);

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= 0.1 * amount)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }

  // Empty the input field
  inputLoanAmount.value = '';

  // Reset timer
  clearInterval(timer);
  timer = startLogOutTimer();
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
  displayMovements(currentAccount, !isSorted);

  // Toggle the isSorted variable
  isSorted = !isSorted;
});
