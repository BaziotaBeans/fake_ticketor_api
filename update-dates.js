const fs = require('fs');
const path = require('path');

// Ler o arquivo db.json
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Obter data de hoje
const today = new Date();
today.setHours(0, 0, 0, 0);

// Função para formatar data no formato DD/MM/YYYY
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Função para adicionar dias a uma data
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Coletar todas as datas únicas dos showtimes
const uniqueDates = new Set();
db.showtimes.forEach(showtime => {
  if (showtime.date) {
    uniqueDates.add(showtime.date);
  }
});

// Criar um mapeamento de datas antigas para novas
// Distribuir as datas pelos próximos 14 dias (começando de amanhã)
const dateMapping = new Map();
const sortedOldDates = Array.from(uniqueDates).sort();
let dayOffset = 1; // Começar de amanhã

sortedOldDates.forEach((oldDate, index) => {
  // Distribuir as datas pelos próximos 14 dias
  const newDate = addDays(today, dayOffset);
  dateMapping.set(oldDate, formatDate(newDate));
  
  // Avançar para o próximo dia, mas não mais que 14 dias no futuro
  dayOffset = (dayOffset % 14) + 1;
});

// Atualizar todas as datas nos showtimes
db.showtimes.forEach(showtime => {
  if (showtime.date && dateMapping.has(showtime.date)) {
    showtime.date = dateMapping.get(showtime.date);
  }
});

// Salvar o arquivo atualizado
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log('Datas atualizadas com sucesso!');
console.log(`Total de showtimes atualizados: ${db.showtimes.length}`);
console.log('\nMapeamento de datas:');
dateMapping.forEach((newDate, oldDate) => {
  console.log(`  ${oldDate} -> ${newDate}`);
});
