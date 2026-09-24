/**
 * Reprodução das verificações negativas do gate de tipos.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * As verificações negativas da feature `001-migracao-typescript` (ações T031 a T036,
 * T039, T045 e T046) foram executadas criando um arquivo temporário, rodando o gate
 * de tipos e apagando o arquivo em seguida. A evidência ficou registrada no histórico
 * de execução e **não podia ser reexecutada por ninguém** — dependia de repetir o
 * procedimento à mão. Este comando é a versão reproduzível daquela evidência
 * (RF-04 da feature `002-prova-automatizada`, decisão D-02).
 *
 * COMO FUNCIONA
 * 1. Escreve um arquivo de prova por caso negativo em `src/__negative_checks__/`.
 * 2. Roda o gate de tipos UMA vez sobre o projeto inteiro com os casos presentes.
 * 3. Confere que cada caso produziu o erro esperado — a violação é citada na mensagem.
 * 4. Remove o diretório de prova, aconteça o que acontecer.
 * 5. Roda o gate de novo e confere que ele voltou a zero erros.
 *
 * O passo 5 é o que prova a ausência de resíduo: se algum arquivo de prova sobrasse,
 * o gate voltaria com erro e o comando acusaria.
 *
 * POR QUE NÃO UM ARQUIVO VERSIONADO
 * Um arquivo negativo permanente exigiria ficar fora do programa verificado, sob pena
 * de o gate de tipos passar a falhar de propósito no uso normal — e a razão de existir
 * do gate é ser executável a qualquer momento. Decisão da sessão de 2026-09-19.
 *
 * USO
 *   npm run prova:negativos
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const raiz = resolve(aqui, '..', '..');
const pastaDeProva = join(raiz, 'src', '__negative_checks__');
const tsc = join(raiz, 'node_modules', 'typescript', 'bin', 'tsc');
const tsconfig = join(raiz, 'tsconfig.json');

/**
 * Cada caso declara a violação que representa e o que a mensagem do gate precisa
 * citar para que a recusa seja considerada a recusa CERTA, e não uma qualquer.
 *
 * `espera` é um trecho que deve aparecer na mensagem do erro.
 * `codigo` é o código do erro, usado quando a mensagem não nomeia a violação.
 *
 * `positivo: true` INVERTE a expectativa: o caso **deve compilar**, e o comando
 * acusa falha se o gate o recusar. Existe para MEDIR um buraco do contrato em vez
 * de apenas registrá-lo — o primeiro é o achado F-03, que diz que o compilador
 * confere a forma e nunca a autorização.
 */
