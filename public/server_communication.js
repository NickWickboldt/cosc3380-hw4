const fetchUsers = async () => {
  const response = await fetch('/users');
  const users = await response.json()

  const usersTableBody = document.querySelector('#usersTable tbody');
  usersTableBody.innerHTML = ''; // Clear existing rows

  users.forEach(user => {
    const row = document.createElement('tr');

    // Create and append table cells for each user attribute
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.first_name}</td>
      <td>${user.last_name}</td>
      <td>${user.email}</td>
      <td>${user.phone_number || 'N/A'}</td>
      <td>${new Date(user.created_at).toLocaleString()}</td>
    `;
    usersTableBody.appendChild(row);
  });

}

document.getElementById('create-user-form').addEventListener('submit', async function(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/submit_user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formObject)
    });

    if (response.ok) {
      document.getElementById('statusMessage').style.display = "block";
      document.getElementById('statusMessage').innerText = 'User created!';
      this.reset(); 
      fetchUsers()
      setTimeout(() => {
        document.getElementById('statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('statusMessage').innerText = 'Failed to create user.';
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('statusMessage').innerText = 'An error occurred. Please try again.';
  }
});

document.getElementById('update-user-form').addEventListener('submit', async function(event){
  event.preventDefault()

  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());
  try{
    const response = await fetch(`/update_user/${formObject.update_user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject)
    })
    if (response.ok) {
      fetchUsers()
      document.getElementById('update_statusMessage').style.display = "block"; 
      document.getElementById('update_statusMessage').innerText = 'User updated!';
      this.reset(); 
      setTimeout(() => {
        document.getElementById('update_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('update_statusMessage').innerText = 'Failed to update user.';
    }
  } catch (error) {
  console.error('Error:', error);
  document.getElementById('update_statusMessage').innerText = 'An error occurred. Please try again.';
}
})
document.getElementById('delete-user-form').addEventListener('submit', async function(event){
  event.preventDefault();
  const formData = new FormData(this);
  const formObject = Object.fromEntries(formData.entries());
  try{
    const response = await fetch(`/delete_user/${formObject.delete_user_id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      fetchUsers()
      document.getElementById('delete_statusMessage').style.display = "block"; 
      document.getElementById('delete_statusMessage').innerText = 'User deleted!';
      this.reset(); 
      setTimeout(() => {
        document.getElementById('delete_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('delete_statusMessage').innerText = 'Failed to delete user.';
    }
  } catch (error){
    console.error('Error:', error);
    document.getElementById('delete_statusMessage').innerText = 'An error occurred. Please try again.';
  }

})

document.querySelector(".delete-all-users").addEventListener('click', async () => {
  try{
    const response = await fetch(`/delete_all_users/`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      fetchUsers()
      document.getElementById('delete_statusMessage').style.display = "block"; 
      document.getElementById('delete_statusMessage').innerText = 'All users deleted successfully!';
      setTimeout(() => {
        document.getElementById('delete_statusMessage').style.display = "none"
      }, 2000)
    } else {
      document.getElementById('delete_statusMessage').innerText = 'Failed to delete all users.';
    }
  } catch (error){
    console.error('Error:', error);
    document.getElementById('delete_statusMessage').innerText = 'An error occurred. Please try again.';
  }
})

window.onload = () => {
  fetchUsers()
}