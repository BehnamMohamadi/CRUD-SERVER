renderTable();

// Rendering Functions
async function renderTable(sortBy = null) {
  const response = await fetch('http://localhost:3001/users-data')
  const users = await response.json()

  thead.innerHTML = '';
  tbody.innerHTML = '';

  if (!!sortBy) {
    users.sort((a, b) => {
      const current = a[sortBy].toString();
      const next = b[sortBy].toString();

      return next.localeCompare(current, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  const tableColumns = ['row', ...tablePattern]
    .map((column) => {
      if (column === 'row') return `<th>${column}</th>`;

      return `<th onclick="renderTable('${column}')">${column}</th>`;
    })
    .join('');

  thead.innerHTML = `<tr>${tableColumns}</tr>`;

  for (const [index, user] of users.entries()) {
    tbody.innerHTML += `
    <tr onclick="renderReadUser(${user.uid})">
      <td>${index + 1}</td>
      <td>${user.uid}</td>
      <td>${user.firstname}</td>
      <td>${user.lastname}</td>
      <td>${user.city}</td>
      <td>${user.postalCode}</td>
      <td>${user.phoneNumber}</td>
      <td>${user.position}</td>
    </tr>`;
  }

}

async function renderReadUser(uid) {
  const user = await findUser(uid)

  modalHeader.textContent = 'User Info';

  modalBody.innerHTML = Object.keys(user)
    .map((property) => `<p><strong>${property}:</strong> ${user[property]}</p>`)
    .join('');

  modalFooter.innerHTML = `
    <button class="button" onclick="renderUpdateUser(${uid})">Update</button>
    <button class="button" onclick="deleteUser(${uid})">delete</button>`;

  openModal();
}






function renderCreateUser() {
  modalHeader.textContent = 'Add new User';

  modalBody.innerHTML = tablePattern
    .map((property) => {
      if (property === 'uid') {
        return `<input type="number" min="0" id="${property}"  class="create-inputs" value="" placeholder="${property}" />`;
      }

      return `<input type="text" id="${property}"  class="create-inputs" value="" placeholder="${property}" />`;
    })
    .join('');

  modalFooter.innerHTML = `
    <button class="button" onclick="createUser()">Save</button>
    <button class="button" onclick="modalClose()">Cancel</button>`;

  openModal();
}

async function renderUpdateUser(uid) {
  const response = await fetch('http://localhost:3001/users-data')
  const users = await response.json()

  const user = users.find((user) => user.uid === uid);

  modalHeader.textContent = 'Edit User Info';

  modalBody.innerHTML = Object.keys(user)
    .map((property) => {
      if (property === 'uid') {
        return `<input type="text" id="${property}"  class="update-inputs" value="${user[property]}" placeholder="${property}" disabled />`;
      }
      return `<input type="text" id="${property}"  class="update-inputs" value="${user[property]}" placeholder="${property}" />`;
    })
    .join('');

  modalFooter.innerHTML = `
    <button class="button" onclick="updateUser(${uid})">Save</button>
    <button class="button" onclick="renderReadUser(${uid})">Cancel</button>`;
}

// Operational Functions
async function createUser() {
  const createInputs = document.querySelectorAll('.create-inputs');

  for (const input of createInputs) {
    if (input.value.trim() === '') return alert('invalid input');
  }

  const data = Array.from(createInputs)
    .map(input => ({
      id: input.id,
      value: input.value
    }));

  await fetch("http://localhost:3001/table", {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      uid: uid,
      data: data
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  closeModal();
  renderTable();
}

async function updateUser(uid) {
  const updateInputs = document.querySelectorAll('.update-inputs');

  for (const input of updateInputs) {
    if (input.value.trim() === '') return alert('invalid input');
  }

  const data = Array.from(updateInputs)
    .map(input => ({
      id: input.id,
      value: input.value
    }));

  await fetch("http://localhost:3001/table", {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      uid: uid,
      data: data
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  closeModal();
  await renderTable();
}

async function deleteUser(uid) {
  await fetch("http://localhost:3001/table", {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      uid: uid,
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  closeModal();
  renderTable();
}

function deleteAllUsers() {
  usersData = [];

  renderTable();
}

async function findUser(uid) {
  const response = await fetch('http://localhost:3001/users-data')
  const users = await response.json()

  return users.find((user) => user.uid === uid);
}