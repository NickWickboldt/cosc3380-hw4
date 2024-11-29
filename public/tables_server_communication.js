const fetchCustomers = async () => {
  const response = await fetch("/customer");
  const customers = await response.json();

  const customersTableBody = document.querySelector("#customersTable tbody");
  customersTableBody.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");

    // Create and append table cells for each customer attribute
    row.innerHTML = `
      <td>${customer.customer_id}</td>
      <td>${customer.first_name}</td>
      <td>${customer.last_name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone_number || "N/A"}</td>
      <td>${new Date(customer.created_at).toLocaleString()}</td>
      <td>${customer.is_busy}</td>
      <td>${customer.plan_id}</td>
      <td>${customer.bill_amount}</td>
      <td>${customer.billing_status}</td>
    `;
    customersTableBody.appendChild(row);
  });
};

const fetchBanks = async () => {
  const response = await fetch("/banks");
  const banks = await response.json();

  const banktableBody = document.querySelector("#bankTable tbody");
  banktableBody.innerHTML = "";

  banks.forEach((bank) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${bank.account_number}</td>
      <td>${bank.balance}</td>
      <td>${bank.bank_name}</td>
      <td>${bank.bank_log}</td>
      <td>${bank.customer_id}</td>
    `;
    banktableBody.appendChild(row);
  });
};

const fetchPhonePlans = async () => {
  const response = await fetch("/phone_plans");
  const phonePlans = await response.json();

  const phonePlanstableBody = document.querySelector("#phonePlanTable tbody");
  phonePlanstableBody.innerHTML = "";

  phonePlans.forEach((plan) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${plan.plan_id}</td>
      <td>${plan.plan_name}</td>
      <td>${plan.data_type}</td>
      <td>${plan.call_minutes}</td>
      <td>${plan.data_limit}</td>
      <td>${plan.data_overage_cost}</td>
      <td>${plan.plan_cost}</td>
      <td>${plan.cost_frequency}</td>
    `;
    phonePlanstableBody.appendChild(row);
  });
};

const fetchCallRecord = async () => {
  const response = await fetch("/call_record");
  const callRecord = await response.json();

  const callRecordTableBody = document.querySelector("#callRecordsTable tbody");
  callRecordTableBody.innerHTML = "";

  callRecord.forEach((record) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${record.phone_number}</td>
      <td>${record.call_start.substring(record.call_start.indexOf('T'), record.call_start.length)}</td>
      <td>${record.call_end.substring(record.call_end.indexOf('T'), record.call_end.length)}</td>
      <td>${record.duration}</td>
      <td>${record.data_usage}</td>
      <td>${record.cost}</td>
      <td>${record.date.substring(0, record.date.indexOf('T'))}</td>
    `;
    callRecordTableBody.appendChild(row);
  });
};

const fetchPayment = async () => {
  const response = await fetch("/payment");
  const payment = await response.json();

  const paymentTableBody = document.querySelector("#paymentTable tbody");
  paymentTableBody.innerHTML = "";

  payment.forEach((pay) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${pay.payment_id}</td>
      <td>${pay.amount}</td>
      <td>${pay.payment_date.substring(0, pay.payment_date.indexOf('T'))}</td>
      <td>${pay.payment_type}</td>
      <td>${pay.card_type}</td>
      <td>${pay.card_number}</td>
      <td>${pay.company_balance}</td>
      <td>${pay.customer_id}</td>
      <td>${pay.plan_id}</td>
    `;
    paymentTableBody.appendChild(row);
  });
};

const updateTables = () => {
  fetchCustomers();
  fetchBanks();
  fetchPhonePlans();
  fetchCallRecord();
  fetchPayment();

  setInterval(() => {
    updateTables()
  }, 5000);
}

window.onload = () => {
  updateTables()
}