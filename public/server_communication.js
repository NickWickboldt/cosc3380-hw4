const fetchCustomers = async () => {
  const response = await fetch("/customers");
  const customers = await response.json()

  const customersTableBody = document.querySelector('#customersTable tbody');
  customersTableBody.innerHTML = ''; // Clear existing rows

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
    `;
    customersTableBody.appendChild(row);
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
      fetchCustomers()
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
      fetchCustomers()
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
      fetchCustomers()
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
      fetchCustomers()
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

window.onload = () => {
  fetchCustomers()
}