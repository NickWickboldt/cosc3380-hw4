const fetchCustomerStanding = async () => {
  const response = await fetch("/customer_standing");
  const standings = await response.json();

  // Count occurrences of each status
  const statusCounts = standings.reduce((counts, standing) => {
    counts[standing.account_status] =
      (counts[standing.account_status] || 0) + 1;
    return counts;
  }, {});

  // Prepare data for the pie chart
  const labels = Object.keys(statusCounts);
  const data = Object.values(statusCounts);

  const ctx = document.getElementById("customerStandingChart").getContext("2d");

  if (typeof window.customerStandingChart.data !== "undefined") {
    window.customerStandingChart.data.labels = labels;
    window.customerStandingChart.data.datasets[0].data = data;
    window.customerStandingChart.update();
  } else {
    window.customerStandingChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Customer Standing",
            data: data,
            backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"], // Colors for each section
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
      },
    });
  }
};


const fetchMonthlyRevenue = async () => {
  const response = await fetch("/monthly_revenue");
  const revenueData = await response.json();

  const monthlyRevenueContainer = document.getElementById(
    "monthlyRevenueContainer"
  );
  monthlyRevenueContainer.innerHTML = "";
  revenueData.forEach((revenue) => {
    let section = document.createElement("div");

    section.innerHTML = `
      <h3>${revenue.plan_name}</h3>
      <p>Cost per Customer: $${revenue.cost_per_customer}</p>
      <p>Monthly Revenue Per Plan: $${revenue.monthly_revenue_per_plan}</p>
      <p>Number of Customers: ${revenue.number_of_customers}</p>
    `;
    monthlyRevenueContainer.appendChild(section);
  });
  const totalRevenue = document.createElement("p");
  totalRevenue.innerHTML = `
    <hr>
    <p>Total Monthly Revenue: $${revenueData[0].total_monthly_revenue.toFixed(
      2
    )}</p>
  `;
  monthlyRevenueContainer.appendChild(totalRevenue);
};

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
        console.log(data);

        if (data) {
          resultTable.innerHTML = "";
          const customerData = data;
          console.log(customerData);
          resultTable.style.display = "table";
          const row = document.createElement("tr");

          resultTable.innerHTML = `
        <tr>
          <th>Cost</th>
          <th>Minutes</th>
        </tr>
        <tr>
          <td>$${customerData.bill_amount}</td>
          <td>${customerData.used_minutes}</td>
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
    let continueDelete = confirm(
      "Deleting all customers will cause a significant cascading effect in the database: Proceed?"
    );
    if (continueDelete) {
      try {
        const response = await fetch(`/delete_all_customers/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          updateTables();
          document.getElementById("delete_statusMessage").style.display =
            "block";
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

const fetchTransaction = async () => {
  const response = await fetch("/transaction");
  const transaction = await response.json();

  const transactionTableBody = document.querySelector("#transactionTable tbody");
  transactionTableBody.innerHTML = "";

  transaction.forEach((tran) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${tran.transaction_id}</td>
        <td>${tran.transaction_type}</td>
        <td>${tran.transaction_date.substring(0, tran.transaction_date.indexOf("T"))}</td>
        <td>${tran.transaction_duration}ms</td>
        <td>${tran.customer_id}</td>

      `;
    transactionTableBody.appendChild(row);
  });
};

const updateTables = () => {
  fetchTransaction()
  fetchCustomerStanding();
  fetchMonthlyRevenue();
};

updateTables()

setInterval(() => {
  updateTables()
}, 5000);

window.onload = () => {
  updateTables();
};
