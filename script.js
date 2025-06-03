
    let serial = 1;
    const stock = [];
    const sales = [];

    document.getElementById('addProductForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const product = {
        serial: serial++,
        name: document.getElementById('productName').value,
        quantity: parseInt(document.getElementById('productQuantity').value),
        unitType: document.getElementById('productUnitType').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stockedAt: new Date().toLocaleString()
      };
      stock.push(product);
      updateStockTable();
      updateAllProductOptions();
      alert('Product added successfully');
      e.target.reset();
    });

    function updateAllProductOptions() {
      document.querySelectorAll('.productSelect').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = stock.map(item => `<option value="${item.serial}">${item.name} - ₦${item.price}</option>`).join('');
        select.value = currentValue;
      });
    }

    function updateStockTable() {
      const tbody = document.getElementById('stockTableBody');
      tbody.innerHTML = '';
      stock.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${item.serial}</td><td>${item.name}</td><td>${item.unitType}</td><td>₦${item.price}</td><td>${item.quantity}</td><td>${item.stockedAt}</td>`;
        tbody.appendChild(row);
      });
    }

    function calculateTotal() {
      let total = 0;
      document.querySelectorAll('#productInputs > div').forEach(div => {
        const select = div.querySelector('.productSelect');
        const quantity = parseInt(div.querySelector('.quantityInput').value);
        const product = stock.find(p => p.serial === parseInt(select.value));
        if (product && !isNaN(quantity)) {
          total += product.price * quantity;
        }
      });
      document.getElementById('totalAmount').textContent = `Total: ₦${total}`;
    }

    function addProductInput() {
      const container = document.getElementById('productInputs');
      const div = document.createElement('div');
      div.innerHTML = `
        <select class="productSelect" required onchange="calculateTotal()"></select>
        <input type="number" class="quantityInput" placeholder="Quantity" required oninput="calculateTotal()" />
        <button type="button" onclick="this.parentElement.remove(); calculateTotal()">Remove</button>
      `;
      container.appendChild(div);
      updateAllProductOptions();
    }

    addProductInput();

    document.getElementById('salesForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const paymentMode = document.getElementById('paymentMode').value;
      let total = 0;
      let items = [];

      const divs = document.querySelectorAll('#productInputs > div');
      for (let div of divs) {
        const select = div.querySelector('.productSelect');
        const quantity = parseInt(div.querySelector('.quantityInput').value);
        const product = stock.find(p => p.serial === parseInt(select.value));

        if (!product || product.quantity < quantity) {
          alert(`Not enough stock for ${product?.name || 'selected product'}`);
          return;
        }

        product.quantity -= quantity;
        const itemTotal = product.price * quantity;
        total += itemTotal;

        items.push({ name: product.name, unitType: product.unitType, quantity, unitPrice: product.price, total: itemTotal });
      }

      const saleRecord = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        paymentMode,
        items,
        total
      };

      sales.push(saleRecord);
      updateStockTable();
      renderSalesHistory();
      showReceipt(saleRecord);
      renderSalesSummary();
      resetSalesForm();


    });

    function renderSalesHistory() {
      const filter = document.getElementById('filterPayment').value;
      const historyDiv = document.getElementById('salesHistory');
      historyDiv.innerHTML = '';

      sales.filter(sale => !filter || sale.paymentMode === filter).forEach(sale => {
        const div = document.createElement('div');
        div.textContent = `${sale.date} - ₦${sale.total} (${sale.paymentMode})`;
        div.style.cursor = 'pointer';
        div.onclick = () => showReceipt(sale);
        historyDiv.appendChild(div);
      });
    }
    
    function resetSalesForm() {
  // Clear all product input fields
  const container = document.getElementById('productInputs');
  container.innerHTML = '';
  addProductInput(); // Add one default product input back

  // Reset the payment mode
  document.getElementById('paymentMode').value = '';

  // Reset the total amount display
  document.getElementById('totalAmount').textContent = 'Total: ₦0';
}

    
    
    function groupSalesBy(timeframe) {
    const groups = {};

    sales.forEach(sale => {
      const date = new Date(sale.date);
      let key = "";

      if (timeframe === "day") {
        key = date.toISOString().split("T")[0]; // e.g., 2025-05-29
      } else if (timeframe === "week") {
        const firstDay = new Date(date);
        firstDay.setDate(date.getDate() - date.getDay()); // Sunday
        key = `Week of ${firstDay.toISOString().split("T")[0]}`;
      } else if (timeframe === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // e.g., 2025-05
      }

      if (!groups[key]) {
        groups[key] = 0;
      }
      groups[key] += sale.total;
    });

    return groups;
  }

  function renderSalesSummary() {
    const summaryDiv = document.getElementById('salesSummary');
    summaryDiv.innerHTML = "";

    ["day", "week", "month"].forEach(type => {
      const grouped = groupSalesBy(type);
      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>${type.charAt(0).toUpperCase() + type.slice(1)}</th>
            <th>Total Sales (₦)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(grouped).map(([key, total]) => `
            <tr>
              <td>${key}</td>
              <td>₦${total.toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>`;
      summaryDiv.appendChild(document.createElement("h3")).innerText = `Sales by ${type}`;
      summaryDiv.appendChild(table);
    });
  }

  // Call this function after each sale is made
  renderSalesSummary();
   resetSalesForm();
    function showReceipt(sale) {
      let text = `Store Angel\nSell Smart, Rest Easy\n\n`;
      sale.items.forEach(item => {
        text += `Product: ${item.name}\nUnit: ${item.quantity} ${item.unitType}\nUnit Price: ₦${item.unitPrice}\nSubtotal: ₦${item.total}\n\n`;
      });
      text += `Total: ₦${sale.total}\nPayment Mode: ${sale.paymentMode}\nDate: ${sale.date}\n\nThank you!`;
      document.getElementById('receiptOutput').textContent = text;
    }

    function printReceipt() {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`<pre>${document.getElementById('receiptOutput').textContent}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }

    function exportToCSV() {
      let csv = 'Date,Payment Mode,Product,Unit,Quantity,Unit Price,Subtotal,Total\n';
      sales.forEach(sale => {
        sale.items.forEach(item => {
          csv += `${sale.date},${sale.paymentMode},${item.name},${item.unitType},${item.quantity},${item.unitPrice},${item.total},${sale.total}\n`;
        });
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'sales_history.csv';
      link.click();
    }

    
function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // Show the selected page
  const nextPage = document.getElementById(pageId);
  nextPage.classList.add('active');
}
