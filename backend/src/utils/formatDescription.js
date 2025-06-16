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

---
ID do Agendamento (Banco de Dados): ${data._id}
Agendado através do sistema de agendamento automático.
`;
}
