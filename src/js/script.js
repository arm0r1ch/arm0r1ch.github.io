// function toggleSlide(item) {
//     $(item).each(function(i) {
//         $(this).on('click', function(e) {
//             e.preventDefault();
//             $('.catalog-item__front').eq(i).toggleClass('catalog-item__front_active');
//             $('.catalog-item__back').eq(i).toggleClass('catalog-item__back_active');
//         });
//     });
// }
// toggleSlide('.catalog-item__link');
// toggleSlide('.catalog-item__backlink');

$(document).ready(function() {
    $(document).on('click', '.catalog-item__link,.catalog-item__backlink', function(e) {
        e.preventDefault();
        console.log('Event listener triggered');
        const $wrapper = $(this).closest('.catalog-item__wrapper');
        $wrapper.find('.catalog-item__front').toggleClass('catalog-item__front_active');
        $wrapper.find('.catalog-item__back').toggleClass('catalog-item__back_active');
    });
});


// $('.catalog-item__link').each(function(i) {
//     $(this).on('click', function(e) {
//         e.preventDefault()
//         $('.catalog-item__front').eq(i).toggleClass('catalog-item__front_active');
//         $('.catalog-item__back').eq(i).toggleClass('catalog-item__back_active');
//     });
// });



let items = [];

function fetchItems() {
  fetch('https://arm0r1ch.github.io/data.json/products')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Выводим полученные данные для отладки
    
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
        }
    
        items = []; // Очищаем массив перед добавлением новых элементов
    
        items = data.map(item => ({
            name: item.subtitle,
            quantity: 1,
            unit: "шт",
            price: parseFloat(item.newPrice.replace(/[^\d.-]/g, '')),
            total: parseFloat(item.newPrice.replace(/[^\d.-]/g, ''))
        }));
    

      const catalog = document.querySelector(".catalog__content_active");
      if (!catalog) {
        throw new Error('Element .catalog__content_active not found');
      }

      catalog.innerHTML = data.map((item, index) => `
        <div class="catalog-item">
          <div class="catalog-item__wrapper">
            <div class="catalog-item__front catalog-item__front_active">
              <img src="${item.img}" class="catalog-item__img">
              <div class="catalog-item__subtitle">${item.subtitle}</div>
              <div class="catalog-item__descr">${item.descr}</div>
              <a href="#" class="catalog-item__link">Подробнее</a>
            </div>
            <ul class="catalog-item__back">
              ${item.details.map(detail => `<li>${detail}</li>`).join('')}
              <a href="#" class="catalog-item__backlink">Назад</a>
            </ul>
          </div>
          <hr>
          <div class="catalog-item__footer">
            <div class="catalog-item__prices">
              <div class="catalog-item__old"><s>${item.oldPrice}</s></div>
              <div class="catalog-item__new">${item.newPrice}</div>
            </div>
            <button class="button button_mini" onclick="generateContract(${index})">Купить</button>
          </div>
        </div>
      `).join('');

      // Добавляем обработчики событий для закрытия модального окна
      const contractModal = document.getElementById('contractModal');
      const contractSpan = document.getElementsByClassName('contract-close')[0];

      contractSpan.onclick = function() {
        closeModal();
      }
      window.onclick = function(event) {
        if (event.target == contractModal) {
          closeModal();
        }
      }
    })
    .catch(error => console.error('Error loading data:', error));
}

function generateContract(productIndex) {
    const product = items[productIndex];
    const modal = document.getElementById('contractModal');
    const userInfoForm = document.getElementById('userInfoForm');

    userInfoForm.onsubmit = function (event) {
        event.preventDefault();
        createPDF(product); // Передаем только выбранный товар
    };

    modal.style.display = 'block';
}

function closeModal() {
  const contractModal = document.getElementById('contractModal');
  contractModal.style.display = 'none';
}

function createPDF(product) {
    const buyerName = document.getElementById('buyerName').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
    const buyerINN = document.getElementById('buyerINN').value;
    const buyerKPP = document.getElementById('buyerKPP').value;

    const totalSum = product.price; // Используем цену выбранного товара вместо общей суммы

  

  const docDefinition = {
    content: [
      { text: 'Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате  обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и паспорта.'},
      { text: 'Счет на оплату № 1 от ' + new Date().toLocaleDateString() + ' г.', style: 'header' },
      { text: 'Поставщик: Общество с ограниченной ответственностью "ИНТЕЛ-ПРОФИ", ИНН 1234567890, тел.: 123-45-67', style: 'subheader' },
      { text: 'Покупатель: ' + buyerName + ', ИНН ' + buyerINN + ', КПП ' + buyerKPP + ', ' + buyerAddress + ', тел.: ' + buyerPhone, style: 'subheader' },
      {
        style: 'table',
        table: {
          widths: ['*', '*', '*', '*', '*'],
          body: [
            [{ text: '№', style: 'tableHeader' }, { text: 'Товар', style: 'tableHeader' }, { text: 'Кол-во', style: 'tableHeader' }, { text: 'Ед.', style: 'tableHeader' }, { text: 'Сумма', style: 'tableHeader' }],
            ...items.map((item, index) => [index + 1, item.name, item.quantity, item.unit, item.total]),
            [{ text: 'Итого:', colSpan: 4, alignment: 'right' }, {}, {}, {}, totalSum + ' руб.']
          ] 
        }
      },
      { text: 'Без налога (НДС)', style: 'subheader' },
      { text: 'Всего наименований ' + items.length + ', на сумму ' + totalSum + ' руб.', style: 'subheader' },
      { text: 'Руководитель: ________________', style: 'signature' },
      { text: 'Бухгалтер: ________________', style: 'signature' }
    ],
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 12, margin: [0, 10, 0, 5] },
      tableHeader: { fontSize: 12, bold: true, fillColor: '#eeeeee' },
      table: { margin: [0, 20, 0, 20] },
      signature: { fontSize: 12, margin: [0, 30, 0, 5] }
    }
  };

  pdfMake.createPdf(docDefinition).download('invoice.pdf');
  closeModal();
}

