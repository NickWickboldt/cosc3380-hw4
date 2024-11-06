const createTables = async () => {
  try {
    const response = await fetch("/create_tables", {
      method: "PUT", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok){
      console.log("Database and tables created successfully!")
    } else{
      console.log("Database and tables not created.")
    }
  } catch (err) {
    console.error(err.message);
  }
}

const initializeTables = async () => {
  try {
    const response = await fetch("/initialize_tables", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      }
    })
    if (response.ok){
      console.log("Table data initialized successfully!")
    } else{
      console.log("Table data not initialized.")
    }
  } catch (err) {
    console.error(err.message);
  }
}

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
      <td>${customer.bank_account_id}</td>
      <td>${customer.plan_id}</td>
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
      <td>${bank.bank_account_id}</td>
      <td>${bank.account_number}</td>
      <td>${bank.balance}</td>
      <td>${bank.bank_name}</td>
      <td>${bank.bank_log}</td>
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
      <td>${plan.data_type}</td>
      <td>${plan.call_minutes}</td>
      <td>${plan.plan_name}</td>
    `;
    phonePlanstableBody.appendChild(row);
  });
};

const fetchPlanNames = async () => {
  const response = await fetch("/plan_name");
  const planNames = await response.json();

  const planNamesTableBody = document.querySelector(
    "#availablePlansTable tbody"
  );
  planNamesTableBody.innerHTML = "";

  planNames.forEach((plan) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${plan.plan_name}</td>
      <td>${plan.plan_cost}</td>
      <td>${plan.cost_frequency}</td>
    `;
    planNamesTableBody.appendChild(row);
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
      <td>${record.call_id}</td>
      <td>${record.call_start}</td>
      <td>${record.call_end}</td>
      <td>${record.duration}</td>
      <td>${record.cost}</td>
      <td>${record.date}</td>
      <td>${record.customer_id}</td>
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
      <td>${pay.payment_date}</td>
      <td>${pay.company_balance}</td>
      <td>${pay.customer_id}</td>
      <td>${pay.bank_id}</td>
      <td>${pay.plan_id}</td>
    `;
    paymentTableBody.appendChild(row);
  });
};

const fetchCustomerStanding = async () => {
  const response = await fetch("/customer_standing");
  const standings = await response.json();

  const standingsTableBody = document.querySelector("#standingsTable tbody");
  standingsTableBody.innerHTML = "";

  standings.forEach((standing) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${standing.customer_name}</td>
      <td>${standing.account_status}</td>
    `;
    standingsTableBody.appendChild(row);
  });
};

const fetchMonthlyRevenue = async () => {
  const response = await fetch("/monthly_revenue");
  const revenueData = await response.json();

  const monthlyRevenueContainer = document.getElementById("monthlyRevenueContainer")
  monthlyRevenueContainer.innerHTML = ''
  revenueData.forEach(revenue => {
    
    let section = document.createElement('div');

    section.innerHTML = `
      <h3>${revenue.plan_name}</h3>
      <p>Cost per Customer: $${revenue.cost_per_customer}</p>
      <p>Monthly Revenue Per Plan: $${revenue.monthly_revenue_per_plan}</p>
      <p>Number of Customers: ${revenue.number_of_customers}</p>
      <p>Total Monthly Revenue: $${revenue.total_monthly_revenue.toFixed(2)}</p>
    `
    monthlyRevenueContainer.appendChild(section);
  });
}

document
  .getElementById("create-customer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/submit_customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        document.getElementById("statusMessage").style.display = "block";
        document.getElementById("statusMessage").innerText =
          "Customer created!";
        this.reset();
        updateTables();
        setTimeout(() => {
          document.getElementById("statusMessage").style.display = "none";
        }, 2000);
      } else {
        document.getElementById("statusMessage").innerText =
          "Failed to create customer.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("statusMessage").innerText =
        "An error occurred. Please try again.";
    }
  });

