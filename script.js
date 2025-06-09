document.addEventListener('DOMContentLoaded', () => {
    // Prevent default touch behaviors that might interfere
    document.body.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch-zoom
        }
    }, { passive: false });

    const hoursWorkedInput = document.getElementById('hoursWorked');
    const totalTotalPayOutput = document.getElementById('totalTotalPay');
    const serviceTypeInput = document.getElementById('serviceType');
    let entries = [];
    const dateInput = document.getElementById('date');
    const serviceNameInput = document.getElementById('serviceName');

    const selectedPriceDiv = document.createElement('div');
    selectedPriceDiv.classList.add('selected-price');
    serviceTypeInput.parentNode.parentNode.insertBefore(selectedPriceDiv, serviceTypeInput.parentNode.nextSibling);

    function calculate() {
        const hours = parseFloat(hoursWorkedInput.value);
        const date = dateInput.value;
        const serviceName = serviceNameInput.value;
        const serviceType = serviceTypeInput.value;
        const additionalPricesTable = document.getElementById('additionalPricesTable');
        const priceInput = additionalPricesTable.querySelector(`[data-description="${serviceType}"]`);
        const additionalPrice = priceInput ? parseFloat(priceInput.value) : 0;

        if (!hours) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const totalPay = hours * additionalPrice;
        
        updateSelectedPrice(serviceType);

        totalTotalPayOutput.innerHTML = `Total: <span>$${totalPay.toFixed(2)}</span>`;

        const newEntry = { date, hours, totalPay, serviceName, serviceType, additionalPrice };
        entries.push(newEntry);

    }

    function updateSelectedPrice(serviceType) {
        const additionalPricesTable = document.getElementById('additionalPricesTable');
        const priceInput = additionalPricesTable.querySelector(`[data-description="${serviceType}"]`);
        const additionalPrice = priceInput ? parseFloat(priceInput.value) : 0;
        selectedPriceDiv.textContent = `Precio: $${additionalPrice.toFixed(2)}`;
    }

    hoursWorkedInput.addEventListener('change', calculate);
    dateInput.addEventListener('change', calculate);
    serviceNameInput.addEventListener('change', calculate);
    serviceTypeInput.addEventListener('change', () => {
        const selectedServiceType = serviceType.value;
        updateSelectedPrice(selectedServiceType);
        calculate();
    });

    const priceInputs = document.querySelectorAll('.price-input');
    priceInputs.forEach(input => {
        input.addEventListener('change', () => {
            const description = input.dataset.description;
            const newPrice = parseFloat(input.value);
            console.log(`Price for ${description} changed to ${newPrice}`);
            // Here you might want to update a data structure or perform other actions
            // based on the change in price.
        });
    });

    const lockButton = document.createElement('button');
    lockButton.id = 'lockButton';
    lockButton.classList.add('lock-button');
    lockButton.textContent = 'Bloquear precios';
    const additionalPricesTable = document.getElementById('additionalPricesTable');
    additionalPricesTable.parentNode.appendChild(lockButton);

    let isLocked = localStorage.getItem('isLocked') === 'true' || false;

    function updateLockState() {
        if (isLocked) {
            lockButton.textContent = 'Desbloquear precios';
            priceInputs.forEach(input => {
                input.classList.add('locked-input');
                input.disabled = true;
            });
        } else {
            lockButton.textContent = 'Bloquear precios';
            priceInputs.forEach(input => {
                input.classList.remove('locked-input');
                input.disabled = false;
            });
        }
        localStorage.setItem('isLocked', isLocked);
    }

    lockButton.addEventListener('click', () => {
        isLocked = !isLocked;
        updateLockState();
        saveAdditionalPricesToLocalStorage(); // Save prices when lock state changes
    });

    priceInputs.forEach(input => {
        input.disabled = false;
    });

    // Update totalTotalPayOutput with the result of hoursWorkedInput * additionalPrice
    function updateTotalPayOutput() {
        const additionalPricesTable = document.getElementById('additionalPricesTable');
        const priceInput = additionalPricesTable.querySelector(`[data-description="${serviceTypeInput.value}"]`);
        const additionalPrice = priceInput ? parseFloat(priceInput.value) : 0;
        const hours = parseFloat(hoursWorkedInput.value);

        if (!hours || !additionalPrice) {
            totalTotalPayOutput.innerHTML = `Total: <span>$0.00</span>`;
            return;
        }

        const totalPay = hours * additionalPrice;
        totalTotalPayOutput.innerHTML = `Total: <span>$${totalPay.toFixed(2)}</span>`;
    }

    // Add event listeners to hoursWorkedInput, serviceTypeInput, and priceInputs to call updateTotalPayOutput on change
    hoursWorkedInput.addEventListener('change', updateTotalPayOutput);
    serviceTypeInput.addEventListener('change', () => {
        updateTotalPayOutput();
        const selectedServiceType = serviceTypeInput.value;
        updateSelectedPrice(selectedServiceType);
    });
    priceInputs.forEach(input => {
        input.addEventListener('change', updateTotalPayOutput);
    });

    // Call updateTotalPayOutput on page load to initialize the total pay output
    updateTotalPayOutput();

    // Save Button Functionality
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Guardar';
    saveButton.addEventListener('click', saveEntry);

    const buttonGroup = document.querySelector('.button-group');
    buttonGroup.appendChild(saveButton);

    const viewDetailsButton = document.getElementById('viewDetailsButton');
    viewDetailsButton.addEventListener('click', () => {
        window.location.href = 'details.html';
    });

    // Donations Button Functionality
    const donationsButton = document.getElementById('donationsButton');
    donationsButton.addEventListener('click', () => {
        window.location.href = 'donations.html';
    });
    

    // Details Table
    const detailsTable = document.createElement('table');
    detailsTable.id = 'details';
    const tableHeader = detailsTable.createTHead();
    const headerRow = tableHeader.insertRow();
    const headers = ['Fecha', 'Servicio', 'Tipo', 'Horas', 'Precio', 'Total'];
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    const tableBody = detailsTable.createTBody();
    document.querySelector('.calculator').appendChild(detailsTable);

    function saveEntry() {
        const date = dateInput.value;
        const serviceName = serviceNameInput.value;
        const serviceType = serviceTypeInput.value;
        const hours = parseFloat(hoursWorkedInput.value);
        const additionalPricesTable = document.getElementById('additionalPricesTable');
        const priceInput = additionalPricesTable.querySelector(`[data-description="${serviceType}"]`);
        const additionalPrice = priceInput ? parseFloat(priceInput.value) : 0;

        const totalPay = hours * additionalPrice;

        const newRow = tableBody.insertRow();
        const rowData = [date, serviceName, serviceType, hours, additionalPrice, totalPay.toFixed(2)];
        rowData.forEach(text => {
            const cell = newRow.insertCell();
            cell.textContent = text;
        });

        // Modify delete button creation
        const deleteCell = newRow.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✖';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', () => {
            tableBody.removeChild(newRow);
            updateTotals();
            saveDataToLocalStorage(); // Save data after deletion
        });
        deleteCell.appendChild(deleteButton);

        // Optional: Clear the input fields after saving
        dateInput.value = '';
        serviceNameInput.value = '';
        serviceTypeInput.value = '';
        hoursWorkedInput.value = '8';
        updateTotalPayOutput();
        updateTotals();
        saveDataToLocalStorage(); // Save data after saving
    }

    function updateTotals() {
        let totalHours = 0;
        let totalEarned = 0;

        for (let i = 0; i < tableBody.rows.length; i++) {
            const row = tableBody.rows[i];
            totalHours += parseFloat(row.cells[3].textContent);
            totalEarned += parseFloat(row.cells[5].textContent);
        }

        document.getElementById('totalHours').textContent = totalHours.toFixed(2);
        document.getElementById('totalEarned').textContent = totalEarned.toFixed(2);
    }

    function saveDataToLocalStorage() {
        const data = [];
        for (let i = 0; i < tableBody.rows.length; i++) {
            const row = tableBody.rows[i];
            const rowData = [];
            for (let j = 0; j < row.cells.length - 1; j++) { // Exclude the delete button cell
                rowData.push(row.cells[j].textContent);
            }
            data.push(rowData);
        }
        localStorage.setItem('detailsTableData', JSON.stringify(data));
    }

    function loadDataFromLocalStorage() {
        const data = localStorage.getItem('detailsTableData');
        if (data) {
            const parsedData = JSON.parse(data);
            parsedData.forEach(rowData => {
                const newRow = tableBody.insertRow();
                rowData.forEach(text => {
                    const cell = newRow.insertCell();
                    cell.textContent = text;
                });

                // Modify delete button creation
                const deleteCell = newRow.insertCell();
                const deleteButton = document.createElement('button');
                deleteButton.textContent = '✖';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => {
                    tableBody.removeChild(newRow);
                    updateTotals();
                    saveDataToLocalStorage(); // Save data after deletion
                });
                deleteCell.appendChild(deleteButton);
            });
            updateTotals();
        }
    }

    // Function to save additional prices to local storage
    function saveAdditionalPricesToLocalStorage() {
        const prices = {};
        priceInputs.forEach(input => {
            prices[input.dataset.description] = input.value;
        });
        localStorage.setItem('additionalPrices', JSON.stringify(prices));
    }

    // Function to load additional prices from local storage
    function loadAdditionalPricesFromLocalStorage() {
        const prices = localStorage.getItem('additionalPrices');
        if (prices) {
            const parsedPrices = JSON.parse(prices);
            priceInputs.forEach(input => {
                const description = input.dataset.description;
                if (parsedPrices[description]) {
                    input.value = parsedPrices[description];
                }
            });
        }
    }

    // Call loadAdditionalPricesFromLocalStorage on page load
    loadAdditionalPricesFromLocalStorage();
    updateLockState();
    
    priceInputs.forEach(input => {
        input.addEventListener('change', () => {
            saveAdditionalPricesToLocalStorage();
        });
    });
    
    // Initialize totals on page load
    loadDataFromLocalStorage();
    updateTotals();

    // Add vibration feedback for buttons (if supported)
    function addVibrationFeedback(element) {
        if ('vibrate' in navigator) {
            element.addEventListener('click', () => {
                navigator.vibrate(50); // Short vibration
            });
        }
    }

    // Apply vibration to key interactive elements
    const interactiveElements = [
        saveButton, 
        lockButton, 
        donationsButton, 
        viewDetailsButton,
        ...document.querySelectorAll('.delete-btn')
    ];

    interactiveElements.forEach(addVibrationFeedback);
});