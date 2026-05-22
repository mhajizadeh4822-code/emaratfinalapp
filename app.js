let masterItems = [];

let counts = JSON.parse(localStorage.getItem('counts') || '[]');

let editIndex = null;

// 📥 خواندن فایل اکسل
excelInput.onchange = e => {

  const reader = new FileReader();

  reader.onload = () => {

    const wb = XLSX.read(reader.result, {
      type: 'binary'
    });

    const data = XLSX.utils.sheet_to_json(
      wb.Sheets[wb.SheetNames[0]]
    );

    masterItems = data.map(x => ({
      code: String(x.ItemCode || '').trim(),
      name: String(x.ItemName || '').trim(),
      group: String(x.ItemGroup || '').trim(),
      unit: String(x.Unit || '').trim()
    }));

    alert('لیست کالاها بارگذاری شد');

  };

  reader.readAsBinaryString(e.target.files[0]);

};

// 🔍 جستجوی زنده
searchInput.addEventListener('input', () => {

  const q = searchInput.value
    .trim()
    .toLowerCase();

  searchResults.innerHTML = '';

  if (!q) {

    searchResults.style.display = 'none';

    return;
  }

  const results = masterItems.filter(x =>

    x.code.toLowerCase().startsWith(q) ||

    x.name.toLowerCase().includes(q)

  );

  searchResults.style.display =
    results.length ? 'block' : 'none';

  results.slice(0, 10).forEach(item => {

    const div = document.createElement('div');

    div.className = 'result-item';

    div.innerText =
      ${item.code} - ${item.name};

    div.onclick = () => selectItem(item);

    searchResults.appendChild(div);

  });

});

// انتخاب کالا
function selectItem(item) {

  itemCode.value = item.code;

  itemName.value = item.name;

  itemGroup.value = item.group;

  unitText.innerText =
    واحد: ${item.unit || '-'};

  searchResults.style.display = 'none';

}

// 📷 اسکن QR
let qr;

function startScan() {

  qr = new Html5Qrcode("reader");

  qr.start(
    {
      facingMode: "environment"
    },
    {
      fps: 10,
      qrbox: 250
    },
    txt => {

      const code = txt.split('|')[0];

      const item =
        masterItems.find(x => x.code === code);

      if (item)
        selectItem(item);

      qr.stop();

    }
  );

}

// 💾 ذخیره / ویرایش
function saveCount() {

  if (!itemCode.value || !qty.value) {

    alert('کالا و مقدار را وارد کنید');

    return;
  }

  if (editIndex !== null) {

    counts[editIndex].qty = qty.value;

    editIndex = null;

  } else {

    counts.push({

      code: itemCode.value,

      name: itemName.value,

      qty: qty.value,

      unit: unitText.innerText.replace('واحد: ', ''),

      date: new Date().toLocaleDateString('fa-IR')

    });

  }

  localStorage.setItem(
    'counts',
    JSON.stringify(counts)
  );

  renderList();

  qty.value = '';

}

// 📋 نمایش جدول
function renderList() {

  list.innerHTML = `
<tr>
<th>کد</th>
<th>نام</th>
<th>مقدار</th>
<th>واحد</th>
<th>عملیات</th>
</tr>
`;

  counts.forEach((x, i) => {

    list.innerHTML += `
<tr>

<td>${x.code}</td>

<td>${x.name}</td>

<td>${x.qty}</td>

<td>${x.unit}</td>

<td class="actions">

<button onclick="editRow(${i})">
✏️
</button>

<button onclick="deleteRow(${i})">
❌
</button>

</td>

</tr>
`;

  });

}

// ✏️ ویرایش
function editRow(i) {

  const x = counts[i];

  itemCode.value = x.code;

  itemName.value = x.name;

  itemGroup.value = '';

  qty.value = x.qty;

  unitText.innerText =
    'واحد: ' + x.unit;

  editIndex = i;

}

// ❌ حذف
function deleteRow(i) {

  if (confirm('رکورد حذف شود؟')) {

    counts.splice(i, 1);

    localStorage.setItem(
      'counts',
      JSON.stringify(counts)
    );

    renderList();

  }

}

// 📤 خروجی اکسل
function exportExcel() {

  const ws =
    XLSX.utils.json_to_sheet(counts);

  const wb =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    'Inventory'
  );

  XLSX.writeFile(
    wb,
    'inventory_' + Date.now() + '.xlsx'
  );

}

renderList();
