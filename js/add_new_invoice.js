var rows = 0;
class MedicineInfo {
  constructor(name, batch_id, expiry_date, quantity, mrp, discount, total) {
    this.name = name;
    this.batch_id = batch_id;
    this.expiry_date = expiry_date;
    this.quantity = quantity;
    this.mrp = mrp;
    this.discount = discount;
    this.total = total;
  }
}

function addRow() {
  if(typeof addRow.counter == 'undefined')
    addRow.counter = 1;
  var previous = document.getElementById("invoice_medicine_list_div").innerHTML;
  var node = document.createElement("div");
  var cls = document.createAttribute("id");
  cls.value = "medicine_row_" + addRow.counter;
  node.setAttributeNode(cls);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200) {
      node.innerHTML = xhttp.responseText;
      document.getElementById("invoice_medicine_list_div").appendChild(node);
    }
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=add_row&row_id=" + cls.value + "&row_number=" + addRow.counter, true);
  xhttp.send();
  addRow.counter++;
  rows++;
}

function removeRow(row_id) {
  if(rows == 1)
    alert("Can't delete only one row is there!");
  else {
    document.getElementById(row_id).remove();
    rows--;
  }
}

function getInvoiceNumber() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      document.getElementById("invoice_number").value = xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=current_invoice_number", true);
  xhttp.send();
}

function medicineOptions(text, id) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      document.getElementById(id).innerHTML = xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=medicine_list&text=" + text.trim(), true);
  xhttp.send();
}

function fillFields(medicine_name, id) {
  fill(medicine_name, 'batch_id_' + id, 'BATCH_ID');
  fill(medicine_name, 'available_quantity_' + id, 'QUANTITY');
  fill(medicine_name, 'expiry_date_' + id, 'EXPIRY_DATE');
  fill(medicine_name, 'mrp_' + id, 'MRP');
  getTotal(id);
  var expiry_date = document.getElementById('expiry_date_' + id).value;
  if(checkExpiry(expiry_date, 'medicine_name_error_' + id) != -1)
    document.getElementById("medicine_name_error_" + id).style.display = "none";
  else
    return;
  var available_quantity = document.getElementById("available_quantity_" + id).value;
  if(!checkAvailableQuantity(available_quantity, id))
    return;
  document.getElementById("medicine_name_" + id).blur();
}

function fill(name, field_name, column) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      document.getElementById(field_name).value = xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=fill&name=" + name + "&column=" + column, false);
  xhttp.send();
}

function getTotal(id) {
  var mrp = document.getElementById("mrp_" + id).value;
  var qty = document.getElementById("quantity_" + id).value;
  if(!checkQuantity(qty, 'quantity_error_' + id)) return;
  var discount = document.getElementById("discount_" + id).value;
  if(!checkValue(discount, 'discount_error_' + id)) return;
  var total = document.getElementById("total_" + id);
  total.value = mrp * qty - (discount * mrp * qty / 100);

  // net total , discount and total Amount
  var parent = document.getElementById('invoice_medicine_list_div');
  var row_count = parent.childElementCount;
  var medicine_info = parent.children;
  var total_amount = 0;
  var total_discount = 0;
  var net_total = 0;
  for(var i = 1; i < row_count; i++) {
    qty = Number.parseInt(medicine_info[i].children[0].children[4].children[0].value);
    mrp = Number.parseFloat(medicine_info[i].children[0].children[5].children[0].value);
    discount = (qty * mrp * Number.parseFloat(medicine_info[i].children[0].children[6].children[0].value)) / 100;

    total_amount += (qty * mrp);
    total_discount += discount;
  }
  net_total = total_amount - total_discount;
  document.getElementById("total_amount").value = total_amount;
  document.getElementById("total_discount").value = total_discount;
  document.getElementById("net_total").value = net_total;
}