document
  .getElementById("update-customer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    try {
      const response = await fetch(
        `/update_customer/${formObject.update_customer_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formObject),
        }
      );
      if (response.ok) {
        updateTables();
        document.getElementById("update_statusMessage").style.display = "block";
        document.getElementById("update_statusMessage").innerText =
          "Customer updated!";
        this.reset();
        setTimeout(() => {
          document.getElementById("update_statusMessage").style.display =
            "none";
        }, 2000);
      } else {
        document.getElementById("update_statusMessage").innerText =
          "Failed to update customer.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("update_statusMessage").innerText =
        "An error occurred. Please try again.";
    }
  });
document
  .getElementById("delete-customer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    let continueDelete = confirm("Deleting a customer will cause a cascading effect in the database: Proceed?")
    if (continueDelete){
      const formData = new FormData(this);
      const formObject = Object.fromEntries(formData.entries());
      try {
        const response = await fetch(
          `/delete_customer/${formObject.delete_customer_id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.ok) {
          updateTables();
          document.getElementById("delete_statusMessage").style.display = "block";
          document.getElementById("delete_statusMessage").innerText =
            "Customer deleted!";
          this.reset();
          setTimeout(() => {
            document.getElementById("delete_statusMessage").style.display =
              "none";
          }, 2000);
        } else {
          document.getElementById("delete_statusMessage").innerText =
            "Failed to delete customer.";
        }
      } catch (error) {
        console.error("Error:", error);
        document.getElementById("delete_statusMessage").innerText =
          "An error occurred. Please try again.";
      }
    }
  });

document
  .getElementById("minutes-cost-customer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    const resultTable = document.getElementById("minutesCostTable");
    try {
      const response = await fetch(
        `/minutes_cost/${formObject.minutes_cost_customer_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        const data = await response.json();

        if (data.length > 0) {
          resultTable.innerHTML = "";
          const customerData = data[0];
          console.log(customerData);
          resultTable.style.display = "table";
          const row = document.createElement("tr");

          resultTable.innerHTML = `
        <tr>
          <th>Cost</th>
          <th>Minutes</th>
        </tr>
        <tr>
          <td>$${customerData.total_logged_cost}</td>
          <td>${customerData.total_logged_minutes}</td>
        </tr>
      `;
          resultTable.appendChild(row);
        }
        this.reset();
        setTimeout(() => {
          document.getElementById("minutes_cost_statusMessage").style.display =
            "none";
        }, 2000);
      } else {
        document.getElementById("minutes_cost_statusMessage").innerText =
          "Failed to find customer.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("minutes_cost_statusMessage").innerText =
        "An error occurred. Please try again.";
    }
  });

document
  .querySelector(".delete-all-customers")
  .addEventListener("click", async () => {
    let continueDelete = confirm("Deleting all customers will cause a significant cascading effect in the database: Proceed?")
    if (continueDelete){
      try {
        const response = await fetch(`/delete_all_customers/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          updateTables();
          document.getElementById("delete_statusMessage").style.display = "block";
          document.getElementById("delete_statusMessage").innerText =
            "All customers deleted successfully!";
          setTimeout(() => {
            document.getElementById("delete_statusMessage").style.display =
              "none";
          }, 2000);
        } else {
          document.getElementById("delete_statusMessage").innerText =
            "Failed to delete all customers.";
        }
      } catch (error) {
        console.error("Error:", error);
        document.getElementById("delete_statusMessage").innerText =
          "An error occurred. Please try again.";
      }
    }
  });

const updateTables = () => {
  fetchCustomers();
  fetchBanks();
  fetchPhonePlans();
  fetchPlanNames();
  fetchCallRecord();
  fetchPayment();
  fetchCustomerStanding();
  fetchMonthlyRevenue()
};

document.querySelector(".create-tables-button").addEventListener('click', async () => {
  let confirmCreate = confirm("Creating tables will reset all current table data: Proceed?")
  if(confirmCreate) {
    await createTables()
    updateTables()
    document.querySelector(".initialize-data").style.display = "block"
    document.querySelector(".create-tables-button").textContent = "Reset Tables"
  }
});

document.querySelector(".initialize-data").addEventListener('click', async () => {
  let confirmItitialize = confirm("Initializing table data will reset all current table data: Proceed?")
  if(confirmItitialize) {
    await initializeTables()
    updateTables()
    document.querySelector(".initialize-data").style.display = "none"
  }
});