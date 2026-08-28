# Relacionamentos de Banco de Dados

> Gerado por reversa-data-master em 27/08/2026.
> Nível de Confiança: 🟢 Inferido de modelos JSON e lógicas de negócios do Base44.

## Pacientes ↔ Agendamentos (1:N)
- Um paciente pode ter múltiplos agendamentos no sistema.
- Cardinalidade: 1 Patient para N Appointments.
- Chave: `Appointment.patient_id` aponta para `Patient.id`.

## Médicos ↔ Agendamentos (1:N)
- Um médico pode estar atrelado a inúmeros agendamentos.
- Cardinalidade: 1 Doctor para N Appointments.
- Chave: `Appointment.doctor_id` aponta para `Doctor.id`.

## Pacientes ↔ Consultas (1:N)
- O histórico de consultas pertence a um paciente.
- Cardinalidade: 1 Patient para N Consultations.
- Chave: `Consultation.patient_id` aponta para `Patient.id`.

## Agendamento ↔ Consulta (1:0..1)
- Um agendamento pode, futuramente, gerar uma consulta se o status mudar para "concluido".
- Cardinalidade: 1 Appointment possui 0 ou 1 Consultation.
- Chave: `Appointment.consultation_id` vincula retroativamente ao ID da consulta gerada.

## Consulta ↔ Prescrições (1:N)
- Durante uma consulta, o médico pode gerar múltiplos documentos (receita, atestado, exames).
- Cardinalidade: 1 Consultation para N Prescriptions.
- Chaves: `Prescription.patient_id` e `Prescription.consultation_id`.

## Pacientes ↔ Exames (1:N)
- O paciente é o dono dos resultados dos exames.
- Cardinalidade: 1 Patient para N Exams.
- Chave: `Exam.patient_id`.
