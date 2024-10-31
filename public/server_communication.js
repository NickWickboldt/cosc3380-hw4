const fetchCustomers = async () => {
  const response = await fetch("/customers");
  const customers = await response.json()

  const customersTableBody = document.querySelector('#customersTable tbody');
  customersTableBody.innerHTML = '';

  customers.forEach(customer => {
    const row = document.createElement('tr');

    // Create and append table cells for each customer attribute
    row.innerHTML = `
      <td>${customer.customer_id}</td>
      <td>${customer.first_name}</td>
      <td>${customer.last_name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone_number || 'N/A'}</td>
      <td>${new Date(customer.created_at).toLocaleString()}</td>
      <td>${customer.account_number}</td>
      <td>${customer.plan_id}</td>
    `;
    customersTableBody.appendChild(row);
  });

}

const fetchBanks = async () => {
  const response = await fetch("/banks");
  const banks = await response.json()

  const banktableBody = document.querySelector("#bankTable tbody");
  banktableBody.innerHTML = '';

  banks.forEach(bank => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${bank.account_number}</td>
      <td>${bank.balance}</td>
      <td>${bank.bank_name}</td>
      <td>${bank.bank_log}</td>
    `;
    banktableBody.appendChild(row);
  });
}

const fetchPhonePlans = async () => {
  const response = await fetch("/phone_plans");
  const phonePlans = await response.json()

  const phonePlanstableBody = document.querySelector("#phonePlanTable tbody");
  phonePlanstableBody.innerHTML = '';

  phonePlans.forEach(plan => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${plan.plan_id}</td>
      <td>${plan.data_type}</td>
      <td>${plan.call_minutes}</td>
      <td>${plan.plan_name}</td>
    `;
    phonePlanstableBody.appendChild(row);
  });
}

document.getElementById('create-customer-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/submit_customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formObject)
    });

    if (response.ok) {
      document.getElementById('statusMessage').style.display = "block";
      document.getElementById('statusMessage').innerText = 'Customer created!';
      this.reset(); 
      updateTables()
      setTimeout(() => {
        document.getElementById('statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('statusMessage').innerText = 'Failed to create customer.';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('statusMessage').innerText = 'An error occurred. Please try again.';
  }
});

document.getElementById('update-customer-form').addEventListener('submit', async function(event){
  event.preventDefault()

  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());
  try{
    const response = await fetch(`/update_customer/${formObject.update_customer_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject)
    })
    if (response.ok) {
      updateTables()
      document.getElementById('update_statusMessage').style.display = "block"; 
      document.getElementById('update_statusMessage').innerText = 'Customer updated!';
      this.reset(); 
      setTimeout(() => {
        document.getElementById('update_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('update_statusMessage').innerText = 'Failed to update customer.';
    }
  } catch (error) {
  console.error('Error:', error);
  document.getElementById('update_statusMessage').innerText = 'An error occurred. Please try again.';
}
})
document.getElementById('delete-customer-form').addEventListener('submit', async function(event){
  event.preventDefault();
  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());
  try{
    const response = await fetch(`/delete_customer/${formObject.delete_customer_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      updateTables()
      document.getElementById('delete_statusMessage').style.display = "block"; 
      document.getElementById('delete_statusMessage').innerText = 'Customer deleted!';
      this.reset(); 
      setTimeout(() => {
        document.getElementById('delete_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('delete_statusMessage').innerText = 'Failed to delete customer.';
    }
  } catch (error){
    console.error('Error:', error);
    document.getElementById('delete_statusMessage').innerText = 'An error occurred. Please try again.';
  }

})

document.querySelector(".delete-all-customers").addEventListener('click', async () => {
  try{
    const response = await fetch(`/delete_all_customers/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      updateTables()
      document.getElementById('delete_statusMessage').style.display = "block"; 
      document.getElementById('delete_statusMessage').innerText = 'All customers deleted successfully!';
      setTimeout(() => {
        document.getElementById('delete_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('delete_statusMessage').innerText = 'Failed to delete all customers.';
    }
  } catch (error){
    console.error('Error:', error);
    document.getElementById('delete_statusMessage').innerText = 'An error occurred. Please try again.';
  }
})

const updateTables = () => {
  fetchCustomers()
  fetchBanks()
  fetchPhonePlans()
}

window.onload = () => {
  updateTables()
}