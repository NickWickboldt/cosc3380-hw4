const createTables = async () => {
  try {
    const response = await fetch("/create_tables", {
      method: "PUT", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      console.log("Database and tables created successfully!");
    } else {
      console.log("Database and tables not created.");
    }
  } catch (err) {
    console.error(err.message);
  }
};

const initializeTables = async () => {
  try {
    const response = await fetch("/initialize_tables", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Table data initialized successfully!");
    } else {
      console.log("Table data not initialized.");
    }
  } catch (err) {
    console.error(err.message);
  }
};

const simulation = async () => {
  try {
    const response = await fetch("/simulation", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Simulation started successfully!");
    } else {
      console.log("Simulation aborted.");
    }
  } catch (err) {
    console.error(err.message);
  }
};

const stopSimulation = async () => {
  try {
    const response = await fetch("/stop_simulation", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      console.log("Simulation started successfully!");
    } else {
      console.log("Simulation aborted.");
    }
  } catch (err) {
    console.error(err.message);
  }
};

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
    let continueDelete = confirm(
      "Deleting a customer will cause a cascading effect in the database: Proceed?"
    );
    if (continueDelete) {
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
          document.getElementById("delete_statusMessage").style.display =
            "block";
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
  .getElementById("billing-status-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    try {
      const response = await fetch(
        `/billing_status/${formObject.billing_status_customer_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        const result = await response.json();
        updateTables();
        document.getElementById("billing_status_statusMessage").style.display =
          "block";
        document.getElementById("billing_status_statusMessage").innerText =
          result.billing_status + ": $" + result.bill_amount.toFixed(2);
        if (result.billing_status.trim() == "Paid") {
          document.querySelector(".payment-message").innerHTML =
            "Payments up to date.";
        } else {
          document.getElementById("make-payment-form").style.display = "block";
          document.querySelector(".payment-message").style.display = "none";
        }

        this.reset();
        setTimeout(() => {
          document.getElementById(
            "billing_status_statusMessage"
          ).style.display = "none";
        }, 2000);
      } else {
        document.getElementById("billing_status_statusMessage").innerText =
          "Failed to find customer.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("billing_status_statusMessage").innerText =
        "An error occurred. Please try again.";
    }
  });

document
  .getElementById("make-payment-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    console.log(formObject);
    try {
      const response = await fetch(
        `/make_payment/${formObject.make_payment_customer_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formObject),
        }
      );
      if (response.ok) {
        updateTables();
        document.getElementById("make_payment_statusMessage").style.display =
          "block";
        document.getElementById("make_payment_statusMessage").innerText =
          "Payment Successful";
        this.reset();
        setTimeout(() => {
          document.getElementById("make_payment_statusMessage").style.display =
            "none";
          document.getElementById("make-payment-form").style.display = "none";
          document.querySelector(".payment-message").style.display = "block";
          document.querySelector(".payment-message").innerHTML =
            "To make a payment, first, check your billing status.";
        }, 2000);
      } else {
        document.getElementById("make_payment_statusMessage").style.display =
          "block";
        if (response.status == 400) {
          document.getElementById("make_payment_statusMessage").innerText =
            "Insufficient Funds";
        } else if (response.status == 404) {
          document.getElementById("make_payment_statusMessage").innerText =
            "Failed to find customer.";
        } else {
          document.getElementById("make_payment_statusMessage").innerText =
            "Failed to process payment.";
        }
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("billing_status_statusMessage").innerText =
        "An error occurred. Please try again.";
    }
  });

document
  .getElementById("make-call-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());
    console.log("Form Data:", formObject);

    const statusMessage = document.getElementById("make_call_statusMessage");
    const endCallButton = document.querySelector(".make_call_end_call");

    try {
      statusMessage.style.display = "block";
      statusMessage.innerText = "Attempting to start the call...";

      const response = await fetch(`/make_call`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formObject),
      });

      if (response.ok) {
        updateTables();
        statusMessage.innerText = "Call is in progress...";

        endCallButton.style.display = "block";

        // Start the call duration timer
        const callStartTime = Date.now();
        const timerInterval = setInterval(() => {
          const elapsedTime = Math.floor((Date.now() - callStartTime) / 1000);
          statusMessage.innerText = `Call Duration: ${elapsedTime} seconds`;
        }, 1000);

        endCallButton.onclick = async function () {
          clearInterval(timerInterval);

          try {
            const callDuration = Math.floor(
              (Date.now() - callStartTime) / 1000
            );

            const updatedFormObject = {
              ...formObject,
              duration: callDuration,
            };
            statusMessage.innerText = "Ending the call...";
            const endResponse = await fetch(`/end_call`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedFormObject),
            });

            if (endResponse.ok) {
              statusMessage.innerText = "Call ended successfully.";
              setTimeout(() => {
                statusMessage.style.display = "none";
              }, 2000);
              document.getElementById("make-call-form").reset();
            } else {
              const errorMessage = await endResponse.text();
              if (endResponse.status === 404) {
                statusMessage.innerText = `Failed to end the call: One or both phone numbers not found. Please check the input.`;
              } else if (endResponse.status === 400) {
                statusMessage.innerText = `Failed to end the call: ${
                  errorMessage || "Invalid request data."
                }`;
              } else {
                statusMessage.innerText = `Failed to end the call: ${
                  errorMessage || "Unexpected error occurred."
                }`;
              }
            }
          } catch (error) {
            console.error("Error ending the call:", error);
            statusMessage.innerText =
              "An error occurred while trying to end the call. Please try again.";
          } finally {
            endCallButton.style.display = "none";
          }
        };
      } else {
        const errorMessage = await response.text();
        statusMessage.innerText = `Failed to start the call: ${errorMessage}`;
      }
    } catch (error) {
      console.error("Error:", error);
      statusMessage.innerText =
        "An error occurred while trying to initiate the call. Please try again.";
    }
  });
const updateTables = () => {};

document
  .querySelector(".create-tables-button")
  .addEventListener("click", async () => {
    let confirmCreate = confirm(
      "Creating tables will reset all current table data: Proceed?"
    );
    if (confirmCreate) {
      await createTables();
      updateTables();
      document.querySelector(".initialize-data").style.display = "block";
      document.querySelector(".create-tables-button").textContent =
        "Reset Tables";
    }
  });

document
  .querySelector(".initialize-data")
  .addEventListener("click", async () => {
    let confirmItitialize = confirm(
      "Initializing table data will reset all current table data: Proceed?"
    );
    if (confirmItitialize) {
      await initializeTables();
      updateTables();
      document.querySelector(".initialize-data").style.display = "none";
      document.querySelector(".begin-simulation").style.display = "block";
    }
  });
let simulationActive = false;
document
  .querySelector(".begin-simulation")
  .addEventListener("click", async () => {
    if (simulationActive) {
      let confirmStop = confirm(
        "Stop the simulation? All active calls will be completed. Proceed?"
      );
      if(confirmStop){
        await stopSimulation();
        simulationActive = false;
        document.querySelector(".begin-simulation").style.innerHTML =
          "Simulation";
        updateTables();
      }
    } else {
      let confirmCreate = confirm(
        "Starting a simulation will simulate customer creation, updating, payments, and calls. Proceed?"
      );
      if (confirmCreate) {
        await simulation();
        simulationActive = true;
        document.querySelector(".begin-simulation").innerHTML =
          "Stop Simulation";
        updateTables();
        document.querySelector(".begin-simulation").style.display = "block";
      }
    }
  });
