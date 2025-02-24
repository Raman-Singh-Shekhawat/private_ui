// Global variables
let currentUser = null;
let bills = [];
let complaints = [];

// Utility functions
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function generateRandomId(length) {
    return Math.random().toString().substr(2, length);
}

// Login handling
function handleLogin(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;

    // Verify credentials
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const validUser = users.find(user => 
        user.userId === userId && user.password === password
    );

    if (validUser) {
        currentUser = {
            userId: validUser.userId,
            name: validUser.name
        };
        document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}`;
        showSection('dashboardSection');
        generateDummyBills();
        generateDummyComplaints();
    } else {
        alert('Invalid User ID or Password!');
    }
    return false;
}

// Registration handling
function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    
    // Get form values
    const userId = document.getElementById('regUserId').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const customerName = document.getElementById('customerName').value;
    const email = document.getElementById('email').value;

    // Validation checks
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    // Check existing users
    const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    if (users.some(user => user.userId === userId)) {
        alert('User ID already exists!');
        return false;
    }

    // Create user object
    const newUser = {
        userId: userId,
        password: password,
        name: customerName,
        email: email,
        consumerId: generateRandomId(13)
    };

    // Save to local storage
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>Registration Successful!</h3>
        <p>Customer ID: ${newUser.consumerId}</p>
        <p>Customer Name: ${customerName}</p>
        <p>Email: ${email}</p>
    `;

    // Replace form with success message
    const registrationSection = document.getElementById('registrationSection');
    registrationSection.replaceChild(successMessage, form);

    // Return to login after 3 seconds
    setTimeout(() => {
        registrationSection.removeChild(successMessage);
        registrationSection.appendChild(form);
        form.reset();
        showSection('loginSection');
    }, 3000);

    return false;
}
// Bill payment handling
function generateDummyBills() {
    bills = [
        { id: 1, month: 'January', amount: 1500 },
        { id: 2, month: 'February', amount: 1800 },
        { id: 3, month: 'March', amount: 2000 }
    ];
    displayBills();
}

function displayBills() {
    const billsList = document.getElementById('billsList');
    billsList.innerHTML = bills.map(bill => `
        <div class="bill-item">
            <span>${bill.month} Bill: ₹${bill.amount}</span>
            <input type="checkbox" onchange="updateTotalAmount()" data-amount="${bill.amount}">
        </div>
    `).join('');
    document.getElementById('paymentDetails').style.display = 'block';
}

function updateTotalAmount() {
    const selectedBills = document.querySelectorAll('#billsList input[type="checkbox"]:checked');
    const totalAmount = Array.from(selectedBills)
        .reduce((sum, checkbox) => sum + parseFloat(checkbox.dataset.amount), 0);
    const pgCharge = totalAmount * 0.02; // 2% payment gateway charge

    document.getElementById('billAmount').textContent = totalAmount.toFixed(2);
    document.getElementById('pgCharge').textContent = pgCharge.toFixed(2);
    document.getElementById('totalPayable').textContent = (totalAmount + pgCharge).toFixed(2);
}

function proceedToPayment() {
    const totalAmount = parseFloat(document.getElementById('totalPayable').textContent);
    if (totalAmount > 0) {
        showSection('cardPaymentSection');
    } else {
        alert('Please select at least one bill to pay');
    }
}

function handleCardPayment(event) {
    event.preventDefault();
    const transactionId = generateRandomId(10);
    const amount = document.getElementById('totalPayable').textContent;
    
    const receiptContent = `
        Transaction ID: ${transactionId}
        Amount Paid: ₹${amount}
        Date: ${new Date().toLocaleDateString()}
        Status: Success
    `;
    
    // Create download link
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transactionId}.txt`;
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>Payment Successful!</h3>
        <p>Transaction ID: ${transactionId}</p>
        <p>Amount Paid: ₹${amount}</p>
        <button onclick="window.location.href='${url}'" download="receipt.txt">Download Receipt</button>
        <div id="countdown">Redirecting in 5 seconds...</div>
    `;
    
    event.target.replaceWith(successMessage);
    // setTimeout(() => showDashboard(), 15000);

    let seconds = 10;
    const updateCountdown = () => {
        document.getElementById('countdown').textContent = 
            `Redirecting in ${seconds} seconds...`;
        
        if(seconds-- <= 0) {
            window.location.href = "index.html";
        }
    };
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    

    return false;
}