window.onload = fetchItems;

$(document).ready(function () {
    $('.carousel__inner').slick({
        speed: 1200,
        // adaptiveHeight: true, 
        prevArrow: '<button type="button" class="slick-prev"><img src = "icon/chevron-left-solid.png"></button>',
        nextArrow: '<button type="button" class="slick-next"><img src = "icon/chevron-right-solid.png"></button>',
        responsive: [{
            breakpoint: 992,
            settings: {
                variableWidth: true,
                adaptiveHeight: true,
                infinite: true,
                dots: true,
                arrows: false
            }
        },
        {
            breakpoint: 480, 
            settings: {
                variableWidth: true,
                slidesToShow: 1, 
                slidesToScroll: 1, 
                arrows: false, 
                dots: true
            }
        }]
    }); 
    console.log("Hello");


    // Формирование карточек товаров

    


    
    // Формирование Договора






    $('ul.catalog__tabs').on('click', 'li:not(.catalog__tab_active)', function() {
        $(this)
            .addClass('catalog__tab_active').siblings().removeClass('catalog__tab_active')
            .closest('div.container').find('div.catalog__content').removeClass('catalog__content_active').eq($(this).index()).addClass('catalog__content_active');
    });



    $('[data-modal="consultation"]').on('click', function() {
        $('.overlay, #consultation').fadeIn('slow');
    });

    $('.modal__close').on('click', function() {
        $('.overlay, #consultation, #order, #thanks').fadeOut('slow');
    });
    $('.button_mini').on('click', function() {
        $('.overlay, #order').fadeIn('slow');
    });
    $('.button_mini').each(function(i) {
        $(this).on('click', function() {
            $('#order .modal__descr').text($('.catalog-item__subtitle').eq(i).text());
            $('.overlay #order').fadeIn('slow');
        });
    });
    // Jqueryvalidate


    function validateForms(form) {
        $(form).validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },
                phone: "required",
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                name: {
                    required: "Пожалуйста введите своё имя!",
                    minlength: jQuery.validator.format("Введите {0} символов!")
                },
                phone: "Пожаллуйста введите свой номер телефона",
                email: {
                    required: "Пожалуйста введите адрес электронной почты",
                    email: "Неправильно введён адрес почты"
                }
            }
        });
    }
    validateForms('#consultation-form');
    validateForms('#consultation form');
    validateForms('#order form');


    //MaskedInput

    $('input[name=phone]').mask("+7 (999) 999-99-99");



    // Mail to
    $('form').submit(function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "mailer/smart.php",
            data: $(this).serialize()
        }).done(function() {
            $(this).find("input").val("");
            $('#consultation, #order').fadeOut();
            $('.overlay, #thanks').fadeIn('slow');

            $('form').trigger('reset');
        });
        return false;
    });

    new WOW().init();
});



/* function generateInvoice() {
    const modal = document.getElementById('contractModal');
    const userInfoForm = document.getElementById('userInfoForm');
   
    userInfoForm.onsubmit = function(event) {
    event.preventDefault();
    createPDF();
    };
   
    modal.style.display = 'block';
   }
   
   function closeModal() {
    const contractModal = document.getElementById('contractModal');
    contractModal.style.display = 'none';
   }
   
   function createPDF() {
    const buyerName = document.getElementById('buyerName').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
   
    const doc = new jsPDF();
    doc.setFont("helvetica");
   
    doc.text("Invoice", 10, 10);
    doc.text("Seller: Individual entrepreneur Ivanov I.I.", 10, 20);
    doc.text("TIN 1234567890", 10, 30);
    doc.text("Buyer: " + buyerName, 10, 40);
    doc.text("Buyer's address: " + buyerAddress, 10, 50);
    doc.text("Buyer's phone number: " + buyerPhone, 10, 60);
   
    // Example of adding goods to an invoice
    const items = [
    { name: "Item 1", quantity: 1, unit: "pcs", price: 2000, total: 2000 },
    { name: "Item 2", quantity: 1, unit: "pcs", price: 2600, total: 2600 }
    ];
   
    doc.text("No. Product Qty. Unit Price Amount", 10, 80);
    items.forEach((item, index) => {
    const y = 90 + (index * 10);
    doc.text(`${index + 1} ${item.name} ${item.quantity} ${item.unit} ${item.price} ${item.total}`, 10, y);
    });
   
    const totalSum = items.reduce((sum, item) => sum + item.total, 0);
    doc.text("Total: " + totalSum + " rub.", 10, 110);
    doc.text("Excluding tax (VAT)", 10, 120);
    doc.text("Total items 2, for the amount of " + totalSum + " rub.", 10, 130);
   
    doc.text("Manager: ________________", 10, 150);
    doc.text("Accountant: ________________", 10, 160);
   
    doc.save('invoice.pdf');
    closeModal();
   } */