const casos = [
  {
    id: 'campo-inexistente',
    violacao: 'Nome de campo inexistente no contrato de paciente (T045, RF-06 da 001)',
    espera: 'nome_completo',
    fonte: `import type { Patient } from '@/types';

export function caso(paciente: Patient): string {
  return paciente.nome_completo;
}
`,
  },
  {
    id: 'entidade-inexistente',
    violacao: 'Nome de entidade fora do registro fechado (T046, RF-06 da 001)',
    espera: 'Pacient',
    fonte: `import type { AppDataClient } from '@/api/registry';

export function caso(cliente: AppDataClient) {
  return cliente.entities.Pacient;
}
`,
  },
  {
    id: 'consentimento-sem-data',
    violacao: 'Consentimento aceito sem data (T031, RN-06 / BR-MIGRAR-004)',
    espera: 'lgpd_consent_date',
    fonte: `import type { WriteInput } from '@/api/registry';
import type { Patient } from '@/types';

export const caso: WriteInput<Patient> = {
  full_name: 'Paciente de Prova',
  cpf: '00000000000',
  birth_date: '1990-01-01',
  phone: '11000000000',
  lgpd_consent: true,
  lgpd_consent_ip: 'client-side',
};
`,
  },
  {
    id: 'consentimento-sem-ip',
    violacao: 'Consentimento aceito sem endereço de rede (T031, RN-06 / BR-MIGRAR-004)',
    espera: 'lgpd_consent_ip',
    fonte: `import type { WriteInput } from '@/api/registry';
import type { Patient } from '@/types';

export const caso: WriteInput<Patient> = {
  full_name: 'Paciente de Prova',
  cpf: '00000000000',
  birth_date: '1990-01-01',
  phone: '11000000000',
  lgpd_consent: true,
  lgpd_consent_date: '2026-01-01T00:00:00.000Z',
};
`,
  },
  {
    id: 'status-fora-do-conjunto',
    violacao: 'Status de consulta fora do conjunto fechado (T032, RN-02)',
    espera: 'finalizada',
    fonte: `import type { ConsultationStatus } from '@/types';

export const caso: ConsultationStatus = 'finalizada';
`,
  },
  {
    id: 'leitura-sem-escopo',
    violacao: 'Leitura de dado clínico sem declarar o escopo de acesso (T033, RN-07 / RF-05 da 001)',
    codigo: 'TS2554',
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.listOwned();
}
`,
  },
  {
    id: 'mutacao-sem-escopo',
    violacao: 'Exclusão de dado clínico sem declarar o escopo de acesso (F-03, BR-MIGRAR-034)',
    codigo: 'TS2554',
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.delete('paciente-1');
}
`,
  },
  {
    id: 'atualizacao-sem-escopo',
    violacao: 'Atualização de dado clínico sem declarar o escopo de acesso (F-03, BR-MIGRAR-034)',
    codigo: 'TS2554',
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.update('paciente-1', { full_name: 'Outro nome' });
}
`,
  },
  {
    id: 'escopo-admin-em-metodo-de-dono',
    violacao: 'Escopo administrativo entregue a método que exige escopo de dono (T034)',
    espera: '"admin"',
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.filterOwned({ kind: 'admin' }, {});
}
`,
  },
  {
    id: 'escrita-sem-campo-obrigatorio',
    violacao: 'Escrita sem campo obrigatório do cadastro (T039, BR-MIGRAR-003)',
    espera: 'full_name',
    fonte: `import type { WriteInput } from '@/api/registry';
import type { Patient } from '@/types';

export const caso: WriteInput<Patient> = {
  cpf: '00000000000',
  birth_date: '1990-01-01',
  phone: '11000000000',
  lgpd_consent: false,
};
`,
  },
  {
    id: 'dono-manual-em-leitura-escopada',
    violacao: 'Filtro de dono informado à mão sobre leitura já escopada (T039, BR-MIGRAR-034)',
    espera: 'created_by_id',
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

const escopo = { kind: 'user', user_id: 'usuario-1' } as const;

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.filterOwned(escopo, { created_by_id: 'outro-usuario' });
}
`,
  },
  {
    id: 'leitura-crua-em-entidade-escopada',
    violacao:
      'Leitura crua sobre entidade sob RLS, que só expõe os métodos com escopo (PT-010.1, feature 008)',
    espera: "'list'",
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.list();
}
`,
  },
  {
    id: 'papel-atribuido-ao-usuario-offline',
    violacao:
      'Papel atribuído à variante offline, cuja ausência é ESTRUTURAL (PT-010.2, achado F-01, feature 008)',
    codigo: 'TS2322',
    fonte: `import type { OfflineUser } from '@/types';

export const caso: OfflineUser = {
  id: 'demo-user-001',
  email: 'demo@medrecord.local',
  full_name: 'Dra. Demo',
  role: 'admin',
};
`,
  },
  {
    id: 'papel-extraido-do-usuario-offline',
    violacao:
      'Papel extraído da variante offline, cuja ausência é ESTRUTURAL e obriga tratamento (PT-010.2, achado F-01, feature 008)',
    codigo: 'TS2322',
    fonte: `import type { OfflineUser, UserRole } from '@/types';

/**
 * A COMPARAÇÃO com um literal NÃO é recusada: o TypeScript permite comparar
 * \\\`undefined\\\` com string, e foi o que esta verificação tentou primeiro. O que o
 * tipo recusa é EXTRAIR o papel — a ausência é estrutural, então o valor não pode
 * ser usado onde um papel é exigido.
 */
export function caso(usuario: OfflineUser): UserRole {
  return usuario.role;
}
`,
  },
  {
    id: 'adaptador-incompleto',
    violacao:
      'Adaptador que omite um dos gateways exigidos pelo contrato (PT-010.3, feature 008)',
    espera: 'getPublicSettings',
    fonte: `import type { AdapterGateways } from '@/api/entities';

export const caso: AdapterGateways = {
  auth: {
    me: async () => null,
    logout: async () => {},
    redirectToLogin: () => {},
  },
  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: '' }),
      SendEmail: async () => ({}),
    },
  },
  appLogs: { logUserInApp: async () => {} },
};
`,
  },
  {
    id: 'situacao-de-agendamento-fora-do-conjunto',
    violacao:
      'Situação de agendamento fora do conjunto fechado (PT-010.4, feature 008)',
    espera: 'finalizado',
    fonte: `import type { AppointmentStatus } from '@/types';

export const caso: AppointmentStatus = 'finalizado';
`,
  },
  {
    id: 'tipo-documental-fora-do-conjunto',
    violacao:
      'Tipo documental fora do conjunto fechado (PT-010.4, feature 008)',
    espera: 'receita_especial',
    fonte: `import type { PrescriptionType } from '@/types';

export const caso: PrescriptionType = 'receita_especial';
`,
  },
  {
    id: 'escopo-administrativo-declarado-por-qualquer-um',
    violacao:
      'CASO POSITIVO: o compilador confere a FORMA e nunca a AUTORIZAÇÃO — qualquer código declara escopo administrativo e compila (achado F-03, feature 008)',
    positivo: true,
    fonte: `import type { OwnedEntity } from '@/api/scopedRead';
import type { Patient } from '@/types';

/**
 * O par deste caso é \`escopo-admin-em-metodo-de-dono\`, que entrega o MESMO
 * \`{ kind: 'admin' }\` a \`filterOwned\` e é recusado. Aqui ele é aceito, porque
 * \`filterAsAdmin\` o exige — e nada no tipo pergunta quem está chamando.
 */
export function caso(pacientes: OwnedEntity<Patient>) {
  return pacientes.filterAsAdmin({ kind: 'admin' }, {});
}
`,
  },
];

