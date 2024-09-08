export function parseDate(dateStr) {
    // Expressão regular para remover o "nd", "th", "st", "rd" do número do dia
    const cleanedDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, '$1');
    
    // Tenta criar um objeto Date usando o formato limpo
    const parsedDate = new Date(cleanedDateStr);

    // Verifica se a data é válida
    if (isNaN(parsedDate)) {
        return null; // Se não for uma data válida, retorna null
    }

    return parsedDate;
}
