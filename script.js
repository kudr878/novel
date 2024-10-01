let giftCatalog = [
  { name: 'Игрушка-робот', price: 30 },
  { name: 'Набор красок', price: 15 },
  { name: 'Конструктор', price: 40 },
  { name: 'Настольная игра', price: 25 },
];

let budget = 35,
  selectedGift;

for (var i = 0; i < giftCatalog.length; i++) {
  if (giftCatalog[i].price <= budget) {
    selectedGift = giftCatalog[i].name;
    break;
  }
}

console.log('Выбранный подарок: ' + selectedGift);