/** Roda o gate de tipos e devolve a saída combinada. */
function rodarGate() {
  const resultado = spawnSync(process.execPath, [tsc, '-p', tsconfig, '--noEmit'], {
    cwd: raiz,
    encoding: 'utf8',
  });
  if (resultado.error) {
    throw new Error(`não foi possível executar o gate de tipos: ${resultado.error.message}`);
  }
  return `${resultado.stdout ?? ''}${resultado.stderr ?? ''}`;
}

/** Extrai as linhas de erro do gate, agrupadas por arquivo. */
function errosPorArquivo(saida) {
  const porArquivo = new Map();
  const linhaDeErro = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;
  let atual = null;
  for (const linha of saida.split(/\r?\n/)) {
    const casa = linhaDeErro.exec(linha.trim());
    if (casa) {
      const [, arquivo, , , codigo, mensagem] = casa;
      const chave = arquivo.replace(/\\/g, '/');
      if (!porArquivo.has(chave)) porArquivo.set(chave, []);
      atual = { codigo, mensagem };
      porArquivo.get(chave).push(atual);
      continue;
    }
    // O verificador detalha o motivo em linhas indentadas de continuação: é nelas que
    // aparece o nome do campo que falta. Sem acumulá-las, a recusa de um objeto grande
    // chega como uma mensagem genérica e a verificação não consegue citar a violação.
    if (atual && linha.trim() !== '' && /^\s/.test(linha)) {
      atual.mensagem += ` ${linha.trim()}`;
    }
  }
  return porArquivo;
}