function checkAvailableQuantity(value, id) {
  var medicine_name = document.getElementById("medicine_name_" + id).value;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=check_quantity&medicine_name=" + medicine_name, false);
  xhttp.send();
  if(Number.parseInt(xhttp.responseText) == 0) {
    document.getElementById("medicine_name_error_" + id).style.display = "block";
    document.getElementById("medicine_name_error_" + id).innerHTML = "Out of Stock!";
    return -1;
  }
  else if(value > Number.parseInt(xhttp.responseText)) {
    document.getElementById("quantity_error_" + id).style.display = "block";
    document.getElementById("quantity_error_" + id).innerHTML = "only " + xhttp.responseText + " in stock!";
    return -2;
  }
  return 999;
}

function getChange(paid_amt) {
  var net_total = document.getElementById("net_total").value;
  document.getElementById("change_amt").value = paid_amt - net_total;
}

function isCustomer(name, contact_number) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=is_customer&name=" + name + "&contact_number=" + contact_number, false);
  xhttp.send();
  return xhttp.responseText;
}

function isInvoiceExist(invoice_number) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=is_invoice&invoice_number=" + invoice_number, false);
  xhttp.send();
  return xhttp.responseText;
}

function isMedicine(name) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=is_medicine&name=" + name, false);
  xhttp.send();
  return xhttp.responseText;
}

// Define the function globally
function sendPurchaseNotification() {
  // Get the customer email from the input field
  var email = document.getElementById("customer_email").value;
  var customer = document.getElementById("customers_name").value;
  var netTotal = document.getElementById("net_total").value;

  // Build the template parameters.
  // Make sure these keys (like "to_email", "customer_name", etc.) exactly match your EmailJS template's variable names.
  var templateParams = {
    to_email: email,
    customer_name: customer,
    total: netTotal,
    message: "Thanks for your purchase!"
  };

  console.log("Sending email with:", templateParams);

  emailjs.send("service_x46cd5r", "template_rhi2m66", templateParams)
    .then(function(response) {
      console.log("SUCCESS!", response.status, response.text);
      alert("Email sent to " + email);
    }, function(error) {
      console.error("FAILED...", error);
      alert("Failed to send email. Check console for details.");
    });
}