// Complaint handling
function updateCategories() {
    const complaintType = document.getElementById('complaintType').value;
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    const categories = {
        billing: ['Wrong Bill', 'Bill Not Received', 'Payment Issues'],
        voltage: ['High Voltage', 'Low Voltage', 'Voltage Fluctuation'],
        disruption: ['Daily Disruption', 'Weekly Disruption', 'Irregular Supply'],
        streetlight: ['Not Working', 'Dim Light', 'Broken Pole'],
        pole: ['Leaning Pole', 'Broken Pole', 'Wire Issues']
    };
    
    if (categories[complaintType]) {
        categories[complaintType].forEach(category => {
            const option = document.createElement('option');
            option.value = category.toLowerCase().replace(/\s+/g, '-');
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }
}

function handleComplaintRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const complaintId = generateRandomId(8);
    
    // Add complaint to the list
    complaints.push({
        id: complaintId,
        type: form.complaintType.value,
        category: form.category.value,
        description: form.problemDescription.value,
        status: 'Under Review',
        date: new Date().toLocaleDateString()
    });
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>Complaint Registered Successfully</h3>
        <p>Complaint ID: ${complaintId}</p>
        <p>We will process your complaint shortly.</p>
    `;
    
    form.replaceWith(successMessage);
    setTimeout(() => showDashboard(), 3000);
    return false;
}

// Handle complaint form cancel
function handleComplaintCancel() {
    const form = document.getElementById('complaintForm');
    form.reset();
    // Reset the category dropdown as well
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    showSection('dashboardSection');    
    return false;
}

function cancelPayment() {
    const modal = document.getElementById('paymentFailedModal');
    modal.style.display = 'flex';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentFailedModal');
    modal.style.display = 'none';
    // showSection('dashboardSection');
}
// Complaint Status handling
function generateDummyComplaints() {
    // Add some dummy complaints for testing
    complaints = [
        {
            id: generateRandomId(8),
            type: 'billing',
            category: 'Wrong Bill',
            description: 'Incorrect amount in March bill',
            status: 'Under Review',
            date: '2024-03-15'
        },
        {
            id: generateRandomId(8),
            type: 'voltage',
            category: 'Voltage Fluctuation',
            description: 'Frequent voltage fluctuations in evening',
            status: 'In Progress',
            date: '2024-03-10'
        }
    ];
}

function displayComplaints() {
    const complaintsList = document.getElementById('complaintsList');
    if (complaints.length === 0) {
        complaintsList.innerHTML = '<p>No complaints found.</p>';
        return;
    }

    complaintsList.innerHTML = complaints.map(complaint => `
        <div class="complaint-item">
            <div class="complaint-header">
                <h3>Complaint ID: ${complaint.id}</h3>
                <span class="status ${complaint.status.toLowerCase().replace(/\s+/g, '-')}">
                    ${complaint.status}
                </span>
            </div>
            <div class="complaint-details">
                <p><strong>Type:</strong> ${complaint.type}</p>
                <p><strong>Category:</strong> ${complaint.category}</p>
                <p><strong>Description:</strong> ${complaint.description}</p>
                <p><strong>Date:</strong> ${complaint.date}</p>
            </div>
        </div>
    `).join('');
}

// Navigation functions
function showDashboard() {
    showSection('dashboardSection');
}

function showBillPayment() {
    showSection('billPaymentSection');
    displayBills();
}

function showComplaintRegistration() {
    showSection('complaintSection');
}

function showComplaintStatus() {
    showSection('complaintStatusSection');
    displayComplaints();
}

function logout() {
    currentUser = null;
    complaints = [];
    bills = [];
    showSection('loginSection');
    document.getElementById('loginForm').reset();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    showSection('loginSection');
});