function limparPastaDeProva() {
  if (existsSync(pastaDeProva)) rmSync(pastaDeProva, { recursive: true, force: true });
}

function main() {
  if (!existsSync(tsc)) {
    console.error(`gate de tipos não encontrado em ${tsc}. Instale as dependências antes.`);
    process.exitCode = 1;
    return;
  }

  limparPastaDeProva();
  mkdirSync(pastaDeProva, { recursive: true });
  casos.forEach((caso, indice) => {
    const nome = `${String(indice + 1).padStart(2, '0')}-${caso.id}.ts`;
    writeFileSync(join(pastaDeProva, nome), caso.fonte, 'utf8');
  });

  let saida;
  try {
    saida = rodarGate();
  } finally {
    limparPastaDeProva();
  }

  const porArquivo = errosPorArquivo(saida);
  const falhas = [];

  console.log('');
  console.log('Verificações negativas do gate de tipos');
  console.log('='.repeat(72));

  casos.forEach((caso, indice) => {
    const nome = `${String(indice + 1).padStart(2, '0')}-${caso.id}.ts`;
    const chave = [...porArquivo.keys()].find((caminho) => caminho.endsWith(`/${nome}`));
    const erros = chave ? porArquivo.get(chave) : [];

    // Caso POSITIVO: a expectativa é invertida — ele DEVE compilar, e a falha é o gate
    // recusá-lo. É o que permite medir um buraco do contrato em vez de só declará-lo.
    if (caso.positivo) {
      if (erros.length === 0) {
        console.log(`  COMPILOU? sim   ${caso.id}`);
      } else {
        falhas.push(`${caso.id}: era caso POSITIVO e o gate o recusou`);
        console.log(`  COMPILOU? não   ${caso.id}  (${erros[0].codigo})`);
        console.log(`                 esperado: compilar sem erro`);
        console.log(`                 veio: ${erros[0].mensagem}`);
      }
      return;
    }

    if (erros.length === 0) {
      falhas.push(`${caso.id}: NÃO foi recusado pelo gate`);
      console.log(`  RECUSOU? não   ${caso.id}`);
      console.log(`                 ${caso.violacao}`);
      return;
    }

    const atende = erros.some((erro) =>
      caso.codigo ? erro.codigo === caso.codigo : erro.mensagem.includes(caso.espera),
    );

    if (atende) {
      console.log(`  RECUSOU? sim   ${caso.id}  (${erros[0].codigo})`);
    } else {
      falhas.push(`${caso.id}: recusado, mas não pelo motivo esperado`);
      console.log(`  RECUSOU? outro ${caso.id}  (${erros[0].codigo})`);
      console.log(`                 esperado citar: ${caso.codigo ?? caso.espera}`);
      console.log(`                 veio: ${erros[0].mensagem}`);
    }
  });

  // Ausência de resíduo: com os casos removidos, o gate tem de voltar a zero.
  const saidaFinal = rodarGate();
  const errosFinais = [...errosPorArquivo(saidaFinal).values()].flat();
  const residuo = errosFinais.length > 0;

  console.log('-'.repeat(72));
  const positivos = casos.filter((caso) => caso.positivo).length;
  console.log(
    `casos: ${casos.length}   negativos: ${casos.length - positivos}   positivos: ${positivos}`,
  );
  console.log(`atenderam ao esperado: ${casos.length - falhas.length}`);
  console.log(
    residuo
      ? `RESÍDUO: o gate voltou com ${errosFinais.length} erro(s) após a limpeza`
      : 'resíduo: nenhum — o gate voltou a zero erros',
  );
  console.log('='.repeat(72));
  console.log('');

  if (falhas.length > 0) {
    for (const falha of falhas) console.error(`falha: ${falha}`);
    process.exitCode = 1;
    return;
  }
  if (residuo) {
    console.error('falha: arquivo de prova permaneceu no repositório');
    process.exitCode = 1;
  }
}

main();