// Your addInvoice() function
function addInvoice() {
  // Save invoice variables
  var customers_name = document.getElementById('customers_name');
  var customers_contact_number = document.getElementById('customers_contact_number');
  var invoice_number = document.getElementById('invoice_number');
  var payment_type = document.getElementById('payment_type');
  var invoice_date = document.getElementById('invoice_date');
  // Capture the Email field value
  var customer_email = document.getElementById('customer_email').value;
  
  // Validation
  if(!notNull(customers_name.value, "customer_name_error")) {
    customers_name.focus();
    return false;
  }
  else if(isCustomer(customers_name.value, customers_contact_number.value) === "false") {
    document.getElementById("customer_name_error").style.display = "block";
    document.getElementById("customer_name_error").innerHTML = "Customer doesn't exist!";
    customers_name.focus();
    return false;
  }
  else if(isInvoiceExist(invoice_number.value) === "true") {
    document.getElementById("invoice_acknowledgement").innerHTML = "Already saved Invoice!";
    return false;
  }
  else if(!checkDate(invoice_date.value, 'date_error')) {
    invoice_date.focus();
    return false;
  }
  else {
    // Process medicine rows
    var parent = document.getElementById('invoice_medicine_list_div');
    var row_count = parent.childElementCount;
    var medicine_info = parent.children;
    var medicines = new Array(row_count - 1);
  
    for(var i = 1; i < row_count; i++) {
      var elements = medicine_info[i].children;
  
      var medicine_name = elements[0].children[0].children[0];
      var medicine_name_error = elements[0].children[0].children[1];
      var batch_id = elements[0].children[1].children[0];
      var expiry_date = elements[0].children[3].children[0];
      var quantity = elements[0].children[4].children[0];
      var quantity_error = elements[0].children[4].children[1];
      var mrp = elements[0].children[5].children[0];
      var discount = elements[0].children[6].children[0];
      var discount_error = elements[0].children[6].children[1];
      var total = elements[0].children[7].children[0];
  
      var total_amount = document.getElementById("total_amount");
      var total_discount = document.getElementById("total_discount");
      var net_total = document.getElementById("net_total");
  
      var flag = false;
      var isAvailable = checkAvailableQuantity(quantity.value, quantity.getAttribute('id').slice(9, 10));
  
      if(!notNull(medicine_name.value, medicine_name_error.getAttribute('id'))) {
        medicine_name.focus();
        return false;
      }
      else if(isMedicine(medicine_name.value) === "false") {
        medicine_name_error.style.display = "block";
        medicine_name_error.innerHTML = "Medicine doesn't exist!";
        medicine_name.focus();
        return false;
      }
      else if(!checkExpiry(expiry_date.value, medicine_name_error.getAttribute('id')) ||
              checkExpiry(expiry_date.value, medicine_name_error.getAttribute('id')) === -1) {
        medicine_name.focus();
        return false;
      }
      else if(isAvailable === -1) {
        medicine_name_error.style.display = "block";
        medicine_name.focus();
        return false;
      }
      else if(!checkQuantity(quantity.value, quantity_error.getAttribute('id'))) {
        quantity.focus();
        return false;
      }
      else if(quantity.value == 0) {
        quantity_error.style.display = "block";
        quantity_error.innerHTML = "Increase quantity or remove row!";
        quantity.focus();
        return false;
      }
      else if(isAvailable === -2) {
        quantity_error.style.display = "block";
        quantity.focus();
        return false;
      }
      else if(!checkValue(discount.value, discount_error.getAttribute('id'))) {
        discount.focus();
        return false;
      }
      else {
        flag = true;
        medicines[i - 1] = new MedicineInfo(
          medicine_name.value, batch_id.value, expiry_date.value,
          quantity.value, mrp.value, discount.value, total.value
        );
      }
    } // End medicine loop
  
    // Process each medicine: update stock and add sale record
    for(var i = 0; i < row_count - 1; i++) {
      updateStock(medicines[i].name, medicines[i].batch_id, medicines[i].quantity);
      addSale(
        customers_name.value, customers_contact_number.value, invoice_number.value,
        medicines[i].name, medicines[i].batch_id, medicines[i].expiry_date,
        medicines[i].quantity, medicines[i].mrp, medicines[i].discount, medicines[i].total
      );
    }
  
    // Save the invoice along with email data
    addNewInvoice(
      customers_name.value, customers_contact_number.value, customer_email,
      invoice_date.value, total_amount.value, total_discount.value, net_total.value
    );
  
    // Update UI: hide save, show new invoice and print buttons
    document.getElementById("save_button").style.display = "none";
    document.getElementById("new_invoice_button").style.display = "block";
    document.getElementById("print_button").style.display = "block";
    
    // Now, call the email function after invoice is saved
    sendPurchaseNotification();
  }
  
  return false;
}


function updateStock(name, batch_id, quantity) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=update_stock&name=" + name + "&batch_id=" + batch_id + "&quantity=" + quantity, true);
  xhttp.send();
}

function addSale(customers_name, customers_contact_number, invoice_number, medicine_name, batch_id, expiry_date, quantity, mrp, discount, total) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      xhttp.responseText;
  };
  xhttp.open("GET", "php/add_new_invoice.php?action=add_sale&customers_name=" + customers_name + "&customers_contact_number=" + customers_contact_number + "&invoice_number=" + invoice_number + "&medicine_name=" + medicine_name + "&batch_id=" + batch_id + "&expiry_date=" + expiry_date +  "&quantity=" + quantity + "&mrp=" + mrp + "&discount=" + discount + "&total=" + total, true);
  xhttp.send();
}

function addNewInvoice(customers_name, customers_contact_number, customer_email, invoice_date, total_amount, total_discount, net_total) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200)
      document.getElementById("invoice_acknowledgement").innerHTML = xhttp.responseText;
  };
  // Include customer_email in the query string
  xhttp.open("GET", "php/add_new_invoice.php?action=add_new_invoice&customers_name=" + customers_name + "&customers_contact_number=" + customers_contact_number + "&customer_email=" + encodeURIComponent(customer_email) + "&invoice_date=" + invoice_date + "&total_amount=" + total_amount + "&total_discount=" + total_discount + "&net_total=" + net_total, true);
  xhttp.send();
}
// 1. Load and initialize the EmailJS SDK (make sure this is after the SDK script tag in your HTML)








// Other functions, event handlers, etc.

