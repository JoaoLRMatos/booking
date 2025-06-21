export function buildEventDescription(data) {
  return `
Reservado por
${data.guestName}
${data.attendeeEmail}
${data.phoneNumber || "Não informado"}

Nome do Estabelecimento
${data.establishmentName || "Não informado"}

CNPJ
${data.cnpj}

Assunto
${data.customSubject || "Não informado"}

Olá pessoal que agendou o agendamento, obrigado por agendar
`;
}
